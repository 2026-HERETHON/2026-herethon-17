document.addEventListener("DOMContentLoaded", function () {

  // ==========================================
  // 유틸리티 함수
  // ==========================================

  function getDateString(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

  // ==========================================
  // 백엔드 API 호출 함수
  // ==========================================

  /* 주간 리포트 데이터 조회
   @param {Date} startDate - 주의 시작일 (일요일)
   @returns {Promise<Object>} {daily_scores: [int], symptoms: [{name, count, color}]}
   */
  async function fetchWeeklyReportData(startDate) {
    const startDateStr = getDateString(startDate);
    const apiUrl = `/reports/weekly/?start_date=${startDateStr}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("주간 리포트 데이터 로드 실패:", error);
      return {
        daily_scores: [0, 0, 0, 0, 0, 0, 0],
        symptoms: [],
        week_range: ""
      };
    }
  }

  /* 월간 리포트 데이터 조회
   @param {Date} monthDate - 월의 기준일
   @returns {Promise<Object>} {daily_status: {date: level}, summary: {total_days, symptom_days, none_days}}
   */
  async function fetchMonthlyReportData(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;
    const apiUrl = `/reports/monthly/?year=${year}&month=${month}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("월간 리포트 데이터 로드 실패:", error);
      return {
        daily_status: {},
        summary: { total_days: 0, symptom_days: 0, none_days: 0 },
        year: year,
        month: month
      };
    }
  }

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

      loadAndRenderMonthlyReport(); // 월간 탭이 열릴 때 달력 그리기
    });
  }

// ==========================================
  // [주간 리포트] 날짜 변경 및 동적 차트 렌더링
  // ==========================================

  // 기준 날짜 설정 (현재 주의 월요일)
  let currentStartDate = new Date();
  const todayDay = currentStartDate.getDay(); // 0=일, 1=월, ..., 6=토
  const daysToMonday = todayDay === 0 ? 6 : todayDay - 1;
  currentStartDate.setDate(currentStartDate.getDate() - daysToMonday); // 이번 주 월요일

  const btnPrevWeek = document.getElementById("btn-prev-week");
  const btnNextWeek = document.getElementById("btn-next-week");
  const weekDateText = document.getElementById("week-date-text");

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

  // 버튼 클릭 이벤트 (일주일씩 이동 및 데이터 재로드)
  if (btnPrevWeek) {
    btnPrevWeek.addEventListener("click", () => {
      currentStartDate.setDate(currentStartDate.getDate() - 7);
      updateWeekText();
      loadAndRenderWeeklyReport();
    });
  }

  if (btnNextWeek) {
    btnNextWeek.addEventListener("click", () => {
      currentStartDate.setDate(currentStartDate.getDate() + 7);
      updateWeekText();
      loadAndRenderWeeklyReport();
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
        <img src="/static/assets/icons/dot_line.svg" alt="">
        <img src="/static/assets/icons/dot_line.svg" alt="">
        <img src="/static/assets/icons/dot_line.svg" alt="">
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

  // 최초 로드 여부 체크용 (빈 화면 판단은 처음 한 번만)
  let isFirstLoad = true;

  // 주간 리포트 데이터 로드 및 렌더링
  async function loadAndRenderWeeklyReport() {
    const reportData = await fetchWeeklyReportData(currentStartDate);

    if (reportData && reportData.daily_scores) {
      renderWeeklyChart(reportData.daily_scores);
      renderSymptomStatus(reportData.symptoms || []);

      if (isFirstLoad) {
      // 데이터 유무 판단: daily_scores가 모두 0이고 symptoms가 비어있으면 데이터 없음
      const hasData = reportData.daily_scores.some(score => score > 0) ||
                     (reportData.symptoms && reportData.symptoms.length > 0);
      checkAndRenderView(hasData);
      isFirstLoad = false;
      }
    }
  }

  // 페이지 로드 시 최초 1회 실행
  updateWeekText();
  loadAndRenderWeeklyReport();

  // ==========================================
  // [주간 리포트] 증상별 현황 동적 렌더링
  // ==========================================

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

  // ==========================================
  // [월간 리포트] 캘린더 동적 렌더링 로직
  // ==========================================
  let currentMonthDate = new Date(); // 현재 월을 기준으로 시작

  const btnPrevMonth = document.getElementById("btn-prev-month");
  const btnNextMonth = document.getElementById("btn-next-month");
  const monthDateText = document.getElementById("month-date-text");

  // 월 이동 버튼 이벤트
  if (btnPrevMonth) {
    btnPrevMonth.addEventListener("click", () => {
      currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
      loadAndRenderMonthlyReport();
    });
  }
  if (btnNextMonth) {
    btnNextMonth.addEventListener("click", () => {
      currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
      loadAndRenderMonthlyReport();
    });
  }

  // 캘린더 그리기 함수
  function renderCalendar(monthlyData) {
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
      const status = monthlyData.daily_status?.[dateStr] || "none";

      let cssClass = "date-box";
      if (status === "mild") cssClass += " symptom-mild";
      if (status === "severe") cssClass += " symptom-severe";

      grid.innerHTML += `<div class="${cssClass}">${day}</div>`;
    }
  }

  // 월간 리포트 데이터 로드 및 렌더링
  async function loadAndRenderMonthlyReport() {
    const reportData = await fetchMonthlyReportData(currentMonthDate);

    if (reportData) {
      renderCalendar(reportData);
      updateMonthlySummary(
        reportData.summary?.total_days || 0,
        reportData.summary?.symptom_days || 0,
        reportData.summary?.none_days || 0
      );
    }
  }

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

  // 페이지 로드 시 월간 리포트 초기 로드
  loadAndRenderMonthlyReport();

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

  // ==========================================
  // 데이터 유무에 따른 화면 전환
  // ==========================================

  function checkAndRenderView(hasData) {
    const weeklyArea = document.getElementById("weekly-report-area");
    const monthlyArea = document.getElementById("monthly-report-area");
    const emptyArea = document.getElementById("empty-report-area");

    const toggleContainer = document.querySelector(".toggle-container");
    const downloadBtn = document.getElementById("btn-download");

    const btnWeeklyToggle = document.getElementById("btn-weekly");
    const btnMonthlyToggle = document.getElementById("btn-monthly");

    if (hasData) {
      // 데이터가 있을 때: 빈 화면을 끄고 주간 리포트로 전환
      if (emptyArea) emptyArea.style.display = "none";
      if (weeklyArea) weeklyArea.style.display = "block";

      if (toggleContainer) toggleContainer.style.pointerEvents = "auto";
      if (downloadBtn) downloadBtn.style.display = "block";
    } else {
      // 데이터가 없을 때: 주간/월간을 끄고 빈 화면으로 전환
      if (weeklyArea) weeklyArea.style.display = "none";
      if (monthlyArea) monthlyArea.style.display = "none";
      if (emptyArea) emptyArea.style.display = "flex";

      if (btnWeeklyToggle) btnWeeklyToggle.classList.remove("active");
      if (btnMonthlyToggle) btnMonthlyToggle.classList.remove("active");

      if (toggleContainer) toggleContainer.style.pointerEvents = "none";
      if (downloadBtn) downloadBtn.style.display = "none";
    }
  }
})
  // 초기 뷰 체크는 loadAndRenderWeeklyReport()에서 API 응답 결과에 따라 실행됨