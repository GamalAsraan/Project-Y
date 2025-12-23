#!/bin/bash
# Test script for backend sentiment analysis integration

# Default to localhost:3000 if not specified
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"

echo "Testing Sentiment Analysis via Backend ($BACKEND_URL)..."
echo "Input: \"I've been waiting on hold for 3 hours. This is ridiculous.\""

if command -v jq &> /dev/null; then
  curl -X POST "$BACKEND_URL/analyze-sentiment" \
    -H "Content-Type: application/json" \
    -d '{"text": "I'\''ve been waiting on hold for 3 hours. This is ridiculous."}' \
    -s | jq .
else
  echo "Response (install jq for pretty printing):"
  curl -X POST "$BACKEND_URL/analyze-sentiment" \
    -H "Content-Type: application/json" \
    -d '{"text": "I'\''ve been waiting on hold for 3 hours. This is ridiculous."}' \
    -s
  echo "" # Add newline
fi
