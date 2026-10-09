// BankExamPro Client Logic
let PAPERS = null;
let currentPaperId = "paper_1";
let currentPaper = null;
let currentSectionKey = "english";
let currentQIndex = 0;
let strictMode = true;

let sectionalTimeLimit = 20 * 60;
let remainingSectionSeconds = sectionalTimeLimit;
let timerInterval = null;
let qTimerInterval = null;
let userResponses = {};

const SECTIONS_CONFIG = [
  { key: "english", name: "English Language", count: 30, startIndex: 0 },
  { key: "quant", name: "Quantitative Aptitude", count: 35, startIndex: 30 },
  { key: "reasoning", name: "Reasoning Ability", count: 35, startIndex: 65 }
];

window.onload = function() {
  if (typeof EMBEDDED_PAPERS !== "undefined") {
    PAPERS = EMBEDDED_PAPERS;
    initApp();
  } else {
    fetch("questions_bank.json")
      .then(res => res.json())
      .then(data => {
        PAPERS = data;
        initApp();
      })
      .catch(err => {
        console.error("Error loading questions_bank.json, using fallback", err);
      });
  }
};

function initApp() {
  populatePaperDropdown();
  loadPaper("paper_1");
}

function populatePaperDropdown() {
  const select = document.getElementById("paperSelect");
  select.innerHTML = "";
  for (let key in PAPERS) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${PAPERS[key].title} (${PAPERS[key].difficulty})`;
    select.appendChild(opt);
  }
}

function switchPaper(paperId) {
  if (confirm("Switching papers will reset your current attempt. Proceed?")) {
    loadPaper(paperId);
  } else {
    document.getElementById("paperSelect").value = currentPaperId;
  }
}

function loadPaper(paperId) {
  currentPaperId = paperId;
  currentPaper = PAPERS[paperId];
  currentSectionKey = "english";
  currentQIndex = 0;
  remainingSectionSeconds = sectionalTimeLimit;
  userResponses = {};

  currentPaper.questions.forEach((q, idx) => {
    userResponses[q.id] = {
      selectedOption: null,
      status: (idx === 0) ? "not_answered" : "not_visited",
      timeSpent: 0
    };
  });

  document.getElementById("examWorkspaceView").style.display = "flex";
  document.getElementById("sectionNavBar").style.display = "flex";
  document.getElementById("timerBox").style.display = "flex";
  document.getElementById("analyticsScreen").style.display = "none";

  renderSectionTabs();
  renderCurrentQuestion();
  renderPalette();
  startSectionTimer();
}

function toggleStrictMode(isChecked) {
  strictMode = isChecked;
  renderSectionTabs();
}

function renderSectionTabs() {
  const container = document.getElementById("sectionTabsContainer");
  container.innerHTML = "";

  SECTIONS_CONFIG.forEach(sec => {
    const tab = document.createElement("div");
    tab.className = "sec-tab";
    if (sec.key === currentSectionKey) {
      tab.classList.add("active");
    }

    if (strictMode && sec.key !== currentSectionKey) {
      tab.classList.add("locked");
      tab.title = "Section locked until current 20-min section concludes.";
    }

    tab.innerHTML = `<span>${sec.name} (${sec.count})</span>`;
    
    tab.onclick = () => {
      if (!strictMode || sec.key === currentSectionKey) {
        switchSection(sec.key);
      } else {
        alert("In Strict Exam Mode, you cannot switch sections until the current 20-minute section completes, mirroring real IBPS/SBI examinations.");
      }
    };

    container.appendChild(tab);
  });
}

function getQuestionsOfCurrentSection() {
  return currentPaper.questions.filter(q => q.section === currentSectionKey);
}

function switchSection(sectionKey) {
  currentSectionKey = sectionKey;
  currentQIndex = 0;
  if (strictMode) {
    remainingSectionSeconds = sectionalTimeLimit;
  }
  
  const secQs = getQuestionsOfCurrentSection();
  const firstQ = secQs[0];
  if (userResponses[firstQ.id].status === "not_visited") {
    userResponses[firstQ.id].status = "not_answered";
  }

  renderSectionTabs();
  renderCurrentQuestion();
  renderPalette();
}

function renderCurrentQuestion() {
  const secQs = getQuestionsOfCurrentSection();
  const q = secQs[currentQIndex];
  const resp = userResponses[q.id];

  document.getElementById("qNumberTitle").textContent = `Question No. ${currentQIndex + 1} of ${secQs.length} [${q.topic}]`;
  document.getElementById("qBenchmarkPill").innerHTML = `Target: <b>${q.benchmark_seconds}s</b> &bull; ${q.difficulty}`;
  document.getElementById("qTextBody").innerHTML = q.question;

  const optContainer = document.getElementById("qOptionsContainer");
  optContainer.innerHTML = "";

  q.options.forEach((optText, oIdx) => {
    const isSelected = resp.selectedOption === oIdx;
    const label = document.createElement("label");
    label.className = `q-option-item ${isSelected ? "selected" : ""}`;
    label.innerHTML = `
      <input type="radio" name="optRadio" value="${oIdx}" ${isSelected ? "checked" : ""}>
      <div class="q-option-text"><b>(${String.fromCharCode(65 + oIdx)})</b> ${optText}</div>
    `;

    label.onclick = (e) => {
      document.querySelectorAll(".q-option-item").forEach(el => el.classList.remove("selected"));
      label.classList.add("selected");
      label.querySelector("input").checked = true;
    };

    optContainer.appendChild(label);
  });

  document.getElementById("qContentScroll").scrollTop = 0;
}

function handleSaveAndNext() {
  const secQs = getQuestionsOfCurrentSection();
  const q = secQs[currentQIndex];
  const selectedRadio = document.querySelector('input[name="optRadio"]:checked');

  if (selectedRadio) {
    userResponses[q.id].selectedOption = parseInt(selectedRadio.value);
    userResponses[q.id].status = "answered";
  } else {
    if (userResponses[q.id].selectedOption === null) {
      userResponses[q.id].status = "not_answered";
    }
  }

  advanceToNextQuestion();
}

function handleMarkForReview() {
  const secQs = getQuestionsOfCurrentSection();
  const q = secQs[currentQIndex];
  const selectedRadio = document.querySelector('input[name="optRadio"]:checked');

  if (selectedRadio) {
    userResponses[q.id].selectedOption = parseInt(selectedRadio.value);
    userResponses[q.id].status = "ans_review";
  } else {
    userResponses[q.id].status = "review";
  }

  advanceToNextQuestion();
}

function handleClearResponse() {
  const secQs = getQuestionsOfCurrentSection();
  const q = secQs[currentQIndex];
  userResponses[q.id].selectedOption = null;
  userResponses[q.id].status = "not_answered";

  document.querySelectorAll('input[name="optRadio"]').forEach(r => r.checked = false);
  document.querySelectorAll(".q-option-item").forEach(el => el.classList.remove("selected"));
  renderPalette();
}

function advanceToNextQuestion() {
  const secQs = getQuestionsOfCurrentSection();
  if (currentQIndex < secQs.length - 1) {
    currentQIndex++;
    const nextQ = secQs[currentQIndex];
    if (userResponses[nextQ.id].status === "not_visited") {
      userResponses[nextQ.id].status = "not_answered";
    }
    renderCurrentQuestion();
    renderPalette();
  } else {
    if (strictMode) {
      alert("You have reached the end of this section! You can review or wait for the section timer.");
    } else {
      alert("End of this section reached. You can switch to the next section via the tabs above.");
    }
    renderPalette();
  }
}

function jumpToQuestion(idx) {
  currentQIndex = idx;
  const secQs = getQuestionsOfCurrentSection();
  const q = secQs[currentQIndex];
  if (userResponses[q.id].status === "not_visited") {
    userResponses[q.id].status = "not_answered";
  }
  renderCurrentQuestion();
  renderPalette();
}

function renderPalette() {
  const secQs = getQuestionsOfCurrentSection();
  const grid = document.getElementById("paletteGrid");
  grid.innerHTML = "";

  let cAns = 0, cNotAns = 0, cNotVis = 0, cRev = 0, cAnsRev = 0;

  currentPaper.questions.forEach(q => {
    const s = userResponses[q.id].status;
    if (s === "answered") cAns++;
    else if (s === "not_answered") cNotAns++;
    else if (s === "not_visited") cNotVis++;
    else if (s === "review") cRev++;
    else if (s === "ans_review") cAnsRev++;
  });

  document.getElementById("countAnswered").textContent = cAns;
  document.getElementById("countNotAnswered").textContent = cNotAns;
  document.getElementById("countNotVisited").textContent = cNotVis;
  document.getElementById("countReview").textContent = cRev;
  document.getElementById("countAnsReview").textContent = cAnsRev;

  document.getElementById("paletteSectionLabel").textContent = `${currentSectionKey.toUpperCase()} PALETTE`;
  document.getElementById("paletteCountLabel").textContent = `${currentQIndex + 1}/${secQs.length}`;

  secQs.forEach((q, idx) => {
    const btn = document.createElement("button");
    const st = userResponses[q.id].status;
    btn.className = `palette-btn st-${st.replace('_', '-')}`;
    if (idx === currentQIndex) {
      btn.classList.add("active");
    }
    btn.textContent = idx + 1;
    btn.onclick = () => jumpToQuestion(idx);
    grid.appendChild(btn);
  });
}

function startSectionTimer() {
  clearInterval(timerInterval);
  clearInterval(qTimerInterval);

  qTimerInterval = setInterval(() => {
    const secQs = getQuestionsOfCurrentSection();
    if (secQs && secQs[currentQIndex]) {
      const qId = secQs[currentQIndex].id;
      if (userResponses[qId]) {
        userResponses[qId].timeSpent = (userResponses[qId].timeSpent || 0) + 1;
      }
    }
  }, 1000);

  timerInterval = setInterval(() => {
    remainingSectionSeconds--;
    updateTimerDisplay();

    if (remainingSectionSeconds <= 0) {
      handleSectionTimerExpiry();
    }
  }, 1000);

  updateTimerDisplay();
}

function updateTimerDisplay() {
  const m = Math.floor(remainingSectionSeconds / 60);
  const s = remainingSectionSeconds % 60;
  const disp = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  const el = document.getElementById("timerDisplay");
  el.textContent = disp;

  if (remainingSectionSeconds <= 180) {
    el.classList.add("warning");
  } else {
    el.classList.remove("warning");
  }
}

function handleSectionTimerExpiry() {
  clearInterval(timerInterval);
  clearInterval(qTimerInterval);

  if (currentSectionKey === "english") {
    alert("⏳ Time's up for English Language! Auto-advancing to Section 2: Quantitative Aptitude.");
    switchSection("quant");
    startSectionTimer();
  } else if (currentSectionKey === "quant") {
    alert("⏳ Time's up for Quantitative Aptitude! Auto-advancing to Section 3: Reasoning Ability.");
    switchSection("reasoning");
    startSectionTimer();
  } else {
    alert("⏳ Final Section Time Expired! Generating your detailed performance diagnostics...");
    finalizeAndSubmitExam();
  }
}

function confirmSubmitTest() {
  let cAns = 0, cNotAns = 0, cNotVis = 0, cRev = 0, cAnsRev = 0;
  currentPaper.questions.forEach(q => {
    const s = userResponses[q.id].status;
    if (s === "answered") cAns++;
    else if (s === "not_answered") cNotAns++;
    else if (s === "not_visited") cNotVis++;
    else if (s === "review") cRev++;
    else if (s === "ans_review") cAnsRev++;
  });

  const body = document.getElementById("submitModalBody");
  body.innerHTML = `
    <p style="margin-bottom:12px;">Are you sure you want to submit your mock test? Here is your question status summary:</p>
    <table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:13px;">
      <tr style="background:#f1f5f9;"><th style="padding:6px;border:1px solid #cbd5e1;">Status</th><th style="padding:6px;border:1px solid #cbd5e1;">Count</th></tr>
      <tr><td style="padding:6px;border:1px solid #cbd5e1;color:#16a34a;font-weight:700;">Answered (Evaluated)</td><td style="padding:6px;border:1px solid #cbd5e1;">${cAns}</td></tr>
      <tr><td style="padding:6px;border:1px solid #cbd5e1;color:#7c3aed;font-weight:700;">Answered & Marked for Review (Evaluated)</td><td style="padding:6px;border:1px solid #cbd5e1;">${cAnsRev}</td></tr>
      <tr><td style="padding:6px;border:1px solid #cbd5e1;color:#8b5cf6;font-weight:700;">Marked for Review (Not Evaluated)</td><td style="padding:6px;border:1px solid #cbd5e1;">${cRev}</td></tr>
      <tr><td style="padding:6px;border:1px solid #cbd5e1;color:#dc2626;font-weight:700;">Not Answered</td><td style="padding:6px;border:1px solid #cbd5e1;">${cNotAns}</td></tr>
      <tr><td style="padding:6px;border:1px solid #cbd5e1;color:#64748b;">Not Visited</td><td style="padding:6px;border:1px solid #cbd5e1;">${cNotVis}</td></tr>
      <tr style="background:#f8fafc;font-weight:700;"><td style="padding:6px;border:1px solid #cbd5e1;">Total Questions</td><td style="padding:6px;border:1px solid #cbd5e1;">${currentPaper.questions.length}</td></tr>
    </table>
  `;

  document.getElementById("submitModal").style.display = "flex";
}

function closeSubmitModal() {
  document.getElementById("submitModal").style.display = "none";
}

function openQuestionPaperModal() {
  const secQs = getQuestionsOfCurrentSection();
  document.getElementById("qpModalTitle").textContent = `${currentSectionKey.toUpperCase()} - Complete Question Paper (${secQs.length} Questions)`;
  const body = document.getElementById("qpModalBody");
  body.innerHTML = "";

  secQs.forEach((q, idx) => {
    const item = document.createElement("div");
    item.style.padding = "10px 0";
    item.style.borderBottom = "1px solid #e2e8f0";
    item.innerHTML = `
      <div style="font-weight:700;color:#1e3a8a;margin-bottom:4px;">Q${idx + 1}. [${q.topic} - ${q.difficulty}]</div>
      <div style="margin-bottom:6px;">${q.question}</div>
      <div style="font-size:12px;color:#64748b;">
        ${q.options.map((opt, oIdx) => `<div>(${String.fromCharCode(65+oIdx)}) ${opt}</div>`).join('')}
      </div>
    `;
    body.appendChild(item);
  });

  document.getElementById("qpModal").style.display = "flex";
}

function closeQuestionPaperModal() {
  document.getElementById("qpModal").style.display = "none";
}

function openInstructionsModal() {
  document.getElementById("instructionsModal").style.display = "flex";
}

function closeInstructionsModal() {
  document.getElementById("instructionsModal").style.display = "none";
}

function finalizeAndSubmitExam() {
  closeSubmitModal();
  clearInterval(timerInterval);
  clearInterval(qTimerInterval);

  document.getElementById("examWorkspaceView").style.display = "none";
  document.getElementById("sectionNavBar").style.display = "none";
  document.getElementById("timerBox").style.display = "none";
  document.getElementById("analyticsScreen").style.display = "block";

  computeAndRenderAnalytics();
}

function computeAndRenderAnalytics() {
  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  let fatalTraps = [];
  let inefficientSolves = [];
  let carelessErrors = [];
  let sweetSpots = [];

  let sectionStats = {
    english: { attempted: 0, correct: 0, incorrect: 0, score: 0, time: 0 },
    quant: { attempted: 0, correct: 0, incorrect: 0, score: 0, time: 0 },
    reasoning: { attempted: 0, correct: 0, incorrect: 0, score: 0, time: 0 }
  };

  let topicStats = {};

  currentPaper.questions.forEach((q, idx) => {
    const resp = userResponses[q.id];
    const isAttempted = (resp.status === "answered" || resp.status === "ans_review") && (resp.selectedOption !== null);
    const timeSpent = resp.timeSpent || 0;
    const isCorrect = isAttempted && (resp.selectedOption === q.correct_index);

    sectionStats[q.section].time += timeSpent;

    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { section: q.section_name, total: 0, correct: 0, time: 0 };
    }
    topicStats[q.topic].total++;
    topicStats[q.topic].time += timeSpent;

    if (isAttempted) {
      sectionStats[q.section].attempted++;
      if (isCorrect) {
        correctCount++;
        sectionStats[q.section].correct++;
        sectionStats[q.section].score += 1.0;
        totalScore += 1.0;
        topicStats[q.topic].correct++;

        if (timeSpent >= 90) {
          inefficientSolves.push({ q, timeSpent });
        } else if (timeSpent <= 45) {
          sweetSpots.push({ q, timeSpent });
        }
      } else {
        incorrectCount++;
        sectionStats[q.section].incorrect++;
        sectionStats[q.section].score -= 0.25;
        totalScore -= 0.25;

        if (timeSpent >= 90) {
          fatalTraps.push({ q, timeSpent });
        } else if (timeSpent <= 30) {
          carelessErrors.push({ q, timeSpent });
        }
      }
    } else {
      unattemptedCount++;
    }
  });

  const totalAttempted = correctCount + incorrectCount;
  const accuracy = totalAttempted > 0 ? ((correctCount / totalAttempted) * 100).toFixed(1) : 0;
  const expectedCutoff = currentPaper.cutoff || 58.5;
  const isPassed = totalScore >= expectedCutoff;

  document.getElementById("heroScore").textContent = `${totalScore.toFixed(2)} / 100`;
  document.getElementById("heroCutoff").textContent = expectedCutoff.toFixed(2);
  document.getElementById("heroAccuracy").textContent = `${accuracy}%`;
  document.getElementById("heroExamTitle").textContent = `${currentPaper.title} &bull; ${currentPaper.exam}`;

  let estimatedPercentile = Math.min(99.9, Math.max(10.0, 50 + (totalScore - expectedCutoff) * 2.5)).toFixed(1);
  document.getElementById("heroPercentile").textContent = `${estimatedPercentile}%`;

  const statusBadge = document.getElementById("heroStatusBadge");
  if (isPassed) {
    statusBadge.className = "status-badge-lg badge-passed";
    statusBadge.textContent = "PASSED OVERALL CUTOFF";
  } else {
    statusBadge.className = "status-badge-lg badge-failed";
    statusBadge.textContent = "BELOW EXPECTED CUTOFF";
  }

  document.getElementById("quadTrapCount").textContent = fatalTraps.length;
  let trapSecs = fatalTraps.reduce((acc, cur) => acc + cur.timeSpent, 0);
  document.getElementById("quadTrapTime").textContent = `Wasted: ${(trapSecs/60).toFixed(1)} mins (${(fatalTraps.length * 0.25).toFixed(2)} marks lost)`;

  document.getElementById("quadInefficientCount").textContent = inefficientSolves.length;
  let ineffSecs = inefficientSolves.reduce((acc, cur) => acc + cur.timeSpent, 0);
  document.getElementById("quadInefficientTime").textContent = `Total Time: ${(ineffSecs/60).toFixed(1)} mins`;

  document.getElementById("quadCarelessCount").textContent = carelessErrors.length;
  document.getElementById("quadCarelessLoss").textContent = `Direct loss: -${(carelessErrors.length * 0.25).toFixed(2)} marks`;

  document.getElementById("quadSweetCount").textContent = sweetSpots.length;
  document.getElementById("quadSweetGain").textContent = `High-yield gain: +${sweetSpots.length}.00 marks`;

  const secTableBody = document.getElementById("sectionalTableBody");
  secTableBody.innerHTML = "";

  SECTIONS_CONFIG.forEach(sec => {
    const s = sectionStats[sec.key];
    const cut = currentPaper.sectional_cutoffs[sec.key] || 9.0;
    const secPassed = s.score >= cut;
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><b>${sec.name}</b></td>
      <td>${s.attempted} / ${sec.count}</td>
      <td style="color:#16a34a;font-weight:700;">${s.correct}</td>
      <td style="color:#dc2626;font-weight:700;">${s.incorrect}</td>
      <td style="color:#dc2626;">-${(s.incorrect * 0.25).toFixed(2)}</td>
      <td style="font-weight:800;color:${secPassed ? '#16a34a' : '#dc2626'};">${s.score.toFixed(2)}</td>
      <td>${cut.toFixed(1)}</td>
      <td>${Math.floor(s.time/60)}m ${s.time%60}s</td>
      <td><span class="tag-badge ${secPassed ? 'tag-strong' : 'tag-weak'}">${secPassed ? 'CLEARED' : 'MISSED'}</span></td>
    `;
    secTableBody.appendChild(row);
  });

  const topicTableBody = document.getElementById("topicTableBody");
  topicTableBody.innerHTML = "";

  for (let topic in topicStats) {
    const t = topicStats[topic];
    const acc = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
    const avgSec = t.total > 0 ? Math.round(t.time / t.total) : 0;

    let badgeClass = "tag-moderate";
    let badgeText = "NEEDS REVISION";
    if (acc >= 80) {
      badgeClass = "tag-strong";
      badgeText = "MASTERED";
    } else if (acc <= 50) {
      badgeClass = "tag-weak";
      badgeText = "PRIORITY WEAKNESS";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><b>${topic}</b></td>
      <td>${t.section}</td>
      <td>${t.total}</td>
      <td>${t.correct}</td>
      <td><b>${acc}%</b></td>
      <td>${avgSec}s</td>
      <td><span class="tag-badge ${badgeClass}">${badgeText}</span></td>
    `;
    topicTableBody.appendChild(tr);
  }

  renderSolutionsList("all");
}

function renderSolutionsList(filterMode) {
  const container = document.getElementById("solutionsListContainer");
  container.innerHTML = "";

  currentPaper.questions.forEach((q, idx) => {
    const resp = userResponses[q.id];
    const isAttempted = (resp.status === "answered" || resp.status === "ans_review") && (resp.selectedOption !== null);
    const isCorrect = isAttempted && (resp.selectedOption === q.correct_index);
    const timeSpent = resp.timeSpent || 0;
    const isFatalTrap = isAttempted && !isCorrect && (timeSpent >= 90);

    if (filterMode === "wrong" && (!isAttempted || isCorrect)) return;
    if (filterMode === "correct" && !isCorrect) return;
    if (filterMode === "unattempted" && isAttempted) return;
    if (filterMode === "traps" && !isFatalTrap) return;

    const card = document.createElement("div");
    card.className = "solution-item-card";

    let statusPill = `<span class="tag-badge" style="background:#e2e8f0;color:#475569;">Unattempted</span>`;
    if (isAttempted) {
      if (isCorrect) {
        statusPill = `<span class="tag-badge tag-strong">Correct (+1.0)</span>`;
      } else {
        statusPill = `<span class="tag-badge tag-weak">Incorrect (-0.25)</span>`;
      }
    }

    if (isFatalTrap) {
      statusPill += ` <span class="tag-badge" style="background:#fee2e2;color:#991b1b;">🚨 Time Trap (${timeSpent}s)</span>`;
    }

    card.innerHTML = `
      <div class="sol-header" onclick="toggleSolutionBody(this)">
        <div>
          <b>Q${idx + 1}.</b> <span style="color:#64748b;margin-left:6px;">[${q.section_name} &bull; ${q.topic}]</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:12px;color:#64748b;">Time: <b>${timeSpent}s</b> (Target: ${q.benchmark_seconds}s)</span>
          ${statusPill}
          <span style="font-size:12px;color:#94a3b8;">▼</span>
        </div>
      </div>
      <div class="sol-body">
        <div style="margin-bottom:12px;">${q.question}</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">
          ${q.options.map((opt, oIdx) => {
            let optStyle = "padding:6px 10px;border-radius:4px;font-size:13px;border:1px solid #e2e8f0;";
            if (oIdx === q.correct_index) {
              optStyle = "padding:6px 10px;border-radius:4px;font-size:13px;border:1px solid #22c55e;background:#dcfce7;color:#15803d;font-weight:700;";
            } else if (isAttempted && oIdx === resp.selectedOption) {
              optStyle = "padding:6px 10px;border-radius:4px;font-size:13px;border:1px solid #ef4444;background:#fee2e2;color:#b91c1c;font-weight:700;";
            }
            return `<div style="${optStyle}">(${String.fromCharCode(65+oIdx)}) ${opt} ${oIdx === q.correct_index ? '✓ (Correct Answer)' : ''} ${(isAttempted && oIdx === resp.selectedOption && !isCorrect) ? '✗ (Your Response)' : ''}</div>`;
          }).join('')}
        </div>
        <div class="expl-box">
          <div style="font-weight:700;color:#1e3a8a;margin-bottom:4px;">💡 Step-by-Step Explanation & Shortcut:</div>
          <div>${q.explanation}</div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function toggleSolutionBody(headerEl) {
  const body = headerEl.nextElementSibling;
  body.classList.toggle("open");
}

function filterSolutions(filterMode, chipEl) {
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
  chipEl.classList.add("active");
  renderSolutionsList(filterMode);
}

function retakeCurrentTest() {
  loadPaper(currentPaperId);
}

function chooseAnotherMock() {
  const pKeys = Object.keys(PAPERS);
  const nextKey = pKeys[(pKeys.indexOf(currentPaperId) + 1) % pKeys.length];
  document.getElementById("paperSelect").value = nextKey;
  loadPaper(nextKey);
}