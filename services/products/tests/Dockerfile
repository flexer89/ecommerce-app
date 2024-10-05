FROM python:3.11-slim-buster

WORKDIR /app

COPY src/ /app/src/

COPY tests/ /app/tests/

RUN pip install --no-cache-dir -r tests/requirements.txt

ENV ENV=test

CMD ["pytest", "--color=yes"]
