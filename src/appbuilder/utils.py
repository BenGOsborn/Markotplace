import psycopg2
import os


def is_safe():
    """
    Runs security checks on the downloaded repository to make sure that it is safe to be built.
    """
    pass


def connect_db():
    """
    Establish and return the connection to PostgreSQL server
    """
    conn = psycopg2.connect(
        host="localhost", port="5432", user=os.getenv("POSTGRES_USER"), password=os.getenv("POSTGRES_PASSWORD"), database=os.getenv("POSTGRES_DB"))

    return conn
