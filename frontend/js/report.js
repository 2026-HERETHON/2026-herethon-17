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
  const weeklyArea = document.getElementById("weekly-report-area");
  const monthlyArea = document.getElementById("monthly-report-area");


  if (btnWeekly && btnMonthly) {
    btnWeekly.addEventListener("click", function () {
      this.classList.add("active");
      btnMonthly.classList.remove("active");
      weeklyArea.style.display = "block";  // 주간 켜기
      monthlyArea.style.display = "none";  // 월간 끄기
    });

    btnMonthly.addEventListener("click", function () {
      this.classList.add("active");
      btnWeekly.classList.remove("active");
      monthlyArea.style.display = "block"; // 월간 켜기
      weeklyArea.style.display = "none";   // 주간 끄기
      
      renderCalendar(); // 월간 탭이 열릴 때 달력 그리기
    });
  }

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

  // ==========================================
  // [월간 리포트] 캘린더 동적 렌더링 로직
  // ==========================================
  let currentMonthDate = new Date(2026, 5, 1); // 시작 기준일: 2026년 6월 1일 (JS에서 월은 0부터 시작)
  
  const btnPrevMonth = document.getElementById("btn-prev-month");
  const btnNextMonth = document.getElementById("btn-next-month");
  const monthDateText = document.getElementById("month-date-text");

  // 가상의 월간 증상 데이터 (YYYY-M-D 형식)
  const monthlySymptomData = {
    "2026-6-2": "severe", "2026-6-5": "severe", "2026-6-9": "severe", 
    "2026-6-10": "severe", "2026-6-13": "severe", "2026-6-15": "severe", 
    "2026-6-17": "severe", "2026-6-26": "severe",
    "2026-6-1": "mild", "2026-6-3": "mild", "2026-6-7": "mild", 
    "2026-6-8": "mild", "2026-6-11": "mild", "2026-6-14": "mild", 
    "2026-6-18": "mild", "2026-6-19": "mild", "2026-6-21": "mild", 
    "2026-6-23": "mild", "2026-6-24": "mild"
  };

  const mockTodayStr = "2026-6-27"; 

  // 월 이동 버튼 이벤트
  if (btnPrevMonth) {
    btnPrevMonth.addEventListener("click", () => {
      currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
      renderCalendar();
    });
  }
  if (btnNextMonth) {
    btnNextMonth.addEventListener("click", () => {
      currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
      renderCalendar();
    });
  }

  // 캘린더 그리기 함수
  function renderCalendar() {
    const grid = document.getElementById("calendar-grid");
    if (!grid) return;
    grid.innerHTML = ""; // 기존 달력 초기화

    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    // 상단 텍스트 업데이트
    if (monthDateText) monthDateText.innerText = `${year}년 ${month + 1}월`;

    // 이번 달 1일의 요일 (0: 일요일, 1: 월요일...)
    const firstDay = new Date(year, month, 1).getDay();
    // 이번 달의 총 일수
    const lastDate = new Date(year, month + 1, 0).getDate();

    // 1일이 시작하기 전까지 빈 칸 만들기
    for (let i = 0; i < firstDay; i++) {
      grid.innerHTML += `<div class="date-box" style="background: transparent;"></div>`;
    }

    // 1일부터 마지막 날까지 날짜 박스 채우기
    for (let day = 1; day <= lastDate; day++) {
      const dateStr = `${year}-${month + 1}-${day}`;
      const status = monthlySymptomData[dateStr] || "none";
      
      let cssClass = "date-box";
      if (status === "mild") cssClass += " symptom-mild";
      if (status === "severe") cssClass += " symptom-severe";
      if (dateStr === mockTodayStr) cssClass += " is-today";

      grid.innerHTML += `<div class="${cssClass}">${day}</div>`;
    }
  }
})

// ==========================================
  // [월간 리포트] 이번 달 요약 업데이트 함수
  // ==========================================
  function updateMonthlySummary(totalDays, symptomDays, noneDays) {
    const elTotal = document.getElementById("summary-total-days");
    const elSymptom = document.getElementById("summary-symptom-days");
    const elNone = document.getElementById("summary-none-days");

    if (elTotal) elTotal.innerText = `${totalDays}일`;
    if (elSymptom) elSymptom.innerText = `${symptomDays}일`;
    if (elNone) elNone.innerText = `${noneDays}일`;
  }

  // 백엔드 연동 전 테스트용 (추후 연동 시 삭제)
  updateMonthlySummary(23, 20, 3);

  // ==========================================
  // 리포트 화면 캡처 및 이미지 다운로드 기능
  // ==========================================
  const btnDownload = document.getElementById("btn-download");

  if (btnDownload) {
    btnDownload.addEventListener("click", () => {
      // 현재 켜져 있는 탭이 '주간'인지 '월간'인지 파악
      const isWeekly = document.getElementById("btn-weekly").classList.contains("active");
      
      // 캡처할 타겟 영역 설정
      const targetArea = isWeekly 
        ? document.getElementById("weekly-report-area") 
        : document.getElementById("monthly-report-area");

      // 화면에서 임시로 숨길 요소들 찾기 (화살표, 산부인과 링크)
      const arrows = targetArea.querySelectorAll(".date-btn");
      const mapLink = targetArea.querySelector(".map-link-card");


      arrows.forEach(btn => btn.style.visibility = "hidden");
      if (mapLink) mapLink.style.display = "none";

      // html2canvas로 화면 캡쳐
      html2canvas(targetArea, {
        scale: 2, 
        backgroundColor: "#FAF9F7" 
      }).then(canvas => {
        
        arrows.forEach(btn => btn.style.visibility = "visible");
        if (mapLink) mapLink.style.display = "flex";

        // 이미지 파일로 만들어서 유저 기기에 다운로드
        const link = document.createElement("a");
        link.download = isWeekly ? "주간_패턴_리포트.png" : "월간_패턴_리포트.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
  }