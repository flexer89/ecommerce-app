FROM python:3.11-slim-buster

WORKDIR /products

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

ENV DEBUG_METRICS=1

CMD [ "uvicorn", "app:app", "--host=0.0.0.0", "--port=5020", "--reload"]
