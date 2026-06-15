FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY API/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY API/ ./API/
COPY models/ ./models/
COPY data/ ./data/

WORKDIR /app/API

CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
