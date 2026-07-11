  /* ==========================================
    뒤로가기 버튼 공통 동작
  ========================================== */
  // 헤더에 있는 뒤로가기 버튼(.back-btn)을 찾아서, 클릭하면 이전 페이지로 이동하게 합니다.
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  /* ==========================================
   증상 선택 카드 동작 로직
========================================== */
const checkBoxes = document.querySelectorAll(".check-box");

// 아이콘 상태를 업데이트하는 공통 함수
function updateIcon(card) {
  const iconImg = card.querySelector(".symptom-icon");
  if (card.classList.contains("active")) {
    iconImg.src = iconImg.src.replace("_inactive.svg", "_active.svg");
  } else {
    iconImg.src = iconImg.src.replace("_active.svg", "_inactive.svg");
  }
}

checkBoxes.forEach((box) => {
  box.addEventListener("click", function () {
    // 부모 카드 찾기
    const card = this.closest(".symptom-card");
    const symptomName = card.querySelector(".symptom-name").innerText.trim();
    
    // 클릭한 카드의 상태를 토글하고 아이콘 업데이트
    card.classList.toggle("active");
    updateIcon(card);

    // 카드를 클릭 후 active 상태가 되었다면 로직 실행
    if (card.classList.contains("active")) {
      
      if (symptomName === "증상 없음") {
        // '증상 없음'을 켰을 때 -> 다른 일반 증상들은 모두 끄기
        checkBoxes.forEach((otherBox) => {
          const otherCard = otherBox.closest(".symptom-card");
          
          if (otherCard !== card && otherCard.classList.contains("active")) {
            otherCard.classList.remove("active"); 
            updateIcon(otherCard); 
          }
        });
        
      } else {
        // '일반 증상'을 켰을 때 -> '증상 없음' 카드 끄기
        checkBoxes.forEach((otherBox) => {
          const otherCard = otherBox.closest(".symptom-card");
          const otherName = otherCard.querySelector(".symptom-name").innerText.trim();
          
          if (otherName === "증상 없음" && otherCard.classList.contains("active")) {
            otherCard.classList.remove("active"); 
            updateIcon(otherCard); 
          }
        });
      }
      
    }
  });
});