document.addEventListener("DOMContentLoaded", function () {
  
  // ==========================================
  // 수정 모드 테스트 스위치 (true면 3.4 수정 모드, false면 3.1 증상 선택)
  // 백엔드 연동 시에는 삭제 필요. 추후 수정
  // ==========================================
  const TEST_EDIT_MODE = false; 

  // ==========================================
  // 공통 요소 찾기
  // ==========================================
  const symptomCards = document.querySelectorAll("#step-1 .symptom-card");
  const btnNextStep1 = document.getElementById("btn-next-step1");
  const btnPrevStep2 = document.getElementById("btn-prev-step2");
  const btnSubmitRecord = document.getElementById("btn-submit-record");
  const backBtn = document.querySelector(".back-btn");

  // ==========================================
  // 화면 전환 함수
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
      window.scrollTo(0, 0);
    }
  }

  function updateIcon(card) {
    const iconImg = card.querySelector(".symptom-icon");
    if (iconImg) {
      iconImg.src = card.classList.contains("active") 
        ? iconImg.src.replace("_inactive.svg", "_active.svg") 
        : iconImg.src.replace("_active.svg", "_inactive.svg");
    }
  }

  // ==========================================
  // 페이지 초기 진입 분기
  // ==========================================
  if (TEST_EDIT_MODE) {
    setupEditMode(); // 스위치가 true면 3.4 수정 모드로
  } else {
    showSection("step-1"); // 스위치가 false면 3.1 증상 선택으로
  }

  // 뒤로가기 버튼들 로직
  if (backBtn) {
    backBtn.addEventListener("click", () => window.history.back());
  }
  if (btnPrevStep2) {
    btnPrevStep2.addEventListener("click", () => {
      const step2Progress = document.querySelector("#step-2 .progress-green");
      if (step2Progress) step2Progress.style.width = "50%";
      showSection("step-1");
    });
  }

  // ==========================================
  // 3.4 수정 모드 세팅 및 렌더링 로직
  // ==========================================
  function setupEditMode() {
    const headerTitle = document.querySelector(".header-title");
    const headerDate = document.querySelector(".header-date");
    const modeBadge = document.getElementById("mode-badge");

    if (headerTitle) headerTitle.innerText = "기록 수정";
    if (headerDate) headerDate.innerText = "오늘 기록을 수정합니다";
    if (modeBadge) modeBadge.style.display = "flex";

    // 가상의 백엔드 데이터 (안면홍조: 강, 수면장애: 중)
    // 백엔드 로직 받아오면 이 부분을 API 호출로 대체. 추후 수정
    const previousSymptoms = [
      { id: "1", intensity: "high" }, 
      { id: "2", intensity: "mid" }
    ];

    renderEditCards(previousSymptoms);
    showSection("step-4");
  }

  function renderEditCards(prevData) {
    const container = document.getElementById("edit-strength-list");
    if (!container) return;
    container.innerHTML = "";
    
    // 5개의 모든 증상 카드 강제 렌더링
    const allSymptoms = [
      { id: "1", name: "안면홍조", icon: "hot" }, 
      { id: "2", name: "수면장애", icon: "sleep" },
      { id: "3", name: "감정기복", icon: "mood" }, 
      { id: "4", name: "피로감", icon: "fatigue" },
      { id: "5", name: "관절통", icon: "joint" }
    ];

    allSymptoms.forEach(symptom => {
      const prev = prevData.find(i => i.id === symptom.id);
      const val = prev ? prev.intensity : ""; // low, mid, high
      const inactiveIconSrc = `assets/icons/symptom_${symptom.icon}_inactive.svg`;

      const cardHTML = `
        <div class="strength-card" data-id="${symptom.id}">
          <input type="hidden" name="intensity_${symptom.id}" value="${val}">
          <div class="strength-header">
            <img src="${inactiveIconSrc}" alt="${symptom.name} 아이콘" class="symptom-icon" style="width: 28px; height: 28px;">
            <span class="symptom-name">${symptom.name}</span>
          </div>
          <div class="strength-buttons">
            <button type="button" class="btn-strength low ${val==='low'?'active':''}" data-value="low">약</button>
            <button type="button" class="btn-strength mid ${val==='mid'?'active':''}" data-value="mid">중</button>
            <button type="button" class="btn-strength high ${val==='high'?'active':''}" data-value="high">강</button>
          </div>
        </div>`;
      container.insertAdjacentHTML('beforeend', cardHTML);
    });

    // 렌더링된 카드에 토글 연결
    container.querySelectorAll(".strength-card").forEach(card => {
      const buttons = card.querySelectorAll(".btn-strength");
      const hiddenInput = card.querySelector("input[type='hidden']");
      
      buttons.forEach(btn => {
        btn.addEventListener("click", function() {
          const isAct = this.classList.contains("active");
          
          buttons.forEach(b => b.classList.remove("active"));
          
          if (!isAct) {
            this.classList.add("active");
            if (hiddenInput) hiddenInput.value = this.dataset.value;
          } else {
            if (hiddenInput) hiddenInput.value = "";
          }
        });
      });
    });
  }

  // ==========================================
  // 3.1 증상 선택 카드 클릭 로직
  // ==========================================
  function updateNextButton() {
    const activeCards = document.querySelectorAll("#step-1 .symptom-card.active");
    const selectedCount = activeCards.length;
    if (btnNextStep1) {
      btnNextStep1.innerText = `다음 (${selectedCount}개 선택됨)`;
      btnNextStep1.disabled = selectedCount === 0;
    }
  }

  symptomCards.forEach(card => {
    card.addEventListener("click", function(e) {
      e.preventDefault();
      const hiddenInput = this.querySelector("input[type='checkbox']");
      const isNoSymptom = this.dataset.id === "0" || this.querySelector("input[name='no_symptom']");
      const isAlreadyActive = this.classList.contains("active");

      if (!isAlreadyActive) {
        if (isNoSymptom) {
          symptomCards.forEach(c => {
            c.classList.remove("active");
            const inp = c.querySelector("input[type='checkbox']");
            if (inp) inp.checked = false;
            updateIcon(c);
          });
        } else {
          const noSympCard = Array.from(symptomCards).find(c => c.dataset.id === "0" || c.querySelector("input[name='no_symptom']"));
          if (noSympCard && noSympCard.classList.contains("active")) {
            noSympCard.classList.remove("active");
            const inp = noSympCard.querySelector("input[type='checkbox']");
            if (inp) inp.checked = false;
            updateIcon(noSympCard);
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
  // 3.1 -> 3.2 화면 전환 및 렌더링
  // ==========================================
  if (btnNextStep1) {
    btnNextStep1.addEventListener("click", function() {
      const activeCards = document.querySelectorAll("#step-1 .symptom-card.active");
      const isNoSymptomSelected = Array.from(activeCards).some(c => c.dataset.id === "0");
      
      if (isNoSymptomSelected) {
        saveRecordAndGoToStep3();
      } else {
        renderStrengthCards(activeCards);
        if (btnSubmitRecord) btnSubmitRecord.disabled = true;
        showSection("step-2");
        setTimeout(() => {
          const prog = document.querySelector("#step-2 .progress-green");
          if (prog) prog.style.width = "100%";
        }, 50);
      }
    });
  }

  function renderStrengthCards(activeCards) {
    const container = document.getElementById("strength-list-step2");
    if (!container) return;
    container.innerHTML = "";
    
    activeCards.forEach(card => {
      const id = card.dataset.id;
      const name = card.querySelector(".symptom-name").innerText;
      const iconSrc = card.querySelector(".symptom-icon").src.replace("_active.svg", "_inactive.svg");
      
      const cardHTML = `
        <div class="strength-card" data-id="${id}">
          <input type="hidden" name="intensity_${id}" value="">
          <div class="strength-header">
            <img src="${iconSrc}" class="symptom-icon" style="width: 28px; height: 28px;">
            <span class="symptom-name">${name}</span>
          </div>
          <div class="strength-buttons">
            <button type="button" class="btn-strength low" data-value="low">약</button>
            <button type="button" class="btn-strength mid" data-value="mid">중</button>
            <button type="button" class="btn-strength high" data-value="high">강</button>
          </div>
        </div>`;
      container.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    container.querySelectorAll(".strength-card").forEach(c => {
      const buttons = c.querySelectorAll(".btn-strength");
      const hiddenInput = c.querySelector("input[type='hidden']");
      buttons.forEach(btn => {
        btn.addEventListener("click", function() {
          buttons.forEach(b => b.classList.remove("active"));
          this.classList.add("active");
          if(hiddenInput) hiddenInput.value = this.dataset.value;
          
          let allSelected = true;
          container.querySelectorAll(".strength-card").forEach(c2 => {
            const hi = c2.querySelector("input[type='hidden']");
            if(!hi || !hi.value) allSelected = false;
          });
          if (btnSubmitRecord) btnSubmitRecord.disabled = !allSelected;
        });
      });
    });
  }

  // ==========================================
  // 3.3 기록 완료 페이지 생성
  // ==========================================
  function saveRecordAndGoToStep3() {
    const recordContainer = document.getElementById("record-list-step3");
    if (!recordContainer) return;
    recordContainer.innerHTML = "";

    const activeCards = document.querySelectorAll("#step-1 .symptom-card.active");
    const isNoSymptomSelected = Array.from(activeCards).some(c => c.dataset.id === "0");

    if (isNoSymptomSelected) {
      recordContainer.innerHTML = `
        <div class="record-card">
          <div class="record-info">
            <img src="assets/icons/symptom_none_inactive.svg" class="symptom-icon" style="width:24px; height:24px;">
            <span class="symptom-name">증상 없음</span>
          </div>
        </div>`;
    } else {
      const strengthCards = document.querySelectorAll("#strength-list-step2 .strength-card");
      const map = { low: "약", mid: "중", high: "강" };
      
      strengthCards.forEach(c => {
        const name = c.querySelector(".symptom-name").innerText;
        const iconSrc = c.querySelector(".symptom-icon").src;
        const val = c.querySelector("input[type='hidden']").value;
        const text = map[val] || "";
        
        recordContainer.insertAdjacentHTML('beforeend', `
          <div class="record-card">
            <div class="record-info">
              <img src="${iconSrc}" class="symptom-icon" style="width:24px; height:24px;">
              <span class="symptom-name">${name}</span>
            </div>
            <div class="record-badge ${val}">${text}</div>
          </div>`);
      });
    }
    showSection("step-3");
  }

  if (btnSubmitRecord) {
    btnSubmitRecord.addEventListener("click", saveRecordAndGoToStep3);
  }

  const btnViewReport = document.getElementById("btn-view-report");
  if (btnViewReport) {
    btnViewReport.addEventListener("click", () => window.location.href = "report.html");
  }

  // ==========================================
  // [수정 모드] 수정 완료 토스트 및 이동
  // ==========================================
  const btnEditComplete = document.getElementById("btn-edit-complete");
  if (btnEditComplete) {
    btnEditComplete.addEventListener("click", () => {
      const toast = document.getElementById("toast-success");
      if (toast) {
        toast.classList.add("show");
        setTimeout(() => {
          toast.classList.remove("show");
        }, 2000);
      }
    });
  }
});