// 韓愈書房：全部用程式化幾何與 canvas 貼圖，不需外部模型檔。
import * as THREE from 'three';

const ROOM = { w: 10, d: 8, h: 3.4 };

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

function rand(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function woodTex(base, dark, seed = 7, rep) {
  return canvasTex(256, 256, (g, w, h) => {
    const r = rand(seed);
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = dark;
      g.globalAlpha = 0.08 + r() * 0.18;
      g.lineWidth = 0.6 + r() * 2.2;
      const y = r() * h;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x / 40 + i) * 3 * r());
      g.stroke();
    }
    g.globalAlpha = 1;
  }, rep);
}

function floorTex() {
  return canvasTex(512, 512, (g, w, h) => {
    const r = rand(3);
    const rows = 8;
    for (let i = 0; i < rows; i++) {
      const y = (i * h) / rows;
      const shade = 0.82 + r() * 0.18;
      g.fillStyle = `rgb(${Math.round(120 * shade)},${Math.round(82 * shade)},${Math.round(52 * shade)})`;
      g.fillRect(0, y, w, h / rows);
      for (let k = 0; k < 14; k++) {
        g.strokeStyle = 'rgba(60,35,20,0.25)';
        g.lineWidth = 1;
        const yy = y + r() * (h / rows);
        g.beginPath();
        g.moveTo(0, yy);
        g.bezierCurveTo(w * 0.3, yy + 3, w * 0.6, yy - 3, w, yy + 1);
        g.stroke();
      }
      g.fillStyle = 'rgba(30,18,10,0.6)';
      g.fillRect(0, y, w, 2);
      const cut = r() * w;
      g.fillRect(cut, y, 2, h / rows);
    }
  }, [3, 3]);
}

function plasterTex() {
  return canvasTex(256, 256, (g, w, h) => {
    const r = rand(11);
    g.fillStyle = '#e9dcc0';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      g.fillStyle = `rgba(120,95,60,${r() * 0.06})`;
      g.fillRect(r() * w, r() * h, 2, 2);
    }
  }, [4, 2]);
}

// 直排文字（書法感，用系統襯線字型）
function vText(g, text, x, y, size, color, gap = 1.12) {
  g.fillStyle = color;
  g.font = `bold ${size}px "Noto Serif TC","Songti TC","PMingLiU","MingLiU",serif`;
  g.textAlign = 'center';
  g.textBaseline = 'top';
  [...text].forEach((ch, i) => g.fillText(ch, x, y + i * size * gap));
}

function scrollTex(name, sub, seed) {
  return canvasTex(256, 640, (g, w, h) => {
    const r = rand(seed);
    g.fillStyle = '#efe3c4';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(140,110,60,${r() * 0.07})`;
      g.fillRect(r() * w, r() * h, 3, 3);
    }
    g.strokeStyle = '#8a6a3a';
    g.lineWidth = 6;
    g.strokeRect(14, 14, w - 28, h - 28);
    // 簡筆人物：頭、冠、袍
    g.fillStyle = '#2b241d';
    g.globalAlpha = 0.85;
    g.beginPath();
    g.arc(w / 2, 210, 34, 0, Math.PI * 2);
    g.fill();
    g.fillRect(w / 2 - 18, 160, 36, 16);
    g.beginPath();
    g.moveTo(w / 2 - 30, 245);
    g.quadraticCurveTo(w / 2 - 95, 380, w / 2 - 80, 470);
    g.lineTo(w / 2 + 80, 470);
    g.quadraticCurveTo(w / 2 + 95, 380, w / 2 + 30, 245);
    g.closePath();
    g.fill();
    g.globalAlpha = 1;
    g.fillStyle = '#efe3c4';
    g.fillRect(w / 2 - 3, 260, 6, 200);
    vText(g, name, 44, 40, 34, '#2b241d');
    g.fillStyle = '#b3342a';
    g.fillRect(w - 66, h - 92, 40, 40);
    vText(g, sub, w / 2, 500, 26, '#5a4630');
  });
}

function silkTex(label, letter, seed) {
  return canvasTex(256, 640, (g, w, h) => {
    const r = rand(seed);
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#efe6cf');
    grd.addColorStop(1, '#d9caa6');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    // 山水淡墨
    g.globalAlpha = 0.25;
    g.fillStyle = '#3a4a44';
    g.beginPath();
    g.moveTo(0, h * 0.78);
    for (let x = 0; x <= w; x += 20) g.lineTo(x, h * (0.62 + r() * 0.12));
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.fill();
    g.globalAlpha = 1;
    g.fillStyle = '#8a2a1e';
    g.beginPath();
    g.arc(w / 2, 70, 34, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#f7efe0';
    g.font = 'bold 40px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(letter, w / 2, 72);
    const size = label.length > 6 ? 30 : 38;
    vText(g, label.replace(/、/g, ''), w / 2, 130, size, '#2b241d');
  });
}

function plaqueTex(text) {
  return canvasTex(512, 160, (g, w, h) => {
    g.fillStyle = '#3a2416';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9a24a';
    g.lineWidth = 8;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#e8c467';
    g.font = 'bold 92px "Noto Serif TC","PMingLiU",serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 4);
  });
}

function slipTex(text) {
  return canvasTex(64, 512, (g, w, h) => {
    g.fillStyle = '#d6b679';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(90,60,20,0.25)';
    g.fillRect(0, 0, 4, h);
    g.fillRect(w - 4, 0, 4, h);
    vText(g, text, w / 2, 16, 40, '#2b1d10', 1.05);
  });
}

function mat(opts) {
  return new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, ...opts });
}

function box(w, h, d, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// 每個機關物件：group 放在場景中，userData.id 對應 PUZZLES 的 id
export function buildRoom(scene, slipTexts, screenLabels, portraitNames) {
  const W = ROOM.w / 2;
  const D = ROOM.d / 2;
  const colliders = []; // [minX, minZ, maxX, maxZ]
  const items = {};

  const woodDark = mat({ map: woodTex('#5a3a22', '#2a170b', 5) });
  const woodMid = mat({ map: woodTex('#7a5232', '#3b2414', 9) });
  const woodRed = mat({ map: woodTex('#7a2e22', '#3b130d', 13), roughness: 0.55 });
  const brass = mat({ color: '#c9a24a', metalness: 0.8, roughness: 0.35 });

  // 地板、牆、天花板
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.w, ROOM.d),
    mat({ map: floorTex(), roughness: 0.7 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = mat({ map: plasterTex(), roughness: 0.95 });
  const walls = [
    [ROOM.w, 0, -D, 0],
    [ROOM.w, 0, D, Math.PI],
    [ROOM.d, -W, 0, Math.PI / 2],
    [ROOM.d, W, 0, -Math.PI / 2]
  ];
  walls.forEach(([len, x, z, ry]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, ROOM.h), wallMat);
    m.position.set(x, ROOM.h / 2, z);
    m.rotation.y = ry;
    m.receiveShadow = true;
    scene.add(m);
    // 牆裙
    const skirt = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.9), woodDark);
    skirt.position.set(x, 0.45, z);
    skirt.rotation.y = ry;
    skirt.translateZ(0.01);
    scene.add(skirt);
  });
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), woodDark);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = ROOM.h;
  scene.add(ceil);
  for (let x = -W + 1; x < W; x += 2) scene.add(box(0.22, 0.25, ROOM.d, woodMid, x, ROOM.h - 0.12, 0));
  // 柱子
  [[-W + 0.15, -D + 0.15], [W - 0.15, -D + 0.15], [-W + 0.15, D - 0.15], [W - 0.15, D - 0.15]].forEach(([x, z]) =>
    scene.add(box(0.3, ROOM.h, 0.3, woodRed, x, ROOM.h / 2, z))
  );

  // 北牆：門與匾額
  const doorFrame = new THREE.Group();
  doorFrame.add(box(0.2, 2.6, 0.25, woodRed, -0.95, 1.3, -D + 0.1));
  doorFrame.add(box(0.2, 2.6, 0.25, woodRed, 0.95, 1.3, -D + 0.1));
  doorFrame.add(box(2.1, 0.22, 0.25, woodRed, 0, 2.6, -D + 0.1));
  scene.add(doorFrame);
  const outside = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 2.5),
    new THREE.MeshBasicMaterial({ color: '#fff4d6' })
  );
  outside.position.set(0, 1.25, -D - 0.02);
  scene.add(outside);
  const doors = [];
  [-1, 1].forEach((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.85, 0, -D + 0.12);
    const leaf = new THREE.Group();
    const panel = box(0.85, 2.45, 0.08, woodRed, -side * 0.425, 1.25, 0);
    leaf.add(panel);
    for (let i = 0; i < 4; i++) leaf.add(box(0.7, 0.04, 0.1, woodDark, -side * 0.425, 1.5 + i * 0.22, 0));
    for (let i = 0; i < 4; i++) leaf.add(box(0.04, 0.9, 0.1, woodDark, -side * (0.12 + i * 0.2), 1.83, 0));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 20), brass);
    ring.position.set(-side * 0.08, 1.2, 0.07);
    leaf.add(ring);
    pivot.add(leaf);
    scene.add(pivot);
    doors.push({ pivot, side });
  });
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), mat({ map: plaqueTex('昌黎書房') }));
  plaque.position.set(0, 3.0, -D + 0.03);
  scene.add(plaque);
  colliders.push([-W, -D, -1.0, -D + 0.3], [1.0, -D, W, -D + 0.3]);
  const doorBlock = [-1.0, -D, 1.0, -D + 0.3];
  colliders.push(doorBlock);

  // 東牆：窗
  const win = new THREE.Group();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), new THREE.MeshBasicMaterial({ color: '#fde7b0' }));
  win.add(glow);
  for (let i = -5; i <= 5; i++) {
    const v = box(0.03, 1.4, 0.04, woodDark, i * 0.2, 0, 0.02);
    v.castShadow = false;
    win.add(v);
  }
  for (let i = -3; i <= 3; i++) {
    const h = box(2.2, 0.03, 0.04, woodDark, 0, i * 0.2, 0.02);
    h.castShadow = false;
    win.add(h);
  }
  win.add(box(2.4, 0.1, 0.12, woodRed, 0, -0.75, 0.04));
  win.add(box(2.4, 0.1, 0.12, woodRed, 0, 0.75, 0.04));
  win.position.set(W - 0.02, 1.9, 1.6);
  win.rotation.y = -Math.PI / 2;
  scene.add(win);

  // 1. 書櫃（西牆北側）
  {
    const g = new THREE.Group();
    g.add(box(2.0, 2.4, 0.5, woodDark, 0, 1.2, 0));
    const books = ['#7a2e22', '#35566e', '#5c6b3a', '#8a6a3a', '#3a3a52'];
    const r = rand(21);
    for (let s = 0; s < 3; s++) {
      const y = 1.05 + s * 0.48;
      g.add(box(1.86, 0.04, 0.44, woodMid, 0, y - 0.02, 0.03));
      let x = -0.85;
      while (x < 0.8) {
        const bw = 0.05 + r() * 0.05;
        const bh = 0.28 + r() * 0.12;
        const b = box(bw, bh, 0.3, mat({ color: books[Math.floor(r() * books.length)] }), x + bw / 2, y + bh / 2, 0.06);
        g.add(b);
        x += bw + 0.01;
      }
    }
    for (let i = 0; i < 3; i++) {
      const dr = box(0.56, 0.36, 0.06, woodRed, -0.62 + i * 0.62, 0.45, 0.26);
      g.add(dr);
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), brass);
      k.position.set(-0.62 + i * 0.62, 0.45, 0.31);
      g.add(k);
    }
    g.position.set(-W + 0.3, 0, -2.0);
    g.rotation.y = Math.PI / 2;
    scene.add(g);
    items.bookcase = { group: g, focus: new THREE.Vector3(-W + 0.6, 0.9, -2.0), top: 2.6 };
    colliders.push([-W, -3.05, -W + 0.6, -0.95]);
  }

  // 2. 天平（門邊小几）
  {
    const g = new THREE.Group();
    g.add(box(0.9, 0.7, 0.6, woodRed, 0, 0.35, 0));
    g.add(box(1.0, 0.05, 0.7, woodMid, 0, 0.72, 0));
    const post = box(0.04, 0.55, 0.04, brass, 0, 1.0, 0);
    g.add(post);
    const beam = new THREE.Group();
    beam.add(box(0.7, 0.03, 0.03, brass, 0, 0, 0));
    [-0.33, 0.33].forEach((x) => {
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.03, 20), brass);
      pan.position.set(x, -0.22, 0);
      beam.add(pan);
      beam.add(box(0.01, 0.22, 0.01, brass, x, -0.11, 0));
    });
    beam.position.y = 1.27;
    beam.rotation.z = 0.18;
    g.add(beam);
    g.position.set(-2.6, 0, -D + 0.75);
    scene.add(g);
    items.scale = { group: g, focus: new THREE.Vector3(-2.6, 1.1, -D + 0.75), top: 1.7, beam };
    colliders.push([-3.1, -D, -2.1, -D + 1.1]);
  }

  // 3. 屏風（東側，五扇）
  {
    const g = new THREE.Group();
    const panels = [];
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Group();
      const frame = box(0.62, 1.9, 0.05, woodRed, 0, 0.95 + 0.12, 0);
      p.add(frame);
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(0.52, 1.7),
        mat({ map: silkTex(screenLabels[i], 'ABCDE'[i], 30 + i), emissive: '#fff2c0', emissiveIntensity: 0 })
      );
      m.position.set(0, 1.07, 0.03);
      p.add(m);
      p.position.set((i - 2) * 0.62, 0, Math.abs(i - 2) * 0.12 * (i % 2 ? -1 : 1));
      p.rotation.y = (i % 2 ? 1 : -1) * 0.25;
      g.add(p);
      panels.push(m);
    }
    g.position.set(W - 1.3, 0, -1.0);
    g.rotation.y = -Math.PI / 2;
    scene.add(g);
    items.screen = { group: g, focus: new THREE.Vector3(W - 1.4, 1.1, -1.0), top: 2.3, panels };
    colliders.push([W - 1.6, -2.7, W - 1.0, 0.7]);
  }

  // 書案（中央偏北）：放硯台、信封、書匣
  {
    const desk = new THREE.Group();
    desk.add(box(2.4, 0.08, 1.0, woodRed, 0, 0.78, 0));
    [[-1.1, -0.42], [1.1, -0.42], [-1.1, 0.42], [1.1, 0.42]].forEach(([x, z]) => desk.add(box(0.1, 0.78, 0.1, woodDark, x, 0.39, z)));
    desk.add(box(2.2, 0.12, 0.06, woodDark, 0, 0.68, 0.45));
    desk.position.set(0, 0, -1.2);
    scene.add(desk);
    colliders.push([-1.3, -1.8, 1.3, -0.6]);
    // 燭台
    const candle = new THREE.Group();
    candle.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 16), brass));
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 12), mat({ color: '#f3ead2' }));
    wax.position.y = 0.1;
    candle.add(wax);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffcc66' }));
    flame.scale.y = 1.8;
    flame.position.y = 0.21;
    candle.add(flame);
    candle.position.set(-0.95, 0.82, -1.45);
    scene.add(candle);
    items._candle = { flame, pos: new THREE.Vector3(-0.95, 1.1, -1.45) };
  }

  // 4. 硯台
  {
    const g = new THREE.Group();
    const stone = box(0.32, 0.05, 0.22, mat({ color: '#2a2a2e', roughness: 0.4 }), 0, 0.845, 0);
    g.add(stone);
    const well = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 20), mat({ color: '#0b0b0d', roughness: 0.1 }));
    well.position.set(-0.08, 0.872, 0);
    g.add(well);
    const ink = box(0.04, 0.03, 0.12, mat({ color: '#111' }), 0.09, 0.885, 0);
    ink.rotation.y = 0.3;
    g.add(ink);
    const note = box(0.18, 0.003, 0.1, mat({ color: '#f1e6c8' }), 0.02, 0.82, 0.14);
    g.add(note);
    // 毛筆
    const brush = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8), mat({ color: '#6b4a2a' }));
    brush.rotation.z = Math.PI / 2;
    brush.position.set(0, 0.835, -0.16);
    g.add(brush);
    g.position.set(0.55, 0, -1.25);
    scene.add(g);
    items.inkstone = { group: g, focus: new THREE.Vector3(0.55, 0.9, -1.25), top: 1.2 };
  }

  // 7. 信封
  {
    const g = new THREE.Group();
    const env = box(0.24, 0.012, 0.14, mat({ color: '#e7d6ac' }), 0, 0.83, 0);
    env.rotation.y = -0.25;
    g.add(env);
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 16), mat({ color: '#a32a1e' }));
    seal.position.set(0, 0.84, 0);
    g.add(seal);
    g.position.set(-0.45, 0, -1.0);
    scene.add(g);
    items.letter = { group: g, focus: new THREE.Vector3(-0.45, 0.85, -1.0), top: 1.15 };
  }

  // 8. 書匣
  {
    const g = new THREE.Group();
    g.add(box(0.5, 0.2, 0.32, woodDark, 0, 0.92, 0));
    const lid = new THREE.Group();
    lid.add(box(0.52, 0.06, 0.34, woodRed, 0, 0.03, 0.17));
    lid.position.set(0, 1.02, -0.17);
    g.add(lid);
    const lock = box(0.07, 0.07, 0.02, brass, 0, 0.94, 0.17);
    g.add(lock);
    const paper = box(0.4, 0.04, 0.24, mat({ color: '#f5ecd2' }), 0, 0.98, 0);
    g.add(paper);
    g.position.set(0.05, 0, -1.5);
    scene.add(g);
    items.box = { group: g, focus: new THREE.Vector3(0.05, 1.0, -1.5), top: 1.4, lid, lock };
  }

  // 5. 四幅畫像（西牆南側）
  {
    const g = new THREE.Group();
    const scrolls = [];
    portraitNames.forEach(([name, sub], i) => {
      const s = new THREE.Group();
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.5), mat({ map: scrollTex(name, sub, 40 + i) }));
      s.add(m);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 10), woodDark);
      rod.rotation.z = Math.PI / 2;
      rod.position.y = -0.77;
      s.add(rod);
      const rod2 = rod.clone();
      rod2.position.y = 0.77;
      s.add(rod2);
      s.position.set((i - 1.5) * 0.85, 1.75, 0);
      g.add(s);
      scrolls.push(s);
    });
    g.position.set(-W + 0.04, 0, 1.6);
    g.rotation.y = Math.PI / 2;
    scene.add(g);
    // 下方長凳，避免走進牆
    const bench = box(0.4, 0.45, 2.6, woodMid, -W + 0.35, 0.225, 1.6);
    scene.add(bench);
    items.portraits = { group: g, focus: new THREE.Vector3(-W + 0.3, 1.5, 1.6), top: 2.75, scrolls };
    colliders.push([-W, 0.25, -W + 0.6, 2.95]);
  }

  // 6. 竹簡（東南茶几）
  {
    const g = new THREE.Group();
    g.add(box(1.2, 0.06, 0.7, woodRed, 0, 0.42, 0));
    [[-0.52, -0.28], [0.52, -0.28], [-0.52, 0.28], [0.52, 0.28]].forEach(([x, z]) => g.add(box(0.07, 0.42, 0.07, woodDark, x, 0.21, z)));
    const slips = [];
    slipTexts.forEach((t, i) => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.5), [
        mat({ color: '#c9a565' }), mat({ color: '#c9a565' }),
        mat({ map: slipTex(t) }), mat({ color: '#b8935a' }),
        mat({ color: '#c9a565' }), mat({ color: '#c9a565' })
      ]);
      s.position.set(-0.27 + i * 0.18, 0.457, 0);
      s.material[2].map.rotation = 0;
      g.add(s);
      slips.push(s);
    });
    g.position.set(2.6, 0, 2.4);
    scene.add(g);
    items.slips = { group: g, focus: new THREE.Vector3(2.6, 0.5, 2.4), top: 0.95, slips };
    colliders.push([1.95, 2.0, 3.25, 2.8]);
  }

  // 裝飾：坐墊、花瓶、地毯
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.6), mat({ color: '#7b2b24', roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.005, 0.6);
  rug.receiveShadow = true;
  scene.add(rug);
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.6, 20), mat({ color: '#2f5a6e', roughness: 0.3 }));
  vase.position.set(W - 0.5, 0.3, D - 0.5);
  scene.add(vase);
  colliders.push([W - 0.8, D - 0.8, W, D]);

  return { colliders, items, doors, doorBlock, bounds: { minX: -W + 0.35, maxX: W - 0.35, minZ: -D + 0.35, maxZ: D - 0.35 } };
}

export { ROOM };
