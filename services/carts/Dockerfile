FROM python:3.11-slim-buster

WORKDIR /carts

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

ENV ENV=dev
ENV DEBUG_METRICS=1

CMD [ "uvicorn", "src.app:app", "--host=0.0.0.0", "--port=5040", "--reload"]
