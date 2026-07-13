// home page 날짜 표시
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

const userName = localStorage.getItem("userName") || "회원";
document.getElementById("username").textContent = userName;

const welcomeUsernameEl = document.getElementById("welcome-username");
if (welcomeUsernameEl) {
  welcomeUsernameEl.textContent = userName;
}