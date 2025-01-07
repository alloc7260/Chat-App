# Todo Notes & Chat Application

This project is a Flask-based chat application that allows users to register, log in, and send messages. It uses MongoDB for data storage and JWT for authentication.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repo-url>
   cd <repo-name>
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Ensure that MongoDB is running and accessible.

## Running the Application

### Using Docker

1. Build the Docker image:
   ```
   docker build -t todo-chat-notes .
   ```

2. Run the Docker container:
   ```
   docker run -d -p 80:5000 --name todo-chat-notes-app --env-file .env todo-chat-notes
   ```

3. Access the application at `http://localhost`.

### Without Docker

1. Run the application:
   ```
   python app.py
   ```

2. Access the application at `http://localhost:5000`.

## Usage

- Register a new user using the registration form.
- Log in with your credentials.
- Send and get messages in the chat interface.

## License

This project is licensed under the MIT License.