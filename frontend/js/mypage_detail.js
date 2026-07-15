  // ==========================================
  // 내가 쓴 글 페이지에서 게시글 상세 페이지로 이동하는 로직
  // ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // 화면에 있는 모든 게시글 카드(.post-card) 가져오기
  const postCards = document.querySelectorAll(".post-card");

  // 각각의 카드에 클릭 이벤트 달기
  postCards.forEach(card => {
    card.addEventListener("click", () => {
      // HTML에 적어둔 data-id 값을 가져옴. (없을 경우를 대비해 '1'을 기본값으로)
      const postId = card.getAttribute("data-id") || "1";
      
      // 해당 id를 파라미터로 붙여서 상세 페이지로 이동
      // 예: community_detail.html?id=1
      window.location.href = `community_detail.html?id=${postId}`;
    });
  });
});


  // ==========================================
  // 알림 설정 - 기록 리마인더 시간 스피너 로직
  // ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const timeInput = document.getElementById("time-input");
  const timeText = document.getElementById("time-text");
  
  const btnChange = document.querySelector(".btn-change");

  if (timeInput && timeText) {
    
    // 데스크톱 환경에서도 강제로 시스템 팝업을 띄우는 마법의 코드
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

    // 사용자가 스피너/팝업에서 시간을 바꿨을 때 실행되는 이벤트 
    timeInput.addEventListener("change", (e) => {
      const timeVal = e.target.value; // "20:00" 형태의 문자열
      if (!timeVal) return;

      const [hourString, minuteString] = timeVal.split(":");
      let hour = parseInt(hourString, 10);
      let minute = parseInt(minuteString, 10);

      // 오전/오후 계산 로직
      let period = "오전";
      let displayHour = hour;

      if (hour >= 12) {
        period = "오후";
        if (hour > 12) {
          displayHour = hour - 12;
        }
      } else if (hour === 0) {
        displayHour = 12; // 밤 12시는 오전 12시로 표시
      }

      // 분이 한 자리일 경우 앞에 0 붙이기 (예: 0 -> 00)
      const displayMinute = minute < 10 ? "0" + minute : minute;

      // 계산된 시간을 화면에 표시
      timeText.innerText = `${period} ${displayHour}:${displayMinute}`;
    });
  }
});