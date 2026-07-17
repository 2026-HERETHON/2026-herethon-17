// ===== Garden 뒤로가기 버튼 =====
document
  .querySelectorAll(".back-btn[data-url]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const targetUrl = button.dataset.url;

      if (targetUrl) {
        window.location.href = targetUrl;
      }
    });
  });


// ===== 삭제 모달 =====
const deleteButton =
  document.getElementById("deleteBtn");

const deleteModal =
  document.getElementById("deleteModal");

const cancelDeleteButton =
  document.getElementById("cancelDelete");

if (deleteButton && deleteModal) {
  deleteButton.addEventListener("click", () => {
    deleteModal.style.display = "flex";
  });
}

if (cancelDeleteButton && deleteModal) {
  cancelDeleteButton.addEventListener("click", () => {
    deleteModal.style.display = "none";
  });
}

if (deleteModal) {
  deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      deleteModal.style.display = "none";
    }
  });
}


// ===== Django messages → Toast =====
const djangoMessages =
  document.querySelectorAll(
    "#django-messages [data-message]"
  );

djangoMessages.forEach((messageElement) => {
  const message =
    messageElement.dataset.message || "";

  const tags =
    messageElement.dataset.tags || "";

  const isError =
    tags.includes("error");

  const toast = document.getElementById(
    isError
      ? "toast-error"
      : "toast-success"
  );

  if (!toast) {
    return;
  }

  const textElement =
    toast.querySelector(".toast-text");

  if (textElement) {
    textElement.innerHTML = message.replace(/\n/g, "<br>");
  }

  toast.classList.add("show");

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
});

// ===== Garden 사진 미리보기 =====
const photoInput = document.getElementById("photo-input");
const photoPreview = document.getElementById("photo-preview");
const photoPlaceholder = document.getElementById(
  "photo-upload-placeholder"
);

if (photoInput && photoPreview) {
  photoInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      photoInput.value = "";
      return;
    }

    // 파일 크기 제한: 5MB
    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      alert("사진은 5MB 이하만 업로드할 수 있습니다.");
      photoInput.value = "";
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      photoPreview.src = reader.result;
      photoPreview.classList.add("is-visible");

      if (photoPlaceholder) {
        photoPlaceholder.classList.add("is-hidden");
      }
    });

    reader.readAsDataURL(file);
  });
}

// ==========================================
// 나의 정원 빈 화면 체크 로직
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const timelineContainer = document.getElementById("garden-timeline");
  const emptyState = document.getElementById("empty-garden-state");

  if (timelineContainer && emptyState) {
    // 컨테이너 안에 있는 화분 개수 가져오기
    const items = timelineContainer.querySelectorAll(".timeline-item");

    // 화분이 하나도 없다면 빈 화면을 띄우기
    if (items.length === 0) {
      timelineContainer.style.display = "none";
      emptyState.style.display = "flex";
    } else {
      // 화분이 있다면 기존 목록을 보여주기
      timelineContainer.style.display = "flex";
      emptyState.style.display = "none";
    }
  }


});