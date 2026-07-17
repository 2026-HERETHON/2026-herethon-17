
// complete.html
// 저장된 기록(완료된 리포트) 표시 로직 및 최종 데이터 렌더링

document.addEventListener("DOMContentLoaded", () => {
  
  // 세션 스토리지 키값
  const STORAGE_KEY = "herb-tracker-state";       // 이전 단계들의 임시 데이터
  const COMPLETED_KEY = "herb-tracker-completed"; // 최종 완료되어 확정된 데이터 (API 전송용)

  // 리포트 카드가 그려질 부모 컨테이너
  const recordListContainer = document.getElementById("record-list-step3");

  // ==========================================
  // 스토리지 읽기/쓰기, 데이터 정제
  // ==========================================
  function readJson(key, fallback) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  // 증상 ID를 기반으로 아이콘, 이름 등 메타데이터를 매핑해주는 함수
  function getSymptomMeta(id) {
    const catalog = [
      { id: "1", name: "안면홍조", icon: "hot" },
      { id: "2", name: "수면장애", icon: "sleep" },
      { id: "3", name: "감정기복", icon: "mood" },
      { id: "4", name: "피로감", icon: "fatigue" },
      { id: "5", name: "관절통", icon: "joint" },
      { id: "0", name: "증상 없음", icon: "none" },
    ];
    return catalog.find((c) => c.id === String(id));
  }

  // ==========================================
  // 데이터 로드 함수 - 스토리지에서 최종 데이터 가져오기
  // ==========================================
  
  // 진행 중이던 임시 데이터를 가져옴
  function getDraftState() {
    return readJson(STORAGE_KEY, {
      symptomIds: [],
      noSymptom: false,
      intensities: {},
    });
  }

  // 화면에 그릴 최종 데이터를 가져오는 함수
  function getCompletedRecord() {
    // 완료 키(COMPLETED_KEY)에 저장된 최종 데이터가 있는지 확인
    const storedRecord = readJson(COMPLETED_KEY, null);
    if (storedRecord) {
      return storedRecord;
    }

    // 완료 데이터가 없다면, 임시 상태 데이터를 Fallback으로 사용
    const draft = getDraftState();
    if (draft && (draft.symptomIds?.length || draft.noSymptom)) {
      return { ...draft, updatedAt: null };
    }

    // 데이터가 아예 없는 경우
    return null;
  }

  // 영문 강도 값을 UI 표시용 한글로 변환
  function getIntensityLabel(value) {
    if (value === "low") return "약";
    if (value === "mid") return "중";
    if (value === "high") return "강";
    return "";
  }

  // ==========================================
  // UI 렌더링 함수 - 최종 데이터를 읽어 화면에 리포트 카드 생성
  // ==========================================
  // ==========================================
  // UI 렌더링 함수 - 최종 데이터를 읽어 화면에 리포트 카드 생성
  // ==========================================
  function renderCompleteRecord(record) {
    if (!recordListContainer) return;

    recordListContainer.innerHTML = ""; // 컨테이너 초기화

    // 저장된 데이터가 아예 없는 경우 (예외 처리)
    if (!record) {
      recordListContainer.innerHTML = `
        <div class="record-card">
          <div class="record-info">
            <span class="symptom-name">저장된 기록이 없어요</span>
          </div>
        </div>`;
      return;
    }

    // 1단계에서 '증상 없음'을 선택하고 넘어온 경우 (뱃지 숨김)
    if (record.noSymptom) {
      recordListContainer.innerHTML = `
        <div class="record-card">
          <div class="record-info">
            <img src="assets/icons/symptom_none_inactive.svg" alt="증상 없음" class="symptom-icon" style="width: 28px; height: 28px;">
            <span class="symptom-name">증상 없음</span> 
          </div>
        </div>`;
      return;
    }

    // 1, 2단계를 거쳐 '증상'과 '강도' 데이터가 모두 존재하는 경우
    const selectedIds = (record.symptomIds || []).map(String);
    const intensities = record.intensities || {};

    selectedIds.forEach((id) => {
      const symptom = getSymptomMeta(id);
      if (!symptom) return;

      const intensityValue = intensities[id] || "";
      const badgeText = getIntensityLabel(intensityValue) || "미정";
      const badgeClass = intensityValue || "low"; 

      // 각 증상별로 카드를 하나씩 생성하여 화면에 추가
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

  // ==========================================
  // 초기 실행
  // ==========================================
  
  // 페이지 로드 시, 스토리지에서 데이터를 읽어와 즉시 화면을 렌더링함
  // 향후 백엔드 POST 연동 시, 이 시점에서 완성된 데이터를 서버로 전송하는 로직을 추가하시면 됩니다!!
  renderCompleteRecord(getCompletedRecord() || getDraftState());
});