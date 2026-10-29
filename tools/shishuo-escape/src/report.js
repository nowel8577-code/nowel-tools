// 結局時把各組成績送到老師 Google 帳號裡的「〈師說〉3D 密室逃脫成績（自動送出）」表單。
// 只送班級代號、組別與遊戲數據，不含個資。老師在該表單的「回覆」分頁看成績。
const FORM_POST =
  'https://docs.google.com/forms/d/e/1FAIpQLSdHYdrn2oxwV-ugJ0G1x17MBl-vVQ1UnemXZfe_KzuTXdD0iw/formResponse';
const ENTRY = {
  cls: 'entry.1037478255',
  group: 'entry.1513862361',
  sec: 'entry.1345280871',
  time: 'entry.620326444',
  errors: 'entry.2084796525',
  hints: 'entry.2051236230'
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
