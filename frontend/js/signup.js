// ===== 요소 가져오기 =====
const signupForm = document.getElementById("signup-form");
const essentialCheckbox = document.getElementById("policy-essential");
const signupBtn = document.querySelector(".signup-btn");
const policyError = document.querySelector(".signup-policyerror");

const emailInput = document.getElementById("email");
const emailGroup = document.getElementById("email-group");
const emailError = document.getElementById("email-error");

const passwordInput = document.getElementById("password");
const pwGroup = document.getElementById("pw-group");

const passwordAgainInput = document.getElementById("password-again");
const pwAgainGroup = document.getElementById("pw-again-group");

const MIN_PW_LENGTH = 8;

// ===== (임시) 이미 가입된 이메일 목록 - 백엔드 연동 전 목업 =====
const REGISTERED_EMAILS = ["test@example.com", "herb@herb.com"];

// TODO: 백엔드 연동되면 아래 함수를 실제 API 호출로 교체
// 예: const res = await fetch(`/api/check-email?email=${email}`);
function isEmailRegistered(email) {
  return REGISTERED_EMAILS.includes(email.trim().toLowerCase());
}

function isValidEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== 이메일 중복 체크 =====
function validateEmail() {
  const value = emailInput.value.trim();

  if (value.length === 0) {
    emailGroup.classList.remove("error", "success");
    return true;
  }

  if (!isValidEmailFormat(value)) {
    emailGroup.classList.remove("error", "success");
    return true; // 형식 오류는 required + type="email"이 처리
  }

  if (isEmailRegistered(value)) {
    emailError.textContent = "이미 가입된 이메일입니다.";
    emailGroup.classList.add("error");
    emailGroup.classList.remove("success");
    return false;
  } else {
    emailGroup.classList.remove("error");
    emailGroup.classList.add("success");
    return true;
  }
}

// 입력할 때마다 체크 (blur 시점에 체크하고 싶으면 "blur"로 변경)
emailInput?.addEventListener("blur", validateEmail);
emailInput?.addEventListener("input", () => {
  // 입력 중엔 에러 표시를 지웠다가, blur 시점에 다시 체크되게
  if (emailGroup.classList.contains("error")) {
    emailGroup.classList.remove("error");
  }
});

// ===== 필수 약관 체크 여부에 따라 버튼 활성화 =====
essentialCheckbox?.addEventListener("change", () => {
  if (essentialCheckbox.checked) {
    signupBtn.classList.add("active");
    policyError.classList.remove("show");
  } else {
    signupBtn.classList.remove("active");
  }
});

// ===== 비밀번호 길이 체크 =====
function validatePasswordLength() {
  const value = passwordInput.value;

  if (value.length === 0) {
    pwGroup.classList.remove("error", "success");
    return true;
  }

  if (value.length < MIN_PW_LENGTH) {
    pwGroup.classList.add("error");
    pwGroup.classList.remove("success");
    return false;
  } else {
    pwGroup.classList.remove("error");
    pwGroup.classList.add("success");
    return true;
  }
}

// ===== 비밀번호 확인 일치 여부 체크 =====
function validatePasswordMatch() {
  const value = passwordAgainInput.value;

  if (value.length === 0) {
    pwAgainGroup.classList.remove("error", "success");
    return true;
  }

  if (passwordInput.value !== value) {
    pwAgainGroup.classList.add("error");
    pwAgainGroup.classList.remove("success");
    return false;
  } else {
    pwAgainGroup.classList.remove("error");
    pwAgainGroup.classList.add("success");
    return true;
  }
}

passwordInput?.addEventListener("input", () => {
  validatePasswordLength();
  if (passwordAgainInput.value.length > 0) {
    validatePasswordMatch();
  }
});

passwordAgainInput?.addEventListener("input", validatePasswordMatch);

// ===== 폼 제출 처리 =====
signupForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  // 이메일 중복 체크
  const isEmailValid = validateEmail();
  if (!isEmailValid) {
    emailInput.focus();
    return;
  }

  // 필수 약관 미동의 시 에러 메시지 보여주고 제출 막기
  if (!essentialCheckbox.checked) {
    policyError.classList.add("show");
    return;
  }

  // 비밀번호 길이 체크
  const isLengthValid = validatePasswordLength();
  if (!isLengthValid) {
    passwordInput.focus();
    return;
  }

  // 비밀번호 확인 일치 체크
  const isMatchValid = validatePasswordMatch();
  if (!isMatchValid) {
    passwordAgainInput.focus();
    return;
  }

  // TODO: 백엔드 연동되면 여기서 실제 회원가입 API 호출
  window.location.href = "survey.html";
});