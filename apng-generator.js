/**
 * APNG生成モジュール
 * UPNG.jsを使用してブラウザ内でAPNGファイルを生成する
 */
import UPNG from 'upng-js';

/**
 * 複数のImageBitmapからAPNGバイナリを生成する
 * @param {ImageBitmap[]} frames - フレーム画像の配列
 * @param {number|number[]} delayMsOrArray - 全フレーム共通の遅延時間(ms)、または各フレームごとの遅延時間配列(ms)
 * @param {number} loopCount - ループ回数 (0 = 無限)
 * @param {number} cnum - 色数（0 = lossless, 256などで減色処理）
 * @param {object|null} targetSize - リサイズ設定 {width, height, canvasWidth, canvasHeight}
 * @returns {ArrayBuffer} APNGバイナリ
 */
export function generateApng(frames, delayMsOrArray, loopCount, cnum = 0, targetSize = null) {
    if (frames.length === 0) {
        throw new Error('No frames provided');
    }

    const origWidth = frames[0].width;
    const origHeight = frames[0].height;

    // Canvas出力サイズの決定
    const canvasW = targetSize ? targetSize.canvasWidth : origWidth;
    const canvasH = targetSize ? targetSize.canvasHeight : origHeight;
    const drawW = targetSize ? targetSize.width : origWidth;
    const drawH = targetSize ? targetSize.height : origHeight;

    // 中央寄せでの描画オフセット計算
    const offsetX = Math.floor((canvasW - drawW) / 2);
    const offsetY = Math.floor((canvasH - drawH) / 2);

    // 各フレームのRGBAデータを取得
    const canvas = new OffscreenCanvas(canvasW, canvasH);
    const ctx = canvas.getContext('2d');

    const frameDataList = [];
    const delays = [];

    const isDelayArray = Array.isArray(delayMsOrArray);

    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        ctx.clearRect(0, 0, canvasW, canvasH);
        ctx.drawImage(frame, offsetX, offsetY, drawW, drawH);
        const imageData = ctx.getImageData(0, 0, canvasW, canvasH);
        frameDataList.push(imageData.data.buffer);

        // 遅延配列が渡された場合はそれぞれの要素を、数値の場合は単一数値を設定
        delays.push(isDelayArray ? delayMsOrArray[i] : delayMsOrArray);
    }

    // UPNG.encodeでAPNG生成
    // 第4引数: 0 = ロスレス, >0 = 色数（パレット）
    const apngBuffer = UPNG.encode(
        frameDataList,
        canvasW,
        canvasH,
        cnum,    // 色数（0で可逆、数値指定で減色圧縮）
        delays,  // 各フレームの遅延
        { loop: loopCount }  // ループ回数
    );

    return apngBuffer;
}

/**
 * ArrayBufferをBlobに変換
 * @param {ArrayBuffer} buffer
 * @returns {Blob}
 */
export function apngBufferToBlob(buffer) {
    return new Blob([buffer], { type: 'image/png' });
}

/**
 * Blobをダウンロードする
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
