# https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps (write:repo_hook) - when a user connects their repo, set a webhook in their account which will auto fire to my server on request
# When a webhook is fired for a change to the deploy branch, we should download that repo, check the dockerfile for any problems, build the image, and then delete it
# This should also be called on a successful app creation (ill have to integrate with my own server for that) AND we should have a manual deploy option for the app (user authenticated of course)
# This will need access to the users dev account details, how will I integrate that ?
# Set the deployment status as the current deployed branch on Markotplace

# **** Maybe I need to store the webhook secret somewhere too ???
# **** Im pretty sure that if a user gives full repo permissions I can write webhooks without asking for permission ? (YES IT DOES!)

# How do I use the .env in Python using the CLI ?

from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
import os
import docker  # This service will require access to the Docker server as well
import shutil
import uuid

# Load the variables from the env (local only)
load_dotenv(dotenv_path=os.path.join(os.getcwd(), "..", "..", ".env"))

# Initialize Flask
app = Flask(__name__)

# Initializer Docker
client = docker.from_env()


@app.route("/appbuilder/hook", methods=["POST"])
def hook():
    # Get the data from the hook
    body = request.json
    headers = request.headers

    # Get the ID and branch from the hook
    hook_id = headers["X-GitHub-Hook-ID"]
    branch = body["ref"].split("/")[-1]

    # Get the app data for the webhook

    # Download, extract, and verify the app from GitHub

    # Build the container image with an appropriate name

    return "Hook"


@app.route("/appbuilder/build", methods=["GET"])  # Change to POST
def deploy():
    # Follow the same steps as the deploy on the hook EXCEPT we should specify the app to be deployed

    # **** Provide some level of authentication for this so random users cant deploy other peoples apps super easy

    # Get the name of the app to build
    # app_name = request.json["appName"]

    # Find the app that matches the name

    # **** TEST DATA
    gh_owner = "BenGOsborn"
    gh_repo = "Webhook-Test"
    gh_branch = "main"
    app_name = "test"

    # Try and manually make the ref using ref/head/branch
    resp = requests.get(f"https://api.github.com/repos/{gh_owner}/{gh_repo}/tarball/{gh_branch}",
                        headers={"Accept": "application/vnd.github.v3+json", "Authorization": "lol"}, stream=True)

    # Initialize a UUID
    temp_id = uuid.uuid4().hex

    # Write the data to the file
    tar_path = os.path.join(os.getcwd(), temp_id + ".tar.gz")
    with open(tar_path, "wb") as file:
        for chunk in resp.iter_content(chunk_size=256):
            file.write(chunk)

    # Extract the content from the file, build the image, and then delete the files

    # Extract the contents from the file
    extract_path = os.path.join(os.getcwd(), temp_id)
    os.mkdir(extract_path)
    shutil.unpack_archive(tar_path, extract_path)
    contents_path = [f.path for f in os.scandir(extract_path)][0]

    # Build the Docker image (maybe later there will be versions for the different apps to avoid bad builds ?)
    client.images.build(
        path=contents_path, tag=f"{os.getenv('CONTAINER_PREFIX')}/{app_name}", pull=True)

    # Delete the temp files
    os.remove(tar_path)
    shutil.rmtree(extract_path, ignore_errors=True)

    return "Deploy"


# Run the app
if __name__ == "__main__":
    app.run(port=3000, debug=True)
