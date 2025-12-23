FROM python:3.9-slim

WORKDIR /app

COPY requirements-core.txt .
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