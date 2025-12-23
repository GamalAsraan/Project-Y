"""Sentiment analysis model using DistilBERT."""

import logging
import re

import torch
import torch.nn.functional as F
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer

logger = logging.getLogger(__name__)


class Probabilities(BaseModel):
    """Probability scores for each sentiment class."""
    negative: float
    neutral: float
    positive: float


class PredictionResponse(BaseModel):
    """Response schema for sentiment prediction."""
    label: str
    confidence: float
    probabilities: Probabilities


class SentimentModel:
    """Wrapper for the DistilBERT sentiment classification model."""

    def __init__(self, model_path: str) -> None:
        """Initialize the model and tokenizer.
        
        Args:
            model_path: Path to the pretrained model directory.
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info("Loading model from %s to %s...", model_path, self.device)
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
        self.model.to(self.device)
        self.model.eval()
        
        # Load labels from config
        self.id2label = self.model.config.id2label
        # Ensure keys are integers
        self.id2label = {int(k): v for k, v in self.id2label.items()}
        
        # Create normalized label mapping (lowercase for schema compatibility)
        self.id2label_normalized = {
            int(k): v.lower() for k, v in self.model.config.id2label.items()
        }
        
        # Create reverse mapping from normalized label name to index for probability lookup
        self.label2id = {
            v.lower(): int(k) for k, v in self.model.config.id2label.items()
        }

    def preprocess(self, text: str) -> str:
        """Clean and normalize input text.
        
        Args:
            text: Raw input text.
            
        Returns:
            Cleaned text with mentions and URLs removed.
        """
        text = re.sub(r'@\w+', '', text)
        text = re.sub(r'http\S+|www\.\S+', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def predict(self, text: str) -> PredictionResponse:
        """Perform sentiment prediction on the input text.
        
        Args:
            text: Input text to analyze.
            
        Returns:
            PredictionResponse with label, confidence, and probability distribution.
            
        Raises:
            ValueError: If input text is empty or becomes empty after preprocessing.
            RuntimeError: If model inference fails.
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
        
        cleaned_text = self.preprocess(text)
        
        if not cleaned_text:
            raise ValueError("Text becomes empty after preprocessing (only mentions/URLs found)")
        
        inputs = self.tokenizer(
            cleaned_text, 
            return_tensors="pt", 
            truncation=True, 
            padding=True, 
            max_length=128
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
        
        probs = F.softmax(outputs.logits, dim=-1)
        pred_index = torch.argmax(probs).item()
        confidence = probs[0][pred_index].item()
        
        # Dynamically map probabilities using label2id mapping
        # This ensures compatibility even if model label ordering changes
        prob_dict = {}
        for label_name in ["negative", "neutral", "positive"]:
            if label_name in self.label2id:
                label_id = self.label2id[label_name]
                prob_dict[label_name] = round(probs[0][label_id].item(), 4)
            else:
                logger.warning(f"Label '{label_name}' not found in model config")
                prob_dict[label_name] = 0.0
        
        return PredictionResponse(
            label=self.id2label_normalized[pred_index],
            confidence=round(confidence, 4),
            probabilities=Probabilities(**prob_dict)
        )