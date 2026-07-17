const emailGroup = document.getElementById("emailGroup");
const emailInput = document.getElementById("email");
const pwGroup = document.getElementById("pwGroup");
const pwInput = document.getElementById("password");
const loginBtn = document.querySelector(".btn-login");

// 로그인 버튼 활성화
function checkLoginButton() {
  const emailValue = emailInput.value.trim();
  const pwValue = pwInput.value.trim();

  if (emailValue.length > 0 && pwValue.length > 0) {
    loginBtn.classList.add("active");
  } else {
    loginBtn.classList.remove("active");
  }
}

//이메일 입력
emailInput?.addEventListener("input", () => {
  emailGroup.classList.remove("error", "valid");
  hideAllErrors(emailGroup);

  if (emailInput.value.length === 0) {
    checkLoginButton();
    return;
  }

  const isValidFormat = /\S+@\S+\.\S+/.test(emailInput.value);
  if (isValidFormat) {
    emailGroup.classList.add("valid");
  }

  checkLoginButton();
});

// 비밀번호 입력
pwInput?.addEventListener("input", () => {
  pwGroup.classList.remove("error", "valid");
  hideAllErrors(pwGroup);

   if (pwInput.value.length === 0) {
    checkLoginButton();
    return;
  }

  if (pwInput.value.length >= 8) {
    pwGroup.classList.add("valid");
  }

  checkLoginButton();
});

function showError(group, errorType) {
  group.classList.remove("valid");
  group.classList.add("error");
  hideAllErrors(group);
  const errorEl = group.querySelector(`[data-error="${errorType}"]`);
  if (errorEl) errorEl.classList.add("show");
}

// 에러 메시지 전부 숨기기
function hideAllErrors(group) {
  group.querySelectorAll(".error-message").forEach(el => el.classList.remove("show"));
}