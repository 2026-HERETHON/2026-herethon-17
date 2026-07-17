
// intensity.html
// 선택된 증상에 대해 강도(약/중/강) 입력, 입력 유효성 검사, 기록 저장

document.addEventListener("DOMContentLoaded", () => {

  // 정적 데이터 - 증상 항목 카탈로그 (이전 페이지와 동일한 메타데이터)
  const symptomCatalog = [
    { id: "1", name: "안면홍조", icon: "hot" },
    { id: "2", name: "수면장애", icon: "sleep" },
    { id: "3", name: "감정기복", icon: "mood" },
    { id: "4", name: "피로감", icon: "fatigue" },
    { id: "5", name: "관절통", icon: "joint" },
  ];

  // 상태 저장소 키
  const STORAGE_KEY = "herb-tracker-state";       // 이전 페이지에서 넘어온 임시 데이터
  const COMPLETED_KEY = "herb-tracker-completed"; // 이 페이지에서 완성될 최종 데이터

  // 화면의 폼, 버튼, 리스트 컨테이너
  const intensityForm = document.getElementById("intensity-form");
  const btnSubmitRecord = document.getElementById("btn-submit-record");
  const intensityListContainer = document.getElementById("strength-list-step2");

  // ==========================================
  // 스토리지 읽기/쓰기 및 데이터 정제
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

  // 중복 ID 제거 및 문자열 배열 정제
  function normalizeIds(ids) {
    return Array.from(new Set((ids || []).map(String).filter(Boolean)));
  }

  // ==========================================
  // 상태 관리 함수 - 데이터 조회 및 최종 저장
  // ==========================================

  // 이전 페이지(select.html)에서 저장해둔 임시 상태(선택된 증상 ID 배열)를 불러옴
  function getDraftState() {
    return readJson(STORAGE_KEY, {
      symptomIds: [],
      noSymptom: false,
      intensities: {},
    });
  }

  // 모든 강도 입력이 완료되었을 때 최종 데이터를 스토리지에 기록하는 함수
  function saveCompletedRecord(record) {
    const nextRecord = {
      symptomIds: normalizeIds(record.symptomIds || []),
      noSymptom: Boolean(record.noSymptom),
      intensities: record.intensities || {}, // { "1": "low", "3": "high" } 형태의 객체
      updatedAt: new Date().toISOString(),   // 완료 시간 스탬프 추가
    };

    // 완성된 데이터를 완료 전용 키에 저장
    writeJson(COMPLETED_KEY, nextRecord);
    // 진행 중 상태도 최신화
    writeJson(STORAGE_KEY, {
      symptomIds: nextRecord.symptomIds,
      noSymptom: nextRecord.noSymptom,
      intensities: nextRecord.intensities,
    });

    return nextRecord;
  }

  // ==========================================
  //  동적 렌더링 및 상태 읽기/쓰기
  // ==========================================

  // 증상 ID를 기반으로 강도 선택 카드 HTML을 동적으로 생성
  function buildIntensityCard(cardData, intensityValue = "", withCheckbox = false, selected = false) {
    const lowActive = intensityValue === "low" ? "active" : "";
    const midActive = intensityValue === "mid" ? "active" : "";
    const highActive = intensityValue === "high" ? "active" : "";
    const checkboxMarkup = withCheckbox
      ? `<input type="checkbox" class="symptom-select-checkbox" name="symptom_ids[]" value="${cardData.id}" ${selected ? "checked" : ""} style="accent-color: #6B9E7A;">`
      : "";

    // 폼 전송을 고려하여 hidden input에 강도 값(low, mid, high)을 저장하도록 구성됨
    return `
      <div class="strength-card ${selected ? "is-selected" : ""}" data-id="${cardData.id}">
        ${checkboxMarkup}
        <div class="strength-header">
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

  // 이전 페이지에서 넘어온 selectedIds 배열을 순회하며 화면에 카드를 그림
  function renderIntensityCards(container, selectedIds, intensities = {}) {
    if (!container) return;

    container.innerHTML = "";

    normalizeIds(selectedIds).forEach((id) => {
      const symptom = symptomCatalog.find((s) => s.id === id);
      if (!symptom) return;

      container.insertAdjacentHTML("beforeend", buildIntensityCard(symptom, intensities[id] || ""));
    });
  }

  // 특정 카드의 hidden input에 담긴 강도 값(low/mid/high)을 읽어옴
  function getCardIntensityValue(card) {
    const hiddenInput = card.querySelector("input[type='hidden'][name^='intensity_']");
    return hiddenInput ? hiddenInput.value : "";
  }

  // 특정 카드의 버튼 클릭 시 hidden input 값을 업데이트하고 UI를 변경함
  function setCardIntensityValue(card, value) {
    const hiddenInput = card.querySelector("input[type='hidden'][name^='intensity_']");
    const buttons = card.querySelectorAll(".btn-strength");

    buttons.forEach((button) => button.classList.remove("active"));

    const targetButton = card.querySelector(`.btn-strength[data-value='${value}']`);
    if (targetButton) {
      targetButton.classList.add("active");
    }

    if (hiddenInput) {
      hiddenInput.value = value;
    }
  }

  // 유효성 검사: 화면에 렌더링된 '모든' 증상 카드에 강도 값이 입력되었는지 확인 후 버튼 활성화
  function updateIntensitySubmitState() {
    if (!btnSubmitRecord || !intensityListContainer) return;

    const cards = Array.from(intensityListContainer.querySelectorAll(".strength-card"));
    // 카드가 존재하고 && 모든 카드의 hidden input 값이 비어있지 않아야(true) 준비 완료
    const ready = cards.length > 0 && cards.every((card) => Boolean(getCardIntensityValue(card)));
    btnSubmitRecord.disabled = !ready;
  }

  // 화면에 렌더링된 카드들을 순회하며 최종 데이터 객체로 취합
  function collectIntensityData(container) {
    const result = { symptomIds: [], intensities: {} };

    if (!container) return result;

    Array.from(container.querySelectorAll(".strength-card")).forEach((card) => {
      const symptomId = card.dataset.id;
      const intensityValue = getCardIntensityValue(card);
      result.symptomIds.push(symptomId);
      result.intensities[symptomId] = intensityValue;
    });

    result.symptomIds = normalizeIds(result.symptomIds);
    return result;
  }

  // ==========================================
  // 최종 서밋 및 완료 처리
  // ==========================================

  // '기록 완료' 버튼 클릭 또는 폼 제출 시 실행됨
  function handleIntensityProceed(event) {
    const currentData = collectIntensityData(intensityListContainer);
    // 이중 체크: 증상이 있고 모든 증상에 강도가 선택되었는지 재확인
    const allSelected = currentData.symptomIds.length > 0 && currentData.symptomIds.every((id) => Boolean(currentData.intensities[id]));

    if (!allSelected) {
      if (event) event.preventDefault();
      updateIntensitySubmitState();
      return;
    }

    // 최종 완성된 데이터를 스토리지에 저장
    const nextRecord = saveCompletedRecord({
      symptomIds: currentData.symptomIds,
      noSymptom: false,
      intensities: currentData.intensities,
    });

    // 폼 제출 기본 동작 막고 완료 페이지로 직접 라우팅
    if (event) event.preventDefault();
    window.location.href = "complete.html";
  }

  // 상단 진행률 바 애니메이션(100% 채우기)
  function animateProgressBar() {
    const progress = document.querySelector(".progress-green");
    if (!progress) return;

    const target = progress.dataset.progressTarget || "100";
    progress.style.setProperty("--progress-target", `${target}%`);
    progress.classList.remove("is-animated");
    progress.style.width = "100%";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progress.classList.add("is-animated");
      });
    });
  }

  // ==========================================
  // 이벤트 리스너 등록 및 초기화
  // ==========================================

  // 이벤트 위임을 통한 강도(약/중/강) 버튼 클릭 처리
  document.body.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-strength");
    if (!button) return;

    const card = button.closest(".strength-card");
    if (!card) return;

    event.preventDefault();
    setCardIntensityValue(card, button.dataset.value || ""); // 히든 인풋에 값 저장
    updateIntensitySubmitState(); // 버튼 활성화 여부 다시 체크
  });

  // 제출 이벤트 바인딩
  if (intensityForm) {
    intensityForm.addEventListener("submit", handleIntensityProceed);
  } else if (btnSubmitRecord) {
    btnSubmitRecord.addEventListener("click", handleIntensityProceed);
  }

  // 초기 렌더링 로직 (이전 페이지에서 세션에 저장한 증상 ID들을 바탕으로 화면을 그림)
  if (intensityListContainer) {
    const draftState = getDraftState();
    const selectedIds = draftState.symptomIds || [];
    renderIntensityCards(intensityListContainer, selectedIds, draftState.intensities || {});
    updateIntensitySubmitState();
  }

  // 진행바 애니메이션 실행
  animateProgressBar();
});