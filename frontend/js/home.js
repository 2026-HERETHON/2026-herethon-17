// ===== 오늘 날짜 표시 =====
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[today.getDay()];
  return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}

document.getElementById("home-date").textContent = getTodayString();

// ===== 사용자 이름 표시 (임시: localStorage, 나중에 서버 연동으로 교체) =====
const userName = localStorage.getItem("userName") || "회원";
document.getElementById("username").textContent = userName;

const welcomeUsernameEl = document.getElementById("welcome-username");
if (welcomeUsernameEl) {
  welcomeUsernameEl.textContent = userName;
}

// ===== 이번 주 기록 현황 (요일별 점 7개) =====
// TODO: 나중에 실제 백엔드 데이터와 연동 필요, 지금은 localStorage로 임시 구현

const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"];

function getThisWeekRecordStatus() {
  const recordedDates = JSON.parse(localStorage.getItem("recordedDates") || "[]");

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return weekdayLabels.map((label, index) => {
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + index);
    const dateString = targetDate.toISOString().split("T")[0];

    return {
      label: label,
      checked: recordedDates.includes(dateString),
      isToday: dateString === todayString,
    };
  });
}

const summaryDaysEl = document.getElementById("summary-days");
const weekRecord = getThisWeekRecordStatus();

weekRecord.forEach((day) => {
  const dayWrap = document.createElement("div");
  dayWrap.className = "summary-day";

  const label = document.createElement("span");
  let labelClass = "summary-day-label";
  if (day.checked) labelClass += " checked";
  if (day.isToday) labelClass += " today";
  label.className = labelClass;
  label.textContent = day.label;

  const dot = document.createElement("div");
  let dotClass = "summary-day-dot";
  if (day.checked) dotClass += " checked";
  if (day.isToday) dotClass += " today";
  dot.className = dotClass;

  dayWrap.appendChild(label);
  dayWrap.appendChild(dot);
  summaryDaysEl.appendChild(dayWrap);
});

// ===== 오늘 증상 기록하기 버튼 =====
document.getElementById("record-btn")?.addEventListener("click", () => {
  window.location.href = "tracker.html";
});

// ===== 웰컴백 배너 표시 여부 (임시: 7일 이상 미접속 시뮬레이션) =====
// TODO: 나중에 실제 마지막 로그인 날짜와 비교해서 판단 필요
const daysSinceLastVisit = 8;
if (daysSinceLastVisit >= 7) {
  document.getElementById("welcome-banner").style.display = "block";
  document.getElementById("welcome-days").textContent = daysSinceLastVisit;
}

document.getElementById("welcome-close")?.addEventListener("click", () => {
  document.getElementById("welcome-banner").style.display = "none";
});