const screens = {
  intro: document.getElementById("introScreen"),
  survey: document.getElementById("surveyScreen"),
  exam: document.getElementById("examScreen"),
  result: document.getElementById("resultScreen")
};

const progressLabel = document.getElementById("progressLabel");
const surveyForm = document.getElementById("surveyForm");
const summary = document.getElementById("summary");

const questionTitle = document.getElementById("questionTitle");
const questionCategory = document.getElementById("questionCategory");
const questionText = document.getElementById("questionText");
const questionAudio = document.getElementById("questionAudio");
const prepTimerEl = document.getElementById("prepTimer");
const answerTimerEl = document.getElementById("answerTimer");

const startBtn = document.getElementById("startBtn");
const surveyNextBtn = document.getElementById("surveyNextBtn");
const playBtn = document.getElementById("playBtn");
const skipBtn = document.getElementById("skipBtn");
const restartBtn = document.getElementById("restartBtn");

let surveyData = [];
let questionData = [];
let answers = {};
let currentQuestion = 0;
let prepLeft = 0;
let answerLeft = 0;
let timer = null;

const format = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function show(screen) {
  Object.values(screens).forEach((el) => el.classList.remove("active"));
  screens[screen].classList.add("active");
}

async function loadData() {
  const [s, q] = await Promise.all([fetch("survey.json"), fetch("questions.json")]);
  surveyData = await s.json();
  questionData = await q.json();
}

function renderSurvey() {
  surveyForm.innerHTML = "";
  surveyData.forEach((item) => {
    const wrap = document.createElement("div");
    wrap.className = "survey-item";
    wrap.innerHTML = `<h3>${item.title}</h3>`;

    const optionList = document.createElement("div");
    optionList.className = "option-list";

    item.options.forEach((opt, idx) => {
      const id = `${item.id}_${idx}`;
      const type = item.multiple ? "checkbox" : "radio";
      const name = item.id;
      const row = document.createElement("label");
      row.className = "option";
      row.innerHTML = `<input type="${type}" name="${name}" value="${opt}" id="${id}" /> ${opt}`;
      optionList.appendChild(row);
    });

    wrap.appendChild(optionList);
    surveyForm.appendChild(wrap);
  });
}

function collectSurvey() {
  const result = {};
  surveyData.forEach((item) => {
    if (item.multiple) {
      result[item.id] = Array.from(document.querySelectorAll(`input[name="${item.id}"]:checked`)).map((el) => el.value);
    } else {
      result[item.id] = document.querySelector(`input[name="${item.id}"]:checked`)?.value || "미선택";
    }
  });
  return result;
}

function renderQuestion() {
  const q = questionData[currentQuestion];
  questionTitle.textContent = `${q.title} (${currentQuestion + 1}/${questionData.length})`;
  questionCategory.textContent = `카테고리: ${q.category}`;
  questionText.textContent = q.text;
  questionAudio.src = q.audio;
  prepLeft = q.prepSeconds;
  answerLeft = q.answerSeconds;
  prepTimerEl.textContent = format(prepLeft);
  answerTimerEl.textContent = format(answerLeft);
  progressLabel.textContent = `문항 ${currentQuestion + 1} 진행 중`;
}

function runTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (prepLeft > 0) {
      prepLeft -= 1;
      prepTimerEl.textContent = format(prepLeft);
      return;
    }
    if (answerLeft > 0) {
      answerLeft -= 1;
      answerTimerEl.textContent = format(answerLeft);
      return;
    }
    nextQuestion();
  }, 1000);
}

function nextQuestion() {
  clearInterval(timer);
  currentQuestion += 1;
  if (currentQuestion >= questionData.length) {
    finishExam();
    return;
  }
  renderQuestion();
}

function finishExam() {
  show("result");
  progressLabel.textContent = "완료";
  summary.innerHTML = `
    <h3>설문 요약</h3>
    <pre>${JSON.stringify(answers, null, 2)}</pre>
    <p>총 문항 수: <strong>${questionData.length}</strong></p>
  `;
}

startBtn.addEventListener("click", async () => {
  await loadData();
  renderSurvey();
  show("survey");
  progressLabel.textContent = "설문 진행 중";
});

surveyNextBtn.addEventListener("click", () => {
  answers = collectSurvey();
  currentQuestion = 0;
  show("exam");
  renderQuestion();
});

playBtn.addEventListener("click", () => {
  questionAudio.currentTime = 0;
  questionAudio.play();
  runTimer();
});

skipBtn.addEventListener("click", nextQuestion);

restartBtn.addEventListener("click", () => {
  clearInterval(timer);
  answers = {};
  currentQuestion = 0;
  show("intro");
  progressLabel.textContent = "설문 진행 중";
});
