
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
        onConfirm: function() { document.getElementById("logout-form").submit(); }
      });
    });
  }

});

/* ==========================================
   토스트 메시지 
========================================== */

  // 게시글 수정완료 등의 토스트 메시지를 표시하는 함수입니다.

document.addEventListener('DOMContentLoaded', function() {
  /* ==========================================
  게시글 좋아요 버튼
  ========================================== */
  const likeBtn = document.querySelector('.detail-like');
  const likeIcon = document.querySelector('.detail-like-icon');

  // 화면에 좋아요 버튼이 진짜 존재할 때만 실행! (글쓰기 창에선 무시하고 통과함)
  if (likeBtn && likeIcon) {
    likeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (likeIcon.src.includes('icon_like.svg')) {
        likeIcon.src = 'assets/icons/icon_like_fill.svg';
        likeBtn.classList.add('active');
      } else {
        likeIcon.src = 'assets/icons/icon_like.svg';
        likeBtn.classList.remove('active');
      }
    });
  }


/* ==========================================
  6.3. 글쓰기 페이지 증상 태그 
========================================== */
  const tagButtons = document.querySelectorAll('.post-write-tag-btn');
  
  // 글쓰기 페이지에서만 실행
  if (tagButtons.length > 0) {
    tagButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault(); // 버튼 클릭 시 새로고침 방지
        this.classList.toggle('active'); // active 클래스 토글
      });
    });
  }

});


document.addEventListener("DOMContentLoaded", () => {
  // --- 요소 선택 ---
  const deleteModal = document.getElementById("deleteModal");
  const modalMainTitle = document.getElementById("modalMainTitle");
  const modalSubTitle = document.getElementById("modalSubTitle");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const cancelDeleteBtn = document.getElementById("cancelDelete");

  const postDeleteBtn = document.getElementById("postDeleteBtn");
  const toastSuccess = document.getElementById("toast-success");

  // 삭제 처리를 위한 임시 상태 저장 변수
  let deleteTargetType = null; // 'post' 또는 'comment'
  let commentToDeleteNode = null; // 삭제할 댓글 엘리먼트 보관용

  // ==========================================
  // [공통 함수] 토스트 메시지 출력
  // ==========================================
  function showToast(message) {
    if (!toastSuccess) return;
    
    // 텍스트 교체
    const toastText = toastSuccess.querySelector(".toast-text");
    if (toastText) toastText.textContent = message;

    // 보이기 코드 추가
    toastSuccess.classList.add("show");

    // 2.5초 후 자동으로 사라짐
    setTimeout(() => {
      toastSuccess.classList.remove("show");
    }, 2500);
  }

  // ==========================================
  // 1. 게시글 삭제 팝업 제어
  // ==========================================
  if (postDeleteBtn) {
    postDeleteBtn.addEventListener("click", () => {
      deleteTargetType = "post";
      modalMainTitle.textContent = "정말 게시글을 삭제하시겠어요?";
      modalSubTitle.textContent = "삭제한 게시글은 되돌릴 수 없으니 신중하게 선택해주세요";
      deleteModal.style.display = "flex";
    });
  }

  // ==========================================
  // 2. 댓글 삭제 및 수정 이벤트 위임 (동적 바인딩 고려)
  // ==========================================
  const commentListContainer = document.querySelector(".detail-comment-list");
  
  if (commentListContainer) {
    commentListContainer.addEventListener("click", (e) => {
      
      // A. 댓글 삭제 클릭 시
      if (e.target.classList.contains("comment-delete-btn")) {
        deleteTargetType = "comment";
        commentToDeleteNode = e.target.closest(".comment-item-card"); // 해당 댓글 카드 선택
        
        modalMainTitle.textContent = "정말 댓글을 삭제하시겠어요?";
        modalSubTitle.textContent = "삭제한 댓글은 되돌릴 수 없으니 신중하게 선택해주세요";
        deleteModal.style.display = "flex";
      }

      // B. 댓글 수정 클릭 시 -> 수정 모드로 전환
      if (e.target.classList.contains("comment-edit-btn")) {
        const card = e.target.closest(".comment-item-card");
        const viewMode = card.querySelector(".comment-view-mode");
        const editMode = card.querySelector(".comment-edit-mode");

        if(viewMode && editMode) {
          viewMode.style.display = "none";
          editMode.style.display = "block";
          card.querySelector(".comment-edit-field").focus(); // 입력란에 바로 포커스
        }
      }

    });
  }

  // ==========================================
  // 3. 모달 팝업 내부 버튼 처리 (취소 / 삭제하기)
  // ==========================================
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      deleteModal.style.display = "none";
      deleteTargetType = null;
      commentToDeleteNode = null;
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      deleteModal.style.display = "none";

      if (deleteTargetType === "post") {
        // [게시글 삭제] 실제 서비스에서는 서버 API 연동 후 페이지 이동
        alert("게시글이 삭제되었습니다.");
        window.location.href = "community_timeline.html"; // 타임라인 목록으로 이동 처리 예시
        
      } else if (deleteTargetType === "comment" && commentToDeleteNode) {
        // [댓글 삭제] 화면에서 엘리먼트 삭제 제거
        commentToDeleteNode.remove();
        showToast("댓글이 정상적으로 삭제되었어요.");
        
        // 상단 댓글 숫자 count 동적 감소 처리 (옵션)
        const countBadges = document.querySelectorAll(".detail-comment-count span, .detail-chat .count");
        countBadges.forEach(badge => {
          let currentCount = parseInt(badge.textContent) || 0;
          if (currentCount > 0) badge.textContent = currentCount - 1;
        });
      }

      // 완료 후 변수 초기화
      deleteTargetType = null;
      commentToDeleteNode = null;
    });
  }

});