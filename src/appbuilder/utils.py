import psycopg2
import os
import re
import mmap


def is_safe(dockerfile: str) -> bool:
    """
    Runs security checks on the downloaded repository to make sure that it is safe to be built.
    """

    with open(dockerfile, "r+") as file:
        data = mmap.mmap(file.fileno(), 0)
        # Explore the different ways that hackers could break this regex
        match = re.search(os.getenv("CONTAINER_PREFIX").encode(), data)

    return not match


def connect_db():
    """
    Establish and return the connection to PostgreSQL server
    """
    conn = psycopg2.connect(host="db", port="5432", user=os.getenv(
        "POSTGRES_USER"), password=os.getenv("POSTGRES_PASSWORD"), database=os.getenv("POSTGRES_DB"))

    return conn
