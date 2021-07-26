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

# Load the variables from the env (local only)
load_dotenv(dotenv_path=os.path.join(os.getcwd(), "..", "..", ".env"))

print(os.getenv("SERVER_SECRET"))

# # Initialize Flask
# app = Flask(__name__)


# @app.route("/hook", methods=["POST"])
# def hook():
#     # Get the data from the hook
#     body = request.json
#     headers = request.headers

#     # Get the ID and branch from the hook
#     hook_id = headers["X-GitHub-Hook-ID"]
#     branch = body["ref"].split("/")[-1]

#     print(hook_id, branch)

#     # Make a request to the server to get the app that has the specified hook (I wonder if I can do this without some form of authentication ???)

#     return "Hello"


# Run the app
if __name__ == "__main__":
    # app.run(port=3000, debug=True)
    print("Hello world")
