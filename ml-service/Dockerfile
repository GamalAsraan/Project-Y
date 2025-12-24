FROM python:3.9-slim

WORKDIR /app

COPY requirements-core.txt .

# 1. Install CPU-only PyTorch first (Speed fix: downloads ~200MB instead of 750MB)
RUN pip install torch==2.2.0 --index-url https://download.pytorch.org/whl/cpu

# 2. Then install the rest (transformers, etc.)
# We increase timeout here just in case the connection is slow
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements-core.txt

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model files first (better caching)
COPY sentiment_model ./sentiment_model

# Copy application code last (frequent changes)
COPY app ./app

ENV MODEL_PATH=/app/sentiment_model

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]