# Library Web Application Dockerfile
# Supports both running the application and generating documentation
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies including Doxygen and Graphviz for documentation
RUN apt-get update && apt-get install -y \
    gcc \
    doxygen \
    graphviz \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create docs directory
RUN mkdir -p docs

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=run.py
ENV FLASK_ENV=development
ENV PYTHONUNBUFFERED=1

# Default command: Run the application
CMD ["python", "run.py"]
