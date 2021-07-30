# Build the image
FROM python
WORKDIR /usr/app
COPY . .
RUN pip3 install -r requirements.txt

# Start the server
CMD python3 app.py