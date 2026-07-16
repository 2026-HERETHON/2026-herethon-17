document.addEventListener("DOMContentLoaded", function () {

  /* ==========================================
     1. 커뮤니티 리스트 페이지 태그 선택
  ========================================== */
  const allCheckbox = document.getElementById("tag-all");
  const otherCheckboxes = document.querySelectorAll(".community-tag-input:not(#tag-all)");

  if (allCheckbox) {
    // "전체" 체크박스 변경 이벤트
    allCheckbox.addEventListener("change", function () {
      if (this.checked) {
        otherCheckboxes.forEach((cb) => {
          cb.checked = false;
        });
      } else {
        const anyOtherChecked = Array.from(otherCheckboxes).some((cb) => cb.checked);
        if (!anyOtherChecked) {
          this.checked = true;
        }
      }
    });

    // 일반 태그 체크박스 변경 이벤트
    otherCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const anyOtherChecked = Array.from(otherCheckboxes).some((cb) => cb.checked);
        if (anyOtherChecked) {
          allCheckbox.checked = false;
        } else {
          allCheckbox.checked = true;
        }
      });
    });
  }

  /* ==========================================
     2. 게시글 상세 페이지 좋아요 토글
  ========================================== */
  const likeBtn = document.querySelector(".detail-like");
  const likeIcon = document.querySelector(".detail-like-icon");

  if (likeBtn && likeIcon) {
    likeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (likeIcon.src.includes("icon_like.svg")) {
        likeIcon.src = "assets/icons/icon_like_active.svg";
        likeBtn.classList.add("active");
      } else {
        likeIcon.src = "assets/icons/icon_like.svg";
        likeBtn.classList.remove("active");
      }
    });
  }

  /* ==========================================
     3. 글쓰기 페이지 증상 태그 선택
  ========================================== */
  const tagButtons = document.querySelectorAll(".post-write-tag-btn");

  if (tagButtons.length > 0) {
    tagButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        this.classList.toggle("active");
      });
    });
  }

  /* ==========================================
     4. 게시글 상세 페이지 [게시글 삭제]
  ========================================== */
  const postDeleteBtn = document.getElementById("postDeleteBtn");
  if (postDeleteBtn) {
    postDeleteBtn.addEventListener("click", function () {
      openCommonModal({
        title: "정말 게시글을 삭제하시겠어요?",
        subtitle: "삭제한 게시글은 되돌릴 수 없으니 신중하게 선택해주세요",
        confirmText: "삭제하기",
        cancelText: "취소",
        onConfirm: function () {
          // 백엔드 삭제 URL 이동 처리
        }
      });
    });
  }

  /* ==========================================
     5. 게시글 상세 페이지 [댓글 수정/삭제]
  ========================================== */
  const commentListContainer = document.querySelector(".detail-comment-list");

  if (commentListContainer) {
    commentListContainer.addEventListener("click", (e) => {

      // 댓글 삭제
      if (e.target.classList.contains("comment-delete-btn")) {
        const commentCard = e.target.closest(".comment-item-card");
        const commentId = commentCard ? commentCard.dataset.id : null;

        openCommonModal({
          title: "정말 댓글을 삭제하시겠어요?",
          subtitle: "삭제한 댓글은 되돌릴 수 없으니 신중하게 선택해주세요",
          confirmText: "삭제하기",
          cancelText: "취소",
          onConfirm: function () {
            // 백엔드 삭제 URL 이동 처리
          }
        });
      }

      // 댓글 수정 모드 전환
      if (e.target.classList.contains("comment-edit-btn")) {
        const card = e.target.closest(".comment-item-card");
        const viewMode = card.querySelector(".comment-view-mode");
        const editMode = card.querySelector(".comment-edit-mode");

        if (viewMode && editMode) {
          const originalText = viewMode.querySelector(".comment-item-text").textContent.trim();
          const editInput = editMode.querySelector(".comment-edit-field");

          if (editInput) {
            editInput.value = originalText;
            editInput.style.height = "auto";
            editInput.style.height = editInput.scrollHeight + 4 + "px";
          }

          viewMode.style.display = "none";
          editMode.style.display = "block";
          if (editInput) editInput.focus();
        }
      }

      // 댓글 수정 취소
      if (e.target.classList.contains("comment-edit-cancel")) {
        const card = e.target.closest(".comment-item-card");
        const viewMode = card.querySelector(".comment-view-mode");
        const editMode = card.querySelector(".comment-edit-mode");

        if (viewMode && editMode) {
          editMode.style.display = "none";
          viewMode.style.display = "block";
        }
      }

      // 댓글 수정 저장 (토스트 없이 완료)
      if (e.target.classList.contains("comment-edit-save")) {
        const card = e.target.closest(".comment-item-card");
        const viewMode = card.querySelector(".comment-view-mode");
        const editMode = card.querySelector(".comment-edit-mode");
        const editInput = editMode.querySelector(".comment-edit-field");

        if (editInput) {
          const newText = editInput.value.trim();
          if (newText === "") {
            alert("수정할 내용을 입력해 주세요.");
            return;
          }

          viewMode.querySelector(".comment-item-text").textContent = newText;
          editMode.style.display = "none";
          viewMode.style.display = "block";
        }
      }

    });
  }

  /* ==========================================
     6. 글쓰기 페이지 작성 완료
  ========================================== */
  const writeSubmitBtn = document.querySelector(".post-write-btn");

  if (writeSubmitBtn) {
    writeSubmitBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const titleInput = document.querySelector(".post-write-input");
      if (titleInput && titleInput.value.trim() === "") {
        alert("제목을 입력해 주세요.");
        return;
      }

      // 작성 완료 후 타임라인 목록으로 이동 (추가)
      
    });
  }

});