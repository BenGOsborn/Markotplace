# Build the image
FROM python:latest
WORKDIR /usr/app
COPY . .
RUN pip3 install -r requirements.txt

# Start the server
CMD python3 -m flask run --host=0.0.0.0