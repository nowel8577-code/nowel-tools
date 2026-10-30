// 結局時把各組成績送到老師 Google 帳號裡的「〈赤壁賦〉3D 密室逃脫成績（自動送出）」表單。
// 只送班級代號、組別與遊戲數據，不含個資。老師在該表單的「回覆」分頁看成績。
const FORM_POST =
  'https://docs.google.com/forms/d/e/1FAIpQLSfcfpUkb0qXYDxFYiT_MywtGLNVkjURHJ4kq8UeYjwW3v0T3A/formResponse';
const ENTRY = {
  cls: 'entry.1500130960',
  group: 'entry.1614532233',
  sec: 'entry.195165058',
  time: 'entry.432752537',
  errors: 'entry.2146959120',
  hints: 'entry.1696722856'
};

export async function reportResult(S) {
  const sec = Math.round(((S.end || Date.now()) - S.start) / 1000);
  const body = new URLSearchParams({
    [ENTRY.cls]: S.cls || '未填',
    [ENTRY.group]: String(S.group),
    [ENTRY.sec]: String(sec),
    [ENTRY.time]: `${Math.floor(sec / 60)} 分 ${sec % 60} 秒`,
    [ENTRY.errors]: String(S.errors),
    [ENTRY.hints]: String(S.hints)
  });
  // Google 表單不回傳 CORS 標頭，用 no-cors 送出；網路斷線時 fetch 會丟錯，交給呼叫端處理
  await fetch(FORM_POST, { method: 'POST', mode: 'no-cors', body });
}
