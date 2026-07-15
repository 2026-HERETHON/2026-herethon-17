document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // [증상 선택 페이지] select.html 로직
  // ==========================================
  const symptomCards = document.querySelectorAll("#step-1 .symptom-card");
  const btnNextStep1 = document.getElementById("btn-next-step1");
  const selectForm = document.getElementById("symptom-select-form");

  if (symptomCards.length > 0) {
    
    // 아이콘 색상 변경 (활성화/비활성화)
    function updateIcon(card) {
      const iconImg = card.querySelector(".symptom-icon");
      if (iconImg) {
        iconImg.src = card.classList.contains("active") 
          ? iconImg.src.replace("_inactive.svg", "_active.svg") 
          : iconImg.src.replace("_active.svg", "_inactive.svg");
      }
    }

    // 다음 버튼 활성화 및 개수 업데이트
    function updateNextButton() {
      const activeCards = document.querySelectorAll("#step-1 .symptom-card.active");
      const selectedCount = activeCards.length;
      if (btnNextStep1) {
        btnNextStep1.innerText = `다음 (${selectedCount}개 선택됨)`;
        btnNextStep1.disabled = selectedCount === 0;
      }
    }

    // 증상 카드 클릭 이벤트
    symptomCards.forEach(card => {
      card.addEventListener("click", function(e) {
        e.preventDefault();
        const hiddenInput = this.querySelector("input[type='checkbox']");
        const isNoSymptom = this.dataset.id === "0" || this.querySelector("input[name='no_symptom']");
        const isAlreadyActive = this.classList.contains("active");

        if (!isAlreadyActive) {
          if (isNoSymptom) {
            // '증상 없음' 선택 시 다른 모든 증상 해제
            symptomCards.forEach(c => {
              c.classList.remove("active");
              const inp = c.querySelector("input[type='checkbox']");
              if (inp) inp.checked = false;
              updateIcon(c);
            });
          } else {
            // 다른 증상 선택 시 '증상 없음' 해제
            const noSympCard = Array.from(symptomCards).find(c => c.dataset.id === "0");
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

    // '증상 없음'일 경우 강도 페이지를 건너뛰고 바로 완료 페이지로
    if (selectForm) {
      selectForm.addEventListener("submit", (e) => {
        const noSymptomCard = document.querySelector(".symptom-card[data-id='0']");
        if (noSymptomCard && noSymptomCard.classList.contains("active")) {
          e.preventDefault(); 
          window.location.href = "complete.html";
        }
      });
    }
  }


  // ==========================================
  // [강도 선택 및 수정 페이지] intensity.html, edit.html 로직
  // ==========================================
  const btnSubmitRecord = document.getElementById("btn-submit-record");
  const editListContainer = document.getElementById("edit-strength-list");

  // 프론트엔드 확인용: 수정 페이지(edit.html)에 데이터가 비어있으면 Mock 데이터 그리기
  if (editListContainer && editListContainer.children.length === 0) {
    renderMockEditCards(editListContainer);
  }

  // 동적(또는 백엔드)으로 생성된 버튼들도 무조건 클릭되도록 이벤트 위임(Delegation) 사용
  document.body.addEventListener("click", function(e) {
    if (e.target.classList.contains("btn-strength")) {
      const btn = e.target;
      const card = btn.closest(".strength-card");
      if (!card) return;

      const buttons = card.querySelectorAll(".btn-strength");
      const hiddenInput = card.querySelector("input[type='hidden']");

      // 모든 버튼 활성화 해제 후 클릭한 버튼만 활성화
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // hidden input에 값(low, mid, high) 넣기
      if (hiddenInput) hiddenInput.value = btn.dataset.value;

      // 강도 선택 페이지(intensity.html)인 경우, 모든 카드가 선택되었는지 확인 후 완료 버튼 켜기
      if (btnSubmitRecord && document.getElementById("step-2")) {
        let allSelected = true;
        const allCards = document.querySelectorAll("#step-2 .strength-card");
        allCards.forEach(c => {
          const hi = c.querySelector("input[type='hidden']");
          if (!hi || !hi.value) allSelected = false;
        });
        btnSubmitRecord.disabled = !allSelected;
      }
    }
  });


  // ==========================================
  // [기록 수정 페이지] 토스트 메시지 처리 (edit.html)
  // ==========================================
  const btnEditComplete = document.getElementById("btn-edit-complete");
  const editForm = document.getElementById("edit-form");
  
  if (editForm && btnEditComplete) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault(); // 페이지가 바로 넘어가지 않게 막음
      
      const toast = document.getElementById("toast-success");
      if (toast) {
        toast.classList.add("show");
        
        setTimeout(() => {
          toast.classList.remove("show");
          window.location.href = "complete.html"; 
          // editForm.submit(); <- 실제 백엔드로 넘길 때는 이 코드 사용!! 추후 수정
        }, 2000);
      } else {
        window.location.href = "complete.html";
      }
    });
  }


  // ==========================================
  // 수정 페이지(edit.html) 테스트용 임시 렌더링 함수
  // 백엔드에서 데이터 받아온 이후 삭제할 함수
  // ==========================================
  function renderMockEditCards(container) {
    const prevData = [
      { id: "1", intensity: "high" }, 
      { id: "2", intensity: "mid" }
    ];
    const allSymptoms = [
      { id: "1", name: "안면홍조", icon: "hot" }, 
      { id: "2", name: "수면장애", icon: "sleep" },
      { id: "3", name: "감정기복", icon: "mood" }, 
      { id: "4", name: "피로감", icon: "fatigue" },
      { id: "5", name: "관절통", icon: "joint" }
    ];

    allSymptoms.forEach(symptom => {
      const prev = prevData.find(i => i.id === symptom.id);
      const val = prev ? prev.intensity : ""; 
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
  }

});