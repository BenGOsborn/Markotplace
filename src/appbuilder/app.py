from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import docker
import utils

# Determine if the app is in a production environment
production = os.getenv("ENVIRONMENT") == "production"

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Initializer Docker
client = docker.from_env()

# Initialize the DB
db = utils.DB(production=production)


@app.route("/appbuilder/hook", methods=["POST"])
def hook():
    # Get the data from the hook
    body = request.json
    headers = request.headers

    # Get the ID and branch from the hook
    hook_id = headers["X-GitHub-Hook-ID"]
    branch = body["ref"].split("/")[-1]

    # Get the app data for the webhook
    app_data = db.find_app_by_webhook(hook_id)

    app_name = app_data["app_name"]
    gh_repo_owner = app_data["gh_repo_owner"]
    gh_repo_name = app_data["gh_repo_name"]
    gh_repo_branch = app_data["gh_repo_branch"]
    gh_access_token = app_data["gh_access_token"]

    # Make sure that pushed branch is the same as the specified deploy branch
    assert app_data["gh_repo_branch"] == branch

    # Build the local Docker image from the GitHub repo
    utils.build_image_from_repo(
        client, gh_repo_owner, gh_repo_name, gh_repo_branch, app_name, gh_access_token)

    return "OK", 200


@app.route("/appbuilder/build", methods=["POST"])  # Change to POST
def deploy():
    # Get the name of the app to build
    app_name = request.json["appName"]

    # Find the app that matches the name in the database
    app_data = db.find_app_by_appname(app_name)

    gh_repo_owner = app_data["gh_repo_owner"]
    gh_repo_name = app_data["gh_repo_name"]
    gh_repo_branch = app_data["gh_repo_branch"]
    gh_access_token = app_data["gh_access_token"]

    # Build the local Docker image from the GitHub repo
    utils.build_image_from_repo(
        client, gh_repo_owner, gh_repo_name, gh_repo_branch, app_name, gh_access_token)

    return "OK", 200


# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=(not production))
