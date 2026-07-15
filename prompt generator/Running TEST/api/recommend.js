const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function normalizeNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return Number.NaN;
}

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

function parseJsonFromText(text) {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
  }

  return null;
}

function extractText(data) {
  if (!data || typeof data !== "object") return "";

  if (typeof data.output_text === "string") {
    return data.output_text.trim();
  }

  const output = Array.isArray(data.output) ? data.output : [];
  const parts = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part && typeof part.text === "string") {
        parts.push(part.text);
      }
    }
  }

  return parts.join("").trim();
}

function validateInput(payload) {
  const weightKg = normalizeNumber(payload.weightKg);
  const heightCm = normalizeNumber(payload.heightCm);
  const goalType = typeof payload.goalType === "string" ? payload.goalType.trim() : "";
  const goalDetail = typeof payload.goalDetail === "string" ? payload.goalDetail.trim() : "";

  const errors = [];
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) {
    errors.push("체중은 30kg 이상 300kg 이하의 숫자로 입력해 주세요.");
  }
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
    errors.push("키는 100cm 이상 250cm 이하의 숫자로 입력해 주세요.");
  }
  if (!goalType) {
    errors.push("목표를 선택해 주세요.");
  }
  if (!goalDetail) {
    errors.push("목표 설명을 간단히 적어 주세요.");
  }

  return {
    valid: errors.length === 0,
    errors,
    data: { weightKg, heightCm, goalType, goalDetail },
  };
}

function buildPrompt({ weightKg, heightCm, goalType, goalDetail }) {
  return [
    "너는 러닝 코치이자 러닝화 피팅 컨설턴트다.",
    "사용자의 체중, 키, 목표를 바탕으로 한국어 상세 리포트를 작성하라.",
    "반드시 아래 JSON 스키마와 정확히 같은 구조의 JSON만 출력하라. 설명 문장이나 코드블록, 마크다운을 추가하지 마라.",
    "",
    "JSON 스키마:",
    "{",
    '  "summary": "한 줄 요약",',
    '  "paceRecommendation": {',
    '    "paceRange": "예: 6:00~6:30/km",',
    '    "intensity": "예: 대화 가능 수준",',
    '    "explanation": "왜 이 페이스가 적절한지"',
    "  },",
    '  "shoeRecommendation": {',
    '    "type": "예: 안정화 러닝화 / 데일리 트레이너 / 쿠셔닝 러닝화",',
    '    "features": ["특징 1", "특징 2", "특징 3"],',
    '    "fitNote": "발볼, 쿠션, 드롭 등에 대한 한 줄 설명"',
    "  },",
    '  "reasoning": ["이유 1", "이유 2", "이유 3"],',
    '  "cautions": ["주의 1", "주의 2"],',
    '  "nextSteps": ["다음 행동 1", "다음 행동 2", "다음 행동 3"]',
    "}",
    "",
    `입력 정보: 체중 ${weightKg}kg, 키 ${heightCm}cm, 목표 ${goalType}, 상세 목표 ${goalDetail}`,
    "",
    "작성 규칙:",
    "- 결과는 실전적이고 안전해야 한다.",
    "- 과도한 속도 추천을 피하고, 초보자일수록 보수적으로 제안한다.",
    "- 체중이 높거나 하체 충격이 우려되면 쿠셔닝과 안정성을 우선한다.",
    "- 목표가 기록 향상이라면 점진적 훈련과 회복 중요성을 강조한다.",
    "- 목표가 체중 감량이라면 지속 가능한 페이스와 부상 예방을 강조한다.",
    "- 의료 조언처럼 단정하지 말고, 무리하지 말라는 주의 문구를 포함한다.",
  ].join("\n");
}

function buildFallbackRecommendation(input) {
  const bmi = input.weightKg / Math.pow(input.heightCm / 100, 2);
  const goal = input.goalType;
  const goalDetail = input.goalDetail;
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

  if (goal === "체중 감량") {
    paceCenter = easyBody ? 7.6 : mediumBody ? 7.1 : 6.8;
    paceSpread = 0.4;
    shoeType = "고쿠션 안정화 러닝화";
    shoeFeatures = [
      "충격 흡수가 큰 두툼한 쿠션",
      "착지 시 흔들림을 줄이는 넓은 플랫폼",
      "장시간 걷기와 달리기를 함께 써도 편한 구조",
    ];
    intensity = "숨이 차지만 대화는 짧게 가능한 저강도 지속주";
  } else if (goal === "5km 완주") {
    paceCenter = easyBody ? 7.0 : 6.5;
    paceSpread = 0.35;
    shoeType = "데일리 트레이너";
    shoeFeatures = [
      "부드럽고 편한 쿠션으로 초반 적응이 쉬움",
      "짧은 거리부터 5km까지 무난하게 대응",
      "너무 공격적이지 않은 안정적인 추진감",
    ];
    intensity = "처음엔 편하게, 후반부에만 약간 숨이 차는 페이스";
  } else if (goal === "10km 도전") {
    paceCenter = mediumBody ? 6.2 : 5.9;
    paceSpread = 0.3;
    shoeType = "가벼운 데일리-템포 겸용 러닝화";
    shoeFeatures = [
      "중간 거리에서 리듬을 살리기 좋은 반응성",
      "장거리에서 피로를 줄이는 적당한 쿠션",
      "훈련과 실전 모두 무난한 범용성",
    ];
    intensity = "꾸준함을 유지하면서 페이스를 잃지 않는 강도";
  } else if (goal === "기록 향상") {
    paceCenter = lightBody ? 5.2 : 5.5;
    paceSpread = 0.25;
    shoeType = "템포 트레이너 또는 경량 반발형 러닝화";
    shoeFeatures = [
      "템포런에서 리듬을 살리는 반발감",
      "가벼운 무게로 발을 빠르게 회전시키기 쉬움",
      "기록 훈련에 적당한 에너지 리턴",
    ];
    intensity = "숨이 차지만 폼을 유지할 수 있는 목표 페이스";
  } else if (goal === "부상 예방") {
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

  const paceRangeText = paceRange(paceCenter, paceSpread);
  return {
    source: "fallback",
    summary: `${goal} 목표와 체형 정보를 바탕으로, ${paceRangeText} 정도의 페이스가 가장 무난합니다. ${goalDetail}`,
    paceRecommendation: {
      paceRange: paceRangeText,
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
      `목표가 "${goal}"이므로 ${goal === "기록 향상" ? "페이스 효율" : "지속성"}을 먼저 맞추는 편이 안전합니다.`,
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

async function callOpenAI(input) {
  if (!OPENAI_API_KEY) {
    return buildFallbackRecommendation(input);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: buildPrompt(input),
        temperature: 0.3,
        max_output_tokens: 1200,
        store: false,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || "OpenAI API 호출에 실패했습니다.");
    }

    const text = extractText(data);
    const parsed = parseJsonFromText(text);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("모델 응답을 JSON으로 해석할 수 없습니다.");
    }

    return { ...parsed, source: "openai" };
  } catch {
    return buildFallbackRecommendation(input);
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "POST 메서드만 허용됩니다." });
    return;
  }

  try {
    const payload =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body && typeof req.body === "object"
          ? req.body
          : {};

    const { valid, errors, data } = validateInput(payload);
    if (!valid) {
      sendJson(res, 400, { error: errors[0], errors });
      return;
    }

    const recommendation = await callOpenAI(data);
    sendJson(res, 200, { recommendation });
  } catch {
    sendJson(res, 400, { error: "요청 JSON 형식이 올바르지 않습니다." });
  }
};
