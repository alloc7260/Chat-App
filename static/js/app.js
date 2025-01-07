let token = "";

function register() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => alert(data.message));
}

function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Login successful!") {
        window.location.href = "/dashboard";
      } else {
        alert(data.message);
      }
    });
}

function createTodo() {
  const title = document.getElementById("todo-title").value;
  const description = document.getElementById("todo-description").value;

  fetch("/todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-tokens": token,
    },
    body: JSON.stringify({ title, description }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      getTodos();
    });
}

function getTodos() {
  fetch("/todo", {
    method: "GET",
    headers: {
      "x-access-tokens": token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const todoList = document.getElementById("todo-list");
      todoList.innerHTML = "";
      data.todos.forEach((todo) => {
        const li = document.createElement("li");
        li.textContent = `${todo.title}: ${todo.description}`;
        todoList.appendChild(li);
      });
    });
}

function logout() {
  fetch("/logout", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      window.location.href = "/";
    });
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("/todo", {
    method: "GET",
    headers: {
      "x-access-tokens": token,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        document.getElementById("auth").style.display = "none";
        document.getElementById("todo").style.display = "block";
        return response.json();
      } else {
        throw new Error("Not authenticated");
      }
    })
    .then((data) => {
      const todoList = document.getElementById("todo-list");
      todoList.innerHTML = "";
      data.todos.forEach((todo) => {
        const li = document.createElement("li");
        li.textContent = `${todo.title}: ${todo.description}`;
        todoList.appendChild(li);
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
});