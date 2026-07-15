import { NextResponse } from "next/server";
import { DEFAULT_MODEL, META_PROMPT } from "@/lib/metaPrompt";

type GenerateRequest = {
  prompt?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function extractText(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "";
  }

  const withOutputText = data as { output_text?: unknown };
  if (typeof withOutputText.output_text === "string") {
    return withOutputText.output_text.trim();
  }

  const withOutput = data as {
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  const text = withOutput.output
    ?.flatMap((item) => item.content ?? [])
    .filter((part) => part.type === "output_text" || part.type === "text")
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  return text ?? "";
}

export async function POST(request: Request) {
  let body: GenerateRequest;

  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400, headers: corsHeaders },
    );
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json(
      { error: "프롬프트를 입력해 주세요." },
      { status: 400, headers: corsHeaders },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다." },
      { status: 500, headers: corsHeaders },
    );
  }

  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        instructions: META_PROMPT,
        input: prompt,
        temperature: 0.2,
        max_output_tokens: 1200,
        store: false,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "OpenAI API에 연결하지 못했습니다." },
      { status: 502, headers: corsHeaders },
    );
  }

  let data: { error?: { message?: string } } | Record<string, unknown>;

  try {
    data = (await response.json()) as
      | { error?: { message?: string } }
      | Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "OpenAI 응답을 읽지 못했습니다." },
      { status: 502, headers: corsHeaders },
    );
  }

  if (!response.ok) {
    const message =
      (data as { error?: { message?: string } }).error?.message ??
      "프롬프트를 생성하지 못했습니다.";
    return NextResponse.json(
      { error: message },
      { status: response.status, headers: corsHeaders },
    );
  }

  const generated = extractText(data).trim();
  if (!generated) {
    return NextResponse.json(
      { error: "모델 응답을 해석하지 못했습니다." },
      { status: 502, headers: corsHeaders },
    );
  }

  return NextResponse.json({ prompt: generated }, { headers: corsHeaders });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
