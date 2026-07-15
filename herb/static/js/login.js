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

/*
showError, hideAllErrors 함수가 login, signup 공통으로 쓰여서
static/js/login.js -> static/js/common.js 로 옮김
*/