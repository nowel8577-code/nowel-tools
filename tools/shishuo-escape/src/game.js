import * as THREE from 'three';
import { buildRoom } from './scene.js';
import { PUZZLES, PASSWORD, FORM_URL } from './puzzles.js';

const SAVE_KEY = 'shishuo-escape-v1';
const GROUPS = 8;
const EYE = 1.55;
const SPEED = 2.6;
const REACH = 2.3;

const $ = (s) => document.querySelector(s);

// ---------- 存檔 ----------
function freshState(group) {
  return { group, solved: 0, errors: 0, hints: 0, start: Date.now(), end: 0, pos: [0, 2.6], yaw: 0 };
}
let S = null;
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
  } catch (e) {
    /* 無痕模式等情況存不了，不影響遊戲 */
  }
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    return s && typeof s.solved === 'number' ? s : null;
  } catch (e) {
    return null;
  }
}

// ---------- 畫面尺寸（iPad Safari 工具列會變） ----------
function fitViewport() {
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--appH', h + 'px');
}
fitViewport();
(window.visualViewport || window).addEventListener('resize', fitViewport);

// ---------- 渲染 ----------
const canvas = $('#c');
const coarse = matchMedia('(pointer:coarse)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = !coarse;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#2a1d14');
scene.fog = new THREE.Fog('#2a1d14', 9, 18);
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 50);

scene.add(new THREE.HemisphereLight('#ffe9c4', '#4a3220', 0.9));
const sun = new THREE.DirectionalLight('#ffe2a8', 1.6);
sun.position.set(8, 5, 2);
sun.target.position.set(0, 0, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 5, bottom: -5, near: 1, far: 20 });
scene.add(sun, sun.target);

const slipTexts = PUZZLES[5].items;
const screenLabels = PUZZLES[2].options;
const portraitNames = [['郯子', '少皞之後'], ['萇弘', '周大夫'], ['師襄', '魯樂官'], ['老聃', '周守藏史']];
const room = buildRoom(scene, slipTexts, screenLabels, portraitNames);

const candle = new THREE.PointLight('#ffb35c', 6, 6, 1.6);
candle.position.copy(room.items._candle.pos);
scene.add(candle);
const lamp = new THREE.PointLight('#ffcf8a', 4, 9, 1.5);
lamp.position.set(0, 3.0, 1.5);
scene.add(lamp);

// 目標標記：金色菱形
const marker = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.11),
  new THREE.MeshBasicMaterial({ color: '#ffd45a' })
);
const markerGlow = new THREE.PointLight('#ffd45a', 2.5, 2.2, 2);
marker.add(markerGlow);
scene.add(marker);

// ---------- 玩家 ----------
const P = { x: 0, z: 2.6, yaw: 0, pitch: -0.08 };
const keys = {};
const pad = { active: false, x: 0, y: 0, id: null };
let paused = true;

function collide(nx, nz) {
  const b = room.bounds;
  const doorOpen = S && S.solved >= PUZZLES.length;
  // 門開後，門洞中間可以走出去
  const minZ = doorOpen && Math.abs(nx) < 0.55 ? b.minZ - 1.2 : b.minZ;
  if (nz < b.minZ) nx = Math.max(-0.55, Math.min(0.55, nx));
  nx = Math.min(b.maxX, Math.max(b.minX, nx));
  nz = Math.min(b.maxZ, Math.max(minZ, nz));
  const r = 0.3;
  for (const c of room.colliders) {
    if (c === room.doorBlock && S && S.solved >= PUZZLES.length) continue;
    const cx = Math.max(c[0], Math.min(nx, c[2]));
    const cz = Math.max(c[1], Math.min(nz, c[3]));
    const dx = nx - cx;
    const dz = nz - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      const d = Math.sqrt(d2) || 0.0001;
      nx = cx + (dx / d) * r;
      nz = cz + (dz / d) * r;
    }
  }
  return [nx, nz];
}

// ---------- 輸入：鍵盤 ----------
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && !paused) {
    e.preventDefault();
    interact();
  }
});
addEventListener('keyup', (e) => (keys[e.code] = false));
addEventListener('blur', () => Object.keys(keys).forEach((k) => (keys[k] = false)));

// ---------- 輸入：搖桿 ----------
const padEl = $('#pad');
const knob = $('#knob');
function padMove(t) {
  const r = padEl.getBoundingClientRect();
  const R = r.width / 2;
  let dx = t.clientX - (r.left + R);
  let dy = t.clientY - (r.top + R);
  const len = Math.hypot(dx, dy);
  if (len > R) {
    dx = (dx / len) * R;
    dy = (dy / len) * R;
  }
  pad.x = dx / R;
  pad.y = dy / R;
  knob.style.transform = `translate(${dx}px,${dy}px)`;
}
function padEnd() {
  pad.active = false;
  pad.id = null;
  pad.x = pad.y = 0;
  knob.style.transform = '';
}
padEl.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  pad.active = true;
  pad.id = e.pointerId;
  padEl.setPointerCapture(e.pointerId);
  padMove(e);
});
padEl.addEventListener('pointermove', (e) => pad.active && e.pointerId === pad.id && padMove(e));
padEl.addEventListener('pointerup', padEnd);
padEl.addEventListener('pointercancel', padEnd);

// ---------- 輸入：拖曳轉視角、點擊物件 ----------
const drag = { id: null, x: 0, y: 0, moved: 0 };
canvas.addEventListener('pointerdown', (e) => {
  if (paused || drag.id !== null) return;
  drag.id = e.pointerId;
  drag.x = e.clientX;
  drag.y = e.clientY;
  drag.moved = 0;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  drag.x = e.clientX;
  drag.y = e.clientY;
  drag.moved += Math.abs(dx) + Math.abs(dy);
  const k = e.pointerType === 'mouse' ? 0.004 : 0.006;
  P.yaw -= dx * k;
  P.pitch = Math.max(-1.1, Math.min(0.9, P.pitch - dy * k));
});
function dragEnd(e) {
  if (e.pointerId !== drag.id) return;
  drag.id = null;
  if (drag.moved < 8) tapAt(e.clientX, e.clientY);
}
canvas.addEventListener('pointerup', dragEnd);
canvas.addEventListener('pointercancel', (e) => e.pointerId === drag.id && (drag.id = null));

const ray = new THREE.Raycaster();
function tapAt(x, y) {
  const r = canvas.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera);
  const ids = PUZZLES.map((p) => p.id);
  const hits = ray.intersectObjects(ids.map((id) => room.items[id].group), true);
  if (!hits.length) return;
  let o = hits[0].object;
  const id = ids.find((k) => {
    let n = o;
    while (n) {
      if (n === room.items[k].group) return true;
      n = n.parent;
    }
    return false;
  });
  if (!id) return;
  const it = room.items[id];
  if (Math.hypot(P.x - it.focus.x, P.z - it.focus.z) > REACH + 0.6) {
    toast(`走近一點，才能調查${PUZZLES.find((p) => p.id === id).name}。`);
    return;
  }
  openItem(id);
}

// ---------- HUD ----------
function current() {
  return PUZZLES[S.solved];
}
function fmt(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function updateHud() {
  $('#hud-group').textContent = `第 ${S.group} 組`;
  $('#hud-prog').textContent = `${Math.min(S.solved, PUZZLES.length)} / ${PUZZLES.length}`;
  const done = S.solved >= PUZZLES.length;
  $('#task').textContent = done ? '目標：門開了，走出書房！' : `目標：調查「${current().name}」`;
  document.querySelectorAll('#seals i').forEach((el, i) => el.classList.toggle('on', i < S.solved));
}
let toastT = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- 音效（WebAudio 合成，免音檔） ----------
let AC = null;
let muted = false;
function tone(freqs, dur = 0.18, type = 'sine', gap = 0.09, vol = 0.12) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = AC.createOscillator();
      const g = AC.createGain();
      o.type = type;
      o.frequency.value = f;
      const t = AC.currentTime + i * gap;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(AC.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  } catch (e) {
    /* 沒有音效也能玩 */
  }
}
const sfx = {
  ok: () => tone([523, 659, 784, 1047], 0.35, 'triangle'),
  bad: () => tone([196, 147], 0.25, 'square', 0.12, 0.06),
  open: () => tone([392, 494, 587], 0.25, 'triangle', 0.07),
  win: () => tone([523, 659, 784, 1047, 1319, 1568], 0.5, 'triangle', 0.12)
};

// ---------- 機關互動 ----------
function nearestActive() {
  if (S.solved >= PUZZLES.length) return null;
  const id = current().id;
  const it = room.items[id];
  const d = Math.hypot(P.x - it.focus.x, P.z - it.focus.z);
  return d <= REACH ? id : null;
}
function interact() {
  const id = nearestActive();
  if (id) openItem(id);
}
function openItem(id) {
  const idx = PUZZLES.findIndex((p) => p.id === id);
  if (idx < S.solved) {
    toast(`「${PUZZLES[idx].name}」已經解開了。`);
    return;
  }
  if (idx > S.solved) {
    toast(`這個機關還打不開。先去調查「${current().name}」。`);
    sfx.bad();
    return;
  }
  openPuzzle(idx);
}

let answer = null;
function openPuzzle(idx) {
  const p = PUZZLES[idx];
  paused = true;
  padEnd();
  sfx.open();
  $('#pz-title').textContent = p.title;
  $('#pz-story').textContent = p.story;
  $('#pz-prompt').textContent = p.prompt;
  $('#pz-msg').textContent = '';
  $('#pz-msg').className = '';
  $('#pz-hint').textContent = '';
  $('#pz-hintbtn').disabled = false;
  const body = $('#pz-body');
  body.innerHTML = '';
  answer = null;
  if (p.type === 'text') {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = p.placeholder || '';
    inp.autocomplete = 'off';
    inp.addEventListener('input', () => (answer = inp.value));
    inp.addEventListener('keydown', (e) => e.key === 'Enter' && submit());
    body.appendChild(inp);
    answer = '';
    if (!coarse) setTimeout(() => inp.focus(), 50);
  } else if (p.type === 'choice') {
    p.options.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'opt';
      b.innerHTML = `<b>${'ABCD'[i]}</b>${o}`;
      b.onclick = () => {
        answer = i;
        body.querySelectorAll('.opt').forEach((x) => x.classList.toggle('sel', x === b));
      };
      body.appendChild(b);
    });
  } else if (p.type === 'multi') {
    answer = new Set();
    p.options.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'opt';
      b.innerHTML = `<b>${'ABCDE'[i]}</b>${o}`;
      b.onclick = () => {
        answer.has(i) ? answer.delete(i) : answer.add(i);
        b.classList.toggle('sel', answer.has(i));
      };
      body.appendChild(b);
    });
  } else if (p.type === 'match') {
    answer = p.left.map(() => -1);
    p.left.forEach((name, i) => {
      const row = document.createElement('label');
      row.className = 'row';
      const sel = document.createElement('select');
      sel.innerHTML = '<option value="-1">選擇……</option>' + p.options.map((o, k) => `<option value="${k}">${o}</option>`).join('');
      sel.onchange = () => (answer[i] = +sel.value);
      row.innerHTML = `<span>${name}</span>`;
      row.appendChild(sel);
      body.appendChild(row);
    });
  } else if (p.type === 'toggle') {
    answer = p.items.map(() => -1);
    p.items.forEach((t, i) => {
      const b = document.createElement('button');
      b.className = 'opt slip';
      const label = () => (answer[i] < 0 ? '？' : p.states[answer[i]]);
      const html = t.replace(/師/g, '<u>師</u>');
      b.innerHTML = `<span>${'①②③④'[i]} ${html}</span><em>${label()}</em>`;
      b.onclick = () => {
        answer[i] = answer[i] === 0 ? 1 : 0;
        b.querySelector('em').textContent = label();
        b.classList.toggle('sel', true);
      };
      body.appendChild(b);
    });
  }
  $('#puzzle').classList.add('show');
}

function submit() {
  const p = current();
  if (!p) return;
  let ok = false;
  const empty =
    answer === null ||
    answer === '' ||
    (answer instanceof Set && answer.size === 0) ||
    (Array.isArray(answer) && answer.includes(-1));
  if (empty) {
    $('#pz-msg').textContent = '還沒作答完喔。';
    $('#pz-msg').className = 'warn';
    return;
  }
  ok = p.check(answer instanceof Set ? [...answer] : answer);
  if (!ok) {
    S.errors++;
    save();
    sfx.bad();
    $('#pz-msg').textContent = p.error;
    $('#pz-msg').className = 'bad';
    const card = $('#pz-card');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    return;
  }
  solve();
}

function solve() {
  const p = current();
  S.solved++;
  if (S.solved >= PUZZLES.length) S.end = Date.now();
  save();
  sfx.ok();
  effects[p.id] && effects[p.id]();
  $('#puzzle').classList.remove('show');
  $('#unlock-text').textContent = p.unlock;
  $('#unlock').classList.add('show');
  updateHud();
}

$('#pz-submit').onclick = submit;
$('#pz-close').onclick = () => {
  $('#puzzle').classList.remove('show');
  paused = false;
};
$('#pz-hintbtn').onclick = () => {
  S.hints++;
  save();
  $('#pz-hint').textContent = '提示：' + current().hint;
  $('#pz-hintbtn').disabled = true;
};
$('#unlock-ok').onclick = () => {
  $('#unlock').classList.remove('show');
  paused = false;
  if (S.solved >= PUZZLES.length) {
    toast('門開了！往北邊的門走出去。');
    sfx.win();
  }
};

// 解開後的場景變化（動畫目標值）
const anim = { scale: 0.18, door: 0, lid: 0, scrolls: 1, screenGlow: 0, slipsGlow: 0 };
const target = { ...anim };
const effects = {
  scale: () => (target.scale = 0),
  screen: () => (target.screenGlow = 1),
  portraits: () => (target.scrolls = 0.25),
  slips: () => (target.slipsGlow = 1),
  box: () => {
    target.lid = 1;
    target.door = 1;
  }
};
function applyStateInstant() {
  const done = PUZZLES.slice(0, S.solved).map((p) => p.id);
  Object.assign(target, { scale: 0.18, door: 0, lid: 0, scrolls: 1, screenGlow: 0, slipsGlow: 0 });
  done.forEach((id) => effects[id] && effects[id]());
  Object.assign(anim, target);
}

// ---------- 結局 ----------
function checkExit() {
  if (S.solved < PUZZLES.length || $('#ending').classList.contains('show')) return;
  if (P.z < -3.9) showEnding();
}
function showEnding() {
  paused = true;
  padEnd();
  sfx.win();
  const t = fmt((S.end || Date.now()) - S.start);
  $('#end-group').textContent = `第 ${S.group} 組`;
  $('#end-time').textContent = t;
  $('#end-err').textContent = S.errors;
  $('#end-hint').textContent = S.hints;
  $('#end-pass').textContent = PASSWORD;
  $('#ending').classList.add('show');
}
function cardPng() {
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 840;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 840);
  grd.addColorStop(0, '#f6ecd3');
  grd.addColorStop(1, '#e3d1a8');
  g.fillStyle = grd;
  g.fillRect(0, 0, 1200, 840);
  g.strokeStyle = '#8a2a1e';
  g.lineWidth = 14;
  g.strokeRect(30, 30, 1140, 780);
  g.strokeStyle = '#c9a24a';
  g.lineWidth = 3;
  g.strokeRect(52, 52, 1096, 736);
  g.textAlign = 'center';
  g.fillStyle = '#8a2a1e';
  g.font = 'bold 76px "Noto Serif TC","PMingLiU",serif';
  g.fillText('逃出昌黎書房', 600, 180);
  g.fillStyle = '#3b2f24';
  g.font = 'bold 52px "Noto Serif TC","PMingLiU",serif';
  g.fillText(`〈師說〉密室逃脫　第 ${S.group} 組`, 600, 290);
  g.font = '40px "Noto Serif TC","PMingLiU",serif';
  g.fillText(`用時 ${fmt((S.end || Date.now()) - S.start)}　答錯 ${S.errors} 次　提示 ${S.hints} 次`, 600, 390);
  g.font = 'bold 48px "Noto Serif TC","PMingLiU",serif';
  g.fillText(`「${PASSWORD.replace('。', '')}」`, 600, 520);
  g.font = '30px "Noto Serif TC","PMingLiU",serif';
  const d = new Date(S.end || Date.now());
  g.fillText(`${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`, 600, 640);
  g.fillStyle = '#b3342a';
  g.fillRect(940, 600, 120, 120);
  g.fillStyle = '#f6ecd3';
  g.font = 'bold 44px "Noto Serif TC","PMingLiU",serif';
  g.fillText('昌黎', 1000, 652);
  g.fillText('書房', 1000, 705);
  return c.toDataURL('image/png');
}
$('#end-download').onclick = () => {
  const a = document.createElement('a');
  a.href = cardPng();
  a.download = `師說密室逃脫_第${S.group}組.png`;
  a.click();
};
$('#end-again').onclick = () => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
  location.reload();
};

// ---------- 開始畫面 ----------
function startGame(state) {
  S = state;
  P.x = S.pos[0];
  P.z = S.pos[1];
  P.yaw = S.yaw || 0;
  applyStateInstant();
  updateHud();
  $('#title').classList.remove('show');
  $('#hud').classList.add('show');
  paused = false;
  if (AC && AC.state === 'suspended') AC.resume();
  if (S.solved === 0) toast(coarse ? '左下搖桿移動，拖曳畫面轉頭，點物件調查。' : 'WASD 移動，拖曳滑鼠轉頭，E 或點物件調查。');
}
(function initTitle() {
  const sel = $('#group');
  for (let i = 1; i <= GROUPS; i++) sel.insertAdjacentHTML('beforeend', `<option value="${i}">第 ${i} 組</option>`);
  const old = load();
  if (old && old.solved > 0 && old.solved <= PUZZLES.length) {
    $('#resume').hidden = false;
    $('#resume').textContent = `繼續第 ${old.group} 組（已解 ${old.solved} 關）`;
    $('#resume').onclick = () => startGame(old);
    sel.value = old.group;
  }
  $('#start').onclick = () => {
    if (!sel.value) {
      toast('請先選組別。');
      return;
    }
    startGame(freshState(+sel.value));
    save();
  };
  $('#form-link').href = FORM_URL;
})();

$('#btn-help').onclick = () => {
  paused = true;
  $('#help').classList.add('show');
};
$('#help-ok').onclick = () => {
  $('#help').classList.remove('show');
  paused = false;
};
$('#btn-sound').onclick = () => {
  muted = !muted;
  $('#btn-sound').textContent = muted ? '🔇' : '🔊';
};
$('#act').onclick = interact;

// ---------- 主迴圈 ----------
const clock = new THREE.Clock();
const fwd = new THREE.Vector3();
let saveT = 0;
function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 80 : 70;
    camera.updateProjectionMatrix();
  }
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  resize();

  if (!paused && S) {
    let mx = 0;
    let mz = 0;
    if (keys.KeyW || keys.ArrowUp) mz -= 1;
    if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA) mx -= 1;
    if (keys.KeyD) mx += 1;
    if (keys.ArrowLeft) P.yaw += 1.8 * dt;
    if (keys.ArrowRight) P.yaw -= 1.8 * dt;
    const kl = Math.hypot(mx, mz);
    if (kl > 0) {
      mx /= kl;
      mz /= kl;
    }
    if (pad.active) {
      mx = pad.x;
      mz = pad.y;
    }
    const mag = Math.min(1, Math.hypot(mx, mz));
    if (mag > 0.05) {
      const s = Math.sin(P.yaw);
      const c = Math.cos(P.yaw);
      const vx = (mx * c + mz * s) * SPEED * dt;
      const vz = (-mx * s + mz * c) * SPEED * dt;
      [P.x, P.z] = collide(P.x + vx, P.z + vz);
    }
    const near = nearestActive();
    const act = $('#act');
    act.hidden = !near;
    if (near) act.textContent = `調查「${PUZZLES.find((p) => p.id === near).name}」`;
    checkExit();
    saveT += dt;
    if (saveT > 2) {
      saveT = 0;
      S.pos = [P.x, P.z];
      S.yaw = P.yaw;
      save();
    }
    $('#hud-time').textContent = fmt((S.end || Date.now()) - S.start);
  }

  camera.position.set(P.x, EYE + (pad.active || keys.KeyW ? Math.sin(t * 9) * 0.015 : 0), P.z);
  fwd.set(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch));
  camera.lookAt(camera.position.clone().add(fwd));

  // 動畫
  const k = 1 - Math.pow(0.03, dt);
  for (const key in anim) anim[key] = lerp(anim[key], target[key], k);
  room.items.scale.beam.rotation.z = anim.scale + Math.sin(t * 1.5) * 0.02 * (anim.scale > 0.05 ? 1 : 0);
  room.doors.forEach((d) => (d.pivot.rotation.y = d.side * anim.door * 1.5));
  room.items.box.lid.rotation.x = -anim.lid * 1.6;
  room.items.portraits.scrolls.forEach((s) => (s.scale.y = Math.max(0.05, anim.scrolls)));
  room.items.screen.panels.forEach((m, i) => (m.material.emissiveIntensity = i === 1 || i === 4 ? anim.screenGlow * 0.6 : 0));
  room.items.slips.slips.forEach((s) => (s.material[2].emissive = new THREE.Color('#ffd27a').multiplyScalar(anim.slipsGlow * 0.35)));
  room.items._candle.flame.scale.x = 1 + Math.sin(t * 13) * 0.12;
  candle.intensity = 6 + Math.sin(t * 11) * 0.6 + Math.sin(t * 23) * 0.3;

  if (S && S.solved < PUZZLES.length) {
    const it = room.items[current().id];
    marker.visible = true;
    marker.position.set(it.focus.x, it.top + 0.18 + Math.sin(t * 2.5) * 0.06, it.focus.z);
    marker.rotation.y = t * 1.8;
  } else if (S) {
    marker.visible = true;
    marker.position.set(0, 2.2 + Math.sin(t * 2.5) * 0.06, -3.6);
    marker.rotation.y = t * 1.8;
  } else marker.visible = false;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// 除錯與自動測試用
window.__esc = {
  get state() {
    return S;
  },
  P,
  pad,
  PUZZLES,
  solveNext: () => solve(),
  open: (i) => openPuzzle(i),
  setAnswer: (a) => (answer = a),
  submit,
  teleport: (x, z) => ([P.x, P.z] = collide(x, z)),
  isPaused: () => paused
};
