FROM python:3.10

RUN pip install keras
RUN pip install tensorflow

WORKDIR /app

COPY . /app

