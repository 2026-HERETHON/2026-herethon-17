document.addEventListener("DOMContentLoaded", () => {
  const symptomCatalog = [
    { id: "1", name: "안면홍조", icon: "hot" },
    { id: "2", name: "수면장애", icon: "sleep" },
    { id: "3", name: "감정기복", icon: "mood" },
    { id: "4", name: "피로감", icon: "fatigue" },
    { id: "5", name: "관절통", icon: "joint" },
    { id: "0", name: "증상 없음", icon: "none" },
  ];

  const STORAGE_KEY = "herb-tracker-state";
  const COMPLETED_KEY = "herb-tracker-completed";

  const selectForm = document.getElementById("symptom-select-form");
  const intensityForm = document.getElementById("intensity-form");
  const editForm = document.getElementById("edit-form");

  const selectSection = document.getElementById("step-1");
  const intensitySection = document.getElementById("step-2");
  const completeSection = document.getElementById("step-3");
  const editSection = document.getElementById("step-4");

  const btnNextStep1 = document.getElementById("btn-next-step1");
  const btnPrevStep2 = document.getElementById("btn-prev-step2");
  const btnSubmitRecord = document.getElementById("btn-submit-record");
  const btnEditComplete = document.getElementById("btn-edit-complete");
  const btnViewReport = document.getElementById("btn-view-report");

  const selectCards = selectSection ? Array.from(selectSection.querySelectorAll(".symptom-card")) : [];
  const intensityListContainer = document.getElementById("strength-list-step2");
  const editListContainer = document.getElementById("edit-strength-list");
  const recordListContainer = document.getElementById("record-list-step3");

  const hasStandaloneSelect = Boolean(selectForm);
  const hasStandaloneIntensity = Boolean(intensityForm);
  const hasStandaloneEdit = Boolean(editForm);
  const hasCombinedTracker = Boolean(selectSection && intensitySection && completeSection && !hasStandaloneSelect && !hasStandaloneIntensity && !hasStandaloneEdit);

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

  function getSymptomMeta(id) {
    return symptomCatalog.find((item) => item.id === String(id));
  }

  function getIntensityLabel(value) {
    if (value === "low") return "약";
    if (value === "mid") return "중";
    if (value === "high") return "강";
    return "";
  }

  function getDraftState() {
    return readJson(STORAGE_KEY, {
      symptomIds: [],
      noSymptom: false,
      intensities: {},
    });
  }

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

  function getCompletedRecord() {
    const storedRecord = readJson(COMPLETED_KEY, null);
    if (storedRecord) {
      return storedRecord;
    }

    const querySelectedIds = getQuerySelectedIds();
    const queryNoSymptom = getQueryNoSymptom();

    if (!querySelectedIds.length && !queryNoSymptom) {
      return null;
    }

    return {
      symptomIds: querySelectedIds,
      noSymptom: queryNoSymptom,
      intensities: {},
      updatedAt: null,
    };
  }

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

  function getQuerySelectedIds() {
    const params = new URLSearchParams(window.location.search);
    const ids = [...params.getAll("symptom_ids[]"), ...params.getAll("symptom_ids")];
    return normalizeIds(ids);
  }

  function getQueryNoSymptom() {
    const params = new URLSearchParams(window.location.search);
    return params.get("no_symptom") === "true";
  }

  function buildSelectQuery(selectedIds) {
    const params = new URLSearchParams();
    normalizeIds(selectedIds).forEach((id) => {
      params.append("symptom_ids[]", id);
    });
    return params.toString();
  }

  function navigateTo(url) {
    window.location.href = url;
  }

  function shouldBindNativeBackButton(button) {
    return Boolean(button && !button.getAttribute("onclick"));
  }

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

  function getSelectedIdsFromSelectCards() {
    return selectCards
      .filter((card) => card.dataset.id !== "0" && card.classList.contains("active"))
      .map((card) => card.dataset.id);
  }

  function isNoSymptomSelected() {
    const noSymptomCard = selectCards.find((card) => card.dataset.id === "0");
    return Boolean(noSymptomCard && noSymptomCard.classList.contains("active"));
  }

  function updateSelectNextButton() {
    if (!btnNextStep1) return;

    const selectedCount = getSelectedIdsFromSelectCards().length;
    const noSymptomSelected = isNoSymptomSelected();

    if (selectForm) {
      selectForm.action = noSymptomSelected ? "complete.html" : "intensity.html";
    }

    btnNextStep1.textContent = noSymptomSelected && selectedCount === 0 ? "다음" : `다음 (${selectedCount}개 선택됨)`;
    btnNextStep1.disabled = !noSymptomSelected && selectedCount === 0;
  }

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

  restoreSelectCards();

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

  function renderIntensityCards(container, selectedIds, intensities = {}) {
    if (!container) return;

    container.innerHTML = "";

    normalizeIds(selectedIds).forEach((id) => {
      const symptom = getSymptomMeta(id);
      if (!symptom || symptom.id === "0") return;

      container.insertAdjacentHTML("beforeend", buildIntensityCard(symptom, intensities[id] || ""));
    });
  }

  function getCardIntensityValue(card) {
    const hiddenInput = card.querySelector("input[type='hidden'][name^='intensity_']");
    return hiddenInput ? hiddenInput.value : "";
  }

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

  function updateIntensitySubmitState() {
    if (!btnSubmitRecord || !intensityListContainer) return;

    const cards = Array.from(intensityListContainer.querySelectorAll(".strength-card"));
    const ready = cards.length > 0 && cards.every((card) => Boolean(getCardIntensityValue(card)));
    btnSubmitRecord.disabled = !ready;
  }

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

  function handleSelectProceed(event) {
    const selectedIds = getSelectedIdsFromSelectCards();
    const noSymptomSelected = isNoSymptomSelected();

    if (!noSymptomSelected && selectedIds.length === 0) {
      if (event) event.preventDefault();
      return;
    }

    saveDraftState({
      symptomIds: selectedIds,
      noSymptom: noSymptomSelected,
      intensities: {},
    });

    if (noSymptomSelected) {
      saveCompletedRecord({ symptomIds: [], noSymptom: true, intensities: {} });

      if (hasCombinedTracker) {
        if (event) event.preventDefault();
        showCombinedSection(completeSection);
        renderCompleteRecord(getCompletedRecord());
      }

      return;
    }

    if (hasCombinedTracker) {
      if (event) event.preventDefault();
      showCombinedSection(intensitySection);
      renderIntensityCards(intensityListContainer, selectedIds, getDraftState().intensities || {});
      updateIntensitySubmitState();
    }
  }

  function loadEditSeedRecord() {
    const completedRecord = getCompletedRecord();
    if (completedRecord && Array.isArray(completedRecord.symptomIds)) {
      return completedRecord;
    }

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

  function renderEditCards(container, record) {
    if (!container) return;

    const selectedIds = normalizeIds(record.symptomIds || []);
    const intensities = record.intensities || {};

    container.innerHTML = symptomCatalog
      .filter((symptom) => symptom.id !== "0")
      .map((symptom) => buildIntensityCard(symptom, intensities[symptom.id] || "", true, selectedIds.includes(symptom.id)))
      .join("");
  }

  function refreshEditSubmitState() {
    if (!btnEditComplete || !editListContainer) return;

    const cards = Array.from(editListContainer.querySelectorAll(".strength-card"));
    const selectedCards = cards.filter((card) => {
      const checkbox = card.querySelector("input[type='checkbox'][name='symptom_ids[]']");
      return Boolean(checkbox && checkbox.checked);
    });

    const ready = selectedCards.length > 0 && selectedCards.every((card) => Boolean(getCardIntensityValue(card)));
    btnEditComplete.disabled = !ready;
  }

  function collectEditData() {
    const result = { symptomIds: [], intensities: {} };

    if (!editListContainer) return result;

    Array.from(editListContainer.querySelectorAll(".strength-card")).forEach((card) => {
      const symptomId = card.dataset.id;
      const checkbox = card.querySelector("input[type='checkbox'][name='symptom_ids[]']");
      const intensityValue = getCardIntensityValue(card);

      result.intensities[symptomId] = intensityValue;

      if (checkbox && checkbox.checked) {
        result.symptomIds.push(symptomId);
      }
    });

    result.symptomIds = normalizeIds(result.symptomIds);
    return result;
  }

  function handleIntensityProceed(event) {
    const currentData = collectIntensityData(intensityListContainer);
    const allSelected = currentData.symptomIds.length > 0 && currentData.symptomIds.every((id) => Boolean(currentData.intensities[id]));

    if (!allSelected) {
      if (event) event.preventDefault();
      updateIntensitySubmitState();
      return;
    }

    const nextRecord = saveCompletedRecord({
      symptomIds: currentData.symptomIds,
      noSymptom: false,
      intensities: currentData.intensities,
    });

    if (hasCombinedTracker) {
      if (event) event.preventDefault();
      showCombinedSection(completeSection);
      renderCompleteRecord(nextRecord);
      return;
    }
  }

  function handleEditProceed(event) {
    if (event) event.preventDefault();

    const editData = collectEditData();
    const selectedCards = editData.symptomIds.length > 0;
    const intensitiesReady = editData.symptomIds.every((id) => Boolean(editData.intensities[id]));

    if (!selectedCards || !intensitiesReady) {
      refreshEditSubmitState();
      return;
    }

    saveCompletedRecord({
      symptomIds: editData.symptomIds,
      noSymptom: false,
      intensities: editData.intensities,
    });

    setTimeout(() => {
      navigateTo("complete.html");
    }, 2000);
  }

  function renderCompleteRecord(record) {
    if (!recordListContainer) return;

    recordListContainer.innerHTML = "";

    if (!record) {
      recordListContainer.innerHTML = `
        <div class="record-card">
          <div class="record-info">
            <span class="symptom-name">저장된 기록이 없어요</span>
          </div>
          <span class="record-badge low">-</span>
        </div>`;
      return;
    }

    if (record.noSymptom) {
      recordListContainer.innerHTML = `
        <div class="record-card">
          <div class="record-info">
            <img src="assets/icons/symptom_none_inactive.svg" alt="증상 없음" class="symptom-icon" style="width: 28px; height: 28px;">
            <span class="symptom-name">증상 없음</span>
          </div>
          <span class="record-badge low">없음</span>
        </div>`;
      return;
    }

    const selectedIds = normalizeIds(record.symptomIds || []);
    const intensities = record.intensities || {};

    selectedIds.forEach((id) => {
      const symptom = getSymptomMeta(id);
      if (!symptom) return;

      const intensityValue = intensities[id] || "";
      const badgeText = getIntensityLabel(intensityValue) || "미정";
      const badgeClass = intensityValue || "low";

      recordListContainer.insertAdjacentHTML(
        "beforeend",
        `
          <div class="record-card">
            <div class="record-info">
              <img src="assets/icons/symptom_${symptom.icon}_inactive.svg" alt="${symptom.name}" class="symptom-icon" style="width: 28px; height: 28px;">
              <span class="symptom-name">${symptom.name}</span>
            </div>
            <span class="record-badge ${badgeClass}">${badgeText}</span>
          </div>`
      );
    });
  }

  function showCombinedSection(sectionToShow) {
    if (!hasCombinedTracker) return;

    [selectSection, intensitySection, completeSection, editSection].forEach((section) => {
      if (!section) return;

      const isActive = section === sectionToShow;
      section.classList.toggle("active", isActive);
      section.style.display = isActive ? "flex" : "none";
    });
  }

  function initCombinedTracker() {
    if (!hasCombinedTracker) return;

    if (intensityListContainer) {
      const draftState = getDraftState();
      const querySelectedIds = getQuerySelectedIds();
      const selectedIds = querySelectedIds.length ? querySelectedIds : draftState.symptomIds || getSelectedIdsFromSelectCards();
      renderIntensityCards(intensityListContainer, selectedIds, draftState.intensities || {});
      updateIntensitySubmitState();
    }

    if (editListContainer) {
      renderEditCards(editListContainer, loadEditSeedRecord());
      refreshEditSubmitState();
    }

    if (recordListContainer) {
      renderCompleteRecord(getCompletedRecord() || getDraftState());
    }
  }

  const backBtn = document.querySelector(".back-btn");
  if (shouldBindNativeBackButton(backBtn)) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  if (btnViewReport && !btnViewReport.getAttribute("onclick")) {
    btnViewReport.addEventListener("click", () => {
      navigateTo("report.html");
    });
  }

  if (intensityListContainer && !hasCombinedTracker) {
    const draftState = getDraftState();
    const querySelectedIds = getQuerySelectedIds();
    const selectedIds = querySelectedIds.length ? querySelectedIds : draftState.symptomIds || [];
    renderIntensityCards(intensityListContainer, selectedIds, draftState.intensities || {});
    updateIntensitySubmitState();
  }

  selectCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();

      const id = card.dataset.id;
      const isNoSymptom = id === "0";
      const isActive = card.classList.contains("active");

      if (!isActive) {
        if (isNoSymptom) {
          selectCards.forEach((otherCard) => {
            setSelectCardActive(otherCard, false);
          });
        } else {
          const noSymptomCard = selectCards.find((otherCard) => otherCard.dataset.id === "0");
          if (noSymptomCard) {
            setSelectCardActive(noSymptomCard, false);
          }
        }

        setSelectCardActive(card, true);
      } else {
        setSelectCardActive(card, false);
      }

      updateSelectNextButton();
    });
  });

  if (selectForm) {
    selectForm.addEventListener("submit", handleSelectProceed);
  } else if (btnNextStep1) {
    btnNextStep1.addEventListener("click", handleSelectProceed);
  }

  if (btnPrevStep2 && !btnPrevStep2.getAttribute("onclick")) {
    btnPrevStep2.addEventListener("click", () => {
      if (hasCombinedTracker) {
        showCombinedSection(selectSection);
      } else {
        navigateTo("select.html");
      }
    });
  }

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-strength");
    if (!button) return;

    const card = button.closest(".strength-card");
    if (!card) return;

    event.preventDefault();
    setCardIntensityValue(card, button.dataset.value || "");

    const checkbox = card.querySelector("input[type='checkbox'][name='symptom_ids[]']");
    if (checkbox) {
      checkbox.checked = true;
      card.classList.add("is-selected");
    }

    if (card.closest("#strength-list-step2")) {
      updateIntensitySubmitState();
    }

    if (card.closest("#edit-strength-list")) {
      refreshEditSubmitState();
    }
  });

  document.body.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox'][name='symptom_ids[]']");
    if (!checkbox) return;

    const card = checkbox.closest(".strength-card");
    if (!card) return;

    card.classList.toggle("is-selected", checkbox.checked);
    refreshEditSubmitState();
  });

  if (intensityForm) {
    intensityForm.addEventListener("submit", handleIntensityProceed);
  } else if (btnSubmitRecord) {
    btnSubmitRecord.addEventListener("click", handleIntensityProceed);
  }

  if (editListContainer && editForm) {
    renderEditCards(editListContainer, loadEditSeedRecord());
    refreshEditSubmitState();
  }

  if (editForm) {
    editForm.addEventListener("submit", handleEditProceed);
  } else if (btnEditComplete) {
    btnEditComplete.addEventListener("click", handleEditProceed);
  }

  if (recordListContainer && !hasCombinedTracker) {
    renderCompleteRecord(getCompletedRecord() || getDraftState());
  }

  initCombinedTracker();
});