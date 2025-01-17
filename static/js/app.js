let token;

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
      document.getElementById("chat-message").value = ""; // Clear the input
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

function renderMessages(messages) {
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = "";
  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className = "p-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-lg flex justify-between items-center";
    const iconsDiv = document.createElement("div");
    iconsDiv.className = "flex items-center space-x-2";
    const copyIcon = document.createElement("button");
    copyIcon.className = "text-xl text-red-500";
    copyIcon.innerHTML = "&#x2398;";
    copyIcon.onclick = () => {
      navigator.clipboard.writeText(msg.message);
      showToast("Message copied to clipboard!", "success");
    };
    const deleteIcon = document.createElement("button");
    deleteIcon.className = "text-red-500";
    deleteIcon.innerHTML = "&#x1F5D1;";
    deleteIcon.onclick = () => deleteMessage(msg.id);
    iconsDiv.appendChild(copyIcon);
    iconsDiv.appendChild(deleteIcon);
    const messageText = document.createElement("div");
    messageText.className = "text-right flex-grow";
    messageText.textContent = msg.message;
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

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname === "/dashboard") { // Check if on the dashboard page
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
        document.getElementById("current-username").textContent = data.username;
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
  document.getElementById("send-svg").setAttribute("fill", isDarkMode ? "#ffffff" : "#000000");
  document.getElementById("dark-mode-toggle").innerHTML = isDarkMode ? sun_svg : moon_svg;
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
    document.getElementById("send-svg").setAttribute("fill", "#ffffff");
    document.getElementById("dark-mode-toggle").innerHTML = sun_svg;
  } else {
    document.documentElement.classList.remove("dark");
    document.getElementById("send-svg").setAttribute("fill", "#000000");
    document.getElementById("dark-mode-toggle").innerHTML = moon_svg;
  }
});