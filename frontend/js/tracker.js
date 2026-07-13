document.addEventListener("DOMContentLoaded", function () {

  // ==========================================
  // 공통 요소
  // ==========================================
  const symptomCards = document.querySelectorAll(".symptom-card");
  const btnNextStep1 = document.getElementById("btn-next-step1");
  const btnSubmitRecord = document.getElementById("btn-submit-record");
  const btnPrevStep2 = document.getElementById("btn-prev-step2");
  const backBtn = document.querySelector(".back-btn");

  // ==========================================
  // 공통 함수: 화면 전환 및 아이콘 업데이트
  // ==========================================
  function showSection(sectionId) {
    const sections = document.querySelectorAll(".step-section");
    sections.forEach(sec => {
      sec.classList.remove("active");
      sec.style.display = "none";
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add("active");
      targetSection.style.display = "flex";
      window.scrollTo(0, 0); // 화면 최상단으로 올리기
    }
  }

  function updateIcon(card) {
    const iconImg = card.querySelector(".symptom-icon");
    if (iconImg) {
      if (card.classList.contains("active")) {
        iconImg.src = iconImg.src.replace("_inactive.svg", "_active.svg");
      } else {
        iconImg.src = iconImg.src.replace("_active.svg", "_inactive.svg");
      }
    }
  }

  // ==========================================
  // 헤더 및 이전 페이지 버튼 로직
  // ==========================================
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  if (btnPrevStep2) {
    btnPrevStep2.addEventListener("click", function () {
      const step2Progress = document.querySelector("#step-2 .progress-green");
      if (step2Progress) step2Progress.style.width = "50%";
      showSection("step-1");
    });
  }

  // ==========================================
  // 3.1 증상 선택 카드 클릭 로직
  // ==========================================
  function updateNextButton() {
    const activeCards = document.querySelectorAll(".symptom-card.active");
    const selectedCount = activeCards.length;

    if (btnNextStep1) {
      btnNextStep1.innerText = `다음 (${selectedCount}개 선택됨)`;
      btnNextStep1.disabled = selectedCount === 0;
    }
  }

  symptomCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      e.preventDefault();

      const hiddenInput = this.querySelector("input[type='checkbox']");
      const isNoSymptom = this.getAttribute("data-id") === "0" || this.querySelector("input[name='no_symptom']");
      const isAlreadyActive = this.classList.contains("active");

      if (!isAlreadyActive) {
        if (isNoSymptom) {
          // '증상 없음' 선택 시 -> 다른 모든 증상 해제
          symptomCards.forEach(c => {
            c.classList.remove("active");
            const input = c.querySelector("input[type='checkbox']");
            if (input) input.checked = false;
            updateIcon(c);
          });
        } else {
          // 일반 증상 선택 시 -> '증상 없음' 해제
          const noSymptomCard = Array.from(symptomCards).find(c => c.getAttribute("data-id") === "0" || c.querySelector("input[name='no_symptom']"));
          if (noSymptomCard && noSymptomCard.classList.contains("active")) {
            noSymptomCard.classList.remove("active");
            const input = noSymptomCard.querySelector("input[type='checkbox']");
            if (input) input.checked = false;
            updateIcon(noSymptomCard);
          }
        }

        this.classList.add("active");
        if (hiddenInput) hiddenInput.checked = true;
      } else {
        this.classList.remove("active");
        if (hiddenInput) hiddenInput.checked = false;
      }

      updateIcon(this);
      updateNextButton();
    });
  });

  // ==========================================
  // 3.1 -> 3.2 화면 전환 및 동적 카드 렌더링
  // ==========================================
  if (btnNextStep1) {
    btnNextStep1.addEventListener("click", function () {
      const activeCards = document.querySelectorAll("#step-1 .symptom-card.active");
      const isNoSymptomSelected = Array.from(activeCards).some(card => card.getAttribute("data-id") === "0");

      if (isNoSymptomSelected) {
        saveRecordAndGoToStep3();
      } else {
        renderStrengthCards(activeCards);
        if (btnSubmitRecord) btnSubmitRecord.disabled = true;

        showSection("step-2");

        // 진행바 애니메이션
        setTimeout(() => {
          const step2Progress = document.querySelector("#step-2 .progress-green");
          if (step2Progress) step2Progress.style.width = "100%";
        }, 50);
      }
    });
  }

  // ==========================================
  // 3.2 강도 카드 렌더링 로직
  // ==========================================
  function renderStrengthCards(activeCards) {
    const container = document.getElementById("strength-list-step2");
    if (!container) return;
    container.innerHTML = "";

    activeCards.forEach(card => {
      const id = card.getAttribute("data-id");
      const name = card.querySelector(".symptom-name").innerText;

      const activeIconSrc = card.querySelector(".symptom-icon").src;
      const inactiveIconSrc = activeIconSrc.replace("_active.svg", "_inactive.svg");

      const cardHTML = `
        <div class="strength-card" data-id="${id}">
          <input type="hidden" name="intensity_${id}" value="">
          <div class="strength-header">
            <img src="${inactiveIconSrc}" alt="${name} 아이콘" class="symptom-icon" style="width: 28px; height: 28px;">
            <span class="symptom-name">${name}</span>
          </div>
          <div class="strength-buttons">
            <button type="button" class="btn-strength low" data-value="low">약</button>
            <button type="button" class="btn-strength mid" data-value="mid">중</button>
            <button type="button" class="btn-strength high" data-value="high">강</button>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', cardHTML);
    });

    bindStrengthButtonEvents();
  }

  // ==========================================
  // 3.2 강도 버튼 클릭 및 완료 활성화 로직
  // ==========================================
  function bindStrengthButtonEvents() {
    const strengthCards = document.querySelectorAll("#strength-list-step2 .strength-card");

    strengthCards.forEach(card => {
      const buttons = card.querySelectorAll(".btn-strength");
      const hiddenInput = card.querySelector("input[type='hidden']");

      buttons.forEach(btn => {
        btn.addEventListener("click", function () {
          buttons.forEach(b => b.classList.remove("active"));
          this.classList.add("active");
          if (hiddenInput) hiddenInput.value = this.getAttribute("data-value");
          
          checkAllStrengthsSelected();
        });
      });
    });
  }

  function checkAllStrengthsSelected() {
    const cards = document.querySelectorAll("#strength-list-step2 .strength-card");
    let allSelected = true;

    cards.forEach(card => {
      const hiddenInput = card.querySelector("input[type='hidden']");
      if (!hiddenInput || !hiddenInput.value) {
        allSelected = false;
      }
    });

    if (btnSubmitRecord) btnSubmitRecord.disabled = !allSelected;
  }

  // ==========================================
  // 기록 완료 및 3.3 페이지로 이동
  // ==========================================
  function saveRecordAndGoToStep3() {
    const recordContainer = document.getElementById("record-list-step3");
    if (!recordContainer) return;
    recordContainer.innerHTML = ""; // 기존 내용 초기화

    // Step 1에서 '증상 없음'이 선택되었는지 확인
    const activeCards = document.querySelectorAll("#step-1 .symptom-card.active");
    const isNoSymptomSelected = Array.from(activeCards).some(card => card.getAttribute("data-id") === "0");

    if (isNoSymptomSelected) {
      // 🌟 [케이스 A] 증상 없음을 선택한 경우 -> 뱃지 없이 카드 1개만 생성
      const cardHTML = `
        <div class="record-card">
          <div class="record-info">
            <img src="assets/icons/symptom_none_inactive.svg" alt="증상 없음" class="symptom-icon" style="width: 24px; height: 24px;">
            <span class="symptom-name">증상 없음</span>
          </div>
        </div>
      `;
      recordContainer.insertAdjacentHTML('beforeend', cardHTML);

    } else {
      // 🌟 [케이스 B] 일반 증상을 선택한 경우 -> Step 2에서 고른 강도를 가져와서 렌더링
      const strengthCards = document.querySelectorAll("#strength-list-step2 .strength-card");
      
      const strengthLabelMap = {
        "low": "약",
        "mid": "중",
        "high": "강"
      };

      strengthCards.forEach(card => {
        const name = card.querySelector(".symptom-name").innerText;
        const iconSrc = card.querySelector(".symptom-icon").src;
        
        const hiddenInput = card.querySelector("input[type='hidden']");
        const strengthValue = hiddenInput ? hiddenInput.value : "";
        const strengthText = strengthLabelMap[strengthValue] || "";

        const cardHTML = `
          <div class="record-card">
            <div class="record-info">
              <img src="${iconSrc}" alt="${name}" class="symptom-icon" style="width: 24px; height: 24px;">
              <span class="symptom-name">${name}</span>
            </div>
            <div class="record-badge ${strengthValue}">${strengthText}</div>
          </div>
        `;
        recordContainer.insertAdjacentHTML('beforeend', cardHTML);
      });
    }

    showSection("step-3");
  }

  // ==========================================
  // 9. 완료 버튼 및 리포트 이동 버튼 이벤트
  // ==========================================
  
  // Step 2에서 '기록 완료' 버튼을 눌렀을 때 실행
  if (btnSubmitRecord) {
    btnSubmitRecord.addEventListener("click", function () {
      saveRecordAndGoToStep3();
    });
  }

  // Step 3에서 '패턴 리포트 보기' 버튼 눌렀을 때 페이지 이동
  const btnViewReport = document.getElementById("btn-view-report");
  if (btnViewReport) {
    btnViewReport.addEventListener("click", function () {
      window.location.href = "report.html"; // 실제 이동할 경로
    });
  }
}); 