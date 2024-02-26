FROM python:3.11-slim

WORKDIR /app

COPY src/ /app/src/

COPY tests/ /app/tests/

RUN pip install --no-cache-dir -r tests/requirements.txt

CMD ["pytest", "--color=yes"]
