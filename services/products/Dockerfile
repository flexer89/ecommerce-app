FROM python:3.11-slim-buster

WORKDIR /products

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 5000

ENV ENV=dev

CMD [ "uvicorn", "src.app:app", "--host=0.0.0.0", "--port=5000", "--root-path", "/products", "--reload"]
