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

  .top-bar {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .top-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    border-radius: 999px;
    border: 1px solid var(--border);
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .top-link:hover {
    background: rgba(76, 110, 245, 0.12);
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

  .color-inline-preview {
    display: none;
    width: 64px;
    height: 64px;
    border-radius: 18px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .advanced-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }

  .advanced-button:hover {
    background: rgba(76, 110, 245, 0.12);
    box-shadow: 0 8px 22px rgba(76, 110, 245, 0.2);
  }

  .advanced-button:focus {
    outline: 3px solid rgba(76, 110, 245, 0.25);
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

  .palette-card .info .hex {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(17, 24, 39, 0.85);
  }

  .palette-card .info .usage {
    font-size: 0.85rem;
    color: rgba(55, 65, 81, 0.75);
  }

  .color-dialog {
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 40;
  }

  .color-dialog[hidden] {
    display: none;
  }

  .color-dialog__panel {
    width: min(420px, 100%);
    background: rgba(255, 255, 255, 0.96);
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
    padding: 24px;
    display: grid;
    gap: 20px;
  }

  .color-dialog__panel h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  .color-dialog__preview {
    width: 100%;
    height: 120px;
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .color-dialog__hex {
    margin: 0;
    font-weight: 600;
    font-size: 1.1rem;
    text-align: center;
    color: rgba(17, 24, 39, 0.85);
  }

  .color-dialog__sliders {
    display: grid;
    gap: 16px;
  }

  .slider-row {
    display: grid;
    gap: 8px;
  }

  .slider-row__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .slider-row label {
    font-weight: 600;
    font-size: 0.9rem;
    color: rgba(17, 24, 39, 0.75);
  }

  .slider-row output {
    font-size: 0.85rem;
    color: rgba(55, 65, 81, 0.75);
  }

  .slider-row input[type="range"] {
    width: 100%;
  }

  .color-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .color-dialog__actions button {
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    font-weight: 600;
  }

  .color-dialog__actions button.primary {
    background: var(--accent);
    color: white;
    border: none;
  }

  .color-dialog__actions button.primary:hover {
    box-shadow: 0 12px 28px rgba(76, 110, 245, 0.35);
  }

  @media (pointer: coarse) {
    .color-picker {
      display: none;
    }

    .color-inline-preview {
      display: block;
    }

    .advanced-button {
      display: flex;
      width: 100%;
      font-size: 1rem;
      padding: 12px 18px;
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
    <div class="top-bar">
      <a
        class="top-link"
        href="https://chrischangminlee.github.io/Enterprise-AI-Platform/"
        target="_blank"
        rel="noopener noreferrer"
      >
        기업 AI 정보 플랫폼
      </a>
      <a
        class="top-link"
        href="https://www.linkedin.com/in/chrislee9407/"
        target="_blank"
        rel="noopener noreferrer"
      >
        개발자 링크드인
      </a>
    </div>
    <section class="hero">
      <h1>슬라이드 팔레트 도우미</h1>
      <p>
        기본 색상을 고르면 Gemini가 프레젠테이션용 보조 색상 다섯 가지와 활용법을 추천해 드립니다.
      </p>
    </section>
    <form class="palette-form" autocomplete="off">
      <div class="inputs-row">
        <div class="color-picker-wrapper">
          <input
            class="color-picker"
            type="color"
            name="baseColor"
            aria-label="기본 색상 선택"
          />
          <span class="color-picker-hint">기본 색상을 선택하세요</span>
          <div
            class="color-inline-preview"
            data-role="inline-preview"
            aria-hidden="true"
          ></div>
          <button
            type="button"
            class="advanced-button"
            data-role="open-advanced"
          >
            세밀한 색상 선택
          </button>
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
    <div class="color-dialog" data-role="color-dialog" hidden>
      <div
        class="color-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="color-dialog-title"
      >
        <h3 id="color-dialog-title">색상 직접 선택</h3>
        <div class="color-dialog__preview" data-role="dialog-preview"></div>
        <p class="color-dialog__hex" data-role="dialog-hex">#4C6EF5</p>
        <div class="color-dialog__sliders">
          <div class="slider-row">
            <div class="slider-row__head">
              <label for="hue-range">색상 (Hue)</label>
              <output data-role="hue-value">0°</output>
            </div>
            <input
              id="hue-range"
              type="range"
              min="0"
              max="360"
              value="220"
              data-role="hue-range"
            />
          </div>
          <div class="slider-row">
            <div class="slider-row__head">
              <label for="saturation-range">채도 (Saturation)</label>
              <output data-role="saturation-value">0%</output>
            </div>
            <input
              id="saturation-range"
              type="range"
              min="0"
              max="100"
              value="70"
              data-role="saturation-range"
            />
          </div>
          <div class="slider-row">
            <div class="slider-row__head">
              <label for="lightness-range">명도 (Lightness)</label>
              <output data-role="lightness-value">0%</output>
            </div>
            <input
              id="lightness-range"
              type="range"
              min="0"
              max="100"
              value="60"
              data-role="lightness-range"
            />
          </div>
        </div>
        <div class="color-dialog__actions">
          <button type="button" data-role="cancel-advanced">취소</button>
          <button
            type="button"
            class="primary"
            data-role="apply-advanced"
          >
            적용
          </button>
        </div>
      </div>
    </div>
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
const openAdvancedButton = requireElement<HTMLButtonElement>(
  app.querySelector("[data-role=open-advanced]"),
  "세밀한 색상 선택 버튼을 찾을 수 없습니다."
);
const inlinePreview = requireElement<HTMLDivElement>(
  app.querySelector("[data-role=inline-preview]"),
  "인라인 색상 미리보기를 찾을 수 없습니다."
);
const suggestionsGrid = requireElement<HTMLDivElement>(
  app.querySelector("[data-role=suggestions]"),
  "추천 영역을 찾을 수 없습니다."
);
const statusText = requireElement<HTMLDivElement>(
  app.querySelector("[data-role=status]"),
  "상태 영역을 찾을 수 없습니다."
);
const colorDialog = requireElement<HTMLDivElement>(
  app.querySelector("[data-role=color-dialog]"),
  "색상 선택 대화상자를 찾을 수 없습니다."
);
const dialogPreview = requireElement<HTMLDivElement>(
  app.querySelector("[data-role=dialog-preview]"),
  "색상 미리보기를 찾을 수 없습니다."
);
const dialogHexLabel = requireElement<HTMLParagraphElement>(
  app.querySelector("[data-role=dialog-hex]"),
  "HEX 표시를 찾을 수 없습니다."
);
const hueRange = requireElement<HTMLInputElement>(
  app.querySelector("[data-role=hue-range]"),
  "Hue 슬라이더를 찾을 수 없습니다."
);
const saturationRange = requireElement<HTMLInputElement>(
  app.querySelector("[data-role=saturation-range]"),
  "Saturation 슬라이더를 찾을 수 없습니다."
);
const lightnessRange = requireElement<HTMLInputElement>(
  app.querySelector("[data-role=lightness-range]"),
  "Lightness 슬라이더를 찾을 수 없습니다."
);
const hueValueLabel = requireElement<HTMLOutputElement>(
  app.querySelector("[data-role=hue-value]"),
  "Hue 값 표시를 찾을 수 없습니다."
);
const saturationValueLabel = requireElement<HTMLOutputElement>(
  app.querySelector("[data-role=saturation-value]"),
  "Saturation 값 표시를 찾을 수 없습니다."
);
const lightnessValueLabel = requireElement<HTMLOutputElement>(
  app.querySelector("[data-role=lightness-value]"),
  "Lightness 값 표시를 찾을 수 없습니다."
);
const applyAdvancedButton = requireElement<HTMLButtonElement>(
  app.querySelector("[data-role=apply-advanced]"),
  "고급 색상 적용 버튼을 찾을 수 없습니다."
);
const cancelAdvancedButton = requireElement<HTMLButtonElement>(
  app.querySelector("[data-role=cancel-advanced]"),
  "고급 색상 취소 버튼을 찾을 수 없습니다."
);

let isRequestInFlight = false;
let currentBaseColor = defaultColor;
let lastFocusedElement: HTMLElement | null = null;
let previousBodyOverflow: string | null = null;

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

openAdvancedButton.addEventListener("click", () => {
  openAdvancedPicker();
});

cancelAdvancedButton.addEventListener("click", () => {
  closeAdvancedPicker();
});

applyAdvancedButton.addEventListener("click", () => {
  applyAdvancedSelection();
});

[hueRange, saturationRange, lightnessRange].forEach((range) => {
  range.addEventListener("input", () => {
    syncAdvancedPreview();
  });
});

colorDialog.addEventListener("click", (event) => {
  if (event.target === colorDialog) {
    closeAdvancedPicker();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !colorDialog.hidden) {
    closeAdvancedPicker();
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
  currentBaseColor = normalized;
  inlinePreview.style.background = normalized;
  syncAdvancedControls(normalized);
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
        추천을 실행하면 기본 색상과 어울리는 색상 조합을 확인할 수 있어요.
      </p>
    `;
    return;
  }

  const baseCard = `
    <article class="palette-card" aria-label="기본 색상">
      <div class="swatch" style="background:${currentBaseColor}"></div>
      <div class="info">
        <span class="hex">${currentBaseColor}</span>
        <span class="usage">기본 색상</span>
      </div>
    </article>
  `;

  const suggestionCards = suggestions
    .map(
      (suggestion) => `
        <article class="palette-card" aria-label="${suggestion.name}">
          <div class="swatch" style="background:${suggestion.hex}"></div>
          <div class="info">
            <span class="hex">${suggestion.hex}</span>
            <span class="usage">${suggestion.role}</span>
          </div>
        </article>
      `
    )
    .join("");

  suggestionsGrid.innerHTML = baseCard + suggestionCards;
}

function openAdvancedPicker() {
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  syncAdvancedControls(currentBaseColor);
  colorDialog.hidden = false;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  applyAdvancedButton.focus();
}

function closeAdvancedPicker() {
  colorDialog.hidden = true;
  if (previousBodyOverflow !== null) {
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = null;
  }
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

function applyAdvancedSelection() {
  const selectedHex = dialogPreview.dataset.currentHex ?? currentBaseColor;
  updateBaseColor(selectedHex);
  closeAdvancedPicker();
}

function syncAdvancedControls(hex: string) {
  const { h, s, l } = hexToHsl(hex);
  hueRange.value = String(Math.round(h));
  saturationRange.value = String(Math.round(s));
  lightnessRange.value = String(Math.round(l));
  updateSliderOutputs();
  dialogPreview.style.background = hex;
  dialogPreview.dataset.currentHex = hex;
  dialogHexLabel.textContent = hex;
}

function syncAdvancedPreview() {
  updateSliderOutputs();
  const hue = Number(hueRange.value);
  const saturation = Number(saturationRange.value);
  const lightness = Number(lightnessRange.value);
  const hex = hslToHex(hue, saturation, lightness);
  dialogPreview.style.background = hex;
  dialogPreview.dataset.currentHex = hex;
  dialogHexLabel.textContent = hex;
}

function updateSliderOutputs() {
  hueValueLabel.textContent = `${hueRange.value}°`;
  saturationValueLabel.textContent = `${saturationRange.value}%`;
  lightnessValueLabel.textContent = `${lightnessRange.value}%`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const sanitized = hex.trim().replace(/^#/, "");
  if (sanitized.length !== 6) {
    return { h: 0, s: 0, l: 0 };
  }

  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return { h: 0, s: 0, l: 0 };
  }

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      hue = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      hue = (bNorm - rNorm) / delta + 2;
    } else {
      hue = (rNorm - gNorm) / delta + 4;
    }
    hue *= 60;
  }
  if (hue < 0) {
    hue += 360;
  }

  const lightness = (max + min) / 2;

  let saturation = 0;
  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
  }

  return {
    h: clamp(Math.round(hue), 0, 360),
    s: clamp(Math.round(saturation * 100), 0, 100),
    l: clamp(Math.round(lightness * 100), 0, 100),
  };
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const h = ((hue % 360) + 360) % 360;
  const s = clamp(saturation, 0, 100) / 100;
  const l = clamp(lightness, 0, 100) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  const r = Math.round((rPrime + m) * 255);
  const g = Math.round((gPrime + m) * 255);
  const b = Math.round((bPrime + m) * 255);

  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

function toHexChannel(value: number): string {
  return clamp(value, 0, 255).toString(16).padStart(2, "0").toUpperCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
