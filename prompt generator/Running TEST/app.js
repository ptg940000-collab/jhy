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
  title: "Running TEST | 러닝 페이스 & 러닝화 추천",
  description:
    "체중, 키, 목표를 입력하면 러닝 페이스와 러닝화 종류를 추천해 드립니다.",
  heroBadge: "Running TEST",
  heroTitle: "몸과 목표에 맞는 러닝 페이스와 러닝화를 찾아보세요.",
  heroLead:
    "체중, 키, 목표를 입력하면 AI가 러닝 페이스, 러닝화 종류, 주의사항까지 한국어 상세 리포트로 정리해 드립니다.",
  heroPoints: ["상세 리포트", "러닝화 추천", "안전 주의문"],
  statTitle: "즉시 추천",
  statSub: "체중 · 키 · 목표 입력",
  statLabels: ["페이스", "러닝화", "근거", "안전"],
  statValues: ["분/km", "쿠션 / 안정화", "상세 설명", "주의사항"],
  formBadge: "입력",
  formTitle: "기본 정보와 목표를 알려주세요.",
  formLead:
    "숫자가 맞지 않으면 바로 안내하고, 제출 후에는 AI가 상세 리포트를 생성합니다.",
  weightLabel: "체중 (kg)",
  heightLabel: "키 (cm)",
  weightPlaceholder: "예: 68",
  heightPlaceholder: "예: 173",
  goalLabel: "목표",
  goalPlaceholder: "목표를 선택하세요",
  goalOptions: [
    "체중 감량",
    "5km 완주",
    "10km 도전",
    "기록 향상",
    "부상 예방",
  ],
  detailLabel: "목표 설명",
  detailPlaceholder: "예: 8주 안에 5km를 무리 없이 완주하고 싶어요.",
  sampleLabels: ["체중 감량", "5km 완주", "기록 향상"],
  submitLabel: "추천받기",
  hint: "무리한 속도보다 지속 가능한 러닝을 우선합니다.",
  resultBadge: "결과",
  resultTitle: "AI 상세 리포트",
  copyLabel: "복사",
  initialStatusTitle: "입력 후 추천받기 버튼을 눌러주세요.",
  initialStatusDetail:
    "체중, 키, 목표를 바탕으로 러닝 페이스와 러닝화 종류를 추천합니다.",
  resultSummary: "요약",
  paceHeading: "추천 페이스",
  shoeHeading: "러닝화 종류",
  reasonHeading: "추천 이유",
  cautionHeading: "주의사항",
  nextHeading: "실행 팁",
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
  let shoeType = "데일리 쿠션 러닝화";
  let shoeFeatures = [
    "충격을 분산해 주는 충분한 미드솔 쿠션",
    "너무 무겁지 않으면서 안정적인 착용감",
    "초보자도 쓰기 좋은 범용형 지지력",
  ];
  let intensity = "대화가 가능한 편안한 조깅";

  if (goalType === "체중 감량") {
    paceCenter = easyBody ? 7.6 : mediumBody ? 7.1 : 6.8;
    paceSpread = 0.4;
    shoeType = "고쿠션 안정화 러닝화";
    shoeFeatures = [
      "두꺼운 쿠션으로 충격 흡수 강화",
      "착지 흔들림을 줄여주는 넓은 플랫폼",
      "걷기와 달리기를 함께 하기 좋은 편안함",
    ];
    intensity = "숨이 차지 않는 낮은 강도의 지속주";
  } else if (goalType === "5km 완주") {
    paceCenter = easyBody ? 7.0 : 6.5;
    paceSpread = 0.35;
    shoeType = "데일리 트레이너";
    shoeFeatures = [
      "적응기에 편안한 부드러운 착화감",
      "짧은 러닝부터 5km까지 무난하게 사용 가능",
      "공격적이지 않고 안정적인 밸런스",
    ];
    intensity = "초반은 여유롭게, 후반은 약간 숨이 찰 수 있는 정도";
  } else if (goalType === "10km 도전") {
    paceCenter = mediumBody ? 6.2 : 5.9;
    paceSpread = 0.3;
    shoeType = "가벼운 데일리 템포화";
    shoeFeatures = [
      "리듬을 유지하기 좋은 반응성",
      "장거리에도 무난한 균형형 쿠션",
      "훈련과 레이스에 두루 쓰기 좋은 활용도",
    ];
    intensity = "페이스가 크게 무너지지 않는 일정한 노력도";
  } else if (goalType === "기록 향상") {
    paceCenter = lightBody ? 5.2 : 5.5;
    paceSpread = 0.25;
    shoeType = "템포 트레이너 또는 경량 반발화";
    shoeFeatures = [
      "템포 훈련을 부드럽게 해주는 반발감",
      "빠른 회전수를 돕는 가벼운 무게",
      "페이스 훈련에 좋은 에너지 리턴",
    ];
    intensity = "숨은 차지만 통제 가능한 목표 페이스";
  } else if (goalType === "부상 예방") {
    paceCenter = easyBody ? 7.8 : 7.2;
    paceSpread = 0.45;
    shoeType = "맥스 쿠션 안정화 러닝화";
    shoeFeatures = [
      "충격을 줄여주는 매우 부드러운 쿠션",
      "발목과 무릎 보호에 도움이 되는 지지력",
      "회복주와 가벼운 러닝에 가장 적합",
    ];
    intensity = "아주 가벼운 회복 조깅";
  }

  const pace = paceRange(paceCenter, paceSpread);
  return {
    source: "fallback",
    summary: `${goalType} 목표와 체형 정보를 바탕으로 추천 페이스는 ${pace} 정도입니다. ${goalDetail}`,
    paceRecommendation: {
      paceRange: pace,
      intensity,
      explanation:
        bmi >= 28
          ? "충격을 줄이고 착지가 안정되도록 우선순위를 두었습니다."
          : bmi >= 24
            ? "지속성과 적응 속도의 균형을 맞췄습니다."
            : "자세와 리듬을 유지할 수 있는 현실적인 속도를 선택했습니다.",
    },
    shoeRecommendation: {
      type: shoeType,
      features: shoeFeatures,
      fitNote:
        bmi >= 28
          ? "발가락 공간이 넉넉하고 쿠션이 충분한 모델이 좋습니다."
          : bmi >= 24
            ? "중립형에 균형 잡힌 쿠션이 잘 맞을 가능성이 큽니다."
            : "가볍고 반발감이 좋은 모델도 좋은 선택이 될 수 있습니다.",
    },
    reasoning: [
      `BMI가 약 ${bmi.toFixed(1)}이므로 ${easyBody ? "충격 흡수와 안정성" : "지속 가능한 리듬"}에 더 무게를 두었습니다.`,
      `목표가 "${goalType}"이기 때문에 ${goalType === "기록 향상" ? "페이스 효율" : "지속성"}을 우선했습니다.`,
      "러닝화를 고를 때는 착화감, 착지 안정성, 30분 후에도 편한지 함께 확인하세요.",
    ],
    cautions: [
      "목표 페이스로 바로 긴 거리를 뛰지 말고, 단계적으로 적응하세요.",
      "무릎, 발목, 종아리 통증이 느껴지면 강도를 낮추고 휴식하세요.",
      "체중이 높을수록 자세와 회복 관리가 더 중요합니다.",
    ],
    nextSteps: [
      "처음 2주는 추천 페이스보다 15~30초 느리게 달려보세요.",
      "러닝 양말을 신고 신어 보며 발가락 공간과 뒤꿈치 고정을 확인하세요.",
      "주 2~3회부터 시작하고, 몸이 준비됐을 때만 천천히 늘리세요.",
    ],
  };
}

function setBusy(isBusy) {
  submitBtn.disabled = isBusy;
  submitBtn.textContent = isBusy ? "생성 중..." : UI.submitLabel;
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
  document.getElementById("summary-text").textContent = data.summary || "요약이 없습니다.";
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
      "로컬 추천을 표시했습니다.",
      "서버 연결이 되지 않아 브라우저 내 로직으로 대체했습니다.",
    );
  } else {
    setStatus("추천이 준비되었습니다.", "아래 카드에서 페이스와 러닝화 종류를 확인하세요.");
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
    return "체중은 30~300 사이의 숫자로 입력해 주세요.";
  }
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
    return "키는 100~250 사이의 숫자로 입력해 주세요.";
  }
  if (!goalType) {
    return "목표를 선택해 주세요.";
  }
  if (!goalDetail) {
    return "목표 설명을 입력해 주세요.";
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
      "입력값을 다시 확인해 주세요.",
      "체중, 키, 목표를 확인한 뒤 다시 추천받기를 눌러주세요.",
    );
    return;
  }

  setBusy(true);
  setStatus("추천을 생성 중입니다...", "상세 리포트를 준비하는 중입니다. 잠시만 기다려 주세요.");
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
      throw new Error(data.error || "추천 생성에 실패했습니다.");
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
      "로컬 추천으로 전환했습니다.",
      "서버에 연결할 수 없어 브라우저 내 기본 추천을 보여주고 있습니다.",
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
    copyBtn.textContent = "복사됨";
    window.setTimeout(() => {
      copyBtn.textContent = UI.copyLabel;
    }, 1500);
  } catch {
    showError("이 환경에서는 복사를 지원하지 않습니다.");
  }
});

document.querySelectorAll(".sample-chip").forEach((button) => {
  button.addEventListener("click", () => {
    const params = new URLSearchParams(button.dataset.sample || "");
    inputs.weightKg.value = params.get("weightKg") || "";
    inputs.heightCm.value = params.get("heightCm") || "";
    inputs.goalType.value = params.get("goalType") || "";
    inputs.goalDetail.value = params.get("goalDetail") || "";
    setStatus("예시 입력을 적용했습니다.", "값을 수정한 뒤 추천받기를 눌러주세요.");
  });
});

const tabButtons = document.querySelectorAll(".tab-btn[data-tab-target]");
const tabPanels = document.querySelectorAll(".tab-panel[role='tabpanel']");

function activateTab(targetId) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === targetId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateTab(button.dataset.tabTarget || "");
  });
});

localizeStaticText();
