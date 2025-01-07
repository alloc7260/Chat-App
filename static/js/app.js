let token = "";

function showToast(message, type = "info") {
  const toastContainer =
    document.getElementById("toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `p-4 mb-4 text-white rounded-lg shadow-lg transition-opacity duration-300 ease-in-out ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className =
    "fixed top-5 right-5 z-50 flex flex-col items-end space-y-2";
  document.body.appendChild(container);
  return container;
}

function register() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => showToast(data.message, "success"));
}

function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Login successful!") {
        window.location.href = "/dashboard";
      } else {
        showToast(data.message, "error");
      }
    });
}

function sendMessage() {
  const message = document.getElementById("chat-message").value;

  fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-access-tokens": token },
    body: JSON.stringify({ message }),
  })
    .then((response) => response.json())
    .then((data) => {
      showToast(data.message, "success");
      getMessages();
    });
}

function deleteMessage(messageId) {
  fetch(`/chat/${messageId}`, {
    method: "DELETE",
    headers: { "x-access-tokens": token },
  })
    .then((response) => response.json())
    .then((data) => {
      showToast(data.message, "success");
      getMessages();
    });
}

function getMessages() {
  fetch("/chat", {
    method: "GET",
    headers: { "x-access-tokens": token },
  })
    .then((response) => response.json())
    .then((data) => {
      const chatMessages = document.getElementById("chat-messages");
      chatMessages.innerHTML = "";
      data.messages.forEach((msg) => {
        const div = document.createElement("div");
        div.className = "p-2 bg-gray-200 rounded-lg flex justify-between items-center";
        const messageText = document.createElement("span");
        messageText.textContent = msg.message;
        const copyIcon = document.createElement("button");
        copyIcon.className = "ml-2 text-blue-500";
        copyIcon.innerHTML = "&#x2398;"; // Copy icon
        copyIcon.onclick = () => {
          navigator.clipboard.writeText(msg.message);
          showToast("Message copied to clipboard!", "success");
        };
        const deleteIcon = document.createElement("button");
        deleteIcon.className = "ml-2 text-red-500";
        deleteIcon.innerHTML = "&#x1F5D1;"; // Delete icon
        deleteIcon.onclick = () => deleteMessage(msg.id); // Ensure correct property is accessed
        div.appendChild(messageText);
        div.appendChild(copyIcon);
        div.appendChild(deleteIcon);
        chatMessages.appendChild(div);
      });
    });
}

function logout() {
  fetch("/logout", { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      showToast(data.message, "info");
      window.location.href = "/";
    });
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("/chat", {
    method: "GET",
    headers: { "x-access-tokens": token },
  })
    .then((response) => {
      if (response.status === 200) {
        document.getElementById("auth").style.display = "none";
        document.getElementById("chat").style.display = "block";
        return response.json();
      } else {
        throw new Error("Not authenticated");
      }
    })
    .then((data) => {
      const chatMessages = document.getElementById("chat-messages");
      chatMessages.innerHTML = "";
      data.messages.forEach((msg) => {
        const div = document.createElement("div");
        div.className = "p-2 bg-gray-200 rounded-lg flex justify-between items-center";
        const messageText = document.createElement("span");
        messageText.textContent = msg.message;
        const copyIcon = document.createElement("button");
        copyIcon.className = "ml-2 text-blue-500";
        copyIcon.innerHTML = "&#x2398;"; // Copy icon
        copyIcon.onclick = () => {
          navigator.clipboard.writeText(msg.message);
          showToast("Message copied to clipboard!", "success");
        };
        const deleteIcon = document.createElement("button");
        deleteIcon.className = "ml-2 text-red-500";
        deleteIcon.innerHTML = "&#x1F5D1;"; // Delete icon
        deleteIcon.onclick = () => deleteMessage(msg.id); // Ensure correct property is accessed
        div.appendChild(messageText);
        div.appendChild(copyIcon);
        div.appendChild(deleteIcon);
        chatMessages.appendChild(div);
      });
    })
    .catch((error) => {
      showToast(error.message, "error");
    });
});
