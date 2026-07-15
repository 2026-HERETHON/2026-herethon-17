// ==========================================
  // 유저의 단계에 따라 아이콘과 텍스트가 바뀌는 로직
  // ==========================================
  
  document.addEventListener("DOMContentLoaded", () => {

  const logoImg = document.getElementById("profile-logo");

  // 서버가 넘겨준 진짜 현재 단계 값 (data-stage 속성에서 읽어옴)
  const stage = logoImg ? logoImg.dataset.stage : "";

  // 현재 단계에 맞는 SVG 파일명 매칭하기
  let svgFileName = "";
  if (stage === "confusion") {
    svgFileName = "profile_leaf.svg";
  } else if (stage === "adaptation") {
    svgFileName = "profile_clover.svg";
  } else if (stage === "restart") {
    svgFileName = "profile_flowerLotus.svg";
  } else {
    svgFileName = "profile_leaf.svg"; 
  }

  // 화면에 아이콘 뿌려주기 (이름/이메일/단계 텍스트는 서버가 이미 렌더링함)
  if (logoImg) {
    logoImg.src = `/static/assets/icons/${svgFileName}`;
  }
});

  // ==========================================
  // 계정 정보 수정 및 토스트 메시지 연결
  // ==========================================
  
  // 토스트 메시지 띄우는 함수
  function showToast(toastId) {
    const toastElement = document.getElementById(toastId);
    if (!toastElement) return;
  
    // 토스트 나타나게 하기
    toastElement.classList.add("show");
  
    // 2초 뒤에 사라지게 하기
    setTimeout(() => {
      toastElement.classList.remove("show");
    }, 2000);
  }

  // 모든 '수정하기/변경하기' 버튼을 찾아 이벤트 연결
  const editButtons = document.querySelectorAll(".btn-edit");

  editButtons.forEach(button => {
    button.addEventListener("click", (e) => {

      e.preventDefault(); // 기본 submit 막기

      showToast("toast-success");

      // 토스트가 보인 뒤 제출
      setTimeout(() => {
        button.closest("form").submit();
      }, 2000);

    });
  });


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
    
    // 데스크톱 환경에서도 강제로 시스템 팝업을 띄우는 코드
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