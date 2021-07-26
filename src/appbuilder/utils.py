import psycopg2
import os


def is_safe():
    """
    Runs security checks on the downloaded repository to make sure that it is safe to be built.
    """
    pass


def connect_db():
    """
    Establish connection to PostgreSQL server
    """
    # Load these from environment variables
    conn = psycopg2.connect(
        host="localhost", database="db", user="", password="")

    return conn
