/**
 * アニメ画像に変換する君 Web - メインアプリケーション
 */
import { getLang, setLang, t, applyI18n } from './i18n.js';
import { validateLine, getLineConstraints, calculateTargetSize } from './validator.js';
import { generateApng, apngBufferToBlob, downloadBlob } from './apng-generator.js';

// ===== State =====
const state = {
    mode: 'line',          // 'line' | 'web'
    fps: 15,
    duration: 1,           // ADDED: LINEスタンプの再生時間(秒) 1-4
    noLoop: false,
    loopCount: 1,
    exportApng: true,
    exportWebp: false,
    compressUrl: true,     // ADDED: 容量圧縮オプション(cnum=256)
    lineRule: 'animation_stamp',
    frames: [],            // ImageBitmap[]
    files: [],             // File[]
    imageWidth: 0,
    imageHeight: 0,
    isPlaying: false,
    currentFrame: 0,
    animationId: null,
};

// ===== DOM Elements =====
const $ = (sel) => document.querySelector(sel);
const modeSelect = $('#mode-select');
const fpsRow = $('#fps-row');
const fpsHelp = $('#fps-help');
const fpsInput = $('#fps-input');
const durationRow = $('#duration-row');
const durationHelp = $('#duration-help');
const durationSelect = $('#duration-select');

const noLoopCheck = $('#no-loop-check');
const loopInput = $('#loop-input');
const exportApngCheck = $('#export-apng');
const exportWebpCheck = $('#export-webp');
const compressCheck = $('#compress-check');
const lineRuleSelect = $('#line-rule-select');
const saveBtn = $('#save-btn');
const dropZone = $('#drop-zone');
const dropZoneContent = $('#drop-zone-content');
const fileInput = $('#file-input');
const previewContainer = $('#preview-container');
const previewCanvas = $('#preview-canvas');
const playPauseBtn = $('#play-pause-btn');
const clearBtn = $('#clear-btn');
const frameIndicator = $('#frame-indicator');
const validationArea = $('#validation-area');
const validationList = $('#validation-list');
const imageInfoDiv = $('#image-info');
const infoSize = $('#info-size');
const infoFrames = $('#info-frames');
const infoDuration = $('#info-duration');
const loadingOverlay = $('#loading-overlay');
const langToggle = $('#lang-toggle');
const langLabel = $('#lang-label');
const lineValidationSection = $('#line-validation-section');
const loopInfiniteRow = $('#loop-infinite-row');
const loopCountRow = $('#loop-count-row');
const webpExportRow = $('#webp-export-row');

// ===== Initialization =====
function init() {
    applyI18n();
    updateLangLabel();
    bindEvents();
    updateUI();
}

// ===== Event Bindings =====
function bindEvents() {
    // Mode change
    modeSelect.addEventListener('change', (e) => {
        state.mode = e.target.value;
        applyModeDefaults();
        updateUI();
    });

    // FPS
    fpsInput.addEventListener('input', (e) => {
        state.fps = clamp(parseInt(e.target.value) || 1, 1, 60);
        updateValidation();
    });
    fpsInput.addEventListener('blur', () => {
        fpsInput.value = state.fps;
    });

    // Duration
    durationSelect.addEventListener('change', (e) => {
        state.duration = parseInt(e.target.value) || 1;
        updateValidation();
        // LINEモードの場合、FPS(再生遅延)が変動するのでアニメーションが再生中なら再描画
        if (state.isPlaying && state.mode === 'line') {
            stopAnimation();
            startAnimation();
        }
    });

    // Loop
    noLoopCheck.addEventListener('change', (e) => {
        state.noLoop = e.target.checked;
        updateUI();
    });

    loopInput.addEventListener('input', (e) => {
        const maxLoop = state.mode === 'line' ? 4 : 100;
        state.loopCount = clamp(parseInt(e.target.value) || 1, 1, maxLoop);
        updateValidation();
    });
    loopInput.addEventListener('blur', () => {
        loopInput.value = state.loopCount;
    });

    // Export & Quality options
    exportApngCheck.addEventListener('change', (e) => {
        state.exportApng = e.target.checked;
    });
    exportWebpCheck.addEventListener('change', (e) => {
        state.exportWebp = e.target.checked;
    });
    compressCheck.addEventListener('change', (e) => {
        state.compressUrl = e.target.checked;
    });

    // LINE rule
    lineRuleSelect.addEventListener('change', (e) => {
        state.lineRule = e.target.value;
        applyLineConstraints();
        updateValidation();
    });

    // Save
    saveBtn.addEventListener('click', handleSave);

    // Drop zone
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type === 'image/png');
        if (files.length > 0) loadFiles(files);
    });
    dropZone.addEventListener('click', (e) => {
        if (state.frames.length === 0) {
            fileInput.click();
        }
    });
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter((f) => f.type === 'image/png');
        if (files.length > 0) loadFiles(files);
        fileInput.value = '';
    });

    // Preview controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    clearBtn.addEventListener('click', clearFrames);

    // Language toggle
    langToggle.addEventListener('click', () => {
        const newLang = getLang() === 'ja' ? 'en' : 'ja';
        setLang(newLang);
        applyI18n();
        updateLangLabel();
        updateValidation();
        updateImageInfo();
    });
}

// ===== File Loading =====
async function loadFiles(files) {
    // Sort files by name
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    state.files = files;
    state.frames = [];

    const bitmaps = [];
    let firstWidth = 0;
    let firstHeight = 0;
    let sizeMismatch = false;

    for (const file of files) {
        const bitmap = await createImageBitmap(file);
        if (bitmaps.length === 0) {
            firstWidth = bitmap.width;
            firstHeight = bitmap.height;
        } else if (bitmap.width !== firstWidth || bitmap.height !== firstHeight) {
            sizeMismatch = true;
        }
        bitmaps.push(bitmap);
    }

    if (sizeMismatch) {
        showToast(t('TOAST_sizeMismatch'), 'warning');
    }

    state.frames = bitmaps;
    state.imageWidth = firstWidth;
    state.imageHeight = firstHeight;
    state.currentFrame = 0;

    // Setup canvas
    previewCanvas.width = firstWidth;
    previewCanvas.height = firstHeight;

    // Show preview
    dropZoneContent.style.display = 'none';
    previewContainer.style.display = 'flex';
    saveBtn.disabled = false;

    drawFrame(0);
    startAnimation();
    updateUI();
    updateValidation();
    updateImageInfo();
}

// ===== Preview Animation =====
function drawFrame(index) {
    if (index < 0 || index >= state.frames.length) return;
    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    ctx.drawImage(state.frames[index], 0, 0);
    state.currentFrame = index;
    frameIndicator.textContent = `${index + 1} / ${state.frames.length}`;
}

function startAnimation() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    playPauseBtn.textContent = '⏸️';

    let lastTime = 0;
    const delays = getDelays();

    function animate(timestamp) {
        if (!state.isPlaying) return;

        const currentDelay = delays.length > 0
            ? delays[state.currentFrame % delays.length]
            : (1000 / state.fps);

        if (timestamp - lastTime >= currentDelay) {
            lastTime = timestamp;
            const nextFrame = (state.currentFrame + 1) % state.frames.length;
            drawFrame(nextFrame);
        }
        state.animationId = requestAnimationFrame(animate);
    }
    state.animationId = requestAnimationFrame(animate);
}

function stopAnimation() {
    state.isPlaying = false;
    playPauseBtn.textContent = '▶️';
    if (state.animationId) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
    }
}

function togglePlayPause() {
    if (state.isPlaying) {
        stopAnimation();
    } else {
        startAnimation();
    }
}

function clearFrames() {
    stopAnimation();
    state.frames.forEach((f) => f.close());
    state.frames = [];
    state.files = [];
    state.imageWidth = 0;
    state.imageHeight = 0;
    state.currentFrame = 0;

    previewContainer.style.display = 'none';
    dropZoneContent.style.display = '';
    saveBtn.disabled = true;

    validationArea.style.display = 'none';
    imageInfoDiv.style.display = 'none';
}

// ===== Save / Generate =====
async function handleSave() {
    if (state.frames.length === 0) return;

    if (!state.exportApng && !state.exportWebp) {
        showToast(t('TOAST_noFormat'), 'warning');
        return;
    }

    loadingOverlay.style.display = 'flex';

    try {
        // APNG
        if (state.exportApng) {
            const loopCount = state.noLoop ? 0 : state.loopCount;
            // 計算されたピッタリの遅延時間配列を取得
            const delays = getDelays();
            const cnum = state.compressUrl ? 256 : 0; // 色数指定

            // リサイズ設定（LINEモードで圧縮ONの場合のみ適用）
            const targetSize = state.mode === 'line' && state.compressUrl
                ? calculateTargetSize(state.lineRule, state.imageWidth, state.imageHeight)
                : null;

            const buffer = generateApng(state.frames, delays, loopCount, cnum, targetSize);
            const blob = apngBufferToBlob(buffer);
            downloadBlob(blob, 'animation.png');

            // LINE バリデーション（ファイルサイズ含む）
            if (state.mode === 'line') {
                runValidation(blob.size);
            }
        }

        // WebP (still frames)
        if (state.exportWebp) {
            for (let i = 0; i < state.frames.length; i++) {
                const canvas = new OffscreenCanvas(state.imageWidth, state.imageHeight);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(state.frames[i], 0, 0);
                const webpBlob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.9 });
                downloadBlob(webpBlob, `frame_${String(i).padStart(4, '0')}.webp`);
            }
        }

        showToast(t('TOAST_saved'), 'success');
    } catch (err) {
        console.error(err);
        showToast(`${t('TOAST_error')}: ${err.message}`, 'error');
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// ===== Validation =====
function runValidation(fileSize = null) {
    if (state.mode !== 'line' || state.frames.length === 0) {
        validationArea.style.display = 'none';
        return;
    }

    const currentFps = state.mode === 'line'
        ? state.frames.length / state.duration
        : state.fps;

    const targetSize = state.mode === 'line' && state.compressUrl
        ? calculateTargetSize(state.lineRule, state.imageWidth, state.imageHeight)
        : null;

    const currentW = targetSize ? targetSize.canvasWidth : state.imageWidth;
    const currentH = targetSize ? targetSize.canvasHeight : state.imageHeight;

    const results = validateLine(state.lineRule, {
        width: currentW,
        height: currentH,
        frameCount: state.frames.length,
        loopCount: state.noLoop ? 1 : state.loopCount,
        fps: currentFps,
        fileSize: fileSize,
    });

    validationList.innerHTML = '';
    for (const r of results) {
        const li = document.createElement('li');
        li.className = `validation-item ${r.pass ? 'pass' : 'fail'}`;
        li.innerHTML = `<span>${r.pass ? '✅' : '❌'}</span> <strong>${r.label}:</strong> ${r.message}`;
        validationList.appendChild(li);
    }
    validationArea.style.display = '';
}

function updateValidation() {
    runValidation();
}

// ===== UI Updates =====
function updateUI() {
    const isLine = state.mode === 'line';

    // LINE mode: show validation & checkrule, hide webp/loop-infinite
    lineValidationSection.style.display = isLine ? '' : 'none';
    loopInfiniteRow.style.display = isLine ? 'none' : '';
    webpExportRow.style.display = isLine ? 'none' : '';

    // FPS vs Duration row visualization
    fpsRow.style.display = isLine ? 'none' : '';
    fpsHelp.style.display = isLine ? 'none' : '';
    durationRow.style.display = isLine ? '' : 'none';
    durationHelp.style.display = isLine ? '' : 'none';

    // Loop count row
    loopCountRow.style.display = state.noLoop ? 'none' : '';

    // FPS constraints
    if (isLine) {
        applyLineConstraints();
        // LINE mode: always export APNG, no webp
        state.exportApng = true;
        exportApngCheck.checked = true;
        state.exportWebp = false;
        exportWebpCheck.checked = false;
        // Compression recommended for LINE
        state.compressUrl = true;
        compressCheck.checked = true;

        loopInput.max = 4;
    } else {
        fpsInput.min = 1;
        fpsInput.max = 60;
        loopInput.min = 1;
        loopInput.max = 999;
    }

    updateValidation();
}

function applyModeDefaults() {
    if (state.mode === 'line') {
        state.fps = 15;
        state.noLoop = false;
        state.loopCount = 1;
        state.exportApng = true;
        state.exportWebp = false;
        fpsInput.value = 15;
        loopInput.value = 1;
        noLoopCheck.checked = false;
        exportApngCheck.checked = true;
        exportWebpCheck.checked = false;
    } else {
        state.fps = 30;
        fpsInput.value = 30;
    }
}

function applyLineConstraints() {
    const constraints = getLineConstraints(state.lineRule);
    if (!constraints) return;
    fpsInput.min = constraints.fpsMin;
    fpsInput.max = constraints.fpsMax;
    loopInput.min = constraints.loopMin;
    loopInput.max = constraints.loopMax;
    state.fps = clamp(state.fps, constraints.fpsMin, constraints.fpsMax);
    state.loopCount = clamp(state.loopCount, constraints.loopMin, constraints.loopMax);
    fpsInput.value = state.fps;
    loopInput.value = state.loopCount;
}

function updateLangLabel() {
    langLabel.textContent = getLang() === 'ja' ? 'EN' : 'JA';
}

function updateImageInfo() {
    if (state.frames.length === 0) {
        imageInfoDiv.style.display = 'none';
        return;
    }

    // 表示用の寸法（リサイズされる場合はリサイズ後の寸法を表示）
    const targetSize = state.mode === 'line' && state.compressUrl
        ? calculateTargetSize(state.lineRule, state.imageWidth, state.imageHeight)
        : null;
    const currentW = targetSize ? targetSize.canvasWidth : state.imageWidth;
    const currentH = targetSize ? targetSize.canvasHeight : state.imageHeight;

    const delays = getDelays();
    const singleCycleMs = delays.reduce((acc, val) => acc + val, 0);
    const duration = (singleCycleMs / 1000) * (state.noLoop ? 1 : state.loopCount);

    infoSize.textContent = t('INFO_size', { w: currentW, h: currentH });
    infoFrames.textContent = t('INFO_frames', { n: state.frames.length });
    infoDuration.textContent = t('INFO_duration', { t: Math.round(duration * 1000) / 1000 });
    imageInfoDiv.style.display = '';
}

// ===== Utility =====
function getDelays() {
    if (state.frames.length === 0) return [];
    const count = state.frames.length;

    if (state.mode === 'line') {
        const totalMs = state.duration * 1000;
        const baseDelay = Math.floor(totalMs / count);
        const remainder = totalMs % count;
        const delays = [];
        for (let i = 0; i < count; i++) {
            // 余りの数だけ、最初のフレームに+1msして総時間をピッタリ合わせる
            delays.push(baseDelay + (i < remainder ? 1 : 0));
        }
        return delays;
    } else {
        const delayMs = Math.round(1000 / state.fps);
        return Array(count).fill(delayMs);
    }
}

// ===== Toast =====
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ===== Utility =====
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// ===== Start =====
init();
