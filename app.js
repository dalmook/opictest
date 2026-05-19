const screens = {
  intro: document.getElementById("introScreen"),
  survey: document.getElementById("surveyScreen"),
  self: document.getElementById("selfScreen"),
  setup: document.getElementById("setupScreen"),
  exam: document.getElementById("examScreen"),
  result: document.getElementById("resultScreen")
};
const progressLabel = document.getElementById("progressLabel");
const surveyForm = document.getElementById("surveyForm");
const selfForm = document.getElementById("selfForm");
const summary = document.getElementById("summary");
const totalTimerEl = document.getElementById("totalTimer");
const questionTitle = document.getElementById("questionTitle");
const questionCategory = document.getElementById("questionCategory");
const questionText = document.getElementById("questionText");
const questionAudio = document.getElementById("questionAudio");

const startBtn = document.getElementById("startBtn");
const surveyNextBtn = document.getElementById("surveyNextBtn");
const selfNextBtn = document.getElementById("selfNextBtn");
const examStartBtn = document.getElementById("examStartBtn");
const micBtn = document.getElementById("micBtn");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

let surveyData = [], questionData = [], config = null;
let currentQuestion = 0, totalLeft = 0, timer = null;
const state = { survey: {}, selfLevel: null, micChecked: false };

const format = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const show = (k) => Object.entries(screens).forEach(([n, el]) => el.classList.toggle("active", n === k));

async function loadData() {
  const [s, q, c] = await Promise.all([fetch("survey.json"), fetch("questions.json"), fetch("test-config.json")]);
  surveyData = await s.json();
  questionData = await q.json();
  config = await c.json();
}

function renderSurvey() {
  surveyForm.innerHTML = "";
  surveyData.forEach((item) => {
    const type = item.multiple ? "checkbox" : "radio";
    const html = item.options.map((opt, i) => `<label class="option"><input type="${type}" name="${item.id}" value="${opt}" id="${item.id}_${i}"> ${opt}</label>`).join("");
    surveyForm.insertAdjacentHTML("beforeend", `<div class="survey-item"><h3>${item.title}</h3><div class="option-list">${html}</div></div>`);
  });
}

function renderSelfAssessment() {
  selfForm.innerHTML = config.selfAssessmentLevels.map((lv) => `<label class="option"><input type="radio" name="selfLevel" value="${lv.level}"> ${lv.level}단계 - ${lv.description}</label>`).join("");
}

function collectSurvey() {
  const out = {};
  surveyData.forEach((item) => {
    out[item.id] = item.multiple
      ? Array.from(document.querySelectorAll(`input[name="${item.id}"]:checked`)).map((x) => x.value)
       : document.querySelector(`input[name="${item.id}"]:checked`)?.value || "미선택";
  });
  return out;
}

function renderQuestion() {
  const q = questionData[currentQuestion];
  questionTitle.textContent = `Question ${currentQuestion + 1} / ${questionData.length}`;
  questionCategory.textContent = q.category;
  questionText.textContent = q.text;
  questionAudio.src = q.audio;
  progressLabel.textContent = `Questions (${currentQuestion + 1}/${questionData.length})`;
}

function startGlobalTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    totalLeft -= 1;
    totalTimerEl.textContent = format(Math.max(0, totalLeft));
    if (totalLeft <= 0) finishExam();
  }, 1000);
}

function nextQuestion() {
  currentQuestion += 1;
  if (currentQuestion >= questionData.length) return finishExam();
  renderQuestion();
}

function finishExam() {
  clearInterval(timer);
  show("result");
  progressLabel.textContent = "Completed";
  summary.innerHTML = `<pre>${JSON.stringify(state, null, 2)}</pre><p>총 답변 시간: ${config.totalAnswerMinutes}분</p>`;
}

startBtn.onclick = async () => { await loadData(); renderSurvey(); show("survey"); progressLabel.textContent = "Background Survey"; };
surveyNextBtn.onclick = () => { state.survey = collectSurvey(); renderSelfAssessment(); show("self"); progressLabel.textContent = "Self Assessment"; };
selfNextBtn.onclick = () => {
  state.selfLevel = Number(document.querySelector('input[name="selfLevel"]:checked')?.value || 0);
  if (!state.selfLevel) return alert("단계를 선택하세요.");
  show("setup"); progressLabel.textContent = "Setup";
};
micBtn.onclick = async () => {
  try { await navigator.mediaDevices.getUserMedia({ audio: true }); state.micChecked = true; alert("마이크 체크 완료"); }
  catch { alert("마이크 권한이 필요합니다."); }
};
examStartBtn.onclick = () => {
  totalLeft = config.totalAnswerMinutes * 60;
  totalTimerEl.textContent = format(totalLeft);
  currentQuestion = 0;
  show("exam");
  renderQuestion();
  startGlobalTimer();
};
playBtn.onclick = () => { questionAudio.currentTime = 0; questionAudio.play(); };
nextBtn.onclick = nextQuestion;
restartBtn.onclick = () => location.reload();
