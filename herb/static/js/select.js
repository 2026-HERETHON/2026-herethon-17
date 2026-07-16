
// select.html
// 증상 선택 관련 로직 — 선택 복원, 카드 토글, 다음 버튼 상태 업데이트, 선택 전송
document.addEventListener("DOMContentLoaded", () => {
  // 정적 데이터 - 증상 카탈로그
  const symptomCatalog = [
    { id: "1", name: "안면홍조", icon: "hot" },
    { id: "2", name: "수면장애", icon: "sleep" },
    { id: "3", name: "감정기복", icon: "mood" },
    { id: "4", name: "피로감", icon: "fatigue" },
    { id: "5", name: "관절통", icon: "joint" },
    { id: "0", name: "증상 없음", icon: "none" },
  ];
  // 프론트엔드 sessionStorage에 데이터를 임시 저장하기 위한 키값
  const STORAGE_KEY = "herb-tracker-state"; // 진행중
  const COMPLETED_KEY = "herb-tracker-completed"; // 완료

  // 화면의 폼, 버튼, 카드 요소들
  const selectForm = document.getElementById("symptom-select-form");
  const btnNextStep1 = document.getElementById("btn-next-step1");
  const selectSection = document.getElementById("step-1");
  const selectCards = selectSection ? Array.from(selectSection.querySelectorAll(".symptom-card")) : [];

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

  // 중복된 ID 제거 및 유효한 문자열 배열로 정제
  function normalizeIds(ids) {
    return Array.from(new Set((ids || []).map(String).filter(Boolean)));
  }

  // ==========================================
  // [상태 관리 함수] 데이터 조회 및 업데이트
  // ==========================================

  // 임시 상태 가져오기
  function getDraftState() {
    return readJson(STORAGE_KEY, {
      symptomIds: [],
      noSymptom: false,
      intensities: {},
    });
  }

  // 새로운 데이터를 기존 상태에 합쳐서 스토리지에 저장
  function saveDraftState(patch) {
    const current = getDraftState();
    const next = {
      ...current,
      ...patch,
      symptomIds: patch.symptomIds ? normalizeIds(patch.symptomIds) : current.symptomIds,
      intensities: patch.intensities ? { ...current.intensities, ...patch.intensities } : current.intensities,
    };

    writeJson(STORAGE_KEY, next);
    return next;
  }

  // URL 쿼리 파라미터에서 선택된 증상 ID 추출 (?symptom_ids[]=1&symptom_ids[]=2)
  function getQuerySelectedIds() {
    const params = new URLSearchParams(window.location.search);
    const ids = [...params.getAll("symptom_ids[]"), ...params.getAll("symptom_ids")];
    return normalizeIds(ids);
  }

  // URL 쿼리 파라미터에서 '증상 없음' 상태 추출 (?no_symptom=true)
  function getQueryNoSymptom() {
    const params = new URLSearchParams(window.location.search);
    return params.get("no_symptom") === "true";
  }

  // 모든 선택이 완료되었을 때 최종 데이터를 저장소에 기록
  function saveCompletedRecord(record) {
    const nextRecord = {
      symptomIds: normalizeIds(record.symptomIds || []),
      noSymptom: Boolean(record.noSymptom),
      intensities: record.intensities || {},
      updatedAt: new Date().toISOString(),
    };

    writeJson(COMPLETED_KEY, nextRecord);
    writeJson(STORAGE_KEY, {
      symptomIds: nextRecord.symptomIds,
      noSymptom: nextRecord.noSymptom,
      intensities: nextRecord.intensities,
    });

    return nextRecord;
  }

  function navigateTo(url) {
    window.location.href = url;
  }

  // ==========================================
  // UI 제어 함수 - 화면 시각 효과 및 DOM 상태 읽기
  // ==========================================

  // 개별 증상 카드의 활성화/비활성화 시각 효과 처리 및 숨김 체크박스 상태

  function setSelectCardActive(card, active) {
    const hiddenInput = card.querySelector("input[type='checkbox']");
    card.classList.toggle("active", active);

    if (hiddenInput) {
      hiddenInput.checked = active;
    }

    const iconImg = card.querySelector(".symptom-icon");
    if (iconImg) {
      const currentSrc = iconImg.getAttribute("src") || "";
      if (currentSrc.includes("_inactive.svg")) {
        iconImg.setAttribute("src", active ? currentSrc.replace("_inactive.svg", "_active.svg") : currentSrc);
      } else if (currentSrc.includes("_active.svg")) {
        iconImg.setAttribute("src", active ? currentSrc : currentSrc.replace("_active.svg", "_inactive.svg"));
      }
    }
  }

  // 현재 화면에서 활성화 상태인 증상 카드의 ID 목록을 배열로 반환 (증상 없음 제외)
  function getSelectedIdsFromSelectCards() {
    return selectCards
      .filter((card) => card.dataset.id !== "0" && card.classList.contains("active"))
      .map((card) => card.dataset.id);
  }

  // '증상 없음(id: 0)' 카드가 선택되었는지 여부 반환 (boolean)
  function isNoSymptomSelected() {
    const noSymptomCard = selectCards.find((card) => card.dataset.id === "0");
    return Boolean(noSymptomCard && noSymptomCard.classList.contains("active"));
  }

  // 선택 상태에 따라 폼의 도착지 변경 및 '다음' 버튼 활성화
  function updateSelectNextButton() {
    if (!btnNextStep1) return;

    const selectedCount = getSelectedIdsFromSelectCards().length;
    const noSymptomSelected = isNoSymptomSelected();

    btnNextStep1.textContent = noSymptomSelected && selectedCount === 0 ? "다음" : `다음 (${selectedCount}개 선택됨)`;
    btnNextStep1.disabled = !noSymptomSelected && selectedCount === 0;
  }

  // 페이지 로드 시 세션 스토리지의 기존 데이터를 읽어와 화면을 초기화
  function restoreSelectCards() {
    if (!selectCards.length) return;

    const querySelectedIds = getQuerySelectedIds();
    const draftState = getDraftState();
    const selectedIds = querySelectedIds.length ? querySelectedIds : draftState.symptomIds || [];
    const noSymptomSelected = getQueryNoSymptom() || Boolean(draftState.noSymptom);

    selectCards.forEach((card) => {
      const id = card.dataset.id;
      const isActive = id === "0" ? noSymptomSelected : selectedIds.includes(id) && !noSymptomSelected;
      setSelectCardActive(card, isActive);
    });

    updateSelectNextButton();
  }

  // ==========================================
  // 사용자 상호작용 처리 및 최종 서밋
  // ==========================================

  // '다음' 버튼 클릭 또는 폼 제출 시 실행되는 최종 처리 로직
  function handleSelectProceed(event) {
    const selectedIds = getSelectedIdsFromSelectCards();
    const noSymptomSelected = isNoSymptomSelected();

    if (!noSymptomSelected && selectedIds.length === 0) {
      if (event) event.preventDefault();
      return;
    }

    // 다음 페이지로 넘어가기 전, 현재 선택된 상태를 세션 스토리지에 임시 저장
    saveDraftState({
      symptomIds: selectedIds,
      noSymptom: noSymptomSelected,
      intensities: {},
    });

    // 증상 없음 선택 시 강도 체크를 생략하고 즉시 완료 처리
    if (noSymptomSelected) {
      saveCompletedRecord({ symptomIds: [], noSymptom: true, intensities: {} });
      return;
    }

    if (selectForm) return;

    // '증상 강도' 페이지로 이동
    if (event) event.preventDefault();
    navigateTo(`intensity.html`);
  }

  // 상단 진행률 바 애니메이션 효과 처리
  function animateProgressBar() {
    const progress = document.querySelector(".progress-green");
    if (!progress) return;

    const target = progress.dataset.progressTarget || "50";
    progress.style.setProperty("--progress-target", `${target}%`);
    progress.classList.remove("is-animated");
    progress.style.width = "50%";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progress.classList.add("is-animated");
      });
    });
  }

  // ==========================================
  // 초기화 및 이벤트 리스너 등록
  // ==========================================
  restoreSelectCards();

  // 각 카드 클릭 시 선택/해제 토글 로직 바인딩
  selectCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();

      const id = card.dataset.id;
      const isNoSymptom = id === "0";
      const isActive = card.classList.contains("active");

      if (!isActive) {
        // '증상 없음' 선택 시 다른 모든 증상 해제
        if (isNoSymptom) {
          selectCards.forEach((otherCard) => {
            setSelectCardActive(otherCard, false);
          });
        } else {
        // 일반 증상 선택 시 '증상 없음' 항목 강제 해제
          const noSymptomCard = selectCards.find((otherCard) => otherCard.dataset.id === "0");
          if (noSymptomCard) {
            setSelectCardActive(noSymptomCard, false);
          }
        }

        setSelectCardActive(card, true);
      } else {
        setSelectCardActive(card, false);
      }

      updateSelectNextButton(); // 선택 변경 시마다 다음 버튼 상태 업데이트
    });
  });

  // 폼 전송 또는 다음 버튼 클릭 이벤트 바인딩
  if (selectForm) {
    selectForm.addEventListener("submit", handleSelectProceed);
  } else if (btnNextStep1) {
    btnNextStep1.addEventListener("click", handleSelectProceed);
  }

  animateProgressBar(); // 진행률 바 애니메이션 실행
});
