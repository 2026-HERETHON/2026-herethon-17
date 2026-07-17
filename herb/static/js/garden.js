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