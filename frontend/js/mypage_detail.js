  // ==========================================
  // 유저의 단계에 따라 아이콘과 텍스트가 바뀌는 로직
  // ==========================================
  
  document.addEventListener("DOMContentLoaded", () => {

  const logoImg = document.getElementById("profile-logo");
  const nameText = document.getElementById("profile-name");
  const emailText = document.getElementById("profile-email");
  const stageText = document.getElementById("profile-stage-text");

  // 가상의 백엔드 데이터 (추후 실제 API fetch 코드로 교체)
  const userData = {
    name: "박수현",
    email: "id@email.com",
    stage: "혼란기" // "혼란기", "적응기", "재도약기" 중 하나
  };

  // 현재 단계에 맞는 SVG 파일명 매칭하기
  let svgFileName = "";
  if (userData.stage === "혼란기") {
    svgFileName = "profile_leaf.svg";
  } else if (userData.stage === "적응기") {
    svgFileName = "profile_clover.svg";
  } else if (userData.stage === "재도약기") {
    svgFileName = "profile_flowerLotus.svg";
  } else {
    svgFileName = "profile_leaf.svg"; 
  }

  // 화면에 데이터 뿌려주기
  if (logoImg) {
    logoImg.src = `assets/icons/${svgFileName}`;
  }
  if (nameText) {
    nameText.innerText = userData.name;
  }
  if (emailText) {
    emailText.innerText = userData.email;
  }
  if (stageText) {
    stageText.innerText = `현재 단계: ${userData.stage}`;
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
    button.addEventListener("click", () => {
      // (백엔드 전송 로직이 들어가야함. 추후수정)
      
      // 통신 성공 가정 하에 성공 토스트 띄우기
      showToast("toast-success");
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