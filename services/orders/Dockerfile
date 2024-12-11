FROM python:3.11

WORKDIR /orders

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

ENV DEBUG_METRICS=1

CMD [ "uvicorn", "src.app:app", "--host=0.0.0.0", "--port=5010", "--reload"]
