import { applyCpfMask } from "/static/js/utils/masks.js";
import { isValidCpf, isValidEmail } from "/static/js/utils/validators.js";

const initialMessage = document.querySelector(".initial-message");
const inputEmail = document.getElementById("email");
const inputDocument = document.getElementById("document");
const fakeSubmitButton = document.getElementById("fake-submit-button");
const submitButton = document.getElementById("submit-button");

submitButton.style.display = "none";
inputEmail.style.display = "none";

inputEmail.addEventListener("input", () => {
  inputEmail.value = inputEmail.value.toLowerCase();
});

inputDocument.addEventListener("input", () => {
  inputDocument.value = applyCpfMask(inputDocument.value);
});

submitButton.closest("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isValidEmail(inputEmail.value)) {
    initialMessage.textContent = "E-mail inválido. Por favor, insira um e-mail válido.";
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

    inputDocument.style.display = "block";
    inputEmail.style.display = "none";

    fakeSubmitButton.style.display = "block";
    submitButton.style.display = "none";

    return;
  }

  window.location.href = "/chat";
});

fakeSubmitButton.addEventListener("click", () => {
  if(isValidCpf(inputDocument.value)) {
    initialMessage.textContent = "Por favor, agora nos informe o seu e-mail.";
    
    inputDocument.style.display = "none";
    inputEmail.style.display = "block";

    fakeSubmitButton.style.display = "none";
    submitButton.style.display = "block";
  } else {
    initialMessage.textContent = "CPF inválido. Por favor, insira um CPF válido.";
    inputDocument.value = "";
  }
});