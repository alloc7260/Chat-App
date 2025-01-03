from flask import Flask, request, jsonify, render_template, make_response
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

app = Flask(__name__)
app.config['MONGO_URI'] = 'mongodb://admin:example@localhost:27017/todoDB?authSource=admin'
app.config['SECRET_KEY'] = 'febghbn23u48934jfi3j4dj394u345r23'

mongo = PyMongo(app)
users_collection = mongo.db.users
todos_collection = mongo.db.todos
chats_collection = mongo.db.chats

# check connection mongoDB
@app.route('/check')
def check():
    # list databases    
    print(mongo.db.list_collection_names())
    return jsonify({'message': 'Connected to MongoDB!'})

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({'username': data['username']})
        except:
            return jsonify({'message': 'Token is invalid!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Invalid data!'}), 400
    hashed_password = generate_password_hash(data['password'], method='sha256')
    users_collection.insert_one({'username': data['username'], 'password': hashed_password})
    return jsonify({'message': 'Registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = users_collection.find_one({'username': data['username']})
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Login failed!'}), 401
    token = jwt.encode({'username': user['username'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=10)}, app.config['SECRET_KEY'])
    resp = make_response(jsonify({'message': 'Login successful!'}))
    resp.set_cookie('token', token, httponly=True)
    return resp

@app.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    resp = make_response(jsonify({'message': 'Logged out!'}))
    resp.set_cookie('token', '', expires=0)
    return resp

@app.route('/todo', methods=['POST'])
@token_required
def create_todo(current_user):
    data = request.get_json()
    todos_collection.insert_one({'user_id': current_user['_id'], 'title': data['title'], 'description': data['description']})
    return jsonify({'message': 'To-do created!'}), 201

@app.route('/todo', methods=['GET'])
@token_required
def get_todos(current_user):
    todos = todos_collection.find({'user_id': current_user['_id']})
    output = [{'title': todo['title'], 'description': todo['description']} for todo in todos]
    return jsonify({'todos': output})

@app.route('/chat', methods=['POST'])
@token_required
def create_chat(current_user):
    data = request.get_json()
    chats_collection.insert_one({'user_id': current_user['_id'], 'username': current_user['username'], 'message': data['message']})
    return jsonify({'message': 'Message sent!'}), 201

@app.route('/chat', methods=['GET'])
@token_required
def get_chats(current_user):
    chats = chats_collection.find()
    output = [{'username': chat['username'], 'message': chat['message']} for chat in chats]
    return jsonify({'chats': output})

@app.route('/dashboard')
@token_required
def dashboard(current_user):
    return render_template('index.html')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
