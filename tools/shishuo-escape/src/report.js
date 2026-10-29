// 結局時把各組成績送到 nowel-tools 的 Firebase（game_scores 集合，規則已開放寫入）。
// 只送班級代號、組別與遊戲數據，不含個資。失敗不影響遊戲。
export const FIREBASE = {
  apiKey: 'AIzaSyBMTe5eLI3GKmLz6beXvfnaBgQaXJsr-xM',
  authDomain: 'my-teaching-tools-b8e86.firebaseapp.com',
  projectId: 'my-teaching-tools-b8e86',
  storageBucket: 'my-teaching-tools-b8e86.firebasestorage.app',
  messagingSenderId: '47224328529',
  appId: '1:47224328529:web:6e6f761ff6b455f9db0370'
};
export const GAME_ID = 'shishuo-escape';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.0/';

export async function reportResult(S) {
  const appMod = SDK + 'firebase-app.js';
  const fsMod = SDK + 'firebase-firestore.js';
  const { initializeApp } = await import(appMod);
  const { getFirestore, collection, addDoc, serverTimestamp } = await import(fsMod);
  const app = initializeApp(FIREBASE, 'escape-' + Date.now());
  await addDoc(collection(getFirestore(app), 'game_scores'), {
    game: GAME_ID,
    class_name: S.cls || '未填',
    group: S.group,
    time_sec: Math.round(((S.end || Date.now()) - S.start) / 1000),
    errors: S.errors,
    hints: S.hints,
    created_at: serverTimestamp()
  });
}
