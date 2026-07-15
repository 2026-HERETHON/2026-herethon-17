/* ==========================================
   1. 뒤로가기 버튼 공통 동작
========================================== */
const backBtn = document.querySelector(".back-btn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.history.back();
  });
}

/* ==========================================
   2. 공통 팝업(모달) 열기 및 닫기 함수
========================================== */
function openCommonModal(options) {
  const modal = document.getElementById("deleteModal");
  if (!modal) return;

  // 텍스트 동적 변경
  if (options.title) modal.querySelector(".modal-title").innerText = options.title;
  if (options.subtitle) modal.querySelector(".modal-subtitle").innerText = options.subtitle;

  const confirmBtn = document.getElementById("confirmDelete");
  const cancelBtn = document.getElementById("cancelDelete");

  if (options.confirmText && confirmBtn) confirmBtn.innerText = options.confirmText;
  if (options.cancelText && cancelBtn) cancelBtn.innerText = options.cancelText;

  modal.style.display = "flex";

  // 이벤트 중복 등록 방지를 위한 버튼 복제 및 교체
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", function () {
    modal.style.display = "none";
    if (typeof options.onConfirm === "function") {
      options.onConfirm();
    }
  });

  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

  newCancelBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });
}

/* ==========================================
   3. 공통 토스트 메시지 함수
========================================== */
function showToast(message) {
  const toastSuccess = document.getElementById("toast-success");
  if (!toastSuccess) return;

  const toastText = toastSuccess.querySelector(".toast-text");
  if (toastText) toastText.textContent = message;

  toastSuccess.classList.add("show");

  setTimeout(() => {
    toastSuccess.classList.remove("show");
  }, 2500);
}

/* ==========================================
   4. 공통 이벤트 핸들러
========================================== */
document.addEventListener("DOMContentLoaded", function () {

  // 화분 상세 페이지 삭제 기능
  const gardenDeleteBtn = document.getElementById("deleteBtn");
  if (gardenDeleteBtn) {
    gardenDeleteBtn.addEventListener("click", function () {
      openCommonModal({
        title: "정말 화분을 삭제하시겠어요?",
        subtitle: "삭제한 화분은 되돌릴 수 없으니 신중하게 선택해주세요",
        confirmText: "삭제하기",
        cancelText: "취소",
        onConfirm: function () {
          // 백엔드 삭제 요청 처리
        }
      });
    });
  }

  // 마이페이지 메인 로그아웃 기능
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();

      openCommonModal({
        title: "로그아웃 하시겠어요?",
        subtitle: " ",
        confirmText: "로그아웃",
        cancelText: "취소",
        onConfirm: function () {
          // 장고 로그아웃 처리
        }
      });
    });
  }

  // URL 쿼리 파라미터를 감지하여 토스트 메시지 노출 (글쓰기 완료 등)
  const urlParams = new URLSearchParams(window.location.search);
  const writeStatus = urlParams.get("writeStatus");

  if (writeStatus === "success") {
    showToast("게시가 정상적으로 완료되었어요.");

    // 새로고침 시 토스트 재출력 방지를 위한 URL 정리
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
});