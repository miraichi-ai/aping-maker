/**
 * LINEスタンプのバリデーションロジック
 */
import { t } from './i18n.js';

/**
 * バリデーション定義
 */
const validators = {
    animation_stamp: {
        maxFileSize: 300 * 1024,
        frameCount: { min: 5, max: 20 },
        loopCount: { min: 1, max: 4 },
        allowedDurations: [1, 2, 3, 4],
        imageSize: { type: 'maxBothMinOneside', maxW: 320, maxH: 270, minSide: 270 },
    },
    animation_main: {
        maxFileSize: 300 * 1024,
        frameCount: { min: 5, max: 20 },
        loopCount: { min: 1, max: 4 },
        allowedDurations: [1, 2, 3, 4],
        imageSize: { type: 'exact', w: 240, h: 240 },
    },
    effect: {
        maxFileSize: 500 * 1024,
        frameCount: { min: 5, max: 20 },
        loopCount: { min: 1, max: 3 },
        allowedDurations: [1, 2, 3],
        imageSize: { type: 'exactWidthMinHeight', w: 480, minH: 200, minLong: 320 },
    },
    popup: {
        maxFileSize: 500 * 1024,
        frameCount: { min: 5, max: 20 },
        loopCount: { min: 1, max: 3 },
        allowedDurations: [1, 2, 3],
        imageSize: { type: 'exactWidthMinHeight', w: 480, minH: 200, minLong: 320 },
    },
    emoji: {
        maxFileSize: 300 * 1024,
        frameCount: { min: 5, max: 20 },
        loopCount: { min: 1, max: 4 },
        allowedDurations: [1, 2, 3, 4],
        imageSize: { type: 'exact', w: 180, h: 180 },
    },
};

/**
 * バリデーションを実行
 * @param {string} ruleType - バリデーション種別
 * @param {object} params - { width, height, frameCount, loopCount, fps, fileSize? }
 * @returns {Array<{label: string, pass: boolean, message: string}>}
 */
export function validateLine(ruleType, params) {
    const def = validators[ruleType];
    if (!def) return [];

    const results = [];
    const { width, height, frameCount, loopCount, fps, fileSize } = params;
    const duration = (frameCount / fps) * loopCount;
    const durationRounded = Math.round(duration * 100) / 100;

    // ファイルサイズ
    if (fileSize !== undefined && fileSize !== null) {
        const maxKB = Math.round(def.maxFileSize / 1024);
        results.push({
            label: t('VALIDATE_fileSize'),
            pass: fileSize <= def.maxFileSize,
            message: fileSize <= def.maxFileSize
                ? `${t('VALIDATE_pass')} (${Math.round(fileSize / 1024)}KB / ${maxKB}KB)`
                : t('VALIDATE_fileSizeOver', { max: maxKB }),
        });
    }

    // フレーム数
    results.push({
        label: t('VALIDATE_frameCount'),
        pass: frameCount >= def.frameCount.min && frameCount <= def.frameCount.max,
        message: frameCount >= def.frameCount.min && frameCount <= def.frameCount.max
            ? `${t('VALIDATE_pass')} (${frameCount})`
            : t('VALIDATE_frameCountRange', { min: def.frameCount.min, max: def.frameCount.max }),
    });

    // ループ回数
    results.push({
        label: t('VALIDATE_loopCount'),
        pass: loopCount >= def.loopCount.min && loopCount <= def.loopCount.max,
        message: loopCount >= def.loopCount.min && loopCount <= def.loopCount.max
            ? `${t('VALIDATE_pass')} (${loopCount})`
            : t('VALIDATE_loopCountRange', { min: def.loopCount.min, max: def.loopCount.max }),
    });

    // 再生時間
    const durationPass = def.allowedDurations.includes(Math.round(durationRounded));
    results.push({
        label: t('VALIDATE_duration'),
        pass: durationPass,
        message: durationPass
            ? `${t('VALIDATE_pass')} (${durationRounded}s)`
            : t('VALIDATE_durationRange', {
                allowed: def.allowedDurations.join('/'),
                current: durationRounded,
            }),
    });

    // 画像サイズ
    const sizeResult = validateImageSize(def.imageSize, width, height);
    results.push({
        label: t('VALIDATE_imageSize'),
        pass: sizeResult.pass,
        message: sizeResult.pass
            ? `${t('VALIDATE_pass')} (${width}×${height}px)`
            : sizeResult.message,
    });

    return results;
}

function validateImageSize(def, w, h) {
    switch (def.type) {
        case 'exact':
            return {
                pass: w === def.w && h === def.h,
                message: t('VALIDATE_imageSizeExact', { w: def.w, h: def.h }),
            };
        case 'maxBothMinOneside':
            return {
                pass: w <= def.maxW && h <= def.maxH && (w >= def.minSide || h >= def.minSide),
                message: t('VALIDATE_imageSizeMax', {
                    maxW: def.maxW,
                    maxH: def.maxH,
                    minSide: def.minSide,
                }),
            };
        case 'exactWidthMinHeight': {
            const longSide = Math.max(w, h);
            return {
                pass: w === def.w && h >= def.minH && longSide >= def.minLong,
                message: t('VALIDATE_imageSizeExactWidth', {
                    w: def.w,
                    minH: def.minH,
                    minLong: def.minLong,
                }),
            };
        }
        default:
            return { pass: true, message: '' };
    }
}

/**
 * LINE向けのFPS/ループ制限を取得
 */
export function getLineConstraints(ruleType) {
    const def = validators[ruleType];
    if (!def) return null;
    return {
        fpsMin: 5,
        fpsMax: 20,
        loopMin: def.loopCount.min,
        loopMax: def.loopCount.max,
    };
}

/**
 * LINEのルールに合わせて画像を縮小・リサイズする場合の目標サイズを計算する
 * @param {string} ruleType 
 * @param {number} origW 元画像の幅
 * @param {number} origH 元画像の高さ
 * @returns {object} { width, height, canvasWidth, canvasHeight }
 */
export function calculateTargetSize(ruleType, origW, origH) {
    const def = validators[ruleType];
    if (!def) return { width: origW, height: origH, canvasWidth: origW, canvasHeight: origH };

    const img = def.imageSize;
    let targetW = origW;
    let targetH = origH;

    switch (img.type) {
        case 'exact':
            // 例: メイン画像(240x240)
            const scaleExact = Math.min(img.w / origW, img.h / origH);
            targetW = Math.round(origW * scaleExact);
            targetH = Math.round(origH * scaleExact);
            // 余白を含めてCanvas自体は指定サイズに固定する
            return { width: targetW, height: targetH, canvasWidth: img.w, canvasHeight: img.h };

        case 'maxBothMinOneside':
            // 例: アニメスタンプ(W320xH270以下)
            // デフォルトは縮小のみ。小さい場合はそのまま。
            const scaleMax = Math.min(1.0, img.maxW / origW, img.maxH / origH);
            targetW = Math.round(origW * scaleMax);
            targetH = Math.round(origH * scaleMax);
            return { width: targetW, height: targetH, canvasWidth: targetW, canvasHeight: targetH };

        case 'exactWidthMinHeight':
            // 例: ポップアップ(W480固定)
            const scaleW = img.w / origW;
            targetW = img.w;
            targetH = Math.round(origH * scaleW);
            return { width: targetW, height: targetH, canvasWidth: targetW, canvasHeight: targetH };

        default:
            return { width: origW, height: origH, canvasWidth: origW, canvasHeight: origH };
    }
}
