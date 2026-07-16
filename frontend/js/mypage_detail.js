document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 토스트 메시지 띄우는 함수
  // ==========================================
  function showToast(toastId) {
    const toastElement = document.getElementById(toastId);
    if (!toastElement) return;

    toastElement.classList.add("show");
    setTimeout(() => {
      toastElement.classList.remove("show");
    }, 2000);
  }

  // ==========================================
  // 프로필/계정 설정 페이지 (/accounts/profile/)
  // ==========================================
  const profileForm = document.getElementById("edit-form");
  
  if (profileForm) {
    // 프로필 로고 SVG 변경 로직 
    // 2-1. 프로필 로고 SVG 변경 로직 
    const logoImg = document.getElementById("profile-logo");
    const stageContainer = document.querySelector(".profile-stage-badge");
    const profileImageInput = document.getElementById("profile_image_input"); // 숨김 인풋 가져오기
    
    if (logoImg && stageContainer) {
      const currentStage = stageContainer.getAttribute("data-stage") || "혼란기";
      let svgFileName = "profile_leaf.svg"; // 기본값
      
      if (currentStage === "적응기") svgFileName = "profile_clover.svg";
      if (currentStage === "재도약기") svgFileName = "profile_flowerLotus.svg";
      
      // 화면에 이미지 적용
      logoImg.src = `/static/icons/${svgFileName}`; 
      
      // 백엔드 전송용 폼 데이터에 현재 아이콘 이름 세팅
      if (profileImageInput) {
        profileImageInput.value = svgFileName;
      }
    }

    // 폼 데이터 비동기 전송 (AJAX)
    const editButtons = document.querySelectorAll(".btn-edit");
    
    editButtons.forEach(button => {
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        
        // Django의 CSRF 토큰 가져오기 
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        // 폼 데이터 수집
        const formData = new FormData(profileForm);

        try {
          // 명세서에 따른 URL로 POST 요청
          const response = await fetch('/accounts/profile/', {
            method: 'POST',
            headers: {
              'X-CSRFToken': csrfToken,
            },
            body: formData
          });

          if (response.ok) {
            showToast("toast-success");
            // 성공 후 필요시 mypage로 리다이렉트
          } else {
            showToast("toast-error");
          }
        } catch (error) {
          console.error("Profile update error:", error);
          showToast("toast-error");
        }
      });
    });
  }

  // ==========================================
  // 내가 쓴 글 페이지 (/community/my-posts)
  // ==========================================
  const postCards = document.querySelectorAll(".post-card");
  
  if (postCards.length > 0) {
    postCards.forEach(card => {
      card.addEventListener("click", () => {
        const postId = card.getAttribute("data-id");
        if (postId) {
          // 명세에 맞춰 Django URL 패턴으로 이동
          window.location.href = `/community/detail/${postId}/`; 
        }
      });
    });
  }

  // ==========================================
  // 알림 설정 페이지 (/accounts/notifications/)
  // ==========================================
  const timeInput = document.getElementById("time-input");
  const timeText = document.getElementById("time-text");
  const btnChange = document.querySelector(".btn-change");
  // 알림 설정 폼 요소 가져오기
  const notificationForm = document.getElementById("notification-form"); 

  if (timeInput && timeText) {
    // 데스크톱 환경 시스템 팝업 강제 호출
    if (btnChange) {
      btnChange.addEventListener("click", (e) => {
        e.preventDefault();
        try {
          timeInput.showPicker(); 
        } catch (error) {
          timeInput.focus();
        }
      });
    }

    // 시간 선택 시 UI 업데이트
    timeInput.addEventListener("change", (e) => {
      const timeVal = e.target.value;
      if (!timeVal) return;

      const [hourString, minuteString] = timeVal.split(":");
      let hour = parseInt(hourString, 10);
      let minute = parseInt(minuteString, 10);
      let period = hour >= 12 ? "오후" : "오전";
      let displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      const displayMinute = minute < 10 ? "0" + minute : minute;

      timeText.innerText = `${period} ${displayHour}:${displayMinute}`;
      
      // 시간을 변경하자마자 백엔드로 저장하려면 아래 로직 활성화
      // saveNotificationSettings(); 
    });
  }
  
  // 알림 설정 폼 전송 함수 (필요없으면 삭제하셔도 됩니다!)
  async function saveNotificationSettings() {
    if(!notificationForm) return;
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const formData = new FormData(notificationForm);

    try {
      const response = await fetch('/accounts/notifications/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        body: formData
      });

      if (response.ok) {
        showToast("toast-success");
      } else {
        showToast("toast-error");
      }
    } catch (error) {
      showToast("toast-error");
    }
  }
});