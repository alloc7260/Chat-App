from flask import Flask, request, jsonify, render_template, make_response, redirect
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from bson import ObjectId
import os

app = Flask(__name__)
app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")

mongo = PyMongo(app)
users_collection = mongo.db.users
todos_collection = mongo.db.chats


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get("token")
        if not token:
            return redirect("/")
        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = users_collection.find_one({"username": data["username"]})
        except:
            return jsonify({"message": "Token is invalid!"}), 403
        return f(current_user, *args, **kwargs)

    return decorated


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"message": "Invalid data!"}), 400
    hashed_password = generate_password_hash(data["password"], method="sha256")
    users_collection.insert_one(
        {"username": data["username"], "password": hashed_password}
    )
    return jsonify({"message": "Registered successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users_collection.find_one({"username": data["username"]})
    if not user or not check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Login failed!"}), 401
    token = jwt.encode(
        {
            "username": user["username"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
        },
        app.config["SECRET_KEY"],
    )
    resp = make_response(jsonify({"message": "Login successful!"}))
    resp.set_cookie("token", token, httponly=True)
    return resp


@app.route("/logout", methods=["POST"])
@token_required
def logout(current_user):
    resp = make_response(jsonify({"message": "Logged out!"}))
    resp.set_cookie("token", "", expires=0)
    return resp


@app.route("/chat", methods=["POST"])
@token_required
def create_message(current_user):
    data = request.get_json()
    todos_collection.insert_one(
        {
            "user_id": current_user["_id"],
            "username": current_user["username"],
            "message": data["message"],
        }
    )
    return jsonify({"message": "Message sent!"}), 201


@app.route("/chat", methods=["GET"])
@token_required
def get_messages(current_user):
    messages = todos_collection.find({"user_id": current_user["_id"]})
    output = [{"id": str(msg["_id"]), "message": msg["message"]} for msg in messages]
    return jsonify({"username": current_user["username"], "messages": output})


@app.route("/chat/<message_id>", methods=["DELETE"])
@token_required
def delete_message(current_user, message_id):
    result = todos_collection.delete_one(
        {"_id": ObjectId(message_id), "user_id": current_user["_id"]}
    )
    if result.deleted_count == 1:
        return jsonify({"message": "Message deleted!"}), 200
    else:
        return jsonify({"message": "Message not found!"}), 404


@app.route("/dashboard")
@token_required
def dashboard(current_user):
    return render_template("index.html")


@app.route("/")
def index():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            return redirect("/dashboard")
        except:
            pass
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0")
