from docker.client import DockerClient
import psycopg2
import os
import re
import mmap
import shutil
import uuid
import requests


def is_safe(dockerfile: str) -> bool:
    """
    Runs security checks on the downloaded repository to make sure that it is safe to be built.
    """

    with open(dockerfile, "r+") as file:
        data = mmap.mmap(file.fileno(), 0)
        # Explore the different ways that hackers could break this regex
        match = re.search(os.getenv("CONTAINER_PREFIX").encode(), data)

    return not match


class DB:
    """
    Connect and use the database
    """

    def __init__(self):
        self.__conn = psycopg2.connect(host="db", port="5432", user=os.getenv(
            "POSTGRES_USER"), password=os.getenv("POSTGRES_PASSWORD"), database=os.getenv("POSTGRES_DB"))
        self.__cursor = self.__conn.cursor()

    def find_app_by_webhook(self):
        pass

    def find_app_by_appname(self):
        # I need to get the repo owner, name, and branch for the app, as well as the access token for the app
        pass

    def close_connection(self):
        self.__conn.close()


def build_image_from_repo(docker_client: DockerClient, gh_owner: str, gh_repo: str, gh_branch: str, app_name: str):
    # **** MAKE SURE THAT IT WORKS WITH DIFFERENT BRANCHES

    # Get the repository
    resp = requests.get(f"https://api.github.com/repos/{gh_owner}/{gh_repo}/tarball/{gh_branch}",
                        headers={"Accept": "application/vnd.github.v3+json", "Authorization": "lol"}, stream=True)

    try:
        # Initialize a UUID
        temp_id = uuid.uuid4().hex

        # Write the data to the file
        tar_path = os.path.join(os.getcwd(), temp_id + ".tar.gz")
        with open(tar_path, "wb") as file:
            for chunk in resp.iter_content(chunk_size=256):
                file.write(chunk)

        # Extract the contents from the file
        extract_path = os.path.join(os.getcwd(), temp_id)
        os.mkdir(extract_path)
        shutil.unpack_archive(tar_path, extract_path)
        contents_path = [f.path for f in os.scandir(extract_path)][0]

        # Get the Dockerfile and check that is is safe
        dockerfile = [f.path for f in os.scandir(
            contents_path) if f.name == "Dockerfile"][0]
        assert is_safe(dockerfile)

        # Build the Docker image (maybe later there will be versions for the different apps to avoid bad builds ?)
        docker_client.images.build(
            path=contents_path, tag=f"{os.getenv('CONTAINER_PREFIX')}/{app_name}", pull=True)

    finally:
        # Cleanup the files
        os.remove(tar_path) if os.path.exists(tar_path) else None
        shutil.rmtree(extract_path, ignore_errors=True) if os.path.exists(
            extract_path) else None
