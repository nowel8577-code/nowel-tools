// 赤壁夜舟：全部用程式化幾何與 canvas 貼圖，不需外部模型檔。
import * as THREE from 'three';



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

function vText(g, text, x, y, size, color, gap = 1.12) {
  g.fillStyle = color;
  g.font = `bold ${size}px "Noto Serif TC","Songti TC","PMingLiU","MingLiU",serif`;
  g.textAlign = 'center';
  g.textBaseline = 'top';
  [...text].forEach((ch, i) => g.fillText(ch, x, y + i * size * gap));
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


function labelTex(text, bg, fg, w = 128, h = 192) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.font = `bold ${Math.floor(w * 0.6)}px "Noto Serif TC","PMingLiU",serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2);
  });
}

function matTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#c9ad74';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(110,80,40,0.45)';
    for (let x = 0; x < w; x += 8) {
      g.lineWidth = x % 32 === 0 ? 2.5 : 1;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
  });
}

function sailTex() {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#e8dcc0';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(90,70,40,0.5)';
    g.lineWidth = 4;
    for (let y = 40; y < h; y += 64) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    vText(g, '清風明月', w / 2, 90, 64, 'rgba(60,40,25,0.75)');
  });
}

// 月光倒影：一條往月亮方向延伸的光帶
function glintTex() {
  return canvasTex(64, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, 0);
    grd.addColorStop(0, 'rgba(255,240,200,0)');
    grd.addColorStop(0.5, 'rgba(255,240,200,0.9)');
    grd.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = grd;
    const r = rand(5);
    for (let y = 0; y < h; y += 4) {
      g.globalAlpha = (0.25 + r() * 0.75) * (y / h);
      const ww = w * (0.3 + 0.7 * (y / h)) * (0.6 + r() * 0.4);
      g.fillRect((w - ww) / 2, y, ww, 3);
    }
  });
}

function glowTex() {
  return canvasTex(128, 128, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(255,248,220,0.9)');
    grd.addColorStop(0.3, 'rgba(255,240,200,0.35)');
    grd.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  });
}

// 船身輪廓（x 為左右，y 對應世界的 -z），船頭朝 -z
const HULL = [
  [-2.0, -4.2], [2.0, -4.2], [2.0, 3.0], [1.4, 4.4], [0, 5.0], [-1.4, 4.4], [-2.0, 3.0]
];
export const BOW_Z = -5.0;
// 甲板可走範圍：船頭（z < -3）逐漸變窄
export function deckHalfWidth(z) {
  if (z < -3.0) return Math.max(0.35, 1.6 - ((-3.0 - z) / 2.0) * 1.25);
  return 1.6;
}

export function buildBoat(scene) {
  const colliders = []; // [minX, minZ, maxX, maxZ]
  const items = {};

  const woodDark = mat({ map: woodTex('#4a3020', '#22140a', 5, [2, 2]) });
  const woodMid = mat({ map: woodTex('#6e4a2e', '#33200f', 9) });
  const woodRed = mat({ map: woodTex('#6b2a1f', '#30110b', 13), roughness: 0.6 });
  const deckMat = mat({ map: woodTex('#7a5636', '#3a2414', 3, [3, 6]), roughness: 0.75 });
  const brass = mat({ color: '#c9a24a', metalness: 0.8, roughness: 0.35 });

  // ---------- 天空、星星、月亮 ----------
  const stars = new THREE.BufferGeometry();
  const r = rand(21);
  const pts = [];
  for (let i = 0; i < 700; i++) {
    const th = r() * Math.PI * 2;
    const ph = Math.acos(0.05 + r() * 0.95);
    pts.push(Math.cos(th) * Math.sin(ph) * 160, Math.cos(ph) * 160, Math.sin(th) * Math.sin(ph) * 160);
  }
  stars.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const starMat = new THREE.PointsMaterial({ color: '#fff7e0', size: 0.7, sizeAttenuation: true, transparent: true, fog: false });
  const starPts = new THREE.Points(stars, starMat);
  scene.add(starPts);

  const MOON_POS = new THREE.Vector3(38, 30, -70);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(3.2, 32, 16), new THREE.MeshBasicMaterial({ color: '#fff4cf', fog: false, transparent: true }));
  moon.position.copy(MOON_POS);
  scene.add(moon);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), fog: false, transparent: true, depthWrite: false }));
  halo.scale.set(26, 26, 1);
  halo.position.copy(MOON_POS);
  scene.add(halo);

  // ---------- 江水 ----------
  const waterGeo = new THREE.PlaneGeometry(260, 260, 90, 90);
  waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(waterGeo, mat({ color: '#10243d', roughness: 0.28, metalness: 0.35 }));
  water.position.y = -0.45;
  water.receiveShadow = true;
  scene.add(water);
  const waterBase = Float32Array.from(waterGeo.attributes.position.array);

  const glint = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 90),
    new THREE.MeshBasicMaterial({ map: glintTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
  );
  glint.rotation.x = -Math.PI / 2;
  const dir = new THREE.Vector2(MOON_POS.x, MOON_POS.z).normalize();
  glint.rotation.z = Math.atan2(dir.x, dir.y) + Math.PI;
  glint.position.set(dir.x * 48, -0.4, dir.y * 48);
  scene.add(glint);

  // ---------- 赤壁與遠山 ----------
  const cliffMat = mat({ color: '#6e2f22', roughness: 1, flatShading: true });
  const cr = rand(8);
  for (let i = 0; i < 14; i++) {
    const h = 10 + cr() * 16;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(2 + cr() * 3, 4 + cr() * 4, h, 6, 1), cliffMat);
    m.position.set(-26 - cr() * 8, h / 2 - 1, -40 + i * 7 + cr() * 3);
    m.rotation.y = cr() * 3;
    scene.add(m);
  }
  const hillMat = mat({ color: '#141c28', roughness: 1, flatShading: true });
  for (let i = 0; i < 12; i++) {
    const h = 12 + cr() * 18;
    const m = new THREE.Mesh(new THREE.ConeGeometry(14 + cr() * 10, h, 5), hillMat);
    const a = -0.2 + (i / 12) * 2.2;
    m.position.set(Math.sin(a) * 95, h / 2 - 2, -Math.cos(a) * 95);
    scene.add(m);
  }
  // 上岸的大石（終點）
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(3.4, 0), mat({ color: '#5b4a3a', roughness: 1, flatShading: true }));
  rock.scale.set(1.6, 0.45, 1.2);
  rock.position.set(0, -1.15, -11.2);
  scene.add(rock);

  // ---------- 船身 ----------
  const shape = new THREE.Shape(HULL.map(([x, y]) => new THREE.Vector2(x, y)));
  const hullGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.9, bevelEnabled: false });
  hullGeo.rotateX(Math.PI / 2); // 形狀的 y → 世界 z；擠出方向往下
  const hull = new THREE.Mesh(hullGeo, woodDark);
  hull.castShadow = hull.receiveShadow = true;
  scene.add(hull);
  const deckGeo = new THREE.ShapeGeometry(shape);
  deckGeo.rotateX(Math.PI / 2);
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 0.01;
  deck.material.side = THREE.DoubleSide;
  deck.receiveShadow = true;
  scene.add(deck);

  // 船舷欄杆（沿輪廓一圈，船尾 z>0 那端跳過最後一段當作船篷入口）
  const railMat = woodRed;
  const outline = [...HULL, HULL[0]];
  let gate = null;
  for (let i = 0; i < outline.length - 1; i++) {
    const [x1, z1] = outline[i];
    const [x2, z2] = outline[i + 1];
    const len = Math.hypot(x2 - x1, z2 - z1);
    const mid = [(x1 + x2) / 2, (z1 + z2) / 2];
    const ang = Math.atan2(z2 - z1, x2 - x1);
    if (i === 0) {
      // 船頭的欄杆：中間是可以打開的閘門
      const side = (len - 1.0) / 2;
      [-1, 1].forEach((s) => {
        const b = box(side, 0.55, 0.08, railMat, s * (0.5 + side / 2), 0.28, z1);
        scene.add(b);
      });
      gate = box(1.0, 0.55, 0.06, woodMid, 0, 0.28, z1);
      scene.add(gate);
      continue;
    }
    const b = box(len, 0.55, 0.08, railMat, mid[0], 0.28, mid[1]);
    b.rotation.y = -ang;
    scene.add(b);
    for (let k = 0; k <= 1; k++) {
      const p = box(0.12, 0.7, 0.12, railMat, k ? x2 : x1, 0.35, k ? z2 : z1);
      scene.add(p);
    }
  }

  // 跳板（解完才放下）
  const plank = new THREE.Group();
  const board = box(0.9, 0.06, 4.6, woodMid, 0, 0, -2.3);
  plank.add(board);
  plank.position.set(0, 0.05, -4.2);
  plank.rotation.x = -1.35;
  scene.add(plank);

  // 船篷（船尾，遮住一部分天空，有氣氛）
  const roofMat = mat({ color: '#3b2a1a', roughness: 0.95, side: THREE.DoubleSide });
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 1.6, 20, 1, true, -Math.PI / 2, Math.PI), roofMat);
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.position.set(0, 1.0, 3.6);
  roof.scale.set(1, 1, 0.75);
  scene.add(roof);

  // ---------- 1 水缸 ----------
  {
    const g = new THREE.Group();
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.75, 20, 1, true), mat({ color: '#5a3d2a', roughness: 0.6, side: THREE.DoubleSide }));
    jar.position.y = 0.38;
    jar.castShadow = true;
    g.add(jar);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 8, 24), mat({ color: '#3e2a1c' }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.75;
    g.add(rim);
    const surf = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), mat({ color: '#1d3b5c', roughness: 0.15, metalness: 0.4, emissive: '#bcd7ff', emissiveIntensity: 0 }));
    surf.rotation.x = -Math.PI / 2;
    surf.position.y = 0.66;
    g.add(surf);
    g.position.set(1.25, 0, 2.3);
    scene.add(g);
    items.jar = { group: g, focus: new THREE.Vector3(1.25, 0.5, 2.3), top: 0.95, surf };
    colliders.push([0.85, 1.9, 1.65, 2.7]);
  }

  // ---------- 2 銅鏡 ----------
  {
    const g = new THREE.Group();
    g.add(box(0.5, 0.08, 0.3, woodMid, 0, 0.04, 0));
    g.add(box(0.06, 1.1, 0.06, woodMid, 0, 0.6, 0));
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 32), [
      brass,
      mat({ color: '#a88a4a', metalness: 0.9, roughness: 0.15, emissive: '#fff1c4', emissiveIntensity: 0 }),
      brass
    ]);
    disc.rotation.z = Math.PI / 2;
    disc.position.set(0.04, 1.25, 0);
    g.add(disc);
    const moonImg = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), new THREE.MeshBasicMaterial({ color: '#fff6d6', transparent: true, opacity: 0 }));
    moonImg.rotation.y = Math.PI / 2;
    moonImg.position.set(0.07, 1.25, 0);
    g.add(moonImg);
    g.position.set(-1.4, 0, 2.0);
    scene.add(g);
    items.mirror = { group: g, focus: new THREE.Vector3(-1.3, 1.0, 2.0), top: 1.7, disc, moonImg };
    colliders.push([-1.75, 1.75, -1.05, 2.25]);
  }

  // 小桌子
  function lowTable(x, z) {
    const g = new THREE.Group();
    g.add(box(0.9, 0.06, 0.6, woodRed, 0, 0.42, 0));
    [[-0.38, -0.24], [0.38, -0.24], [-0.38, 0.24], [0.38, 0.24]].forEach(([a, b]) => g.add(box(0.06, 0.4, 0.06, woodDark, a, 0.2, b)));
    g.position.set(x, 0, z);
    colliders.push([x - 0.5, z - 0.35, x + 0.5, z + 0.35]);
    return g;
  }

  // ---------- 3 洞簫 ----------
  {
    const g = lowTable(1.25, 0.5);
    const flute = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 12), mat({ color: '#b48a4a', roughness: 0.5, emissive: '#ffd27a', emissiveIntensity: 0 }));
    tube.rotation.z = Math.PI / 2;
    flute.add(tube);
    for (let i = 0; i < 4; i++) {
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.009, 8), new THREE.MeshBasicMaterial({ color: '#2a1a0c' }));
      hole.rotation.x = -Math.PI / 2;
      hole.position.set(-0.1 + i * 0.07, 0.026, 0);
      flute.add(hole);
    }
    flute.position.set(0, 0.48, 0);
    g.add(flute);
    scene.add(g);
    items.flute = { group: g, focus: new THREE.Vector3(1.25, 0.5, 0.5), top: 0.75, flute, tube };
  }

  // ---------- 4 燈籠 ----------
  {
    const g = new THREE.Group();
    g.add(box(0.08, 2.2, 0.08, woodRed, 0, 1.1, -0.9));
    g.add(box(0.08, 2.2, 0.08, woodRed, 0, 1.1, 0.9));
    g.add(box(0.06, 0.06, 1.9, woodRed, 0, 2.15, 0));
    const lanterns = [];
    'ABCDE'.split('').forEach((L, i) => {
      const z = -0.72 + i * 0.36;
      const rope = box(0.01, 0.3, 0.01, woodDark, 0, 1.98, z);
      g.add(rope);
      const lt = labelTex(L, '#b3342a', '#ffe9b0', 128, 160);
      lt.wrapS = THREE.RepeatWrapping;
      lt.repeat.x = 3;
      const lm = mat({ map: lt, emissive: '#ff9a3c', emissiveIntensity: 0.05, roughness: 0.9 });
      const lan = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.3, 14), lm);
      lan.position.set(0, 1.68, z);
      lan.rotation.y = -Math.PI / 2;
      g.add(lan);
      lanterns.push(lan);
    });
    g.position.set(-1.55, 0, 0.3);
    scene.add(g);
    const light = new THREE.PointLight('#ffab5c', 0, 5, 1.6);
    light.position.set(-1.3, 1.6, 0.3);
    scene.add(light);
    items.lanterns = { group: g, focus: new THREE.Vector3(-1.2, 1.0, 0.3), top: 2.3, lanterns, light };
    colliders.push([-1.75, -0.7, -1.35, 1.3]);
  }

  // ---------- 5 船帆 ----------
  {
    const g = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 5.4, 12), woodDark);
    mast.position.y = 2.7;
    mast.castShadow = true;
    g.add(mast);
    g.add(box(2.6, 0.08, 0.08, woodDark, 0, 4.8, 0.12));
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.4), mat({ map: sailTex(), side: THREE.DoubleSide, roughness: 1, transparent: true }));
    sail.geometry.translate(0, -1.7, 0);
    sail.position.set(0, 4.76, 0.14);
    sail.scale.y = 0.12;
    g.add(sail);
    g.position.set(0, 0, -1.2);
    scene.add(g);
    items.sail = { group: g, focus: new THREE.Vector3(0, 0.8, -1.2), top: 1.4, sail };
    colliders.push([-0.2, -1.4, 0.2, -1.0]);
  }

  // ---------- 6 杯盤 ----------
  {
    const g = lowTable(1.25, -2.0);
    const cups = [];
    const words = ['曾', '藏', '適', '藉'];
    words.forEach((w, i) => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.07, 14), [
        mat({ map: labelTex(w, '#efe6d0', '#3b2f24', 128, 64), roughness: 0.4 }),
        mat({ color: '#efe6d0' }),
        mat({ color: '#efe6d0' })
      ]);
      cup.position.set(-0.3 + i * 0.2, 0.485, 0);
      cup.rotation.y = -Math.PI / 2;
      g.add(cup);
      const wine = new THREE.Mesh(new THREE.CircleGeometry(0.05, 14), mat({ color: '#d8a24a', emissive: '#ffb84d', emissiveIntensity: 0.6 }));
      wine.rotation.x = -Math.PI / 2;
      wine.position.set(-0.3 + i * 0.2, 0.5, 0);
      wine.visible = false;
      g.add(wine);
      cups.push(wine);
    });
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.03, 20), mat({ color: '#dcd2bc' }));
    plate.position.set(0.15, 0.465, 0.18);
    g.add(plate);
    scene.add(g);
    items.cups = { group: g, focus: new THREE.Vector3(1.25, 0.5, -2.0), top: 0.75, cups };
  }

  // ---------- 7 酒壺 ----------
  {
    const g = lowTable(-1.25, -2.1);
    const pot = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 14), mat({ color: '#3f6b78', roughness: 0.3 }));
    body.scale.y = 1.15;
    pot.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.14, 12), mat({ color: '#3f6b78', roughness: 0.3 }));
    neck.position.y = 0.2;
    pot.add(neck);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.022, 0.16, 8), mat({ color: '#3f6b78' }));
    spout.position.set(0.15, 0.06, 0);
    spout.rotation.z = -0.9;
    pot.add(spout);
    pot.position.set(0, 0.62, 0);
    g.add(pot);
    scene.add(g);
    items.pot = { group: g, focus: new THREE.Vector3(-1.25, 0.5, -2.1), top: 0.95, pot };
  }

  // ---------- 8 竹蓆（船頭） ----------
  {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), mat({ map: matTex(), roughness: 1 }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.02;
    m.receiveShadow = true;
    g.add(m);
    [-0.4, 0.4].forEach((x) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.4, 12), mat({ color: '#8a2a1e' }));
      p.rotation.z = Math.PI / 2;
      p.position.set(x, 0.1, 0.38);
      g.add(p);
    });
    g.position.set(0, 0, -3.2);
    scene.add(g);
    items.mat = { group: g, focus: new THREE.Vector3(0, 0.3, -3.2), top: 0.5 };
  }

  return {
    colliders,
    items,
    plank,
    gate,
    moon,
    halo,
    starMat,
    water,
    waterBase,
    bounds: { minX: -1.6, maxX: 1.6, minZ: -4.0, maxZ: 3.3 }
  };
}
