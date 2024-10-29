FROM python:3.11

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r tests/requirements.txt

ENV ENV=test

CMD ["pytest", "--color=yes", "--cov=.", "--cov-report=term-missing", "--cov-report=html:/app/tests/htmlcov", "--cov-report=xml:/app/tests/coverage.xml", "/app/tests"]
