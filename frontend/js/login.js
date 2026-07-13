const emailGroup = document.getElementById("emailGroup");
const emailInput = document.getElementById("email");
const pwGroup = document.getElementById("pwGroup");
const pwInput = document.getElementById("password");

emailInput?.addEventListener("input", () => {
  emailGroup.classList.remove("error", "valid");
  hideAllErrors(emailGroup);

  if (emailInput.value.length === 0) return; 

  const isValidFormat = /\S+@\S+\.\S+/.test(emailInput.value);
  if (isValidFormat) {
    emailGroup.classList.add("valid");
  }
});

pwInput?.addEventListener("input", () => {
  pwGroup.classList.remove("error", "valid");
  hideAllErrors(pwGroup);

  if (pwInput.value.length === 0) return;

  if (pwInput.value.length >= 8) {
    pwGroup.classList.add("valid");
  }
});

function showError(group, errorType) {
  group.classList.remove("valid");
  group.classList.add("error");
  hideAllErrors(group);
  const errorEl = group.querySelector(`[data-error="${errorType}"]`);
  if (errorEl) errorEl.classList.add("show");
}

function hideAllErrors(group) {
  group.querySelectorAll(".error-message").forEach(el => el.classList.remove("show"));
}

document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();


  window.location.href = "survey.html";
});