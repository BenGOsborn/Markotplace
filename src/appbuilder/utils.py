from docker.client import DockerClient
import psycopg2
import os
import re
import mmap
import shutil
import uuid
import requests


def dockerfile_is_valid(dockerfile: str) -> bool:
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
    Connect to and use the database

    'app' table: id | name | title | description | price | ghRepoOwner | ghRepoName | ghRepoBranch | ghWebhookID | devId
    'dev' table: id | ghAccessToken | ghUsername | stripeConnectID
    'user' table: id | username | email |  password  | stripeCustomerID | devId
    """

    def __init__(self, production: bool = False):
        self.__conn = psycopg2.connect(host=os.getenv("POSTGRES_HOST") if production else "0.0.0.0", port="5432", user=os.getenv(
            "POSTGRES_USER"), password=os.getenv("POSTGRES_PASSWORD"), database=os.getenv("POSTGRES_DB"))

    def __label_row(self, row: tuple, labels: tuple) -> dict:
        return {label: data for label, data in zip(labels, row)}

    def find_app_by_webhook(self, webhook_id: str):
        # Initialize the cursor
        cur = self.__conn.cursor()

        # Find the app that has the same GitHub webhook ID
        cur.execute("SELECT app.name, app.ghRepoOwner, app.ghRepoName, app.ghRepoBranch, dev.ghAccessToken, app.env FROM app INNER JOIN dev ON app.devID = dev.id WHERE app.ghWebhookID = %s", (webhook_id,))
        row = cur.fetchone()

        # Close the cursor
        cur.close()

        # Return the labeled app data
        labels = ["app_name", "gh_repo_owner", "gh_repo_name",
                  "gh_repo_branch", "gh_access_token", "env"]
        return self.__label_row(row, labels)

    def find_app_by_appname(self, app_name: str):
        # Initialize the cursor
        cur = self.__conn.cursor()

        # Find the app that has the same appname
        cur.execute("SELECT app.ghRepoOwner, app.ghRepoName, app.ghRepoBranch, dev.ghAccessToken, app.env FROM app INNER JOIN dev ON app.devID = dev.id WHERE app.name = %s", (app_name,))
        row = cur.fetchone()

        # Close the cursor
        cur.close()

        # Return the labeled app data
        labels = ["gh_repo_owner", "gh_repo_name",
                  "gh_repo_branch", "gh_access_token", "env"]
        return self.__label_row(row, labels)

    def close_connection(self):
        self.__conn.close()


def build_image_from_repo(docker_client: DockerClient, gh_repo_owner: str, gh_repo_name: str, gh_repo_branch: str, app_name: str, gh_access_token: str, env: dict):
    # Get the repository
    # resp = requests.get(f"https://api.github.com/repos/{gh_owner}/{gh_repo}/tarball/{gh_branch}",
    #                     headers={"Accept": "application/vnd.github.v3+json", "Authorization": "lol"}, stream=True)

    # Will this work properly (even with authorization) ???
    resp = requests.get(f"https://github.com/{gh_repo_owner}/{gh_repo_name}/archive/{gh_repo_branch}.tar.gz",
                        headers={"Authorization": gh_access_token}, stream=True)

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
        # **** IM PRETTY SURE THIS IS NOT NECESSARY WITH THE NEW WAY OF ARCHIVING IF IT WORKS ??? (the files will be automatically extracted to the named file)
        # contents_path = [f.path for f in os.scandir(extract_path)][0]

        # Get the Dockerfile and check that is is safe
        dockerfile = [f.path for f in os.scandir(
            extract_path) if f.name == "Dockerfile"][0]
        assert dockerfile_is_valid(dockerfile)

        # Build the Docker image (maybe later there will be versions for the different apps to avoid bad builds in the future ?)
        docker_client.images.build(
            path=extract_path, tag=f"{os.getenv('CONTAINER_PREFIX')}/{app_name}", pull=True, buildargs=env)

    finally:
        # Cleanup the files
        os.remove(tar_path) if os.path.exists(tar_path) else None
        shutil.rmtree(extract_path, ignore_errors=True) if os.path.exists(
            extract_path) else None
