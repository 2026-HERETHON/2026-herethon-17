// ===== 요소 가져오기 =====
const signupForm = document.getElementById("signup-form");
const essentialCheckbox = document.getElementById("policy-essential");
const signupBtn = document.querySelector(".signup-btn");
const policyError = document.querySelector(".signup-policyerror");

const passwordInput = document.getElementById("password");
const passwordAgainInput = document.getElementById("password-again");
const pwAgainGroup = document.getElementById("pw-again-group");

// ===== 필수 약관 체크 여부에 따라 버튼 활성화 =====
essentialCheckbox?.addEventListener("change", () => {
  if (essentialCheckbox.checked) {
    signupBtn.classList.add("active");
    policyError.classList.remove("show");   // 체크하면 에러 메시지 숨김
  } else {
    signupBtn.classList.remove("active");
  }
});

// ===== 비밀번호 확인 일치 여부 체크 =====
passwordAgainInput?.addEventListener("input", () => {
  if (passwordAgainInput.value.length === 0) return;

  if (passwordInput.value !== passwordAgainInput.value) {
    passwordAgainInput.style.borderColor = "#E05C5C";
  } else {
    passwordAgainInput.style.borderColor = "#6B9E7A";
  }
});

// ===== 폼 제출 처리 =====
signupForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  // 필수 약관 미동의 시 에러 메시지 보여주고 제출 막기
  if (!essentialCheckbox.checked) {
    policyError.classList.add("show");
    return;
  }

  // 비밀번호 불일치 시 제출 막기 (간단한 알림으로 대체, 나중에 에러 메시지 UI로 교체 가능)
  if (passwordInput.value !== passwordAgainInput.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  // TODO: 백엔드 연동되면 여기서 실제 회원가입 API 호출
  window.location.href = "survey.html";
});