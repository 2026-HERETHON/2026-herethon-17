
  /* ==========================================
    뒤로가기 버튼 공통 동작
  ========================================== */
  // 헤더에 있는 뒤로가기 버튼(.back-btn)을 찾아서, 클릭하면 이전 페이지로 이동하게 합니다.
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  /* ==========================================
     하단 GNB바 자동 활성화
  ========================================== */

    // 현재 페이지의 URL을 가져와서, 그에 맞는 GNB 메뉴를 활성화합니다.
    // 추후 수정


/* ==========================================
   공통 팝업(모달) 열기 / 닫기 함수
========================================== */

  // 게시글/화분 삭제 확인, 로그아웃 확인 등 공통적으로 사용되는 모달을 열고 닫는 함수입니다.
  /**
 * @param {Object} options - 모달에 들어갈 텍스트 및 설정 옵션
 * @param {String} options.title - 모달 메인 제목 (예: "정말 화분을 삭제하시겠어요?")
 * @param {String} options.subtitle - 모달 부제목 (예: "삭제한 화분은 되돌릴 수 없으니...")
 * @param {String} options.confirmText - 확인 버튼 글자 (예: "삭제하기" 또는 "로그아웃")
 * @param {String} options.cancelText - 취소 버튼 글자 (예: "취소")
 * @param {Function} options.onConfirm - 확인 버튼을 눌렀을 때 실행할 함수
 */
function openCommonModal(options) {
  const modal = document.getElementById("deleteModal"); // HTML에 만든 모달 ID

  if (!modal) return;

  // 1. 모달 내부 텍스트들을 옵션에 맞게 동적으로 변경
  if (options.title) modal.querySelector(".modal-title").innerText = options.title;
  if (options.subtitle) modal.querySelector(".modal-subtitle").innerText = options.subtitle;

  const confirmBtn = document.getElementById("confirmDelete");
  const cancelBtn = document.getElementById("cancelDelete");

  if (options.confirmText && confirmBtn) confirmBtn.innerText = options.confirmText;
  if (options.cancelText && cancelBtn) cancelBtn.innerText = options.cancelText;

  // 2. 모달 열기
  modal.style.display = "flex";

  // 3. 확인 버튼 이벤트 바인딩 (이전 이벤트 중복 방지를 위해 초기화 후 등록)
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", function () {
    modal.style.display = "none";
    if (typeof options.onConfirm === "function") {
      options.onConfirm(); // 넘겨받은 삭제 또는 로그아웃 로직 실행
    }
  });

  // 4. 취소 버튼 이벤트 바인딩
  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

  newCancelBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", function () {

  // 1. 5.2. 화분 상세 페이지 실행 코드
  const gardenDeleteBtn = document.getElementById("deleteBtn");
  if (gardenDeleteBtn) { // 💡 이 버튼이 "현재 화면에 있을 때만" 실행되게 안전장치!
    gardenDeleteBtn.addEventListener("click", function() {
      openCommonModal({
        title: "정말 화분을 삭제하시겠어요?",
        subtitle: "삭제한 화분은 되돌릴 수 없으니 신중하게 선택해주세요",
        confirmText: "삭제하기", cancelText: "취소",
        onConfirm: function() { showToast("success", "삭제가 정상적으로 완료되었어요."); }
      });
    });
  }

  // 2. 6.2. 게시글 상세 [게시글 삭제] 실행 코드
  // 게시글 삭제 버튼 id="postDeleteBtn"
  const postDeleteBtn = document.getElementById("postDeleteBtn");

  if (postDeleteBtn) {
    postDeleteBtn.addEventListener("click", function() {
      openCommonModal({
        title: "정말 게시글을 삭제하시겠어요?",
        subtitle: "삭제한 게시글은 되돌릴 수 없으니 신중하게 선택해주세요",
        confirmText: "삭제하기",
        cancelText: "취소",
      });
    });
  }

  // 3. 6.2. 게시글 상세 [댓글 삭제] 실행 코드
  // 댓글 삭제 버튼 id="commentDeleteBtn"
  const commentDeleteBtn = document.getElementById("commentDeleteBtn");

  if (commentDeleteBtn) {
    commentDeleteBtn.addEventListener("click", function() {
      openCommonModal({
        title: "정말 댓글을 삭제하시겠어요?",
        subtitle: "삭제한 댓글은 되돌릴 수 없으니 신중하게 선택해주세요",
        confirmText: "삭제하기",
        cancelText: "취소",
      });
    });
  }

  // 4. 7. 마이페이지 메인 [로그아웃] 실행 코드
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
      openCommonModal({
        title: "로그아웃 하시겠어요?",
        subtitle: "안전하게 로그아웃 후 홈 화면으로 이동합니다.",
        confirmText: "로그아웃", cancelText: "취소",
        onConfirm: function() { console.log("로그아웃 로직 실행"); }
      });
    });
  }

});