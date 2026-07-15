const form = document.getElementById("recommend-form");
const submitBtn = document.getElementById("submit-btn");
const errorBox = document.getElementById("error-box");
const statusBox = document.getElementById("status-box");
const resultContent = document.getElementById("result-content");
const copyBtn = document.getElementById("copy-btn");

const inputs = {
  weightKg: document.getElementById("weightKg"),
  heightCm: document.getElementById("heightCm"),
  goalType: document.getElementById("goalType"),
  goalDetail: document.getElementById("goalDetail"),
};

const renderedTextParts = [];

const UI = {
  title: "Running TEST | Running Pace & Shoe Recommendation",
  description:
    "Enter weight, height, and goal to get a recommended running pace and running shoe type.",
  heroBadge: "Running TEST",
  heroTitle: "Find the running pace and shoes that fit your body and goal.",
  heroLead:
    "Enter your weight, height, and goal, then AI will generate a detailed report with pace, shoe type, and safety notes.",
  heroPoints: ["Detailed report", "Shoe recommendation", "Safety notes"],
  statTitle: "Instant recommendation",
  statSub: "Weight, height, goal",
  statLabels: ["Pace", "Shoe", "Reason", "Safety"],
  statValues: ["min/km", "Cushion / stability", "Detailed explanation", "Precautions"],
  formBadge: "Input",
  formTitle: "Tell us your basic information and goal.",
  formLead:
    "If the values are invalid, we will show a message immediately. After submit, AI will generate a detailed report.",
  weightLabel: "Weight (kg)",
  heightLabel: "Height (cm)",
  weightPlaceholder: "e.g. 68",
  heightPlaceholder: "e.g. 173",
  goalLabel: "Goal",
  goalPlaceholder: "Select your goal",
  goalOptions: [
    "Weight loss",
    "5K finish",
    "10K challenge",
    "Improve pace",
    "Injury prevention",
  ],
  detailLabel: "Goal details",
  detailPlaceholder: "e.g. I want to finish 5K without overdoing it in 8 weeks.",
  sampleLabels: ["Weight loss", "5K finish", "Improve pace"],
  submitLabel: "Get recommendation",
  hint: "We prioritize sustainable running over aggressive pace.",
  resultBadge: "Result",
  resultTitle: "AI detailed report",
  copyLabel: "Copy",
  initialStatusTitle: "Enter your info and press Get recommendation.",
  initialStatusDetail:
    "We will recommend a pace and shoe type based on weight, height, and goal.",
  resultSummary: "Summary",
  paceHeading: "Recommended pace",
  shoeHeading: "Shoe type",
  reasonHeading: "Why this recommendation",
  cautionHeading: "Precautions",
  nextHeading: "Next steps",
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatPace(minutesPerKm) {
  const wholeMinutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - wholeMinutes) * 60);
  return `${wholeMinutes}:${String(seconds).padStart(2, "0")}/km`;
}

function paceRange(center, spread = 0.25) {
  const lower = clamp(center - spread, 3.8, 10);
  const upper = clamp(center + spread, 4, 10.5);
  return `${formatPace(lower)}~${formatPace(upper)}`;
}

function buildFallbackRecommendation({ weightKg, heightCm, goalType, goalDetail }) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  const easyBody = bmi >= 28;
  const mediumBody = bmi >= 24 && bmi < 28;
  const lightBody = bmi < 24;

  let paceCenter = 6.6;
  let paceSpread = 0.35;
  let shoeType = "Daily cushioned running shoe";
  let shoeFeatures = [
    "Enough midsole cushion to distribute impact",
    "Stable fit without feeling overly heavy",
    "All-around support that works for beginners",
  ];
  let intensity = "Comfortable jog where you can still talk";

  if (goalType === "Weight loss") {
    paceCenter = easyBody ? 7.6 : mediumBody ? 7.1 : 6.8;
    paceSpread = 0.4;
    shoeType = "High-cushion stability shoe";
    shoeFeatures = [
      "Thick cushion to absorb impact",
      "Wide platform to reduce wobble on landing",
      "Comfortable for both walking and running",
    ];
    intensity = "Low-intensity steady run with short breathing room";
  } else if (goalType === "5K finish") {
    paceCenter = easyBody ? 7.0 : 6.5;
    paceSpread = 0.35;
    shoeType = "Daily trainer";
    shoeFeatures = [
      "Soft and comfortable for early adaptation",
      "Works well from short runs up to 5K",
      "Stable and not overly aggressive",
    ];
    intensity = "Easy at first, slightly breathy near the end";
  } else if (goalType === "10K challenge") {
    paceCenter = mediumBody ? 6.2 : 5.9;
    paceSpread = 0.3;
    shoeType = "Light daily-tempo shoe";
    shoeFeatures = [
      "Responsive enough to keep a good rhythm",
      "Balanced cushioning for longer runs",
      "Versatile for training and race day",
    ];
    intensity = "Steady effort that keeps your pace from fading";
  } else if (goalType === "Improve pace") {
    paceCenter = lightBody ? 5.2 : 5.5;
    paceSpread = 0.25;
    shoeType = "Tempo trainer or lightweight rebound shoe";
    shoeFeatures = [
      "Bounce that helps tempo sessions feel smoother",
      "Lightweight for quick turnover",
      "Good energy return for pace work",
    ];
    intensity = "Breathable but controlled target pace";
  } else if (goalType === "Injury prevention") {
    paceCenter = easyBody ? 7.8 : 7.2;
    paceSpread = 0.45;
    shoeType = "Max-cushion stability shoe";
    shoeFeatures = [
      "Extra-soft cushioning to reduce impact",
      "Support that helps protect ankles and knees",
      "Best for recovery runs and easy mileage",
    ];
    intensity = "Very easy recovery jog";
  }

  const pace = paceRange(paceCenter, paceSpread);
  return {
    source: "fallback",
    summary: `${goalType} and your body stats suggest a pace around ${pace}. ${goalDetail}`,
    paceRecommendation: {
      paceRange: pace,
      intensity,
      explanation:
        bmi >= 28
          ? "We prioritized impact reduction and a stable landing pattern."
          : bmi >= 24
            ? "We balanced consistency with adaptation."
            : "We chose a realistic pace that supports form and rhythm.",
    },
    shoeRecommendation: {
      type: shoeType,
      features: shoeFeatures,
      fitNote:
        bmi >= 28
          ? "Look for a roomy toe box and generous cushioning."
          : bmi >= 24
            ? "A neutral shoe with balanced cushioning should work well."
            : "A lighter, more responsive shoe could also be a good option.",
    },
    reasoning: [
      `Your BMI is about ${bmi.toFixed(1)}, so we prioritized ${easyBody ? "impact absorption and stability" : "sustainable rhythm"}.`,
      `Because your goal is "${goalType}", we focused on ${goalType === "Improve pace" ? "pace efficiency" : "consistency"} first.`,
      "When choosing shoes, check comfort, landing stability, and whether they still feel good after 30 minutes.",
    ],
    cautions: [
      "Do not start at the target pace for long sessions right away. Build gradually.",
      "If you feel knee, ankle, or calf pain, lower the intensity and rest.",
      "The higher your weight, the more important form and recovery become.",
    ],
    nextSteps: [
      "For the first 2 weeks, run 15-30 seconds slower than the recommendation.",
      "Try shoes with running socks on and check toe space and heel hold.",
      "Start with 2-3 runs per week, then increase only when your body feels ready.",
    ],
  };
}

function setBusy(isBusy) {
  submitBtn.disabled = isBusy;
  submitBtn.textContent = isBusy ? "Generating..." : UI.submitLabel;
}

function showError(message) {
  errorBox.hidden = !message;
  errorBox.textContent = message || "";
}

function hideResults() {
  resultContent.hidden = true;
  copyBtn.disabled = true;
}

function setStatus(title, detail) {
  statusBox.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
}

function clearResultText() {
  renderedTextParts.length = 0;
}

function addRenderedText(...parts) {
  for (const part of parts) {
    if (typeof part === "string" && part.trim()) {
      renderedTextParts.push(part.trim());
    }
  }
}

function fillList(element, items) {
  element.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  }
}

function localizeStaticText() {
  document.title = UI.title;
  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) descriptionTag.setAttribute("content", UI.description);

  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy) {
    const eyebrow = heroCopy.querySelector(".eyebrow");
    const h1 = heroCopy.querySelector("h1");
    const lead = heroCopy.querySelector(".lede");
    const points = heroCopy.querySelectorAll(".hero-points span");
    if (eyebrow) eyebrow.textContent = UI.heroBadge;
    if (h1) h1.textContent = UI.heroTitle;
    if (lead) lead.textContent = UI.heroLead;
    points.forEach((el, index) => {
      el.textContent = UI.heroPoints[index] || "";
    });
  }

  const statPanel = document.querySelector(".hero-panel");
  if (statPanel) {
    const statStrong = statPanel.querySelector(".stat strong");
    const statSpan = statPanel.querySelector(".stat span");
    const statCards = statPanel.querySelectorAll(".stat-card");
    if (statStrong) statStrong.textContent = UI.statTitle;
    if (statSpan) statSpan.textContent = UI.statSub;
    statCards.forEach((card, index) => {
      const label = card.querySelector("span");
      const value = card.querySelector("strong");
      if (label) label.textContent = UI.statLabels[index] || "";
      if (value) value.textContent = UI.statValues[index] || "";
    });
  }

  const formPanel = document.querySelector(".form-panel");
  if (formPanel) {
    const badge = formPanel.querySelector(".panel-head .eyebrow");
    const title = formPanel.querySelector(".panel-head h2");
    const lead = formPanel.querySelector(".panel-head p");
    const fieldLabels = formPanel.querySelectorAll(".field > span");
    const inputsList = formPanel.querySelectorAll("input, textarea");
    const select = formPanel.querySelector("select");
    const sampleButtons = formPanel.querySelectorAll(".sample-chip");
    const hint = formPanel.querySelector(".hint");

    if (badge) badge.textContent = UI.formBadge;
    if (title) title.textContent = UI.formTitle;
    if (lead) lead.textContent = UI.formLead;
    if (fieldLabels[0]) fieldLabels[0].textContent = UI.weightLabel;
    if (fieldLabels[1]) fieldLabels[1].textContent = UI.heightLabel;
    if (fieldLabels[2]) fieldLabels[2].textContent = UI.goalLabel;
    if (fieldLabels[3]) fieldLabels[3].textContent = UI.detailLabel;

    if (inputsList[0]) inputsList[0].placeholder = UI.weightPlaceholder;
    if (inputsList[1]) inputsList[1].placeholder = UI.heightPlaceholder;
    if (inputsList[2]) inputsList[2].placeholder = UI.detailPlaceholder;
    if (select) {
      select.options[0].textContent = UI.goalPlaceholder;
      UI.goalOptions.forEach((text, index) => {
        if (select.options[index + 1]) select.options[index + 1].textContent = text;
      });
    }

    sampleButtons.forEach((button, index) => {
      button.textContent = UI.sampleLabels[index] || "";
    });

    if (hint) hint.textContent = UI.hint;
    if (submitBtn) submitBtn.textContent = UI.submitLabel;
  }

  const resultPanel = document.querySelector(".result-panel");
  if (resultPanel) {
    const badge = resultPanel.querySelector(".panel-head .eyebrow");
    const title = resultPanel.querySelector(".panel-head h2");
    const copy = resultPanel.querySelector("#copy-btn");
    const statusStrong = statusBox.querySelector("strong");
    const statusSpan = statusBox.querySelector("span");
    const headings = resultPanel.querySelectorAll(".result-card h3");
    if (badge) badge.textContent = UI.resultBadge;
    if (title) title.textContent = UI.resultTitle;
    if (copy) copy.textContent = UI.copyLabel;
    if (statusStrong) statusStrong.textContent = UI.initialStatusTitle;
    if (statusSpan) statusSpan.textContent = UI.initialStatusDetail;
    if (headings[0]) headings[0].textContent = UI.resultSummary;
    if (headings[1]) headings[1].textContent = UI.paceHeading;
    if (headings[2]) headings[2].textContent = UI.shoeHeading;
    if (headings[3]) headings[3].textContent = UI.reasonHeading;
    if (headings[4]) headings[4].textContent = UI.cautionHeading;
    if (headings[5]) headings[5].textContent = UI.nextHeading;
  }
}

function renderRecommendation(data) {
  document.getElementById("summary-text").textContent = data.summary || "No summary available.";
  document.getElementById("pace-range").textContent = data.paceRecommendation?.paceRange || "-";
  document.getElementById("pace-intensity").textContent = data.paceRecommendation?.intensity || "";
  document.getElementById("pace-explanation").textContent =
    data.paceRecommendation?.explanation || "";

  document.getElementById("shoe-type").textContent = data.shoeRecommendation?.type || "-";
  fillList(
    document.getElementById("shoe-features"),
    Array.isArray(data.shoeRecommendation?.features) ? data.shoeRecommendation.features : [],
  );
  document.getElementById("shoe-fit-note").textContent = data.shoeRecommendation?.fitNote || "";

  fillList(
    document.getElementById("reasoning-list"),
    Array.isArray(data.reasoning) ? data.reasoning : [],
  );
  fillList(
    document.getElementById("caution-list"),
    Array.isArray(data.cautions) ? data.cautions : [],
  );
  fillList(
    document.getElementById("next-steps-list"),
    Array.isArray(data.nextSteps) ? data.nextSteps : [],
  );

  clearResultText();
  addRenderedText(
    data.summary,
    data.paceRecommendation?.paceRange,
    data.paceRecommendation?.intensity,
    data.paceRecommendation?.explanation,
    data.shoeRecommendation?.type,
    data.shoeRecommendation?.fitNote,
    ...(Array.isArray(data.shoeRecommendation?.features) ? data.shoeRecommendation.features : []),
    ...(Array.isArray(data.reasoning) ? data.reasoning : []),
    ...(Array.isArray(data.cautions) ? data.cautions : []),
    ...(Array.isArray(data.nextSteps) ? data.nextSteps : []),
  );

  resultContent.hidden = false;
  copyBtn.disabled = false;
  if (data.source === "fallback") {
    setStatus(
      "Local recommendation is ready.",
      "We fell back to in-browser logic because the server was unavailable.",
    );
  } else {
    setStatus("Recommendation is ready.", "Check the cards below for your pace and shoe type.");
  }
}

function sanitizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function validateForm() {
  const weightKg = sanitizeNumber(inputs.weightKg.value);
  const heightCm = sanitizeNumber(inputs.heightCm.value);
  const goalType = inputs.goalType.value.trim();
  const goalDetail = inputs.goalDetail.value.trim();

  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) {
    return "Weight must be a number between 30 and 300 kg.";
  }
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
    return "Height must be a number between 100 and 250 cm.";
  }
  if (!goalType) {
    return "Please select a goal.";
  }
  if (!goalDetail) {
    return "Please enter a short goal description.";
  }

  return null;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");

  const validationError = validateForm();
  if (validationError) {
    showError(validationError);
    hideResults();
    setStatus(
      "Please check your inputs.",
      "Review your weight, height, and goal, then press Get recommendation again.",
    );
    return;
  }

  setBusy(true);
  setStatus("Generating recommendation...", "Please wait while the detailed report is prepared.");
  hideResults();

  try {
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weightKg: inputs.weightKg.value,
        heightCm: inputs.heightCm.value,
        goalType: inputs.goalType.value,
        goalDetail: inputs.goalDetail.value,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Recommendation generation failed.");
    }

    renderRecommendation(data.recommendation);
  } catch {
    const fallback = buildFallbackRecommendation({
      weightKg: Number(inputs.weightKg.value),
      heightCm: Number(inputs.heightCm.value),
      goalType: inputs.goalType.value,
      goalDetail: inputs.goalDetail.value,
    });
    renderRecommendation(fallback);
    setStatus(
      "Switched to local recommendation.",
      "The browser is showing a built-in fallback because the server could not be reached.",
    );
    showError("");
  } finally {
    setBusy(false);
  }
});

copyBtn.addEventListener("click", async () => {
  const text = renderedTextParts.join("\n");
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
    window.setTimeout(() => {
      copyBtn.textContent = UI.copyLabel;
    }, 1500);
  } catch {
    showError("Copy is not supported in this environment.");
  }
});

document.querySelectorAll(".sample-chip").forEach((button) => {
  button.addEventListener("click", () => {
    const params = new URLSearchParams(button.dataset.sample || "");
    inputs.weightKg.value = params.get("weightKg") || "";
    inputs.heightCm.value = params.get("heightCm") || "";
    inputs.goalType.value = params.get("goalType") || "";
    inputs.goalDetail.value = params.get("goalDetail") || "";
    setStatus("Sample input applied.", "Edit the values and press Get recommendation.");
  });
});

localizeStaticText();
