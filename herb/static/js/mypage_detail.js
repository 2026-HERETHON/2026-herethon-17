document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 유저 단계에 따라 프로필 아이콘 변경
  // ==========================================

  const logoImg = document.getElementById("profile-logo");

  if (logoImg) {
    const stage = logoImg.dataset.stage || "";

    const stageIconMap = {
      confusion: "profile_leaf.svg",
      adaptation: "profile_clover.svg",
      restart: "profile_flowerLotus.svg",
    };

    const svgFileName =
      stageIconMap[stage] || "profile_leaf.svg";

    logoImg.src = `/static/assets/icons/${svgFileName}`;
  }


  // ==========================================
  // 토스트 메시지
  // ==========================================

  function showToast(toastId) {
    const toastElement = document.getElementById(toastId);

    if (!toastElement) {
      return;
    }

    toastElement.classList.add("show");

    setTimeout(() => {
      toastElement.classList.remove("show");
    }, 2000);
  }


  // ==========================================
  // 계정 정보 수정
  // ==========================================

  const editButtons = document.querySelectorAll(".btn-edit");

  editButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();

      const form = button.closest("form");

      if (!form) {
        return;
      }

      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          showToast("toast-error");
          return;
        }

        if (formData.has("name")) {
          const profileName =
            document.getElementById("profile-name");

          if (profileName) {
            profileName.textContent =
              formData.get("name");
          }
        }

        showToast("toast-success");
      } catch (error) {
        console.error("계정 정보 수정 요청 실패:", error);
        showToast("toast-error");
      }
    });
  });


  // ==========================================
  // 내가 쓴 글 카드 클릭 시 상세 페이지 이동
  // ==========================================

  const postCards = document.querySelectorAll(".post-card");

  postCards.forEach((card) => {
    const moveToPostDetail = () => {
      const detailUrl = card.dataset.url;

      if (!detailUrl) {
        console.error("게시글 상세 URL이 없습니다.");
        return;
      }

      window.location.href = detailUrl;
    };

    card.addEventListener("click", moveToPostDetail);

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        moveToPostDetail();
      }
    });
  });


  // ==========================================
  // 뒤로 가기 버튼
  // ==========================================

  const backButton =
    document.querySelector(".back-btn");

  if (backButton) {
    backButton.addEventListener("click", () => {
      window.history.back();
    });
  }


  // ==========================================
  // 알림 설정 - 기록 리마인더 시간 스피너
  // ==========================================

  const timeInput =
    document.getElementById("time-input");

  const timeText =
    document.getElementById("time-text");

  const btnChange =
    document.querySelector(".btn-change");

  if (timeInput && timeText) {
    if (btnChange) {
      btnChange.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          try {
            timeInput.showPicker();
          } catch (error) {
            timeInput.focus();
          }
        }
      );
    }

    timeInput.addEventListener(
      "change",
      (event) => {
        const timeValue = event.target.value;

        if (!timeValue) {
          return;
        }

        const [hourString, minuteString] =
          timeValue.split(":");

        const hour =
          Number.parseInt(hourString, 10);

        const minute =
          Number.parseInt(minuteString, 10);

        let period = "오전";
        let displayHour = hour;

        if (hour >= 12) {
          period = "오후";

          if (hour > 12) {
            displayHour = hour - 12;
          }
        } else if (hour === 0) {
          displayHour = 12;
        }

        const displayMinute =
          String(minute).padStart(2, "0");

        timeText.textContent =
          `${period} ${displayHour}:${displayMinute}`;
      }
    );
  }
});