FROM python:3.8
ENV PYTHONUNBUFFERED 1

# Allows docker to cache installed dependencies between builds
COPY ./requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Adds our application code to the image
COPY . code
WORKDIR code

EXPOSE 8000
RUN ["chmod", "+x", "./wait_for_postgres.py"]
RUN ["chmod", "+x", "./scripts/start.sh"]
# Run the production server
CMD bash -c "./scripts/start.sh"
