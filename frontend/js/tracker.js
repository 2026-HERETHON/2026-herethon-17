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
    버튼 상태 업데이트 (증상 선택 시 다음 버튼 활성화)
  ========================================== */
  document.addEventListener("DOMContentLoaded", function () {
  
  // 1. 제어할 요소들 찾아오기
  const symptomCards = document.querySelectorAll(".symptom-card");
  const btnNextStep1 = document.getElementById("btn-next-step1");

  // 버튼이 없으면 에러가 나지 않도록 중단
  if (!btnNextStep1) return; 

  // 2. 하단 버튼 상태를 업데이트하는 함수
  function updateNextButton() {
    const activeCards = document.querySelectorAll(".symptom-card.active");
    const selectedCount = activeCards.length;

    btnNextStep1.innerText = `다음 (${selectedCount}개 선택됨)`;
    btnNextStep1.disabled = selectedCount === 0;
  }

  // 3. 증상 카드 클릭 이벤트 연결
  symptomCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      
      // 🌟 핵심: 카드 안의 <button> 태그 등을 눌렀을 때 폼이 제출되거나 튀는 현상 방지
      e.preventDefault();

      const hiddenInput = this.querySelector("input[type='checkbox']");
      const isNoSymptom = this.getAttribute("data-id") === "0" || this.querySelector("input[name='no_symptom']");
      const isAlreadyActive = this.classList.contains("active");

      if (!isAlreadyActive) {
        // [선택하는 경우]
        
        if (isNoSymptom) {
          // '증상 없음'을 누르면 -> 다른 모든 증상의 선택을 끕니다.
          symptomCards.forEach(c => {
            c.classList.remove("active");
            const input = c.querySelector("input[type='checkbox']");
            if (input) input.checked = false;
          });
        } else {
          // 일반 증상을 누르면 -> '증상 없음' 카드가 켜져 있다면 끕니다.
          const noSymptomCard = Array.from(symptomCards).find(c => c.getAttribute("data-id") === "0" || c.querySelector("input[name='no_symptom']"));
          if (noSymptomCard && noSymptomCard.classList.contains("active")) {
            noSymptomCard.classList.remove("active");
            const input = noSymptomCard.querySelector("input[type='checkbox']");
            if (input) input.checked = false;
          }
        }

        // 현재 클릭한 카드 켜기
        this.classList.add("active");
        if (hiddenInput) hiddenInput.checked = true;

      } else {
        // [선택을 해제하는 경우]
        this.classList.remove("active");
        if (hiddenInput) hiddenInput.checked = false;
      }

      // 상태를 바꿨으니 버튼 텍스트를 다시 계산합니다.
      updateNextButton();
    });
  });

});

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

/* ==========================================
   증상 강도 카드 동작 로직
========================================== */
const strengthButtons = document.querySelectorAll(".btn-strength");

strengthButtons.forEach((button) => {
  button.addEventListener("click", function () {
    // 방금 클릭한 버튼이 active 상태인지 확인
    const isAlreadyActive = this.classList.contains("active");

    // 부모 컨테이너 찾기
    const buttonGroup = this.closest(".strength-buttons");

    // 클릭한 버튼을 제외하고 모두 비활성화
    const siblings = buttonGroup.querySelectorAll(".btn-strength");
    siblings.forEach((sibling) => {
      sibling.classList.remove("active");
    });

    // 방금 클릭한 버튼만 활성화 (원래 켜져 있었다면 끄기)
    if (!isAlreadyActive) {
      this.classList.add("active");
    }
  });
});