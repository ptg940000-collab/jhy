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
  let shoeType = "데일리 쿠셔닝 러닝화";
  let shoeFeatures = [
    "발 전체 충격을 고르게 받아주는 충분한 미드솔 쿠션",
    "오래 달려도 무게감이 과하지 않은 안정적인 착화감",
    "초보자도 부담 없이 쓰기 쉬운 만능형 지지력",
  ];
  let intensity = "대화가 가능한 편안한 조깅 강도";

  if (goalType === "체중 감량") {
    paceCenter = easyBody ? 7.6 : mediumBody ? 7.1 : 6.8;
    paceSpread = 0.4;
    shoeType = "고쿠션 안정화 러닝화";
    shoeFeatures = [
      "충격 흡수가 큰 두툼한 쿠션",
      "착지 시 흔들림을 줄이는 넓은 플랫폼",
      "장시간 걷기와 달리기를 함께 써도 편한 구조",
    ];
    intensity = "숨이 차지만 대화는 짧게 가능한 저강도 지속주";
  } else if (goalType === "5km 완주") {
    paceCenter = easyBody ? 7.0 : 6.5;
    paceSpread = 0.35;
    shoeType = "데일리 트레이너";
    shoeFeatures = [
      "부드럽고 편한 쿠션으로 초반 적응이 쉬움",
      "짧은 거리부터 5km까지 무난하게 대응",
      "너무 공격적이지 않은 안정적인 추진감",
    ];
    intensity = "처음엔 편하게, 후반부에만 약간 숨이 차는 페이스";
  } else if (goalType === "10km 도전") {
    paceCenter = mediumBody ? 6.2 : 5.9;
    paceSpread = 0.3;
    shoeType = "가벼운 데일리-템포 겸용 러닝화";
    shoeFeatures = [
      "중간 거리에서 리듬을 살리기 좋은 반응성",
      "장거리에서 피로를 줄이는 적당한 쿠션",
      "훈련과 실전 모두 무난한 범용성",
    ];
    intensity = "꾸준함을 유지하면서 페이스를 잃지 않는 강도";
  } else if (goalType === "기록 향상") {
    paceCenter = lightBody ? 5.2 : 5.5;
    paceSpread = 0.25;
    shoeType = "템포 트레이너 또는 경량 반발형 러닝화";
    shoeFeatures = [
      "템포런에서 리듬을 살리는 반발감",
      "가벼운 무게로 발을 빠르게 회전시키기 쉬움",
      "기록 훈련에 적당한 에너지 리턴",
    ];
    intensity = "숨이 차지만 폼을 유지할 수 있는 목표 페이스";
  } else if (goalType === "부상 예방") {
    paceCenter = easyBody ? 7.8 : 7.2;
    paceSpread = 0.45;
    shoeType = "최대 쿠셔닝 안정화 러닝화";
    shoeFeatures = [
      "착지 충격을 최대한 줄여주는 두꺼운 쿠션",
      "발목과 무릎 부담을 덜어주는 안정성",
      "천천히 오래 달리는 회복 러닝에 적합",
    ];
    intensity = "무리가 없는 회복형 조깅 강도";
  }

  const pace = paceRange(paceCenter, paceSpread);
  return {
    source: "fallback",
    summary: `${goalType} 목표와 체형 정보를 바탕으로, ${pace} 정도의 페이스가 가장 무난합니다. ${goalDetail}`,
    paceRecommendation: {
      paceRange: pace,
      intensity,
      explanation:
        bmi >= 28
          ? "체중 대비 충격 부담을 줄이기 위해 너무 빠른 페이스보다 안정적인 호흡과 착지를 우선했습니다."
          : bmi >= 24
            ? "지속 가능성과 훈련 적응을 함께 고려해, 무리 없는 페이스 범위를 잡았습니다."
            : "기록보다 폼과 리듬을 먼저 살릴 수 있는 현실적인 페이스로 잡았습니다.",
    },
    shoeRecommendation: {
      type: shoeType,
      features: shoeFeatures,
      fitNote:
        bmi >= 28
          ? "발볼이 편하고 쿠션이 넉넉한 모델을 우선 확인하세요."
          : bmi >= 24
            ? "쿠션과 반응성의 균형이 좋은 중립형 모델이 잘 맞습니다."
            : "가볍고 반응성이 좋은 모델도 선택지에 넣어볼 만합니다.",
    },
    reasoning: [
      `체질량지수(BMI)가 약 ${bmi.toFixed(1)}로 계산되어, ${easyBody ? "충격 흡수와 안정성" : "지속 가능한 리듬"}을 우선했습니다.`,
      `목표가 "${goalType}"이므로 ${goalType === "기록 향상" ? "페이스 효율" : "지속성"}을 먼저 맞추는 편이 안전합니다.`,
      "러닝화는 발이 편한지, 착지 시 흔들림이 없는지, 그리고 30분 이상 신어도 불편하지 않은지를 기준으로 고르는 것이 좋습니다.",
    ],
    cautions: [
      "처음부터 목표 페이스를 오래 유지하려 하지 말고, 10분 단위로 천천히 늘리세요.",
      "무릎, 발목, 종아리 통증이 생기면 즉시 강도를 낮추고 휴식을 우선하세요.",
      "체중이 높을수록 페이스보다 러닝 자세와 회복이 더 중요합니다.",
    ],
    nextSteps: [
      "첫 2주는 추천 페이스보다 15~30초 느리게 시작해 몸의 반응을 확인하세요.",
      "러닝화는 매장에서 양말 포함 착화 후 발가락 공간과 뒤꿈치 고정감을 확인하세요.",
      "주 2~3회부터 시작해, 무리가 없을 때만 거리와 시간을 조금씩 늘리세요.",
    ],
  };
}

function setBusy(isBusy) {
  submitBtn.disabled = isBusy;
  submitBtn.textContent = isBusy ? "추천 생성 중..." : "추천받기";
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

function renderRecommendation(data) {
  document.getElementById("summary-text").textContent = data.summary || "추천 요약이 없습니다.";
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

  fillList(document.getElementById("reasoning-list"), Array.isArray(data.reasoning) ? data.reasoning : []);
  fillList(document.getElementById("caution-list"), Array.isArray(data.cautions) ? data.cautions : []);
  fillList(document.getElementById("next-steps-list"), Array.isArray(data.nextSteps) ? data.nextSteps : []);

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
      "로컬 규칙 추천이 준비되었습니다.",
      "OpenAI 연결이 어려운 환경에서도 기본 추천을 확인할 수 있습니다.",
    );
  } else {
    setStatus("추천이 준비되었습니다.", "아래 카드에서 러닝 페이스와 러닝화 추천을 확인하세요.");
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
    return "체중은 30kg 이상 300kg 이하의 숫자로 입력해 주세요.";
  }
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
    return "키는 100cm 이상 250cm 이하의 숫자로 입력해 주세요.";
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
    setStatus("입력값을 확인해 주세요.", "체중, 키, 목표를 다시 점검한 뒤 추천받기를 눌러주세요.");
    return;
  }

  setBusy(true);
  setStatus("추천을 생성하는 중입니다.", "잠시만 기다리면 AI 상세 리포트가 표시됩니다.");
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
  } catch (error) {
    const fallback = buildFallbackRecommendation({
      weightKg: Number(inputs.weightKg.value),
      heightCm: Number(inputs.heightCm.value),
      goalType: inputs.goalType.value,
      goalDetail: inputs.goalDetail.value,
    });
    renderRecommendation(fallback);
    setStatus(
      "로컬 추천으로 전환되었습니다.",
      "서버 연결이 어려워 브라우저 안의 기본 로직으로 결과를 보여줍니다.",
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
    copyBtn.textContent = "복사 완료";
    window.setTimeout(() => {
      copyBtn.textContent = "복사";
    }, 1500);
  } catch {
    showError("복사를 지원하지 않는 환경입니다.");
  }
});

document.querySelectorAll(".sample-chip").forEach((button) => {
  button.addEventListener("click", () => {
    const params = new URLSearchParams(button.dataset.sample || "");
    inputs.weightKg.value = params.get("weightKg") || "";
    inputs.heightCm.value = params.get("heightCm") || "";
    inputs.goalType.value = params.get("goalType") || "";
    inputs.goalDetail.value = params.get("goalDetail") || "";
    setStatus("예시 입력이 적용되었습니다.", "내용을 수정한 뒤 추천받기를 눌러보세요.");
  });
});
