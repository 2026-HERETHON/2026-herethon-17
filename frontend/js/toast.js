/* ==========================================
   토스트 메시지
========================================== */

// 토스트 메시지를 띄우는 공통 함수
function showToast(toastId) {
  const toastElement = document.getElementById(toastId);
  
  if (!toastElement) return;

  // 토스트 나타나게 하기
  toastElement.classList.add("show");

  // 2초 뒤에 사라지게
  setTimeout(() => {
    toastElement.classList.remove("show");
  }, 2000);
}

// ==========================================
// '수정 완료' 버튼 클릭 이벤트 연결
// ==========================================
const btnEditComplete = document.getElementById("btn-edit-complete");

if (btnEditComplete) {
  btnEditComplete.addEventListener("click", function () {
    // 버튼을 누르면 성공 토스트를 띄움
    showToast("toast-success");
    
    // (추후수정, 나중에 백엔드와 연결할 때, 통신에 실패하면 
    // showToast("toast-error"); 를 호출하도록 분기 처리)
  });
}