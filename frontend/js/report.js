document.addEventListener("DOMContentLoaded", function () {
  
  // ==========================================
  // 뒤로 가기 버튼 로직
  // ==========================================
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  // ==========================================
  // 주간/월간 토글 로직
  // ==========================================
  const btnWeekly = document.getElementById("btn-weekly");
  const btnMonthly = document.getElementById("btn-monthly");

  if (btnWeekly && btnMonthly) {
    
    // 주간 버튼을 클릭했을 때
    btnWeekly.addEventListener("click", function () {
      if (!this.classList.contains("active")) {
        this.classList.add("active");
        btnMonthly.classList.remove("active");
        
        // TODO: 나중에 여기에 4.1 주간 리포트 렌더링 함수를 넣을 예정
        console.log("주간 리포트 화면으로 전환");
      }
    });

    // 월간 버튼을 클릭했을 때
    btnMonthly.addEventListener("click", function () {
      if (!this.classList.contains("active")) {
        this.classList.add("active");
        btnWeekly.classList.remove("active");
        
        // TODO: 나중에 여기에 4.2 월간 리포트 렌더링 함수를 넣을 예정
        console.log("월간 리포트 화면으로 전환");
      }
    });
    
  }
});

// ==========================================
  // [주간 리포트] 날짜 변경 및 동적 차트 렌더링
  // ==========================================
  
  // 기준 날짜 설정 (여기톤 날짜가 포함된 주차 7월 13일 ~ 7월 19일)
  let currentStartDate = new Date(2026, 6, 13); // JS에서 6 = 7월

  const btnPrevWeek = document.getElementById("btn-prev-week");
  const btnNextWeek = document.getElementById("btn-next-week");
  const weekDateText = document.getElementById("week-date-text");

  // 가상의 차트 데이터 (월~일 강도 점수 합산) 
  // 백엔드 연동 추후 수정
  const chartData = [2, 1, 3, 2, 4, 1, 0]; 
  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

  // 날짜 텍스트 업데이트 함수
  function updateWeekText() {
    const endDate = new Date(currentStartDate);
    endDate.setDate(currentStartDate.getDate() + 6); 

    const startStr = `${currentStartDate.getMonth() + 1}월 ${currentStartDate.getDate()}일`;
    const endStr = `${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;
    
    if (weekDateText) {
      weekDateText.innerText = `${startStr} - ${endStr}`;
    }
  }

  // 버튼 클릭 이벤트 (일주일씩 이동)
  if (btnPrevWeek) {
    btnPrevWeek.addEventListener("click", () => {
      currentStartDate.setDate(currentStartDate.getDate() - 7);
      updateWeekText();
      // TODO: 백엔드에서 이전 주 데이터 받아와서 다시 차트 그리기
    });
  }

  if (btnNextWeek) {
    btnNextWeek.addEventListener("click", () => {
      currentStartDate.setDate(currentStartDate.getDate() + 7);
      updateWeekText();
      // TODO: 백엔드에서 다음 주 데이터 받아와서 다시 차트 그리기
    });
  }

  // 막대그래프 동적 렌더링 함수
  function renderWeeklyChart(data) {
    const chartArea = document.getElementById("weekly-chart-area");
    if (!chartArea) return;
    
    chartArea.innerHTML = ""; // 기존 차트 초기화

    // 데이터 중 가장 높은 점수 찾기 (최소 4점 기준으로 세팅하여 유동적 변화)
    const maxScore = Math.max(...data, 4); 
    
    // Y축 간격 계산 (0, 중간점, 최대점 형태)
    const midScore = Math.ceil(maxScore / 2);

    // Y축 숫자
    const yAxisHTML = `
      <div class="y-axis-labels">
        <span>${maxScore}</span>
        <span>${midScore}</span>
        <span>0</span>
      </div>
    `;

    // 배경 점선 
    const bgLinesHTML = `
      <div class="chart-bg-lines">
        <img src="assets/icons/dot_line.svg" alt="">
        <img src="assets/icons/dot_line.svg" alt="">
        <img src="assets/icons/dot_line.svg" alt="">
      </div>
    `;

    // 막대그래프 및 요일
    let barsHTML = `<div class="bar-container">`;
    data.forEach((score, index) => {
      // 점수에 따른 막대 높이 퍼센트 계산
      const heightPercentage = (score / maxScore) * 100;
      
      barsHTML += `
        <div class="bar-group">
          <!-- 막대 높이를 인라인 스타일로 동적 주입 -->
          <div class="bar" style="height: ${heightPercentage}%"></div>
          <span class="x-axis-label">${dayLabels[index]}</span>
        </div>
      `;
    });
    barsHTML += `</div>`;

    // 전체 조립 후 화면에 삽입
    chartArea.innerHTML = yAxisHTML + bgLinesHTML + barsHTML;
  }

  // 페이지 로드 시 최초 1회 실행
  updateWeekText();
  renderWeeklyChart(chartData);

  // ==========================================
  // [주간 리포트] 증상별 현황 동적 렌더링
  // ==========================================
  
  // 가상의 백엔드 데이터 (증상별 횟수)
  const symptomStatusData = [
    { name: "안면홍조", count: 5, color: "#E05C5C" },
    { name: "수면장애", count: 4, color: "#7B89D4" },
    { name: "피로감", count: 2, color: "#E8A940" },
    { name: "감정기복", count: 0, color: "#82A183" }, // 0회 (숨김 처리됨), 기디 분께 색상 여쭤보고 추후수정
    { name: "관절통", count: 0, color: "#865523" }    // 0회 (숨김 처리됨), 기디 분께 색상 여쭤보고 추후수정
  ];

  function renderSymptomStatus(data) {
    const listContainer = document.getElementById("symptom-status-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";

    // 횟수가 0보다 큰 증상만 필터링
    const activeSymptoms = data.filter(item => item.count > 0);

    // 기록이 아예 없는 경우
    if (activeSymptoms.length === 0) {
      listContainer.innerHTML = `<p style="text-align:center; color:#9A9A9A; font-size:13px;">기록된 증상이 없습니다.</p>`;
      return;
    }

    // 남은 증상 중에서 가장 횟수가 많은 값 찾기 
    const maxCount = Math.max(...activeSymptoms.map(item => item.count));

    // 필터링된 증상들을 화면에 그리기
    activeSymptoms.forEach(item => {
      // (현재 횟수 / 최대 횟수) * 100 = 상대적 바 너비(%)
      const widthPercentage = (item.count / maxCount) * 100;

      const itemHTML = `
        <div class="status-item">
          <!-- 텍스트 영역 -->
          <div class="status-info">
            <span class="status-name">${item.name}</span>
            <span class="status-count" style="color: ${item.color}">${item.count}회</span>
          </div>
          <!-- 진행바 영역 -->
          <div class="status-bar-bg">
            <div class="status-bar-fill" style="width: ${widthPercentage}%; background-color: ${item.color};"></div>
          </div>
        </div>
      `;
      listContainer.insertAdjacentHTML('beforeend', itemHTML);
    });
  }

  // 페이지 로드 시 증상별 현황 렌더링 실행
  renderSymptomStatus(symptomStatusData);