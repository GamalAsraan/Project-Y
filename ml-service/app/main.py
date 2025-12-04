from fastapi import FastAPI
from pydantic import BaseModel
from textblob import TextBlob

app = FastAPI()

class TextRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "Project-Y ML Service Active"}

@app.post("/analyze")
def analyze_sentiment(request: TextRequest):
    blob = TextBlob(request.text)
    sentiment = blob.sentiment.polarity
    return {
        "text": request.text,
        "polarity": sentiment,
        "sentiment": "positive" if sentiment > 0 else "negative" if sentiment < 0 else "neutral"
    }
