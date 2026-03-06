/**
 * 多言語対応（日本語 / 英語）
 */

const ja = {
    APP_NAME: 'Animake',
    PROP_use: '用途',
    PROP_useItemLine: 'LINEスタンプ向け',
    PROP_useItemWeb: 'Web向け',
    PROP_tabAnim: 'アニメーション',
    PROP_tabAnimFps: 'フレームレート (FPS)',
    PROP_tabAnimLoop: 'ループ',
    PROP_tabAnimLoopInitiny: '無限ループ',
    PROP_tabAnimLoopNum: 'ループ回数',
    PROP_tabAnimDuration: '再生時間 (秒)',             // ADDED
    PROP_tabAnimDurationHelp: 'LINEスタンプは1,2,3,4秒のいずれかで作成する必要があります。', // ADDED
    PROP_tabQuality: '画質・出力',
    PROP_tabQualityHApng: 'APNGを出力',
    PROP_tabQualityHWebp: 'WebP（静止画）を出力',
    PROP_tabQualityCompress: 'ファイル容量を圧縮する（軽量化）', // ADDED
    PROP_btnSave: 'アニメ画像を保存する',
    HELP_fps: '1秒間あたりの画像枚数。数値が大きいほど滑らかになりますが、ファイルサイズも大きくなります。',
    HELP_loop: 'アニメーションを繰り返す回数。LINEスタンプの場合は規定ルールがあります。',
    RULE_title: 'LINEチェックルール',
    RULE_animation_stamp: 'アニメーションスタンプ',
    RULE_animation_main: 'メイン画像',
    RULE_popup: 'ポップアップスタンプ',
    RULE_effect: 'エフェクトスタンプ',
    RULE_emoji: 'アニメーション絵文字',
    DROP_text: 'PNG連番画像をここにドラッグ＆ドロップ',
    DROP_subtext: 'またはクリックしてファイルを選択',
    GUIDE_title: '使い方ガイド',
    GUIDE_step1: '1. 用途を選ぶ（LINE用かWeb用か）',
    GUIDE_step2: '2. 連番PNG画像をドロップする',
    GUIDE_step3: '3. プレビューを確認して保存する',
    VALIDATE_title: 'バリデーション結果',
    LOADING: '生成中...',
    VALIDATE_fileSize: 'ファイルサイズ',
    VALIDATE_frameCount: 'フレーム数',
    VALIDATE_loopCount: 'ループ回数',
    VALIDATE_duration: '再生時間',
    VALIDATE_imageSize: '画像サイズ',
    VALIDATE_pass: 'OK',
    VALIDATE_fileSizeOver: 'ファイルサイズが{max}KBを超えています',
    VALIDATE_frameCountRange: 'フレーム数は{min}〜{max}枚にしてください',
    VALIDATE_loopCountRange: 'ループ回数は{min}〜{max}回にしてください',
    VALIDATE_durationRange: '再生時間は{allowed}秒のいずれかにしてください（現在: {current}秒）',
    VALIDATE_imageSizeExact: '画像サイズは{w}×{h}pxにしてください',
    VALIDATE_imageSizeMax: '画像サイズは幅{maxW}px以下、高さ{maxH}px以下、少なくとも片辺{minSide}px以上にしてください',
    VALIDATE_imageSizeExactWidth: '幅は{w}px、高さは{minH}px以上、長辺は{minLong}px以上にしてください',
    TOAST_saved: 'ファイルを保存しました！',
    TOAST_error: 'エラーが発生しました',
    TOAST_noFormat: '出力画像の形式を選択ください',
    TOAST_sizeMismatch: '連番画像のサイズが異なります。統一してください。',
    INFO_size: 'サイズ: {w}×{h}px',
    INFO_frames: 'フレーム数: {n}枚',
    INFO_duration: '再生時間: {t}秒',
};

const en = {
    APP_NAME: 'Animake',
    PROP_use: 'Purpose',
    PROP_useItemLine: 'For LINE Stickers',
    PROP_useItemWeb: 'For Web',
    PROP_tabAnim: 'Animation',
    PROP_tabAnimFps: 'Frame Rate (FPS)',
    PROP_tabAnimLoop: 'Loop',
    PROP_tabAnimLoopInitiny: 'Infinite Loop',
    PROP_tabAnimLoopNum: 'Loop Count',
    PROP_tabAnimDuration: 'Duration (sec)',          // ADDED
    PROP_tabAnimDurationHelp: 'LINE stickers must be exactly 1, 2, 3, or 4 seconds long.', // ADDED
    PROP_tabQuality: 'Quality & Output',
    PROP_tabQualityHApng: 'Export APNG',
    PROP_tabQualityHWebp: 'Export WebP (still)',
    PROP_tabQualityCompress: 'Compress file size (Color reduction)', // ADDED
    PROP_btnSave: 'Save Animation Image',
    HELP_fps: 'Frames per second. Higher values make it smoother but increase file size.',
    HELP_loop: 'Number of times the animation repeats. LINE stickers have specific rules.',
    RULE_title: 'LINE Validation Rule',
    RULE_animation_stamp: 'Animation Sticker',
    RULE_animation_main: 'Main Image',
    RULE_popup: 'Popup Sticker',
    RULE_effect: 'Effect Sticker',
    RULE_emoji: 'Animated Emoji',
    DROP_text: 'Drag & drop sequential PNG images here',
    DROP_subtext: 'or click to select files',
    GUIDE_title: 'How to Use',
    GUIDE_step1: '1. Select purpose (LINE or Web)',
    GUIDE_step2: '2. Drop sequential PNG images',
    GUIDE_step3: '3. Check preview & Save',
    VALIDATE_title: 'Validation Results',
    LOADING: 'Generating...',
    VALIDATE_fileSize: 'File Size',
    VALIDATE_frameCount: 'Frame Count',
    VALIDATE_loopCount: 'Loop Count',
    VALIDATE_duration: 'Duration',
    VALIDATE_imageSize: 'Image Size',
    VALIDATE_pass: 'OK',
    VALIDATE_fileSizeOver: 'File size exceeds {max}KB',
    VALIDATE_frameCountRange: 'Frame count must be {min}–{max}',
    VALIDATE_loopCountRange: 'Loop count must be {min}–{max}',
    VALIDATE_durationRange: 'Duration must be one of {allowed}s (current: {current}s)',
    VALIDATE_imageSizeExact: 'Image size must be {w}×{h}px',
    VALIDATE_imageSizeMax: 'Image must be ≤{maxW}px wide, ≤{maxH}px tall, at least one side ≥{minSide}px',
    VALIDATE_imageSizeExactWidth: 'Width must be {w}px, height ≥{minH}px, long side ≥{minLong}px',
    TOAST_saved: 'File saved!',
    TOAST_error: 'An error occurred',
    TOAST_noFormat: 'Please select an export format.',
    TOAST_sizeMismatch: 'Image sizes do not match. Please ensure all frames are the same size.',
    INFO_size: 'Size: {w}×{h}px',
    INFO_frames: 'Frames: {n}',
    INFO_duration: 'Duration: {t}s',
};

const messages = { ja, en };
let currentLang = navigator.language.startsWith('ja') ? 'ja' : 'en';

export function getLang() {
    return currentLang;
}

export function setLang(lang) {
    currentLang = lang;
}

export function t(key, params = {}) {
    let msg = messages[currentLang]?.[key] ?? messages['ja'][key] ?? key;
    for (const [k, v] of Object.entries(params)) {
        msg = msg.replace(`{${k}}`, String(v));
    }
    return msg;
}

export function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            el.textContent = t(key);
        }
    });
}
