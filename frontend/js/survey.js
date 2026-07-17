// 자가진단 문항
const questions = [
  {
    title: "요즘 나의 상태를 가장 잘 표현하는 문장은?",
    options: [
      { text: "예전의 나와 지금의 내가 달라진 것 같아 혼란스럽다", score: 1 },
      { text: "예전과는 다르지만, 이제 조금씩 익숙해지고 있다", score: 2 },
      { text: "지금의 나를 자연스럽게 받아들이고 있다", score: 3 },
    ],
  },
  {
    title: "요즘 에너지 수준은?",
    options: [
      { text: "무기력하고 하고 싶은 게 별로 없다", score: 1 },
      { text: "괜찮긴 하지만 조금씩 나아지고 있다", score: 2 },
      { text: "새로운 것을 시도해보고 싶은 의욕이 있다", score: 3 },
    ],
  },
  {
    title: "몸과 마음의 변화에 대해 주변에 표현하나요?",
    options: [
      { text: "아직 누구에게도 말하지 못했다", score: 1 },
      { text: "가까운 몇 명에게는 이야기하기 시작했다", score: 2 },
      { text: "필요할 때 자연스럽게 이야기한다", score: 3 },
    ],
  },
  {
    title: "요즘 나의 하루 계획은?",
    options: [
      { text: "그날그날 버티는 데 급급하다", score: 1 },
      { text: "조금씩 나만의 루틴을 다시 만들고 있다", score: 2 },
      { text: "하고 싶은 일을 구체적으로 계획하고 있다", score: 3 },
    ],
  },
  {
    title: "환경이라는 변화에 대해 드는 생각은?",
    options: [
      { text: "무엇을 잃어버린 느낌이 크다", score: 1 },
      { text: "잃은 것도 있지만 적응해가는 중이다", score: 2 },
      { text: "새로운 챕터가 시작됐다는 느낌이 든다", score: 3 },
    ],
  },
];

let currentStep = 0;
let answers = [];

// 로딩 페이지 - 모래시계 아이콘 로테이트
const hourglassImages = [
  "assets/icons/LoadingLogo1.png",
  "assets/icons/LoadingLogo2.png",
  "assets/icons/LoadingLogo3.png",
];

let hourglassIndex = 0;
let hourglassInterval;

function startHourglassAnimation() {
  const iconEl = document.getElementById("loading-icon1");   
  hourglassInterval = setInterval(() => {
    hourglassIndex = (hourglassIndex + 1) % hourglassImages.length;
    iconEl.src = hourglassImages[hourglassIndex];
  }, 400);
}

function stopHourglassAnimation() {
  clearInterval(hourglassInterval);
}


const questitleEl = document.getElementById("survey-questitle");

if (questitleEl) {
  renderQuestion();

  document.getElementById("next-btn").addEventListener("click", () => {
    if (currentStep < questions.length - 1) {
      currentStep++;
      renderQuestion();
    } else {
      finishSurvey();
    }
  });

  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      renderQuestion();
    }
  });
}

function renderQuestion() {
  const q = questions[currentStep];

  document.getElementById("survey-questionnum").textContent = `Q${currentStep + 1}`;
  document.getElementById("survey-pagenum").textContent = `${currentStep + 1}/${questions.length}`;
  document.getElementById("survey-progressbar").style.width =
    `${((currentStep + 1) / questions.length) * 100}%`;
  document.getElementById("survey-questitle").textContent = q.title;

  const optionsWrap = document.getElementById("survey-options");
  optionsWrap.innerHTML = "";

  q.options.forEach((opt, index) => {
    const label = document.createElement("label");
    label.className = "survey-optionitem";

    label.innerHTML = `
      <input type="radio" name="survey-answer" value="${index}">
      <span class="survey-newradio">
        <img src="assets/icons/Checkedicon.png" alt="" class="survey-checked">
      </span>
      <span class="survey-option">${opt.text}</span>
    `;

    const radioInput = label.querySelector("input");
    if (answers[currentStep] === index) {
      radioInput.checked = true;
    }

    radioInput.addEventListener("change", () => {
      answers[currentStep] = index;
      document.getElementById("next-btn").disabled = false;
    });

    optionsWrap.appendChild(label);
  });

  document.getElementById("prev-btn").style.visibility =
    currentStep === 0 ? "hidden" : "visible";

  document.getElementById("next-btn").disabled = answers[currentStep] === undefined;
  document.getElementById("next-btn").textContent =
    currentStep === questions.length - 1 ? "결과 보기" : "다음";
}

function finishSurvey() {
  let totalScore = 0;
  answers.forEach((answerIndex, qIndex) => {
    totalScore += questions[qIndex].options[answerIndex].score;
  });

  localStorage.setItem("herbSurveyScore", totalScore);

  document.getElementById("survey-container").style.display = "none";
  document.getElementById("loading-container").style.display = "flex";


  setTimeout(() => {
    window.location.href = "survey_result.html";
  }, 1500);
}

//  자가진단 문항 선택에 따른 여정 단계 배정

function finishSurvey() {
  let countA = 0; 
  let countB = 0; 
  let countC = 0; 

  answers.forEach((answerIndex, qIndex) => {
    const score = questions[qIndex].options[answerIndex].score;
    if (score === 1) countA++;
    else if (score === 2) countB++;
    else if (score === 3) countC++;
  });

  // 여정 단계 배정 로직 (A > B > C 우선순위 적용)
  let resultStage = "혼란기"; // 기본값

  if (countA >= countB && countA >= countC) {
    resultStage = "혼란기"; 
  } else if (countB > countA && countB >= countC) {
    resultStage = "적응기"; 
  } else if (countC > countA && countC > countB) {
    resultStage = "재도약기"; 
  }

  // 로컬스토리지에 배정 결과 저장
  localStorage.setItem("herbSurveyResult", resultStage);

  // 로딩 화면 전환 및 애니메이션 시작
  document.getElementById("survey-container").style.display = "none";
  document.getElementById("loading-container").style.display = "flex";
  startHourglassAnimation();

  setTimeout(() => {
    stopHourglassAnimation();
    window.location.href = "survey_result.html";
  }, 1500);
}

// 결과 페이지(survey_result.html) 로드 시 결과 매핑 처리
document.addEventListener("DOMContentLoaded", () => {
  const resultNameEl = document.getElementById("result-name");
  
  if (resultNameEl) {
    const stage = localStorage.getItem("herbSurveyResult") || "혼란기";
    renderSurveyResult(stage);

    // 다시 진단하기 버튼 - 진단 첫번째 문항으로 연결
    const retryBtn = document.querySelector(".retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        localStorage.removeItem("herbSurveyResult");
        window.location.href = "survey.html";
      });
    }
  }
});

// 여정 단계별 DOM 요소 렌더링 함수
function renderSurveyResult(stage) {
  const resultIcon = document.getElementById("result-icon");
  const resultName = document.getElementById("result-name");
  const resultSubname = document.getElementById("result-subname");
  const resultInfo = document.getElementById("result-info");

  const typeHonlan = document.getElementById("result-honlan");
  const typeJukeong = document.getElementById("result-jukeong");
  const typeJaedoyak = document.getElementById("result-jaedoyak");

  // 선택지 active 클래스 초기화
  [typeHonlan, typeJukeong, typeJaedoyak].forEach(el => {
    if (el) el.classList.remove("active");
  });

  if (stage === "혼란기") {
    if (resultIcon) resultIcon.src = "assets/icons/HonlanIcon.png";
    if (resultName) resultName.textContent = "혼란기";
    if (resultSubname) resultSubname.textContent = "낯선 나를 마주하는 시기";
    if (resultInfo) {
      resultInfo.innerHTML = `
        <div class="result-infogroup">
          <li>• 예전과 다른 몸과 마음이 낯설게 느껴져요</li>
          <li>• 에너지가 떨어지고 무기력함을 느끼기 쉬워요</li>
          <li>• 이 변화를 아직 주변에 말하지 못했을 수 있어요</li>
          <li>• 하루하루를 버티는 데 집중하게 돼요</li>
        </div>
      `;
    }
    if (typeHonlan) typeHonlan.classList.add("active");

  } else if (stage === "적응기") {
    if (resultIcon) resultIcon.src = "assets/icons/JukeongIcon.png"; 
    if (resultName) resultName.textContent = "적응기";
    if (resultSubname) resultSubname.textContent = "조금씩 익숙해지는 시기";
    if (resultInfo) {
      resultInfo.innerHTML = `
        <div class="result-infogroup">
          <li>• 변화를 인지하고 조금씩 나만의 페이스를 찾아가고 있어요</li>
          <li>• 마음의 안정을 찾고 주변 사람들과 대화를 시작해요</li>
          <li>• 나를 위한 루틴을 차근차근 만들어가기 시작하는 단계입니다</li>
        </div>
      `;
    }
    if (typeJukeong) typeJukeong.classList.add("active");

  } else if (stage === "재도약기") {
    if (resultIcon) resultIcon.src = "assets/icons/JaedoyakIcon.png"; 
    if (resultName) resultName.textContent = "재도약기";
    if (resultSubname) resultSubname.textContent = "다시 피어날 준비를 하는 시기";
    if (resultInfo) {
      resultInfo.innerHTML = `
        <div class="result-infogroup">
          <li>• 변화를 온전히 수용하고 긍정적인 에너지를 내뿜고 있어요</li>
          <li>• 새로운 도전을 구체적으로 계획하고 시도할 준비가 되었습니다</li>
          <li>• 나다운 라이프스타일을 멋지게 설계해 나갑니다</li>
        </div>
      `;
    }
    if (typeJaedoyak) typeJaedoyak.classList.add("active");
  }
}
