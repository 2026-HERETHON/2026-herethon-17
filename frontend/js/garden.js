const confirmDeleteBtn = document.getElementById("confirmDelete");
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", () => {
    deleteModal.style.display = "none";

    if (deleteTargetType === "post") {
      // 성공했을 때: status=success 파라미터를 붙여 리스트 페이지로 이동
      // (백엔드 처리 결과에 따라 조건 분기하셔도 됩니다)
      window.location.href = "community_timeline.html?deleteStatus=success";
      
      // 실패 시 예시:
      // window.location.href = "community_timeline.html?deleteStatus=fail";
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24시간을 밀리초(ms)로 환산
  const now = new Date().getTime();

  // data-created-at 속성을 가진 모든 info-card 탐색
  const infoCards = document.querySelectorAll(".info-card[data-created-at]");

  infoCards.forEach((card) => {
    const createdAtAttr = card.getAttribute("data-created-at");
    const createdTime = new Date(createdAtAttr).getTime();
    const badgeNew = card.querySelector(".badge-new");

    if (badgeNew && !isNaN(createdTime)) {
      const timeDiff = now - createdTime;

      // 0 이상이고 24시간(86,400,000ms) 미만인 경우만 표시
      if (timeDiff >= 0 && timeDiff < TWENTY_FOUR_HOURS) {
        badgeNew.style.display = "inline-flex";
      } else {
        badgeNew.style.display = "none";
      }
    }
  });
});
