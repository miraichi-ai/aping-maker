/**
 * APNG生成モジュール
 * UPNG.jsを使用してブラウザ内でAPNGファイルを生成する
 */
import UPNG from 'upng-js';

/**
 * 複数のImageBitmapからAPNGバイナリを生成する
 * @param {ImageBitmap[]} frames - フレーム画像の配列
 * @param {number} delayMs - 1フレームあたりの遅延時間(ミリ秒)
 * @param {number} loopCount - ループ回数 (0 = 無限)
 * @param {number} cnum - 色数（0 = lossless, 256などで減色処理）
 * @returns {ArrayBuffer} APNGバイナリ
 */
export function generateApng(frames, delayMs, loopCount, cnum = 0) {
    if (frames.length === 0) {
        throw new Error('No frames provided');
    }

    const width = frames[0].width;
    const height = frames[0].height;

    // 各フレームのRGBAデータを取得
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const frameDataList = [];
    const delays = [];

    for (const frame of frames) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(frame, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);
        frameDataList.push(imageData.data.buffer);
        delays.push(delayMs);
    }

    // UPNG.encodeでAPNG生成
    // 第4引数: 0 = ロスレス, >0 = 色数（パレット）
    const apngBuffer = UPNG.encode(
        frameDataList,
        width,
        height,
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
