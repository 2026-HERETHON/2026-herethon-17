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
let hourglassIndex = 0;
let hourglassInterval;
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
        <img src="${window.surveyConfig.checkedIconUrl}" alt="" class="survey-checked">
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
  const answerLetters = ["A", "B", "C"];
  answers.forEach((answerIndex, qIndex) => {
    document.getElementById(`q${qIndex + 1}-answer`).value = answerLetters[answerIndex];
  });
  document.getElementById("diagnosis-form").submit();
}
