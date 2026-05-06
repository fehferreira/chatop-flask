import { applyCpfMask } from "/static/js/utils/masks.js";
import { isValidCpf, isValidEmail } from "/static/js/utils/validators.js";

const form = document.querySelector(".chat-input-area");
const initialMessage = document.querySelector(".initial-message");
const messageInput = document.getElementById("message");
const inputEmail = document.getElementById("email");
const inputDocument = document.getElementById("document");
const fakeSubmitButton = document.getElementById("fake-submit-button");
const submitButton = document.getElementById("submit-button");

let isAuthenticated = false;

submitButton.style.display = "none";
inputEmail.style.display = "none";
messageInput.style.display = "none";

const showChatMode = (user) => {
  isAuthenticated = true;
  inputDocument.style.display = "none";
  inputEmail.style.display = "none";
  fakeSubmitButton.style.display = "none";
  submitButton.style.display = "flex";
  messageInput.style.display = "flex";

  initialMessage.innerHTML = `Olá <b>${user.name}</b>, como podemos te ajudar hoje?`;

  messageInput.focus();
};

inputEmail.addEventListener("input", () => {
  inputEmail.value = inputEmail.value.toLowerCase();
});

inputDocument.addEventListener("input", () => {
  inputDocument.value = applyCpfMask(inputDocument.value);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isAuthenticated) {
    const message = messageInput.value.trim();
    if (!message) {
      return;
    }

    window.location.href = `/chat?message=${encodeURIComponent(message)}`;
    return;
  }

  if (!isValidEmail(inputEmail.value)) {
    initialMessage.textContent =
      "E-mail inválido. Por favor, insira um e-mail válido.";
    inputEmail.value = "";
    return;
  }

  const response = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document: inputDocument.value,
      email: inputEmail.value,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    initialMessage.textContent = data.message;

    inputDocument.value = "";
    inputEmail.value = "";

    inputDocument.style.display = "flex";
    inputEmail.style.display = "none";

    fakeSubmitButton.style.display = "flex";
    submitButton.style.display = "none";

    return;
  }

  showChatMode(data.user);
});

fakeSubmitButton.addEventListener("click", () => {
  if (isValidCpf(inputDocument.value)) {
    initialMessage.textContent = "Por favor, agora nos informe o seu e-mail.";

    inputDocument.style.display = "none";
    inputEmail.style.display = "flex";
    inputEmail.focus();

    fakeSubmitButton.style.display = "none";
    submitButton.style.display = "flex";
  } else {
    initialMessage.textContent =
      "CPF inválido. Por favor, insira um CPF válido.";
    inputDocument.value = "";
  }
});
