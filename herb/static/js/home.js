// ===== 오늘 날짜 표시 =====
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const weekdays = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토",
  ];

  const weekday = weekdays[today.getDay()];

  return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}

const homeDateElement = document.getElementById("home-date");

if (homeDateElement) {
  homeDateElement.textContent = getTodayString();
}


// ===== Django URL이 연결된 버튼 이동 =====
const urlButtons = [
  document.getElementById("record-btn"),
  document.getElementById("home-noti"),
  document.getElementById("home-profile"),
];

urlButtons.forEach((button) => {
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const targetUrl = button.dataset.url;

    if (targetUrl) {
      window.location.href = targetUrl;
    }
  });
});


// ===== 웰컴백 배너 닫기 =====
const welcomeCloseButton =
  document.getElementById("welcome-close");

if (welcomeCloseButton) {
  welcomeCloseButton.addEventListener("click", () => {
    const welcomeBanner =
      document.getElementById("welcome-banner");

    if (welcomeBanner) {
      welcomeBanner.style.display = "none";
    }
  });
}