import type { PaletteSuggestion } from "./gemini";
import { suggestPalette } from "./gemini";

const style = document.createElement("style");
style.textContent = `
  :root {
    --border: rgba(0, 0, 0, 0.08);
    --shadow: 0 24px 60px rgba(31, 41, 55, 0.12);
    --accent: #4c6ef5;
    --background: #ffffff;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --border: rgba(255, 255, 255, 0.08);
      --shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
      --background: #111827;
    }
  }

  body {
    background-color: var(--background);
  }

  .shell {
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(18px);
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: var(--shadow);
    padding: clamp(24px, 5vw, 48px);
    display: grid;
    gap: 32px;
  }

  .hero h1 {
    font-size: clamp(1.875rem, 2.8vw, 2.75rem);
    margin: 0 0 12px;
  }

  .hero p {
    margin: 0;
    max-width: 46ch;
    line-height: 1.6;
    color: rgba(0, 0, 0, 0.68);
  }

  form.palette-form {
    display: grid;
    gap: 16px;
  }

  .inputs-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  .color-picker-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .color-picker-hint {
    font-size: 0.85rem;
    color: rgba(17, 24, 39, 0.65);
    text-align: center;
  }

  .color-picker {
    border: 0;
    width: 72px;
    height: 72px;
    border-radius: 20px;
    cursor: pointer;
    background: transparent;
    padding: 0;
  }

  .hex-input {
    flex: 1;
    min-width: 160px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid var(--border);
    font-size: 1rem;
    font-family: inherit;
  }

  .hex-input:focus {
    outline: 3px solid rgba(76, 110, 245, 0.25);
    border-color: var(--accent);
  }

  .submit-button {
    justify-self: start;
    padding: 14px 24px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 16px;
    font-weight: 600;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .submit-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 30px rgba(76, 110, 245, 0.35);
  }

  .submit-button:disabled {
    cursor: progress;
    opacity: 0.7;
    box-shadow: none;
  }

  .preview-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 18px 20px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.75);
  }

  .preview-card .swatch {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .preview-card .meta {
    display: grid;
    gap: 4px;
  }

  .preview-card .meta strong {
    font-size: 1rem;
  }

  .status {
    font-size: 0.95rem;
    color: rgba(17, 24, 39, 0.7);
    min-height: 1.5em;
  }

  .status.error {
    color: #d64545;
  }

  .palette-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }

  .palette-card {
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.7);
    display: grid;
    gap: 0;
    min-height: 200px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  }

  .palette-card .swatch {
    height: 120px;
    width: 100%;
  }

  .palette-card .info {
    padding: 16px 18px 18px;
    display: grid;
    gap: 6px;
  }

  .palette-card .info strong {
    font-size: 1.05rem;
  }

  .palette-card .info span {
    font-size: 0.9rem;
    color: rgba(17, 24, 39, 0.68);
  }

  .palette-card .info .usage {
    font-size: 0.85rem;
    color: rgba(55, 65, 81, 0.75);
  }

  .palette-card .info p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: rgba(55, 65, 81, 0.8);
  }

  @media (max-width: 640px) {
    .preview-card {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;
document.head.appendChild(style);

const defaultColor = "#4C6EF5";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
throw new Error("루트 요소 #app을 찾을 수 없습니다.");
}

app.innerHTML = `
  <main class="shell">
    <section class="hero">
      <h1>슬라이드 팔레트 도우미</h1>
      <p>
        기본 색상을 고르면 Gemini가 프레젠테이션용 보조 색상 다섯 가지와 활용법을 추천해 드립니다.
      </p>
    </section>
    <form class="palette-form" autocomplete="off">
      <div class="preview-card" data-role="preview">
        <div class="swatch" aria-hidden="true"></div>
        <div class="meta">
          <strong data-role="preview-hex"></strong>
          <span>선택한 기본 색상</span>
        </div>
      </div>
      <div class="inputs-row">
        <div class="color-picker-wrapper">
          <input
            class="color-picker"
            type="color"
            name="baseColor"
            aria-label="기본 색상 선택"
          />
          <span class="color-picker-hint">기본 색상을 선택하세요</span>
        </div>
        <input
          class="hex-input"
          name="hex"
          placeholder="#4C6EF5"
          maxlength="7"
          pattern="#?[0-9a-fA-F]{6}"
          aria-label="HEX 값"
        />
      </div>
      <button class="submit-button" type="submit">
        조화로운 색상 추천 받기
      </button>
      <div class="status" data-role="status"></div>
    </form>
    <section>
      <h2>팔레트 추천</h2>
      <div class="palette-grid" data-role="suggestions"></div>
    </section>
  </main>
`;

const form = requireElement<HTMLFormElement>(
  app.querySelector("form.palette-form"),
  "팔레트 폼을 찾을 수 없습니다."
);
const colorField = requireElement<HTMLInputElement>(
  app.querySelector(".color-picker"),
  "색상 선택기를 찾을 수 없습니다."
);
const hexField = requireElement<HTMLInputElement>(
  app.querySelector(".hex-input"),
  "HEX 입력창을 찾을 수 없습니다."
);
const previewCard = requireElement<HTMLDivElement>(
  app.querySelector("[data-role=preview]"),
  "미리보기 카드를 찾을 수 없습니다."
);
const previewHex = requireElement<HTMLSpanElement>(
  app.querySelector("[data-role=preview-hex]"),
  "미리보기 HEX 라벨을 찾을 수 없습니다."
);
const suggestionsGrid = requireElement<HTMLDivElement>(
  app.querySelector("[data-role=suggestions]"),
  "추천 영역을 찾을 수 없습니다."
);
const statusText = requireElement<HTMLDivElement>(
  app.querySelector("[data-role=status]"),
  "상태 영역을 찾을 수 없습니다."
);

let isRequestInFlight = false;

initialize(defaultColor);

colorField.addEventListener("input", () => {
  updateBaseColor(colorField.value);
});

hexField.addEventListener("input", () => {
  const nextHex = normalizeHexInput(hexField.value);
  if (nextHex && isValidHex(nextHex)) {
    updateBaseColor(nextHex);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isRequestInFlight) {
    return;
  }

  const baseColor = colorField.value;
  if (!isValidHex(baseColor)) {
    setStatus("유효한 6자리 HEX 색상을 입력하세요.", true);
    return;
  }

  try {
    isRequestInFlight = true;
    toggleFormDisabled(true);
    setStatus("Gemini에게 팔레트를 요청하고 있어요…", false);
    const suggestions = await suggestPalette(baseColor);
    renderSuggestions(suggestions);
    setStatus("", false);
  } catch (error) {
    console.error(error);
    setStatus(
      error instanceof Error
        ? error.message
        : "추천을 불러오는 중 오류가 발생했습니다.",
      true
    );
  } finally {
    isRequestInFlight = false;
    toggleFormDisabled(false);
  }
});

function initialize(initialHex: string) {
  updateBaseColor(initialHex);
  renderSuggestions([]);
}

function updateBaseColor(hex: string) {
  const normalized = ensureHashPrefix(hex);
  colorField.value = normalized;
  hexField.value = normalized;
  previewCard.querySelector<HTMLDivElement>(".swatch")!.style.background =
    normalized;
  previewHex.textContent = normalized;
}

function toggleFormDisabled(disabled: boolean) {
  form.querySelectorAll<HTMLInputElement | HTMLButtonElement>(
    "input, button"
  ).forEach((element) => {
    element.disabled = disabled;
  });
}

function setStatus(message: string, isError: boolean) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError && Boolean(message));
}

function renderSuggestions(suggestions: PaletteSuggestion[]) {
  if (!suggestions.length) {
    suggestionsGrid.innerHTML = `
      <p style="margin: 0; color: rgba(17, 24, 39, 0.6);">
        추천을 실행하면 활용 예시와 함께 어울리는 보조 색상을 확인할 수 있어요.
      </p>
    `;
    return;
  }

  const template = suggestions
    .map(
      (suggestion) => `
        <article class="palette-card" aria-label="${suggestion.name}">
          <div class="swatch" style="background:${suggestion.hex}"></div>
          <div class="info">
            <strong>${suggestion.name}</strong>
            <span>${suggestion.hex}</span>
            <span class="usage">${suggestion.role}</span>
          </div>
        </article>
      `
    )
    .join("");
  suggestionsGrid.innerHTML = template;
}

function ensureHashPrefix(value: string): string {
  return value.startsWith("#") ? value.toUpperCase() : `#${value.toUpperCase()}`;
}

function normalizeHexInput(value: string): string {
  const trimmed = value.trim();
  const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (normalized.length === 7) {
    return normalized.toUpperCase();
  }
  return normalized.toUpperCase();
}

function isValidHex(value: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(value.trim());
}

function requireElement<T>(value: T | null, message: string): T {
  if (!value) {
    throw new Error(message);
  }
  return value;
}
