let token;

function showToast(message, type = "info") {
  const toastContainer =
    document.getElementById("toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `p-4 mb-4 text-white rounded-md shadow-lg transition-opacity duration-300 ease-in-out ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;
  toast.innerText = message;
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
    .then((data) => {
      showToast(data.message, "success");
      document.getElementById("register-username").value = ""; // Clear the input
      document.getElementById("register-password").value = ""; // Clear the input
      return fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
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
      document.getElementById("login-username").value = ""; // Clear the input
      document.getElementById("login-password").value = ""; // Clear the input
    });
}

document
  .getElementById("chat-message")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

function sendMessage() {
  let message = document.getElementById("chat-message").innerText;
  if (message.trim() === "") return;
  message = message.replace(/\n\n/g, "\n");

  fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-access-tokens": token },
    body: JSON.stringify({ message }),
  })
    .then((response) => response.json())
    .then((data) => {
      showToast(data.message, "success");
      document.getElementById("chat-message").innerText = ""; // Clear the input
      document.getElementById("chat-message").focus(); // Refocus the input
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

function editMessage(messageId, currentMessage) {
  const messageElement = document.getElementById(`message-${messageId}`);
  messageElement.innerHTML = `
    <div id="edit-message-${messageId}" class="w-full text-sm p-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white whitespace-pre overflow-auto" contenteditable="true" role="textbox" autofocus ></div>
    <button onclick="saveMessage('${messageId}')" class="rounded-md p-2.5 text-center text-sm transition-all text-purple-600">
      &#x2714;
    </button>
    <button onclick="getMessages()" class="rounded-md p-2.5 text-center text-sm transition-all text-purple-600">
      &#x2716;
    </button>
  `;

  const editMessageElement = document.getElementById(
    `edit-message-${messageId}`
  );
  editMessageElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      saveMessage(messageId);
    }
  });
  editMessageElement.focus();
  editMessageElement.innerText = currentMessage;
}

function saveMessage(messageId) {
  let newMessage = document.getElementById(
    `edit-message-${messageId}`
  ).innerText;
  if (newMessage.trim() === "") return;
  newMessage = newMessage.replace(/\n\n/g, "\n");

  fetch(`/chat/${messageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-access-tokens": token },
    body: JSON.stringify({ message: newMessage }),
  })
    .then((response) => response.json())
    .then((data) => {
      showToast(data.message, "success");
      getMessages();
    });
}

function renderMessages(messages) {
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = "";
  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className =
      "p-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md flex justify-between items-center";
    div.id = `message-${msg.id}`;
    const iconsDiv = document.createElement("div");
    iconsDiv.className = "flex items-center space-x-2";
    const copyIcon = document.createElement("button");
    copyIcon.className = "text-xl text-red-500";
    copyIcon.innerHTML = "&#x2398;";
    copyIcon.onclick = () => {
      navigator.clipboard.writeText(msg.message);
      showToast("Message copied to clipboard!", "success");
    };
    const editIcon = document.createElement("button");
    editIcon.className = "text-yellow-500";
    editIcon.innerHTML = "&#x270E;";
    editIcon.onclick = () => editMessage(msg.id, msg.message);
    const deleteIcon = document.createElement("button");
    deleteIcon.className = "text-red-500";
    deleteIcon.innerHTML = "&#x1F5D1;";
    deleteIcon.onclick = () => deleteMessage(msg.id);
    iconsDiv.appendChild(copyIcon);
    iconsDiv.appendChild(editIcon);
    iconsDiv.appendChild(deleteIcon);
    const messageText = document.createElement("div");
    messageText.className =
      "ml-2 text-sm flex-grow whitespace-pre overflow-auto max-h-24";
    messageText.innerText = msg.message;
    div.appendChild(iconsDiv);
    div.appendChild(messageText);
    chatMessages.appendChild(div);
  });
}

function getMessages() {
  fetch("/chat", {
    method: "GET",
    headers: { "x-access-tokens": token },
  })
    .then((response) => response.json())
    .then((data) => {
      renderMessages(data.messages);
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

function showRegister() {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("register-section").style.display = "block";
  document.getElementById("logout-button").style.visibility = "hidden";
}

function showLogin() {
  document.getElementById("register-section").style.display = "none";
  document.getElementById("login-section").style.display = "block";
  document.getElementById("logout-button").style.visibility = "hidden";
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname === "/dashboard") {
    // Check if on the dashboard page
    fetch("/chat", {
      method: "GET",
      headers: { "x-access-tokens": token },
    })
      .then((response) => {
        if (response.status === 200) {
          document.getElementById("auth").style.display = "none";
          document.getElementById("chat").style.display = "block";
          document.getElementById("logout-button").style.visibility = "visible";
          return response.json();
        } else {
          throw new Error("Not authenticated");
        }
      })
      .then((data) => {
        document.getElementById("current-username").innerText = data.username;
        renderMessages(data.messages);
      })
      .catch((error) => {
        // Suppress the "Not authenticated" message
        if (error.message !== "Not authenticated") {
          showToast(error.message, "error");
        }
      });
  }
});

let sun_svg = `
🌞
`;

let moon_svg = `
🌜
`;

function toggleDarkMode() {
  const isDarkMode = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  document
    .getElementById("send-svg")
    .setAttribute("fill", isDarkMode ? "#000000" : "#ffffff");
  document.getElementById("dark-mode-toggle").innerHTML = isDarkMode
    ? sun_svg
    : moon_svg;
}

tailwind.config = {
  darkMode: "class",
};

document.addEventListener("DOMContentLoaded", () => {
  let theme = localStorage.getItem("theme");
  if (!theme) {
    theme = "dark";
    localStorage.setItem("theme", theme);
  }
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    document.getElementById("send-svg").setAttribute("fill", "#000000");
    document.getElementById("dark-mode-toggle").innerHTML = sun_svg;
  } else {
    document.documentElement.classList.remove("dark");
    document.getElementById("send-svg").setAttribute("fill", "#ffffff");
    document.getElementById("dark-mode-toggle").innerHTML = moon_svg;
  }
  showLogin(); // Show login section by default
});

