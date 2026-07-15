// ===== 요소 가져오기 =====
const essentialCheckbox = document.getElementById("policy-essential");
const signupBtn = document.querySelector(".signup-btn");
const policyError = document.querySelector(".signup-policyerror");

const passwordInput = document.getElementById("password");
const pwGroup = document.getElementById("pw-group");

const passwordAgainInput = document.getElementById("password-again");
const pwAgainGroup = document.getElementById("pw-again-group");

const MIN_PW_LENGTH = 8;

// ===== 필수 약관 체크 여부에 따라 버튼 활성화 =====
essentialCheckbox?.addEventListener("change", () => {
  if (essentialCheckbox.checked) {
    signupBtn.classList.add("active");
    policyError.classList.remove("show");
  } else {
    signupBtn.classList.remove("active");
  }
});

// ===== 비밀번호 길이 체크 (실시간 시각 효과만) =====
function validatePasswordLength() {
  const value = passwordInput.value;
  if (value.length === 0) {
    pwGroup.classList.remove("error", "success");
    return;
  }
  if (value.length < MIN_PW_LENGTH) {
    pwGroup.classList.add("error");
    pwGroup.classList.remove("success");
  } else {
    pwGroup.classList.remove("error");
    pwGroup.classList.add("success");
  }
}

// ===== 비밀번호 확인 일치 여부 체크 (실시간 시각 효과만) =====
function validatePasswordMatch() {
  const value = passwordAgainInput.value;
  if (value.length === 0) {
    pwAgainGroup.classList.remove("error", "success");
    return;
  }
  if (passwordInput.value !== value) {
    pwAgainGroup.classList.add("error");
    pwAgainGroup.classList.remove("success");
  } else {
    pwAgainGroup.classList.remove("error");
    pwAgainGroup.classList.add("success");
  }
}

passwordInput?.addEventListener("input", () => {
  validatePasswordLength();
  if (passwordAgainInput.value.length > 0) {
    validatePasswordMatch();
  }
});

passwordAgainInput?.addEventListener("input", validatePasswordMatch);

// 폼 제출 관련 로직(이메일 중복 체크 포함)은 삭제
// <form method="post">가 자연스럽게 서버(signup_view)로 제출되도록 처리
// 이메일 중복, 비밀번호 검증은 서버에서 실제 DB로 확인