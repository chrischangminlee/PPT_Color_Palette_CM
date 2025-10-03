export type PaletteSuggestion = {
  name: string;
  hex: string;
  role: string;
  rationale: string;
};

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const MODEL_NAME = "gemini-2.5-flash";

const SCHEMA_PROMPT = `You are an expert presentation designer helping colleagues craft cohesive color palettes for slide decks.
Return a strict JSON array with exactly 5 objects. Each object must include the keys:
- name: concise color name (string)
- hex: hex value starting with # (string)
- role: short role in a slide (string)
- rationale: one sentence explaining why it complements the base color (string)
Only return JSON. No markdown fences, no commentary.`;

export async function suggestPalette(
  baseHex: string
): Promise<PaletteSuggestion[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API 키가 없습니다. 환경 변수 VITE_GEMINI_API_KEY를 설정하세요."
    );
  }

  const url = `${GEMINI_BASE_URL}/${MODEL_NAME}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SCHEMA_PROMPT}\nBase color: ${baseHex}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.65,
        topP: 0.9,
        topK: 32,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Gemini 요청이 실패했습니다: ${response.status} ${response.statusText} - ${message}`
    );
  }

  const payload = (await response.json()) as GeminiResponse;
  const textContent = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!textContent) {
    throw new Error("Gemini 응답에 텍스트가 포함되어 있지 않습니다.");
  }

  try {
    const sanitized = textContent.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(sanitized) as PaletteSuggestion[];
    return parsed.map((suggestion) => ({
      ...suggestion,
      hex: normalizeHex(suggestion.hex),
    }));
  } catch (error) {
    console.error("Gemini 응답을 파싱하지 못했습니다", { textContent, error });
    throw new Error("Gemini 응답을 해석할 수 없습니다. 자세한 내용은 콘솔을 확인하세요.");
  }
}

function normalizeHex(hex: string): string {
  const match = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!match) {
    return hex.trim();
  }
  return `#${match[1].toUpperCase()}`;
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};
