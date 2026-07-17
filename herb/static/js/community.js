document.addEventListener("DOMContentLoaded", function () {

  /* 공통: data-url 버튼 이동 (뒤로가기 등) */
  document.querySelectorAll("[data-url]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetUrl = button.dataset.url;
      if (targetUrl) {
        window.location.href = targetUrl;
      }
    });
  });

  /* 글쓰기: 태그 checkbox ↔ 버튼 active 스타일 동기화 */
  document.querySelectorAll(".post-write-tag-input").forEach((input) => {
    const btn = input
      .closest(".post-write-tag-item")
      ?.querySelector(".post-write-tag-btn");

    if (!btn) {
      return;
    }

    if (input.checked) {
      btn.classList.add("active");
    }

    input.addEventListener("change", () => {
      btn.classList.toggle("active", input.checked);
    });
  });

  /* 커뮤니티 목록: 복수 증상 필터 */
  const allFilter = document.getElementById("tag-all");
  const symptomFilters = document.querySelectorAll(
    'input[name="filter_tags"]'
  );

  function moveToFilteredList(listUrl) {
    const selectedCategories = Array.from(symptomFilters)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    const params = new URLSearchParams();

    selectedCategories.forEach((category) => {
      params.append("category", category);
    });

    const targetUrl = params.toString()
      ? `${listUrl}?${params.toString()}`
      : listUrl;

    window.location.href = targetUrl;
  }

  /* 전체 클릭 */
  if (allFilter) {
    allFilter.addEventListener("change", () => {
      const listUrl = allFilter.dataset.listUrl;

      if (!listUrl) {
        return;
      }

      symptomFilters.forEach((checkbox) => {
        checkbox.checked = false;
      });

      window.location.href = listUrl;
    });
  }

  /* 증상 필터 클릭 */
  symptomFilters.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const listUrl = checkbox.dataset.listUrl;

      if (!listUrl) {
        return;
      }

      if (allFilter) {
        allFilter.checked = false;
      }

      moveToFilteredList(listUrl);
    });
  });

  /* 게시글 삭제: 모달 확인 → hidden form 제출 */
  const postDeleteBtn = document.getElementById("postDeleteBtn");

  if (postDeleteBtn) {
    postDeleteBtn.addEventListener("click", function () {
      openCommonModal({
        title: "정말 게시글을 삭제하시겠어요?",
        subtitle: "삭제한 게시글은 되돌릴 수 없으니 신중하게 선택해주세요",
        confirmText: "삭제하기",
        cancelText: "취소",
        onConfirm: function () {
          const deleteForm = document.getElementById("postDeleteForm");

          if (deleteForm) {
            deleteForm.submit();
          }
        },
      });
    });
  }

  /* 댓글: 수정 모드 전환 / 취소 / 삭제 */
  const commentListContainer = document.querySelector(
    ".detail-comment-list"
  );

  if (commentListContainer) {
    commentListContainer.addEventListener("click", (e) => {

      if (e.target.classList.contains("comment-delete-btn")) {
        const card = e.target.closest(".comment-item-card");
        const deleteForm = card
          ? card.querySelector(".comment-delete-form")
          : null;

        openCommonModal({
          title: "정말 댓글을 삭제하시겠어요?",
          subtitle: "삭제한 댓글은 되돌릴 수 없으니 신중하게 선택해주세요",
          confirmText: "삭제하기",
          cancelText: "취소",
          onConfirm: function () {
            if (deleteForm) {
              deleteForm.submit();
            }
          },
        });
      }

      if (e.target.classList.contains("comment-edit-btn")) {
        const card = e.target.closest(".comment-item-card");

        if (!card) {
          return;
        }

        const viewMode = card.querySelector(".comment-view-mode");
        const editMode = card.querySelector(".comment-edit-mode");

        if (viewMode && editMode) {
          const editInput = editMode.querySelector(
            ".comment-edit-field"
          );

          if (editInput) {
            editInput.style.height = "auto";
            editInput.style.height =
              `${editInput.scrollHeight + 4}px`;
          }

          viewMode.style.display = "none";
          editMode.style.display = "block";

          if (editInput) {
            editInput.focus();
          }
        }
      }

      if (e.target.classList.contains("comment-edit-cancel")) {
        const card = e.target.closest(".comment-item-card");

        if (!card) {
          return;
        }

        const viewMode = card.querySelector(".comment-view-mode");
        const editMode = card.querySelector(".comment-edit-mode");

        if (viewMode && editMode) {
          editMode.style.display = "none";
          viewMode.style.display = "block";
        }
      }
    });
  }

  /* Django messages → 토스트 */
  document
    .querySelectorAll("#django-messages [data-message]")
    .forEach((el) => {
      const message = el.dataset.message || "";
      const isError = (el.dataset.tags || "").includes("error");

      const toast = document.getElementById(
        isError ? "toast-error" : "toast-success"
      );

      if (!toast) {
        return;
      }

      const textEl = toast.querySelector(".toast-text");

      if (textEl) {
        textEl.innerHTML = message.replace(/\n/g, "<br>");
      }

      toast.classList.add("show");

      window.setTimeout(() => {
        toast.classList.remove("show");
      }, 2500);
    });


  /* ==========================================
     커뮤니티 빈 화면 체크 로직
  ========================================== */
  const postListContainer = document.getElementById("community-post-list");
  const emptyCommunityState = document.getElementById("empty-community-state");
  const filterContainer = document.getElementById("community-filter-container");
  const checkboxFilterContainer = document.getElementById("community-checkbox-filter");

  if (postListContainer && emptyCommunityState) {
    const posts = postListContainer.querySelectorAll(".post-card");

    if (posts.length === 0) {
      // 게시물이 없을 때: '게시물 목록'만 숨기고 '필터'는 보이게 둡니다!
      postListContainer.style.display = "none";
      if (filterContainer) filterContainer.style.display = "flex"; // style 유지
      if (checkboxFilterContainer) checkboxFilterContainer.style.display = "flex"; // 👈 display: none 제거 및 flex 지정
      emptyCommunityState.style.display = "flex";
    } else {
      // 게시물이 있을 때: 목록 표시, 빈 화면 숨김
      postListContainer.style.display = "flex";
      if (filterContainer) filterContainer.style.display = "flex";
      if (checkboxFilterContainer) checkboxFilterContainer.style.display = "flex";
      emptyCommunityState.style.display = "none";
    }
  }
});