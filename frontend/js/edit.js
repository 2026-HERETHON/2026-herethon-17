// edit.html
// 기존 기록 편집(증상 선택 + 강도 수정 통합) 및 수정 완료 저장

document.addEventListener("DOMContentLoaded", () => {
  // 정적 데이터 - 증상 항목 카탈로그
  const symptomCatalog = [
    { id: "1", name: "안면홍조", icon: "hot" },
    { id: "2", name: "수면장애", icon: "sleep" },
    { id: "3", name: "감정기복", icon: "mood" },
    { id: "4", name: "피로감", icon: "fatigue" },
    { id: "5", name: "관절통", icon: "joint" },
  ];

  // 상태 저장소 키
  const STORAGE_KEY = "herb-tracker-state";
  const COMPLETED_KEY = "herb-tracker-completed";

  // DOM 요소 바인딩
  const editForm = document.getElementById("edit-form");
  const btnEditComplete = document.getElementById("btn-edit-complete");
  const editListContainer = document.getElementById("edit-strength-list");

  // ==========================================
  // 유틸리티 함수
  // ==========================================

  function readJson(key, fallback) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeIds(ids) {
    return Array.from(new Set((ids || []).map(String).filter(Boolean)));
  }

  // ==========================================
  // 데이터 로드 - 기존 기록 불러오기
  // ==========================================

  // 수정할 원본 데이터를 스토리지에서 불러옴
  function loadEditSeedRecord() {
    const stored = readJson(COMPLETED_KEY, null);
    if (stored && Array.isArray(stored.symptomIds)) {
      return stored; // 기존 완료된 데이터가 있으면 반환
    }

    // (테스트용) 스토리지에 데이터가 없을 경우 표시할 기본값
    return {
      symptomIds: ["1", "2"],
      noSymptom: false,
      intensities: {
        "1": "high",
        "2": "mid",
        "3": "",
        "4": "",
        "5": "",
      },
    };
  }

  // ==========================================
  // UI 렌더링 - 수정용 카드 리스트 생성
  // ==========================================
  function buildIntensityCard(cardData, intensityValue = "", withCheckbox = false, selected = false) {
    const lowActive = intensityValue === "low" ? "active" : "";
    const midActive = intensityValue === "mid" ? "active" : "";
    const highActive = intensityValue === "high" ? "active" : "";
    const checkboxMarkup = withCheckbox
      ? `<input type="checkbox" class="symptom-select-checkbox" name="symptom_ids[]" value="${cardData.id}" ${selected ? "checked" : ""} style="accent-color: #6B9E7A;">`
      : "";

    return `
      <div class="strength-card ${selected ? "is-selected" : ""}" data-id="${cardData.id}">
        ${checkboxMarkup}
        <div class="strength-header" style="cursor: pointer;">
          <img src="assets/icons/symptom_${cardData.icon}_inactive.svg" alt="${cardData.name} 아이콘" class="symptom-icon" style="width: 28px; height: 28px;">
          <span class="symptom-name">${cardData.name}</span>
        </div>
        <input type="hidden" name="intensity_${cardData.id}" value="${intensityValue}">
        <div class="strength-buttons">
          <button type="button" class="btn-strength low ${lowActive}" data-value="low">약</button>
          <button type="button" class="btn-strength mid ${midActive}" data-value="mid">중</button>
          <button type="button" class="btn-strength high ${highActive}" data-value="high">강</button>
        </div>
      </div>`;
  }

  // 카탈로그에 있는 '모든' 증상을 렌더링하고, 기존에 선택됐던 증상만 체크/강도 표시 활성화
  function renderEditCards(container, record) {
    if (!container) return;

    const selectedIds = normalizeIds(record.symptomIds || []);
    const intensities = record.intensities || {};

    // '증상 없음'을 제외한 모든 증상 카드를 렌더링
    container.innerHTML = symptomCatalog
      .filter((symptom) => symptom.id !== "0")
      .map((symptom) => buildIntensityCard(symptom, intensities[symptom.id] || "", false, selectedIds.includes(symptom.id)))
      .join("");
  }

  function getCardIntensityValue(card) {
    const hiddenInput = card.querySelector("input[type='hidden'][name^='intensity_']");
    return hiddenInput ? hiddenInput.value : "";
  }

  // ==========================================
  // 상태 검증 및 데이터 수집
  // ==========================================

  // 제출 버튼 활성화/비활성화 유효성 검사
  function refreshEditSubmitState() {
    if (!btnEditComplete || !editListContainer) return;

    const cards = Array.from(editListContainer.querySelectorAll(".strength-card"));
    
    // 현재 선택된 카드만 필터링
    const selectedCards = cards.filter((card) => card.classList.contains("is-selected"));

    // 최소 1개 이상 선택되어야 하고, 선택된 모든 카드의 강도가 입력되어야 준비 완료
    const ready = selectedCards.length > 0 && selectedCards.every((card) => Boolean(getCardIntensityValue(card)));
    btnEditComplete.disabled = !ready;
  }

  // 제출 시 화면의 값을 모두 긁어와 하나의 JSON 객체로 취합
  function collectEditData() {
    const result = { symptomIds: [], intensities: {} };

    if (!editListContainer) return result;

    Array.from(editListContainer.querySelectorAll(".strength-card")).forEach((card) => {
      const symptomId = card.dataset.id;
      const intensityValue = getCardIntensityValue(card);

      result.intensities[symptomId] = intensityValue;

      if (card.classList.contains("is-selected")) {
        result.symptomIds.push(symptomId);
      }
    });

    result.symptomIds = normalizeIds(result.symptomIds);
    return result;
  }

  // ==========================================
  // 최종 서밋 처리
  // ==========================================

  function handleEditProceed(event) {
    if (event) event.preventDefault();

    const editData = collectEditData();
    const selectedCards = editData.symptomIds.length > 0;
    const intensitiesReady = editData.symptomIds.every((id) => Boolean(editData.intensities[id]));

    if (!selectedCards || !intensitiesReady) {
      refreshEditSubmitState();
      return;
    }

    // 수정 완료된 최종 데이터 객체 생성
    const nextRecord = {
      symptomIds: editData.symptomIds,
      noSymptom: false, // 수정 페이지에서는 '증상 없음' 선택 로직을 제외하고 모두 유증상 처리로 가정된 코드
      intensities: editData.intensities,
      updatedAt: new Date().toISOString(),
    };

    // 스토리지 업데이트
    writeJson(COMPLETED_KEY, nextRecord);
    writeJson(STORAGE_KEY, {
      symptomIds: nextRecord.symptomIds,
      noSymptom: nextRecord.noSymptom,
      intensities: nextRecord.intensities,
    });

    setTimeout(() => {
      window.location.href = "complete.html";
    }, 2000);
  }

  // 이벤트 위임: 강도 버튼 클릭 및 카드 헤더 클릭 처리
  document.body.addEventListener("click", (event) => {
    // 강도 버튼 클릭 시
    const button = event.target.closest(".btn-strength");
    if (button) {
      const card = button.closest(".strength-card");
      if (!card) return;

      event.preventDefault();
      const hiddenInput = card.querySelector("input[type='hidden'][name^='intensity_']");
      const buttons = card.querySelectorAll(".btn-strength");
      
      buttons.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      if (hiddenInput) hiddenInput.value = button.dataset.value || "";

      // 강도를 선택하면 자동으로 카드가 활성화됨
      card.classList.add("is-selected");

      refreshEditSubmitState(); // 버튼 누를 때마다 유효성 검사
      return; 
    }

    // 카드 헤더 영역 클릭 시 증상 선택/해제 토글
    const header = event.target.closest(".strength-header");
    if (header) {
      const card = header.closest(".strength-card");
      if (!card) return;

      card.classList.toggle("is-selected");
      refreshEditSubmitState();
    }
  });

  // 폼 제출 / 버튼 클릭 이벤트 바인딩
  if (editForm) {
    editForm.addEventListener("submit", handleEditProceed);
  } else if (btnEditComplete) {
    btnEditComplete.addEventListener("click", handleEditProceed);
  }
  
  // 초기 실행 (화면 렌더링 및 초기 상태 검사)
  if (editListContainer) {
    renderEditCards(editListContainer, loadEditSeedRecord());
    refreshEditSubmitState();
  }
});