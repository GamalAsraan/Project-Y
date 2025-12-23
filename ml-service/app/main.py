"""FastAPI application for Airline Sentiment Analysis."""

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

from app.sentiment import SentimentModel, PredictionResponse


class SentimentRequest(BaseModel):
    """Input schema for sentiment prediction."""
    text: str


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage model lifecycle with proper startup/shutdown."""
    model_path = os.getenv("MODEL_PATH", "./sentiment_model")
    app.state.model = SentimentModel(model_path=model_path)
    yield
    # Cleanup on shutdown
    del app.state.model


app = FastAPI(
    title="Airline Sentiment Analysis API",
    lifespan=lifespan
)


@app.get("/health")
def health_check(request: Request) -> dict:
    """Check if the service and model are healthy."""
    return {
        "status": "healthy",
        "model_loaded": hasattr(request.app.state, "model")
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_sentiment(request: SentimentRequest, http_request: Request) -> PredictionResponse:
    """Predict sentiment for the given text."""
    if not hasattr(http_request.app.state, "model"):
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        result = http_request.app.state.model.predict(request.text)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {e}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")