/* ===================== voxel helpers ===================== */
const unitGeo = new THREE.BoxGeometry(1, 1, 1);
const matCache = new Map();
const lampMat = new THREE.MeshBasicMaterial({ color: 0xbfe3f2 });   // windows and braziers; warm at night
const LAMP = { mat: lampMat, noshadow: true };
function mat(c, basic) {
  const k = c + (basic ? 'b' : '');
  let m = matCache.get(k);
  if (!m) { m = basic ? new THREE.MeshBasicMaterial({ color: c }) : new THREE.MeshLambertMaterial({ color: c }); matCache.set(k, m); }
  return m;
}
// box(parent, minX, minY, minZ, width, height, depth, color)
function box(p, x, y, z, w, h, d, c, o) {
  const m = new THREE.Mesh(unitGeo, (o && o.mat) || mat(c, o && o.basic));
  m.scale.set(w, h, d);
  m.position.set(x + w / 2, y + h / 2, z + d / 2);
  m.castShadow = !(o && o.noshadow);
  m.receiveShadow = true;
  p.add(m);
  return m;
}
function roofPyr(g, cx, y, cz, w, c, layers, step) {
  let s = w;
  for (let k = 0; k < layers && s > 0.05; k++) { box(g, cx - s / 2, y + k * 0.12, cz - s / 2, s, 0.12, s, c); s -= step; }
}
function flagAt(g, x, y, z, c) {
  box(g, x - 0.02, y, z - 0.02, 0.04, 0.55, 0.04, 0x5a4a3a);
  const f = box(g, x + 0.02, y + 0.32, z - 0.01, 0.26, 0.16, 0.03, c, { noshadow: true });
  (g.userData.flags = g.userData.flags || []).push(f);
}

/* ===================== animals ===================== */
const SPEC = {
  fox:     { bw: .3, bh: .26, bd: .5, ly: .16, hw: .28, body: 0xe4702b, belly: 0xf6ead8, leg: 0x3a2a22, sn: { w: .12, h: .1, l: .14, c: 0xf6ead8 } },
  panda:   { bw: .36, bh: .42, bd: .3, ly: .2, hw: .34, body: 0xf4f4f0, belly: 0xe6e6e0, leg: 0x1f1f22, sn: { w: .14, h: .1, l: .07, c: 0xdedbd2 } },
  rabbit:  { bw: .26, bh: .24, bd: .4, ly: .12, hw: .24, body: 0xe9e4da, belly: 0xffffff, leg: 0xcfc8ba, sn: { w: .1, h: .08, l: .06, c: 0xf0b8b8 } },
  bear:    { bw: .42, bh: .36, bd: .52, ly: .16, hw: .34, body: 0x7c4d2b, belly: 0x9a6a40, leg: 0x4d2e19, sn: { w: .16, h: .12, l: .1, c: 0xc59a6a } },
  wolf:    { bw: .28, bh: .26, bd: .6, ly: .2, hw: .26, body: 0x7b838c, belly: 0xc3c9ce, leg: 0x555c63, sn: { w: .1, h: .09, l: .2, c: 0x6a7178 }, eye: 0xff4a3a },
  boar:    { bw: .4, bh: .34, bd: .56, ly: .16, hw: .3, body: 0x5b3a2c, belly: 0x7e5642, leg: 0x2e1c14, sn: { w: .2, h: .12, l: .12, c: 0x8a5e48 }, eye: 0xff4a3a },
  raccoon: { bw: .28, bh: .24, bd: .42, ly: .14, hw: .26, body: 0x8a9098, belly: 0xc9ced2, leg: 0x2f3338, sn: { w: .1, h: .08, l: .1, c: 0xd8dcdf } },
  badger:  { bw: .42, bh: .3, bd: .6, ly: .12, hw: .28, body: 0x3b3b3f, belly: 0x55555a, leg: 0x222226, sn: { w: .1, h: .08, l: .12, c: 0xf0f0ec }, eye: 0xff4a3a },
  elk:     { bw: .34, bh: .34, bd: .62, ly: .3, hw: .28, body: 0x8a6a4a, belly: 0xb79a78, leg: 0x5a4030, sn: { w: .12, h: .1, l: .16, c: 0x6e5440 } },
  owl:     { bw: .3, bh: .36, bd: .28, ly: .12, hw: .3, body: 0x8a7458, belly: 0xe8dcc4, leg: 0xd9a24a, sn: { w: .08, h: .07, l: .08, c: 0xf2b134 } },
  troll:   { bw: .5, bh: .46, bd: .56, ly: .22, hw: .38, body: 0x5e7a5a, belly: 0x8aa082, leg: 0x3e5240, sn: { w: .18, h: .12, l: .12, c: 0x7f9a7a }, eye: 0xffb13a },
  drake:   { bw: .34, bh: .3, bd: .7, ly: .22, hw: .3, body: 0x7a1f2b, belly: 0xb8473a, leg: 0x3a1016, sn: { w: .12, h: .1, l: .22, c: 0x5a1520 }, eye: 0xffd23a },
  warbear: { bw: .42, bh: .36, bd: .52, ly: .16, hw: .34, body: 0x40302a, belly: 0x5a443a, leg: 0x2a1d18, sn: { w: .16, h: .12, l: .1, c: 0x8a6a50 }, eye: 0xff4a3a }
};

function makeAnimal(sp) {
  const S = SPEC[sp], g = new THREE.Group(), { bw, bh, bd, ly, hw } = S;
  const legs = [], arms = [], biped = sp === 'panda' || sp === 'owl' || sp === 'troll';
  if (biped) {
    // pandas stand and walk upright on two legs, arms swinging
    [1, -1].forEach(s => {
      const p = new THREE.Group();
      p.position.set(s * (bw / 2 - 0.1), ly, 0);
      box(p, -0.07, -ly, -0.07, 0.14, ly, 0.16, S.leg);
      g.add(p); legs.push(p);
      const a = new THREE.Group();
      a.position.set(s * (bw / 2 + 0.05), ly + bh - 0.06, 0);
      box(a, -0.05, -0.3, -0.05, 0.1, 0.3, 0.1, 0x1f1f22);
      g.add(a); arms.push(a);
    });
    box(g, -bw / 2, ly, -bd / 2, bw, bh, bd, S.body);
    box(g, -bw / 2 - 0.01, ly + bh - 0.17, -bd / 2 - 0.01, bw + 0.02, 0.17, bd + 0.02, 0x1f1f22);
    box(g, -bw / 2 + 0.05, ly + 0.04, bd / 2, bw - 0.1, bh - 0.26, 0.02, S.belly);
  } else {
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sz]) => {
      const p = new THREE.Group();
      p.position.set(sx * (bw / 2 - 0.07), ly, sz * (bd / 2 - 0.09));
      box(p, -0.05, -ly, -0.05, 0.1, ly, 0.1, S.leg);
      g.add(p); legs.push(p);
    });
    box(g, -bw / 2, ly, -bd / 2, bw, bh, bd, S.body);
    box(g, -bw / 2 + 0.03, ly - 0.01, -bd / 2 + 0.08, bw - 0.06, 0.05, bd - 0.16, S.belly);
  }
  const head = new THREE.Group();
  if (biped) head.position.set(0, ly + bh - 0.06, -hw * 0.45 + 0.02);
  else head.position.set(0, ly + bh * 0.45, bd / 2 - 0.04);
  g.add(head);
  box(head, -hw / 2, 0, 0, hw, hw, hw * 0.9, S.body);
  const sn = S.sn;
  box(head, -sn.w / 2, 0.03, hw * 0.9, sn.w, sn.h, sn.l, sn.c);
  box(head, -0.03, 0.03 + sn.h - 0.02, hw * 0.9 + sn.l - 0.02, 0.06, 0.05, 0.04, 0x1a1a1a);
  const ey = S.eye || 0x111111;
  box(head, -hw / 2 + 0.04, hw * 0.55, hw * 0.9 - 0.01, 0.05, 0.05, 0.03, ey);
  box(head, hw / 2 - 0.09, hw * 0.55, hw * 0.9 - 0.01, 0.05, 0.05, 0.03, ey);
  const both = fn => { fn(-1); fn(1); };
  switch (sp) {
    case 'fox':
      both(s => { box(head, s * (hw / 2 - 0.05) - 0.045, hw, 0.04, 0.09, 0.15, 0.05, S.body); box(head, s * (hw / 2 - 0.05) - 0.045, hw + 0.11, 0.04, 0.09, 0.05, 0.05, 0x1a1a1a); });
      box(g, -0.05, ly + 0.1, -bd / 2 - 0.3, 0.1, 0.1, 0.32, S.body);
      box(g, -0.05, ly + 0.1, -bd / 2 - 0.34, 0.1, 0.1, 0.1, 0xf6ead8);
      break;
    case 'panda':
      both(s => { box(head, s * (hw / 2 - 0.04) - 0.05, hw - 0.03, 0.06, 0.1, 0.1, 0.06, 0x1f1f22); box(head, s * 0.1 - 0.045, hw * 0.5, hw * 0.9 - 0.015, 0.09, 0.1, 0.03, 0x1f1f22); });
      box(g, -0.06, ly + 0.04, -bd / 2 - 0.06, 0.12, 0.12, 0.08, 0xf4f4f0);
      break;
    case 'rabbit':
      both(s => { box(head, s * 0.06 - 0.035, hw, 0.03, 0.07, 0.3, 0.05, S.body); box(head, s * 0.06 - 0.015, hw + 0.02, 0.05, 0.03, 0.2, 0.02, 0xf0b8b8); });
      box(g, -0.06, ly + 0.1, -bd / 2 - 0.09, 0.12, 0.12, 0.1, 0xffffff);
      break;
    case 'bear': case 'warbear':
      both(s => box(head, s * (hw / 2 - 0.03) - 0.05, hw - 0.02, 0.05, 0.1, 0.09, 0.06, S.body));
      box(g, -0.05, ly + 0.15, -bd / 2 - 0.05, 0.1, 0.1, 0.07, S.body);
      if (sp === 'warbear') {
        box(head, -hw / 2 - 0.02, hw - 0.02, -0.02, hw + 0.04, 0.08, hw * 0.9 + 0.04, 0x8a919a);
        both(s => box(head, s * (hw / 2) - 0.03, hw + 0.04, 0.06, 0.06, 0.16, 0.06, 0xefe6c8));
        box(g, -bw / 2, ly + 0.04, -bd / 2 - 0.04, bw, bh, 0.05, 0x8e1f1f);
      }
      break;
    case 'elk':
      both(s => { box(head, s * (hw / 2 - 0.03) - 0.02, hw, 0.08, 0.04, 0.22, 0.04, 0x5a4030); box(head, s * (hw / 2 + 0.05) - 0.02, hw + 0.14, 0.08, 0.04, 0.12, 0.04, 0x5a4030); box(head, s * (hw / 2 - 0.1) - 0.02, hw + 0.18, 0.08, 0.04, 0.1, 0.04, 0x5a4030); box(head, s * (hw / 2 - 0.05) - 0.04, hw - 0.02, 0.02, 0.08, 0.08, 0.05, S.body); });
      box(g, -0.03, ly + 0.12, -bd / 2 - 0.08, 0.06, 0.06, 0.1, S.body);
      break;
    case 'owl':
      both(s => box(head, s * (hw / 2 - 0.04) - 0.03, hw - 0.02, 0.02, 0.06, 0.1, 0.05, S.body));
      box(head, -hw / 2 + 0.02, hw * 0.45, hw * 0.9 - 0.02, 0.1, 0.1, 0.03, 0xf2e6c8); box(head, hw / 2 - 0.12, hw * 0.45, hw * 0.9 - 0.02, 0.1, 0.1, 0.03, 0xf2e6c8);
      both(s => box(g, s * (bw / 2 + 0.02) - 0.03, ly + 0.04, -bd / 2 + 0.02, 0.06, bh - 0.08, bd - 0.04, 0x6e5a42));
      box(g, -0.08, ly - 0.02, -bd / 2 - 0.12, 0.16, 0.06, 0.14, S.body);
      break;
    case 'troll':
      both(s => box(head, s * (hw / 2 - 0.06) - 0.04, hw - 0.04, 0.05, 0.08, 0.1, 0.06, S.body));
      both(s => box(head, s * 0.09 - 0.03, -0.02, hw * 0.9 + 0.02, 0.06, 0.12, 0.06, 0xf1ecd8));
      box(g, bw / 2 + 0.02, ly + 0.1, -0.2, 0.12, 0.12, 0.7, 0x5a3a22); box(g, bw / 2 - 0.02, ly + 0.08, -0.45, 0.2, 0.2, 0.22, 0x6c737a);
      box(g, -bw / 2 - 0.02, ly + bh - 0.1, -bd / 2 - 0.02, bw + 0.04, 0.12, bd + 0.04, 0x3e5240);
      break;
    case 'drake':
      both(s => { box(head, s * (hw / 2 - 0.04) - 0.03, hw, 0.02, 0.06, 0.18, 0.05, 0x3a1016); const w = box(g, s > 0 ? bw / 2 : -bw / 2 - 0.9, ly + bh - 0.04, -0.2, 0.9, 0.04, 0.5, 0x5a1520); w.userData.wing = s; (g.userData.wings = g.userData.wings || []).push(w); });
      box(g, -0.05, ly + 0.08, -bd / 2 - 0.5, 0.1, 0.1, 0.55, S.body); box(g, -0.1, ly + 0.1, -bd / 2 - 0.62, 0.2, 0.08, 0.14, 0x3a1016);
      break;
    case 'wolf':
      both(s => box(head, s * (hw / 2 - 0.05) - 0.04, hw, 0.03, 0.08, 0.13, 0.05, S.body));
      box(g, -0.05, ly + 0.12, -bd / 2 - 0.26, 0.1, 0.12, 0.3, 0x666d75);
      box(g, -0.05, ly + 0.1, -bd / 2 - 0.3, 0.1, 0.1, 0.1, 0x2b3036);
      break;
    case 'boar':
      both(s => { box(head, s * 0.09 - 0.02, 0.02, hw * 0.9 + 0.08, 0.04, 0.1, 0.04, 0xf5f0e0); box(head, s * (hw / 2 - 0.05) - 0.04, hw - 0.02, 0.06, 0.08, 0.08, 0.05, S.body); });
      box(g, -0.04, ly + bh, -bd / 2 + 0.05, 0.08, 0.09, bd - 0.1, 0x2a1a12);
      box(g, -0.025, ly + 0.2, -bd / 2 - 0.08, 0.05, 0.05, 0.1, S.body);
      break;
    case 'raccoon':
      box(head, -hw / 2 - 0.005, hw * 0.45, hw * 0.9 - 0.015, hw + 0.01, 0.09, 0.03, 0x1d2024);
      both(s => box(head, s * (hw / 2 - 0.04) - 0.04, hw - 0.02, 0.05, 0.08, 0.08, 0.05, S.body));
      for (let k = 0; k < 4; k++) box(g, -0.06, ly + 0.08, -bd / 2 - 0.07 - k * 0.08, 0.12, 0.12, 0.08, k % 2 ? 0x2f3338 : 0x8a9098);
      break;
    case 'badger':
      box(g, -0.03, ly + bh, -bd / 2, 0.06, 0.02, bd, 0xf0f0ec);
      box(head, -0.03, hw, 0, 0.06, 0.02, hw * 0.9, 0xf0f0ec);
      both(s => box(head, s * (hw / 2 - 0.04) - 0.04, hw - 0.02, 0.05, 0.08, 0.07, 0.05, S.body));
      box(g, -0.1, ly + bh + 0.02, -bd / 2 - 0.1, 0.2, 0.18, bd + 0.35, 0x7a5230);
      box(g, -0.12, ly + bh, bd / 2 + 0.18, 0.24, 0.2, 0.08, 0x8a919a);
      break;
  }
  g.userData.legs = legs;
  g.userData.arms = arms;
  g.userData.head = head;
  return g;
}

function addGear(g, role, sp) {
  const S = SPEC[sp], head = g.userData.head, hw = S.hw, both = fn => { fn(-1); fn(1); };
  if (role === 'archer') {
    box(head, -hw / 2 - 0.02, hw - 0.02, -0.02, hw + 0.04, 0.07, hw * 0.9 + 0.04, 0x3f7d46);
    box(g, -S.bw / 2 - 0.06, S.ly + 0.02, -0.05, 0.04, 0.34, 0.04, 0x7b5232);
    box(g, -0.06, S.ly + S.bh - 0.02, -S.bd / 2 + 0.02, 0.12, 0.2, 0.08, 0x5a3a22);
  } else if (role === 'guard') {
    box(head, -hw / 2 - 0.02, hw - 0.03, -0.02, hw + 0.04, 0.08, hw * 0.9 + 0.04, 0xaeb6bd);
    box(g, S.bw / 2 + 0.03, S.ly, 0.08, 0.04, 0.7, 0.04, 0x7b5232);
    box(g, S.bw / 2 + 0.025, S.ly + 0.7, 0.08, 0.06, 0.1, 0.06, 0xdfe4e8);
    box(g, -S.bw / 2 - 0.06, S.ly + 0.05, 0.0, 0.05, 0.26, 0.22, 0xc0392b);
  } else if (role === 'knight') {
    box(g, -S.bw / 2 - 0.015, S.ly + 0.04, -S.bd / 2 + 0.1, S.bw + 0.03, S.bh * 0.7, S.bd * 0.55, 0xb9c0c8);
    box(head, -hw / 2 - 0.02, hw - 0.05, -0.02, hw + 0.04, 0.14, hw * 0.9 + 0.04, 0xaeb6bd);
    box(head, -0.03, hw + 0.08, 0.1, 0.06, 0.12, 0.2, 0xc0392b);
    box(g, S.bw / 2 + 0.03, S.ly + 0.1, 0.1, 0.04, 0.5, 0.04, 0xdfe4e8);
  } else if (role === 'musket') {
    box(head, -hw / 2 - 0.04, hw - 0.01, -0.04, hw + 0.08, 0.05, hw * 0.9 + 0.08, 0x2e3a55);
    box(head, -hw / 2 + 0.02, hw + 0.04, 0.0, hw - 0.04, 0.07, hw * 0.9 - 0.04, 0x2e3a55);
    box(g, S.bw / 2 + 0.02, S.ly + 0.12, -0.1, 0.05, 0.05, 0.7, 0x4a4a4f);
    box(g, S.bw / 2 + 0.02, S.ly + 0.1, -0.2, 0.06, 0.08, 0.2, 0x7b5232);
  } else if (role === 'lancer') {
    box(g, -S.bw / 2 - 0.015, S.ly + 0.06, -S.bd / 2 + 0.12, S.bw + 0.03, S.bh * 0.6, S.bd * 0.5, 0xd4af37);
    box(g, S.bw / 2 + 0.03, S.ly + 0.18, -0.3, 0.04, 0.04, 1.0, 0xdfe4e8); box(g, S.bw / 2 + 0.01, S.ly + 0.16, 0.6, 0.08, 0.08, 0.12, 0xb3122e);
    box(head, -hw / 2 - 0.02, hw - 0.04, -0.02, hw + 0.04, 0.1, hw * 0.9 + 0.04, 0xaeb6bd);
  } else if (role === 'sage') {
    box(head, -hw / 2 - 0.03, hw - 0.02, -0.03, hw + 0.06, 0.06, hw * 0.9 + 0.06, 0x1f8a70);
    box(head, -0.05, hw + 0.04, 0.02, 0.1, 0.16, 0.1, 0x1f8a70);
    box(g, S.bw / 2 + 0.06, S.ly, 0.05, 0.04, 0.8, 0.04, 0x7b5232); box(g, S.bw / 2 + 0.03, S.ly + 0.8, 0.02, 0.1, 0.1, 0.1, 0xe0b24a, LAMP);
  } else if (role === 'mech') {   // a walker frame around the panda
    box(g, -S.bw / 2 - 0.08, S.ly - 0.02, -S.bd / 2 - 0.06, S.bw + 0.16, S.bh + 0.1, S.bd + 0.12, 0x2f3b4a);
    box(g, -S.bw / 2 - 0.1, S.ly + S.bh * 0.5, -S.bd / 2 - 0.08, S.bw + 0.2, 0.08, S.bd + 0.16, 0xffb347);
    both(s => { box(g, s * (S.bw / 2 + 0.12) - 0.08, S.ly + S.bh - 0.05, -0.1, 0.16, 0.16, 0.5, 0x1b2430); box(g, s * (S.bw / 2 + 0.12) - 0.04, S.ly + S.bh - 0.01, 0.38, 0.08, 0.08, 0.06, 0xff7a2a, LAMP); });
    box(head, -hw / 2 - 0.03, hw - 0.03, -0.03, hw + 0.06, 0.1, hw * 0.9 + 0.06, 0x2f3b4a); box(head, -0.12, hw * 0.5, hw * 0.9 - 0.02, 0.24, 0.06, 0.03, 0xff7a2a, LAMP);
  } else if (role === 'dropship' || role === 'swarm' || role === 'warden' || role === 'starship' || role === 'drone') {
    const C = { dropship: [0xe8ecf4, 0x5c6fff, 0xc3d0ff], swarm: [0x1f2a2a, 0x19e6a0, 0x7fffd4], warden: [0x3a2a5a, 0xb060ff, 0xe6c7ff], starship: [0xf6f1ff, 0xffd36b, 0xffffff], drone: [0xf6f1ff, 0xffd36b, 0xffffff] }[role];
    for (const p of g.userData.legs) p.visible = false;
    const L = role === 'starship' ? 0.5 : role === 'dropship' ? 0.3 : 0.12, W = role === 'swarm' || role === 'drone' ? 0.06 : 0.14;
    box(g, -S.bw / 2 - W, S.ly - 0.3, -S.bd / 2 - L, S.bw + W * 2, 0.18, S.bd + L * 2, C[0]);
    box(g, -S.bw / 2 - W + 0.04, S.ly - 0.14, -S.bd / 2 - L + 0.04, S.bw + W * 2 - 0.08, 0.06, S.bd + L * 2 - 0.08, C[1]);
    both(s => box(g, s * (S.bw / 2 + W + 0.12) - 0.1, S.ly - 0.4, -0.12, 0.2, 0.1, 0.24, C[2], LAMP));
    if (role === 'starship') { box(g, -0.08, S.ly - 0.26, S.bd / 2 + 0.5, 0.16, 0.12, 0.5, C[1]); both(s => box(g, s * 0.5 - 0.04, S.ly - 0.3, -S.bd / 2 - 0.5, 0.08, 0.3, 0.3, C[1])); }
    if (role === 'swarm') for (let k = 0; k < 6; k++) box(g, rnd(-0.4, 0.3), S.ly + rnd(0.1, 0.5), rnd(-0.4, 0.3), 0.05, 0.05, 0.05, C[1], LAMP);
    if (role === 'warden') box(g, -S.bw / 2 - 0.2, S.ly + S.bh + 0.1, -S.bd / 2 - 0.2, S.bw + 0.4, 0.04, S.bd + 0.4, C[2], LAMP);
    box(g, S.bw / 2 + W - 0.02, S.ly + 0.05, -0.1, 0.05, 0.05, 0.55, 0x2a3350); box(g, S.bw / 2 + W - 0.04, S.ly + 0.04, 0.42, 0.09, 0.09, 0.08, C[2], LAMP);
    box(head, -hw / 2 - 0.02, hw - 0.02, -0.02, hw + 0.04, 0.08, hw * 0.9 + 0.04, C[0]);
  } else if (role === 'skiff') {   // the fox sits in a hovering skiff: hull below, canopy ring, thruster glow
    for (const p of g.userData.legs) p.visible = false;
    box(g, -S.bw / 2 - 0.12, S.ly - 0.3, -S.bd / 2 - 0.16, S.bw + 0.24, 0.16, S.bd + 0.36, 0xdfe6f0);
    box(g, -S.bw / 2 - 0.08, S.ly - 0.16, -S.bd / 2 - 0.1, S.bw + 0.16, 0.08, S.bd + 0.2, 0x2cc4d8);
    box(g, -0.08, S.ly - 0.42, -S.bd / 2 - 0.05, 0.16, 0.12, 0.16, 0x7fe0ff, LAMP); box(g, -0.08, S.ly - 0.42, S.bd / 2 - 0.1, 0.16, 0.12, 0.16, 0x7fe0ff, LAMP);
    box(g, S.bw / 2 + 0.05, S.ly + 0.1, -0.1, 0.05, 0.05, 0.6, 0x3b4a5a); box(g, S.bw / 2 + 0.035, S.ly + 0.085, 0.45, 0.08, 0.08, 0.1, 0x5cf0ff, LAMP);
    box(head, -hw / 2 - 0.02, hw - 0.02, -0.02, hw + 0.04, 0.08, hw * 0.9 + 0.04, 0xdfe6f0);
  } else if (role === 'worker') {
    box(head, -hw / 2 - 0.04, hw - 0.02, -0.04, hw + 0.08, 0.04, hw * 0.9 + 0.08, 0xe2c36b);
    const c = sp === 'panda' ? box(g, -0.1, S.ly + 0.06, -S.bd / 2 - 0.14, 0.2, 0.2, 0.14, 0xffffff) : box(g, -0.1, S.ly + S.bh, -0.12, 0.2, 0.16, 0.2, 0xffffff);
    c.visible = false;
    g.userData.carry = c;
    // a tool in the right paw, shown only while working: axe head one side, pick the other, swapped by what is being gathered
    const tool = new THREE.Group(); tool.position.set(S.bw / 2 + 0.06, S.ly + S.bh * 0.5, S.bd / 2 - 0.05);
    box(tool, -0.02, -0.05, -0.02, 0.04, 0.42, 0.04, 0x7b5232);
    const axe = box(tool, -0.02, 0.3, 0.02, 0.1, 0.12, 0.04, 0xcfd4d8), pick = box(tool, -0.12, 0.33, -0.015, 0.24, 0.04, 0.03, 0x8a919a);
    tool.visible = false; g.add(tool); g.userData.tool = tool; g.userData.axe = axe; g.userData.pick = pick;
  }
}

function makeUnitModel(role, sp, scale) {
  const g = makeAnimal(sp);
  addGear(g, role, sp);
  const wrap = new THREE.Group();
  wrap.add(g);
  g.scale.setScalar(scale || 1);
  wrap.userData = g.userData;
  wrap.userData.body = g;
  return wrap;
}

/* ===================== buildings ===================== */
const STONE = 0x9aa1a8, STONE_TOP = 0xc6ccd1, WOOD = 0x8b5e34;
function wallNeighbors(b) {
  const f = (di, dj) => { const i = b.i + di, j = b.j + dj; return inMap(i, j) && occ[i][j] && occ[i][j].def.wall; };
  return { n: f(0, -1), s: f(0, 1), e: f(1, 0), w: f(-1, 0) };
}
function buildModel(b) {
  const t = b.type, A = G.age, P = AGES[A].pal, g = new THREE.Group();
  g.userData.flags = [];
  switch (t) {
    case 'house':
      box(g, -0.36, 0, -0.36, 0.72, 0.1, 0.72, 0x8a857b);
      box(g, -0.32, 0.08, -0.32, 0.64, 0.42, 0.64, P.wall);
      if (A >= 1) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.03, 0.08, z * 0.3 - 0.03, 0.06, 0.42, 0.06, P.beam));
      roofPyr(g, 0, 0.5, 0, 0.86, P.roof, 4, 0.22);
      box(g, -0.08, 0.08, 0.32, 0.16, 0.24, 0.03, 0x4a2f1c);
      box(g, 0.14, 0.28, 0.32, 0.1, 0.1, 0.03, 0xbfe3f2, LAMP);
      if (A >= 1) box(g, 0.16, 0.62, -0.22, 0.1, 0.3, 0.1, 0x77716a);
      break;
    case 'infirmary':
      box(g, -0.38, 0, -0.38, 0.76, 0.1, 0.76, 0x8a857b);
      box(g, -0.34, 0.08, -0.34, 0.68, 0.4, 0.68, 0xf1ebdc);
      roofPyr(g, 0, 0.48, 0, 0.9, 0x5fa05a, 4, 0.26);
      box(g, -0.07, 0.2, 0.34, 0.14, 0.3, 0.03, 0xd9442f);
      box(g, -0.15, 0.28, 0.34, 0.3, 0.14, 0.03, 0xd9442f);
      box(g, -0.08, 0.3, 0.36, 0.16, 0.1, 0.02, 0xffffff);
      box(g, 0.2, 0.26, 0.34, 0.1, 0.1, 0.03, 0xbfe3f2, LAMP);
      box(g, -0.3, 0.08, 0.2, 0.1, 0.12, 0.1, 0x5fa05a); box(g, -0.28, 0.2, 0.22, 0.06, 0.06, 0.06, 0xf2c14e);
      break;
    case 'sapling':
      box(g, -0.3, 0, -0.3, 0.6, 0.05, 0.6, 0x5a4030);
      box(g, -0.03, 0.05, -0.03, 0.06, 0.35, 0.06, 0x6b4a2f); box(g, -0.12, 0.3, -0.12, 0.24, 0.16, 0.24, 0x6fcf57);
      [[-0.22, -0.22], [0.14, -0.22], [-0.22, 0.14], [0.14, 0.14]].forEach(([x, z]) => box(g, x, 0.05, z, 0.08, 0.1, 0.08, 0x7fd45f));
      break;
    case 'berrybed':
      box(g, -0.32, 0, -0.32, 0.64, 0.06, 0.64, 0x6b4a2f);
      for (let k = 0; k < 3; k++) for (let m = 0; m < 3; m++) box(g, -0.24 + k * 0.18, 0.06, -0.24 + m * 0.18, 0.1, 0.1, 0.1, (k + m) % 2 ? 0x5aae4a : 0x4c9a3e);
      box(g, -0.05, 0.14, -0.05, 0.08, 0.08, 0.08, 0xd9344a);
      break;
    case 'farm':
      box(g, -0.45, 0, -0.45, 0.9, 0.06, 0.9, 0x6b4a2f);
      for (let k = 0; k < 4; k++) {
        box(g, -0.4, 0.06, -0.36 + k * 0.22, 0.8, 0.18, 0.1, k % 2 ? 0x6fb04a : 0x5ea03e);
        for (let q = 0; q < 3; q++) box(g, -0.3 + q * 0.3, 0.22, -0.34 + k * 0.22, 0.07, 0.07, 0.07, 0xd9344a);
      }
      box(g, 0.34, 0.06, 0.34, 0.04, 0.4, 0.04, WOOD);
      box(g, 0.26, 0.3, 0.34, 0.2, 0.04, 0.04, WOOD);
      box(g, 0.32, 0.4, 0.32, 0.08, 0.08, 0.08, 0xe2c36b);
      if (A >= 2) { box(g, -0.45, 0.06, -0.45, 0.28, 0.3, 0.28, P.wall); roofPyr(g, -0.31, 0.36, -0.31, 0.36, P.roof, 2, 0.16); }
      break;
    case 'camp':
      box(g, -0.45, 0, -0.45, 0.9, 0.05, 0.9, 0x7a5c3a);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.38 - 0.035, 0.05, z * 0.38 - 0.035, 0.07, 0.5, 0.07, WOOD));
      box(g, -0.46, 0.55, -0.46, 0.92, 0.07, 0.92, P.roof);
      box(g, -0.35, 0.05, 0.1, 0.7, 0.12, 0.12, WOOD); box(g, -0.3, 0.17, 0.1, 0.6, 0.12, 0.12, 0x9a6a3c); box(g, -0.35, 0.05, 0.26, 0.7, 0.12, 0.12, 0x9a6a3c);
      box(g, 0.2, 0.05, -0.3, 0.18, 0.14, 0.18, 0x6b4a2f);
      box(g, 0.27, 0.19, -0.28, 0.04, 0.2, 0.04, WOOD);
      if (A >= 2) flagAt(g, -0.4, 0.55, -0.4, P.flag);
      break;
    case 'quarry':
      box(g, -0.46, 0, -0.46, 0.92, 0.05, 0.92, 0x8a9096);
      box(g, -0.4, 0.05, -0.35, 0.4, 0.3, 0.4, 0xa9afb5);
      box(g, 0.05, 0.05, 0.0, 0.35, 0.22, 0.35, 0x9aa0a6);
      box(g, -0.3, 0.05, 0.15, 0.25, 0.14, 0.25, 0xb6bcc2);
      box(g, 0.3, 0.05, -0.3, 0.04, 0.35, 0.04, WOOD);
      box(g, 0.22, 0.36, -0.31, 0.2, 0.05, 0.06, 0x8a919a);
      box(g, 0.12, 0.27, 0.08, 0.1, 0.08, 0.1, 0xf2c14e);
      if (A >= 2) flagAt(g, -0.4, 0.3, -0.42, P.flag);
      break;
    case 'market':
      box(g, -0.4, 0, -0.2, 0.8, 0.3, 0.4, 0x7b5232);
      box(g, -0.3, 0.3, -0.1, 0.15, 0.1, 0.15, 0xe56b6f); box(g, -0.05, 0.3, -0.1, 0.15, 0.1, 0.15, 0xf0b94a); box(g, 0.18, 0.3, -0.1, 0.15, 0.1, 0.15, 0x86c45e);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.42 - 0.03, 0, z * 0.3 - 0.03, 0.06, 0.65, 0.06, WOOD));
      for (let k = 0; k < 6; k++) box(g, -0.45 + k * 0.15, 0.65, -0.36, 0.15, 0.06, 0.72, k % 2 ? P.roof : 0xf2efe6);
      if (A >= 2) flagAt(g, 0.4, 0.7, -0.3, P.flag);
      break;
    case 'smith':
      box(g, -0.34, 0, -0.34, 0.68, 0.4, 0.68, 0x7d848c);
      box(g, -0.4, 0.4, -0.4, 0.8, 0.1, 0.8, 0x3b3f45); box(g, -0.3, 0.5, -0.3, 0.6, 0.1, 0.6, 0x3b3f45);
      box(g, 0.12, 0.5, -0.28, 0.16, 0.4, 0.16, 0x6c737a);
      box(g, 0.14, 0.9, -0.26, 0.12, 0.08, 0.12, 0xff8a2b, { basic: true, noshadow: true });
      box(g, 0.2, 0, 0.36, 0.2, 0.1, 0.14, 0x2b2e33); box(g, 0.17, 0.1, 0.34, 0.26, 0.06, 0.18, 0x2b2e33);
      box(g, -0.08, 0, 0.34, 0.16, 0.24, 0.03, 0x2a1d18);
      break;
    case 'wall': {
      const nb = wallNeighbors(b), pal = A === 0;
      const c1 = pal ? WOOD : STONE, c2 = pal ? 0x9a6a3c : STONE_TOP;
      if (pal) {
        box(g, -0.16, 0, -0.16, 0.32, 0.7, 0.32, c1); box(g, -0.1, 0.7, -0.1, 0.2, 0.12, 0.2, c1); box(g, -0.04, 0.82, -0.04, 0.08, 0.08, 0.08, c1);
        if (nb.e) { box(g, 0.16, 0.12, -0.11, 0.34, 0.45, 0.22, c2); box(g, 0.2, 0.57, -0.07, 0.26, 0.1, 0.14, c1); }
        if (nb.w) { box(g, -0.5, 0.12, -0.11, 0.34, 0.45, 0.22, c2); box(g, -0.46, 0.57, -0.07, 0.26, 0.1, 0.14, c1); }
        if (nb.s) { box(g, -0.11, 0.12, 0.16, 0.22, 0.45, 0.34, c2); box(g, -0.07, 0.57, 0.2, 0.14, 0.1, 0.26, c1); }
        if (nb.n) { box(g, -0.11, 0.12, -0.5, 0.22, 0.45, 0.34, c2); box(g, -0.07, 0.57, -0.46, 0.14, 0.1, 0.26, c1); }
      } else {
        box(g, -0.26, 0, -0.26, 0.52, 0.85, 0.52, c1); box(g, -0.3, 0.85, -0.3, 0.6, 0.12, 0.6, c2);
        if (nb.e) { box(g, 0.26, 0, -0.18, 0.24, 0.65, 0.36, c1); box(g, 0.26, 0.65, -0.21, 0.24, 0.1, 0.42, c2); }
        if (nb.w) { box(g, -0.5, 0, -0.18, 0.24, 0.65, 0.36, c1); box(g, -0.5, 0.65, -0.21, 0.24, 0.1, 0.42, c2); }
        if (nb.s) { box(g, -0.18, 0, 0.26, 0.36, 0.65, 0.24, c1); box(g, -0.21, 0.65, 0.26, 0.42, 0.1, 0.24, c2); }
        if (nb.n) { box(g, -0.18, 0, -0.5, 0.36, 0.65, 0.24, c1); box(g, -0.21, 0.65, -0.5, 0.42, 0.1, 0.24, c2); }
        if (A >= 2) {   // battlements on the post and along the runs
          [[-0.3, -0.3], [0.18, -0.3], [-0.3, 0.18], [0.18, 0.18]].forEach(([x, z]) => box(g, x, 0.97, z, 0.12, 0.14, 0.12, c2));
          if (nb.e) box(g, 0.32, 0.75, -0.04, 0.12, 0.12, 0.08, c2); if (nb.w) box(g, -0.44, 0.75, -0.04, 0.12, 0.12, 0.08, c2);
          if (nb.s) box(g, -0.04, 0.75, 0.32, 0.08, 0.12, 0.12, c2); if (nb.n) box(g, -0.04, 0.75, -0.44, 0.08, 0.12, 0.12, c2);
        }
        if (A >= 3) box(g, -0.31, 0.5, -0.31, 0.62, 0.06, 0.62, P.trim);   // gold band
        if (A >= 4) box(g, -0.3, 0.97, -0.3, 0.6, 0.08, 0.6, A >= 6 ? 0x7fe0ff : A >= 5 ? 0xb87333 : 0xe9e3d7, A >= 6 ? LAMP : undefined);   // marble cap, copper, then a glowing barrier rail
        if (A >= 6) { if (nb.e) box(g, 0.26, 0.5, -0.03, 0.24, 0.06, 0.06, 0x7fe0ff, LAMP); if (nb.w) box(g, -0.5, 0.5, -0.03, 0.24, 0.06, 0.06, 0x7fe0ff, LAMP); if (nb.s) box(g, -0.03, 0.5, 0.26, 0.06, 0.06, 0.24, 0x7fe0ff, LAMP); if (nb.n) box(g, -0.03, 0.5, -0.5, 0.06, 0.06, 0.24, 0x7fe0ff, LAMP); }
      }
      break;
    }
    case 'tower': {
      let topY0;
      if (A === 0) {
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.05, 0, z * 0.3 - 0.05, 0.1, 0.85, 0.1, WOOD));
        box(g, -0.4, 0.8, -0.4, 0.8, 0.08, 0.8, 0x9a6a3c);
        box(g, -0.4, 0.88, -0.4, 0.8, 0.12, 0.06, WOOD); box(g, -0.4, 0.88, 0.34, 0.8, 0.12, 0.06, WOOD);
        box(g, -0.4, 0.88, -0.4, 0.06, 0.12, 0.8, WOOD); box(g, 0.34, 0.88, -0.4, 0.06, 0.12, 0.8, WOOD);
        box(g, 0.28, 0.9, 0.28, 0.1, 0.1, 0.1, 0xffc36b, LAMP);
        topY0 = 0.88;
      } else {
        box(g, -0.32, 0, -0.32, 0.64, 0.9, 0.64, STONE);
        box(g, -0.4, 0.9, -0.4, 0.8, 0.1, 0.8, STONE_TOP);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.1, 1.0, z * 0.3 - 0.1, 0.2, 0.14, 0.2, STONE_TOP));
        box(g, -0.06, 0.4, 0.32, 0.12, 0.2, 0.03, 0xffd36b, LAMP);
        flagAt(g, -0.3, 1.0, -0.3, P.flag);
        topY0 = 1.0;
      }
      const tur = new THREE.Group();
      tur.position.set(0, topY0, 0);
      const fx = makeUnitModel('archer', 'fox', 0.7);
      tur.add(fx);
      g.add(tur);
      b.turret = tur;
      break;
    }
    case 'ballista': {
      box(g, -0.34, 0, -0.34, 0.68, 1.0, 0.68, STONE);
      box(g, -0.42, 1.0, -0.42, 0.84, 0.1, 0.84, STONE_TOP);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.32 - 0.09, 1.1, z * 0.32 - 0.09, 0.18, 0.12, 0.18, STONE_TOP));
      flagAt(g, -0.32, 1.1, -0.32, P.flag);
      const tur = new THREE.Group();
      tur.position.set(0, 1.1, 0);
      box(tur, -0.18, 0, -0.18, 0.36, 0.1, 0.36, 0x5a3a22);
      box(tur, -0.45, 0.12, -0.04, 0.9, 0.06, 0.06, 0x7b5232);
      box(tur, -0.05, 0.1, -0.3, 0.1, 0.08, 0.7, 0x5a3a22);
      box(tur, -0.03, 0.16, 0.05, 0.06, 0.04, 0.5, 0xdfe4e8);
      g.add(tur); b.turret = tur;
      break;
    }
    case 'refinery': {
      box(g, -0.42, 0, -0.42, 0.84, 0.5, 0.84, 0x2f3b4a);
      box(g, -0.3, 0.5, -0.3, 0.6, 0.3, 0.6, 0x1b2430);
      [[-0.3, -0.3], [0.1, -0.3], [-0.3, 0.1], [0.1, 0.1]].forEach(([x, z]) => { box(g, x, 0.8, z, 0.2, 0.45, 0.2, 0x3b4a5a); box(g, x + 0.04, 1.25, z + 0.04, 0.12, 0.1, 0.12, 0xff7a2a, LAMP); });
      box(g, -0.1, 0.1, 0.42, 0.2, 0.3, 0.03, 0xffb347, LAMP);
      break;
    }
    case 'collider': {
      box(g, -0.95, 0, -0.95, 1.9, 0.2, 1.9, 0x3a2a5a);
      [[-0.9, -0.9, 1.8, 0.2], [-0.9, 0.7, 1.8, 0.2], [-0.9, -0.7, 0.2, 1.4], [0.7, -0.7, 0.2, 1.4]].forEach(([x, z, w, d]) => box(g, x, 0.2, z, w, 0.5, d, 0x22183a));
      [[-0.85, -0.85, 1.7, 0.1], [-0.85, 0.75, 1.7, 0.1], [-0.85, -0.75, 0.1, 1.5], [0.75, -0.75, 0.1, 1.5]].forEach(([x, z, w, d]) => box(g, x, 0.5, z, w, 0.08, d, 0xb060ff, LAMP));
      box(g, -0.3, 0.2, -0.3, 0.6, 0.9, 0.6, 0x3a2a5a); box(g, -0.15, 1.1, -0.15, 0.3, 0.3, 0.3, 0xe6c7ff, LAMP);
      const ring = new THREE.Group(); ring.position.set(0, 0.8, 0);
      [0, 1, 2, 3, 4, 5].forEach(k => { const a = k / 6 * Math.PI * 2; box(ring, Math.cos(a) * 0.55 - 0.05, 0, Math.sin(a) * 0.55 - 0.05, 0.1, 0.1, 0.1, 0xb060ff, LAMP); });
      g.add(ring); (g.userData.spin = g.userData.spin || []).push(ring);
      break;
    }
    case 'reactor': {
      box(g, -0.95, 0, -0.95, 1.9, 0.3, 1.9, 0x2f3b4a);
      [[0.8, 0.5], [0.62, 0.4], [0.4, 0.3]].forEach(([s, h], k) => box(g, -s, 0.3 + k * 0.45, -s, s * 2, h, s * 2, k % 2 ? 0x1b2430 : 0x2f3b4a));
      box(g, -0.22, 0.45, -0.22, 0.44, 1.1, 0.44, 0xff7a2a, LAMP);
      [[-0.9, 0], [0.7, 0], [0, -0.9], [0, 0.7]].forEach(([x, z]) => { box(g, x, 0.3, z, 0.2, 0.9, 0.2, 0x1b2430); box(g, x + 0.05, 1.2, z + 0.05, 0.1, 0.3, 0.1, 0xffb347, LAMP); });
      box(g, -0.3, 1.7, -0.3, 0.6, 0.08, 0.6, 0xffb347);
      break;
    }
    case 'orbital': {
      box(g, -0.4, 0, -0.4, 0.8, 0.14, 0.8, 0xe8ecf4);
      box(g, -0.1, 0.14, -0.1, 0.2, 1.1, 0.2, 0x2a3350);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.04, 0.14, z * 0.3 - 0.04, 0.08, 0.6, 0.08, 0xc3d0ff));
      const tur = new THREE.Group(); tur.position.set(0, 1.24, 0);
      box(tur, -0.45, 0, -0.45, 0.9, 0.08, 0.9, 0xe8ecf4); box(tur, -0.32, 0.08, -0.32, 0.64, 0.08, 0.64, 0x5c6fff); box(tur, -0.06, 0.16, -0.06, 0.12, 0.3, 0.12, 0xc3d0ff, LAMP);
      g.add(tur); b.turret = tur; (g.userData.spin = g.userData.spin || []).push(tur);
      break;
    }
    case 'nanoforge': {
      box(g, -0.42, 0, -0.42, 0.84, 0.3, 0.84, 0x1f2a2a);
      [[-0.34, -0.34], [0.14, -0.34], [-0.34, 0.14], [0.14, 0.14]].forEach(([x, z]) => box(g, x, 0.3, z, 0.2, 0.7, 0.2, 0x0f1a1a));
      box(g, -0.3, 0.55, -0.3, 0.6, 0.12, 0.6, 0x19e6a0, LAMP); box(g, -0.3, 0.95, -0.3, 0.6, 0.12, 0.6, 0x19e6a0, LAMP);
      box(g, -0.12, 0.3, -0.12, 0.24, 0.9, 0.24, 0x7fffd4, LAMP);
      break;
    }
    case 'quantum': {
      box(g, -0.36, 0, -0.36, 0.72, 0.12, 0.72, 0x3a2a5a);
      [[0.22, 0.9], [0.16, 0.7], [0.1, 0.5]].forEach(([s, h], k) => box(g, -s, 0.12 + k * 0.75, -s, s * 2, h, s * 2, k % 2 ? 0x22183a : 0x3a2a5a));
      [0.5, 1.0, 1.5].forEach(y => box(g, -0.3, y, -0.3, 0.6, 0.05, 0.6, 0xb060ff, LAMP));
      const tur = new THREE.Group(); tur.position.set(0, 2.1, 0);
      box(tur, -0.12, 0, -0.12, 0.24, 0.24, 0.24, 0xe6c7ff, LAMP);
      g.add(tur); b.turret = tur; (g.userData.spin = g.userData.spin || []).push(tur);
      break;
    }
    case 'starbeacon': {
      box(g, -0.95, 0, -0.95, 1.9, 0.2, 1.9, 0x3a3f66);
      box(g, -0.55, 0.2, -0.55, 1.1, 0.25, 1.1, 0xf6f1ff);
      box(g, -0.2, 0.45, -0.2, 0.4, 2.4, 0.4, 0xf6f1ff); box(g, -0.08, 2.85, -0.08, 0.16, 0.5, 0.16, 0xffd36b, LAMP);
      [[-0.85, -0.85], [0.65, -0.85], [-0.85, 0.65], [0.65, 0.65]].forEach(([x, z]) => box(g, x, 0.2, z, 0.2, 0.5, 0.2, 0xffd36b, LAMP));
      const ring = new THREE.Group(); ring.position.set(0, 1.6, 0);
      [0, 1, 2, 3].forEach(k => { const a = k / 4 * Math.PI * 2; box(ring, Math.cos(a) * 0.6 - 0.06, 0, Math.sin(a) * 0.6 - 0.06, 0.12, 0.12, 0.12, 0xffffff, LAMP); });
      g.add(ring); (g.userData.spin = g.userData.spin || []).push(ring);
      break;
    }
    case 'skyscraper': {
      const h1 = hash(b.i * 3, b.j * 5);
      box(g, -0.9, 0, -0.9, 1.8, 0.2, 1.8, 0x8a929c);
      const tiers = [[0.8, 1.4], [0.68, 1.2], [0.56, 1.0], [0.44, 0.6 + h1 * 0.5]];
      let y = 0.2;
      for (const [s, hh] of tiers) {
        box(g, -s, y, -s, s * 2, hh, s * 2, 0xdfe6f0);
        for (let fl = 0; fl < Math.floor(hh / 0.3); fl++) { const fy = y + 0.08 + fl * 0.3; box(g, -s - 0.01, fy, -s + 0.1, 0.02, 0.14, s * 2 - 0.2, 0xbfe3f2, LAMP); box(g, s - 0.01, fy, -s + 0.1, 0.02, 0.14, s * 2 - 0.2, 0xbfe3f2, LAMP); box(g, -s + 0.1, fy, s - 0.01, s * 2 - 0.2, 0.14, 0.02, 0xbfe3f2, LAMP); box(g, -s + 0.1, fy, -s - 0.01, s * 2 - 0.2, 0.14, 0.02, 0xbfe3f2, LAMP); }
        box(g, -s - 0.03, y + hh - 0.06, -s - 0.03, s * 2 + 0.06, 0.06, s * 2 + 0.06, 0x2cc4d8);
        y += hh;
      }
      box(g, -0.03, y, -0.03, 0.06, 0.6, 0.06, 0x3b4a5a); box(g, -0.05, y + 0.6, -0.05, 0.1, 0.1, 0.1, 0xff4a6a, LAMP);
      break;
    }
    case 'laser': {
      box(g, -0.3, 0, -0.3, 0.6, 0.12, 0.6, 0x8a929c);
      box(g, -0.14, 0.12, -0.14, 0.28, 1.3, 0.28, 0xdfe6f0);
      [0.4, 0.8].forEach(yy => box(g, -0.17, yy, -0.17, 0.34, 0.06, 0.34, 0x2cc4d8));
      const tur = new THREE.Group();
      tur.position.set(0, 1.42, 0);
      box(tur, -0.2, 0, -0.2, 0.4, 0.14, 0.4, 0x3b4a5a);
      box(tur, -0.1, 0.12, -0.1, 0.2, 0.2, 0.2, 0xdfe6f0);
      box(tur, -0.06, 0.16, 0.08, 0.12, 0.12, 0.45, 0x3b4a5a); box(tur, -0.05, 0.17, 0.5, 0.1, 0.1, 0.06, 0x5cf0ff, LAMP);
      g.add(tur); b.turret = tur;
      break;
    }
    case 'skyport': {
      box(g, -0.95, 0, -0.95, 1.9, 0.14, 1.9, 0x8a929c);
      box(g, -0.8, 0.14, -0.8, 1.6, 0.04, 1.6, 0x3b4a5a);
      [[-0.7, -0.7], [0.5, -0.7], [-0.7, 0.5], [0.5, 0.5]].forEach(([x, z]) => box(g, x, 0.18, z, 0.2, 0.06, 0.2, 0x7fe0ff, LAMP));
      box(g, -0.6, 0.17, -0.04, 1.2, 0.03, 0.08, 0x7fe0ff, LAMP); box(g, -0.04, 0.17, -0.6, 0.08, 0.03, 1.2, 0x7fe0ff, LAMP);
      box(g, 0.55, 0.18, -0.9, 0.35, 0.9, 0.35, 0xdfe6f0); box(g, 0.6, 1.08, -0.85, 0.25, 0.2, 0.25, 0x2cc4d8);
      const dr = new THREE.Group(); dr.position.set(-0.3, 0.9, 0.2);
      box(dr, -0.12, 0, -0.12, 0.24, 0.12, 0.24, 0xdfe6f0); box(dr, -0.3, 0.12, -0.02, 0.6, 0.03, 0.04, 0x3b4a5a); box(dr, -0.02, 0.12, -0.3, 0.04, 0.03, 0.6, 0x3b4a5a); box(dr, -0.05, -0.08, -0.05, 0.1, 0.08, 0.1, 0x5cf0ff, LAMP);
      g.add(dr); (g.userData.spin = g.userData.spin || []).push(dr);
      break;
    }
    case 'bombard': {
      box(g, -0.46, 0, -0.46, 0.92, 0.6, 0.92, 0xe9e3d7);
      box(g, -0.52, 0.6, -0.52, 1.04, 0.1, 1.04, 0xd4af37);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.4 - 0.08, 0.7, z * 0.4 - 0.08, 0.16, 0.16, 0.16, 0xe9e3d7));
      flagAt(g, -0.44, 0.7, -0.44, P.flag);
      const tur = new THREE.Group();
      tur.position.set(0, 0.7, 0);
      box(tur, -0.26, 0, -0.26, 0.52, 0.22, 0.52, 0x5a4a3a);
      box(tur, -0.17, 0.2, -0.2, 0.34, 0.34, 0.6, 0x8c6d3a);
      box(tur, -0.2, 0.18, 0.3, 0.4, 0.38, 0.1, 0xd4af37);
      box(tur, -0.12, 0.26, -0.3, 0.24, 0.24, 0.1, 0x3b3f45);
      g.add(tur); b.turret = tur;
      break;
    }
    case 'turret': {
      box(g, -0.34, 0, -0.34, 0.68, 0.95, 0.68, 0x707b87);
      box(g, -0.4, 0.95, -0.4, 0.8, 0.08, 0.8, 0xe0b24a);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.06, 0.3 + z * 0.1, z * 0.3 - 0.06, 0.12, 0.3, 0.12, 0xb87333));
      box(g, -0.06, 0.35, 0.34, 0.12, 0.2, 0.03, 0xffd36b, LAMP);
      flagAt(g, -0.3, 1.03, -0.3, P.flag);
      const tur = new THREE.Group();
      tur.position.set(0, 1.03, 0);
      box(tur, -0.2, 0, -0.2, 0.4, 0.16, 0.4, 0x3f464f);
      box(tur, -0.16, 0.14, -0.16, 0.32, 0.26, 0.32, 0xb87333);
      [-0.08, 0.08].forEach(x => box(tur, x - 0.03, 0.22, 0.1, 0.06, 0.06, 0.5, 0x25282c));
      box(tur, -0.1, 0.4, -0.1, 0.2, 0.08, 0.2, 0xe0b24a);
      g.add(tur); b.turret = tur;
      break;
    }
    case 'cannon': {
      box(g, -0.4, 0, -0.4, 0.8, 0.8, 0.8, 0x6c737a);
      box(g, -0.46, 0.8, -0.46, 0.92, 0.1, 0.92, 0xe3b44e);
      box(g, -0.42, 0.9, -0.42, 0.84, 0.08, 0.84, 0x8a919a);
      box(g, -0.08, 0.3, 0.4, 0.16, 0.25, 0.03, 0x25282c);
      flagAt(g, -0.38, 0.98, -0.38, P.flag);
      const tur = new THREE.Group();
      tur.position.set(0, 0.98, 0);
      box(tur, -0.2, 0, -0.2, 0.4, 0.2, 0.4, 0x3b3f45);
      box(tur, -0.12, 0.16, -0.12, 0.24, 0.22, 0.75, 0x25282c);
      box(tur, -0.14, 0.14, 0.5, 0.28, 0.26, 0.08, 0xe3b44e);
      g.add(tur); b.turret = tur;
      break;
    }
    case 'barracks':
      box(g, -0.85, 0, -0.9, 1.7, 0.55, 1.2, P.wall);
      box(g, -0.85, 0, -0.9, 1.7, 0.08, 1.2, 0x6f6a62);
      if (A >= 1) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.82 - 0.04, 0, z * 0.57 - 0.3 - 0.04, 0.08, 0.55, 0.08, P.beam));
      box(g, -0.95, 0.55, -0.95, 1.9, 0.1, 1.3, P.roof); box(g, -0.8, 0.65, -0.8, 1.6, 0.1, 1.0, P.roof); box(g, -0.55, 0.75, -0.6, 1.1, 0.1, 0.6, P.roof);
      box(g, -0.15, 0, 0.29, 0.3, 0.35, 0.03, 0x3a2616);
      box(g, -0.6, 0.28, 0.29, 0.18, 0.2, 0.03, 0xc0392b); box(g, 0.42, 0.28, 0.29, 0.18, 0.2, 0.03, 0x2f5fb3);
      box(g, 0.6, 0, 0.65, 0.06, 0.4, 0.06, WOOD); box(g, 0.5, 0.25, 0.63, 0.26, 0.08, 0.08, WOOD); box(g, 0.58, 0.4, 0.62, 0.1, 0.1, 0.1, 0xe2c36b);
      box(g, -0.7, 0, 0.62, 0.3, 0.2, 0.1, WOOD);
      flagAt(g, -0.85, 0.75, -0.85, P.flag);
      break;
    case 'keep':
      if (A === 0) {
        box(g, -1.1, 0, -1.0, 2.2, 0.7, 2.0, P.wall);
        box(g, -1.1, 0, -1.0, 2.2, 0.08, 2.0, 0x6b4a2f);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 1.05 - 0.06, 0, z * 0.95 - 0.06, 0.12, 0.7, 0.12, P.beam));
        roofPyr(g, 0, 0.7, 0, 2.4, P.roof, 6, 0.4);
        box(g, -0.2, 0, 1.0, 0.4, 0.5, 0.04, 0x3a2616);
        flagAt(g, 0, 1.42, 0, P.flag);
      } else if (A === 1) {
        box(g, -1.1, 0, -1.1, 2.2, 0.45, 2.2, STONE);
        box(g, -0.95, 0.45, -0.95, 1.9, 0.65, 1.9, P.wall);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.92 - 0.06, 0.45, z * 0.92 - 0.06, 0.12, 0.65, 0.12, P.beam));
        roofPyr(g, 0, 1.1, 0, 2.3, P.roof, 6, 0.38);
        box(g, 0.75, 0, 0.75, 0.5, 1.5, 0.5, STONE);
        roofPyr(g, 1.0, 1.5, 1.0, 0.66, P.roof, 3, 0.22);
        box(g, -0.2, 0, 1.1, 0.4, 0.5, 0.04, 0x3a2616);
        flagAt(g, 0, 1.7, 0, P.flag);
      } else {
        const st = A === 2 ? 0x9ca3aa : 0xb9bec6, st2 = A === 2 ? 0xa9afb5 : 0xc6ccd1;
        box(g, -1.3, 0, -1.3, 2.6, 1.0, 2.6, st);
        for (let k = 0; k < 6; k++) {
          const p = -1.3 + k * 0.48;
          box(g, p, 1.0, -1.3, 0.26, 0.16, 0.26, st2); box(g, p, 1.0, 1.04, 0.26, 0.16, 0.26, st2);
          box(g, -1.3, 1.0, p, 0.26, 0.16, 0.26, st2); box(g, 1.04, 1.0, p, 0.26, 0.16, 0.26, st2);
        }
        box(g, -0.65, 1.0, -0.65, 1.3, 1.0, 1.3, st2);
        roofPyr(g, 0, 2.0, 0, 1.5, P.roof, 5, 0.3);
        if (A >= 3) { box(g, -0.7, 1.95, -0.7, 1.4, 0.06, 1.4, P.trim); box(g, -0.05, 2.6, -0.05, 0.1, 0.5, 0.1, P.trim); }
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
          box(g, x * 1.15 - 0.25, 0, z * 1.15 - 0.25, 0.5, 1.5, 0.5, st2);
          roofPyr(g, x * 1.15, 1.5, z * 1.15, 0.66, P.roof, 3, 0.22);
          if (A >= 3) box(g, x * 1.15 - 0.27, 1.3, z * 1.15 - 0.27, 0.54, 0.06, 0.54, P.trim);
        });
        box(g, -0.3, 0, 1.3, 0.6, 0.7, 0.04, 0x3a2616);
        flagAt(g, 0, A >= 3 ? 3.0 : 2.5, 0, P.flag);
      }
      break;
  }
  return g;
}

/* ===================== icons for the dock ===================== */
function shade(c, f) { return `rgb(${Math.min(255, ((c >> 16) & 255) * f) | 0},${Math.min(255, ((c >> 8) & 255) * f) | 0},${Math.min(255, (c & 255) * f) | 0})`; }
function iso(cx, cy, w, h, top, side) {
  const a = w, b = w / 2;
  return `<polygon points="${cx},${cy - b} ${cx + a},${cy} ${cx},${cy + b} ${cx - a},${cy}" fill="${shade(top, 1.08)}"/>` +
    `<polygon points="${cx - a},${cy} ${cx},${cy + b} ${cx},${cy + b + h} ${cx - a},${cy + h}" fill="${shade(side, 0.86)}"/>` +
    `<polygon points="${cx + a},${cy} ${cx},${cy + b} ${cx},${cy + b + h} ${cx + a},${cy + h}" fill="${shade(side, 0.64)}"/>`;
}
const ICONS = {
  house: [[24, 24, 13, 12, 0xd2c2a6, 0xd2c2a6], [24, 17, 16, 5, 0xa5513f, 0xa5513f]],
  infirmary: [[24, 27, 13, 10, 0xf1ebdc, 0xf1ebdc], [24, 19, 15, 5, 0x5fa05a, 0x5fa05a], [24, 26, 3, 4, 0xd9442f, 0xd9442f]],
  sapling: [[24, 32, 14, 3, 0x5a4030, 0x4a3426], [24, 24, 3, 9, 0x6b4a2f, 0x4a3426], [24, 16, 9, 6, 0x6fcf57, 0x4fb243]],
  berrybed: [[24, 30, 15, 4, 0x6b4a2f, 0x4a3426], [20, 24, 5, 4, 0x5aae4a, 0x3f8a35], [28, 24, 5, 4, 0x5aae4a, 0x3f8a35], [24, 20, 4, 4, 0xd9344a, 0xb52a3c]],
  farm: [[24, 28, 17, 3, 0x6fb04a, 0x6b4a2f], [16, 26, 4, 3, 0xd9344a, 0xd9344a], [30, 28, 4, 3, 0xd9344a, 0xd9344a]],
  camp: [[24, 28, 15, 5, 0x9a6a3c, 0x7a5c3a], [24, 18, 16, 4, 0xd8b85c, 0xb9964a]],
  quarry: [[19, 30, 10, 8, 0xa9afb5, 0x8a9096], [29, 25, 9, 7, 0xb6bcc2, 0x7d848c]],
  market: [[24, 28, 14, 8, 0x9a6a3c, 0x7b5232], [24, 19, 16, 4, 0xe56b6f, 0xd9a5a5]],
  barracks: [[24, 27, 17, 10, 0x9ca3aa, 0x9ca3aa], [24, 19, 19, 5, 0x3e6199, 0x3e6199]],
  smith: [[24, 28, 13, 10, 0x7d848c, 0x7d848c], [24, 20, 15, 4, 0x3b3f45, 0x3b3f45], [31, 14, 3, 3, 0xff8a2b, 0xff8a2b]],
  palisade: [[24, 28, 6, 14, 0xb0814e, 0x8b5e34], [16, 26, 4, 12, 0xb0814e, 0x8b5e34], [32, 26, 4, 12, 0xb0814e, 0x8b5e34]],
  wall: [[24, 30, 9, 12, 0xc6ccd1, 0x9aa1a8], [15, 26, 5, 8, 0xc6ccd1, 0x9aa1a8]],
  tower: [[24, 30, 8, 16, 0xb9bfc5, 0x9aa1a8], [24, 16, 11, 3, 0xc6ccd1, 0xc6ccd1]],
  ballista: [[24, 30, 8, 16, 0xb9bfc5, 0x9aa1a8], [24, 16, 11, 3, 0xc6ccd1, 0xc6ccd1], [24, 12, 6, 2, 0x7b5232, 0x5a3a22]],
  cannon: [[24, 31, 10, 13, 0x6c737a, 0x6c737a], [24, 18, 12, 3, 0xe3b44e, 0xb98c2a], [24, 13, 4, 5, 0x25282c, 0x25282c]],
  refinery: [[24, 30, 14, 8, 0x2f3b4a, 0x1b2430], [18, 20, 4, 8, 0x3b4a5a, 0x2a3340], [30, 20, 4, 8, 0x3b4a5a, 0x2a3340], [24, 14, 6, 4, 0xff7a2a, 0xff7a2a]],
  collider: [[24, 30, 20, 8, 0x3a2a5a, 0x22183a], [24, 24, 16, 4, 0xb060ff, 0x8a3fd0], [24, 16, 8, 8, 0xe6c7ff, 0xb060ff]],
  reactor: [[24, 30, 20, 8, 0x2f3b4a, 0x1b2430], [24, 22, 12, 6, 0x2f3b4a, 0x1b2430], [24, 15, 5, 8, 0xff7a2a, 0xff7a2a]],
  orbital: [[24, 32, 10, 5, 0xe8ecf4, 0xc3d0ff], [24, 20, 4, 14, 0x2a3350, 0x1b2430], [24, 12, 16, 4, 0xe8ecf4, 0x5c6fff]],
  nanoforge: [[24, 32, 14, 5, 0x1f2a2a, 0x0f1a1a], [24, 22, 8, 12, 0x7fffd4, 0x19e6a0], [24, 17, 12, 3, 0x19e6a0, 0x19e6a0]],
  quantum: [[24, 33, 12, 4, 0x3a2a5a, 0x22183a], [24, 20, 6, 16, 0x3a2a5a, 0x22183a], [24, 8, 5, 5, 0xe6c7ff, 0xb060ff]],
  starbeacon: [[24, 32, 18, 6, 0x3a3f66, 0x2a2f4d], [24, 16, 6, 18, 0xf6f1ff, 0xd8d2e8], [24, 6, 4, 6, 0xffd36b, 0xffd36b]],
  skyscraper: [[24, 34, 14, 6, 0xdfe6f0, 0xb9c3cf], [24, 24, 12, 10, 0xdfe6f0, 0xb9c3cf], [24, 14, 9, 10, 0xdfe6f0, 0xb9c3cf], [24, 10, 2, 5, 0x2cc4d8, 0x2cc4d8]],
  laser: [[24, 32, 10, 5, 0x8a929c, 0x6f777f], [24, 18, 5, 16, 0xdfe6f0, 0xb9c3cf], [24, 12, 8, 5, 0x3b4a5a, 0x2b3744], [24, 9, 4, 3, 0x5cf0ff, 0x5cf0ff]],
  skyport: [[24, 30, 20, 5, 0x3b4a5a, 0x2b3744], [24, 28, 10, 2, 0x7fe0ff, 0x7fe0ff], [32, 20, 5, 10, 0xdfe6f0, 0xb9c3cf], [18, 18, 6, 3, 0xdfe6f0, 0xb9c3cf]],
  bombard: [[24, 32, 13, 10, 0xe9e3d7, 0xcfc8ba], [24, 22, 15, 3, 0xd4af37, 0xb8922a], [24, 16, 8, 7, 0x8c6d3a, 0x6b5230]],
  turret: [[24, 31, 9, 15, 0x707b87, 0x5a636e], [24, 16, 11, 3, 0xe0b24a, 0xb8922a], [24, 11, 7, 6, 0xb87333, 0x8f5a28]]
};
function iconSVG(type) {
  if (type === 'wall' && G.age === 0) type = 'palisade';
  return `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ICONS[type].map(a => iso(...a)).join('')}</svg>`;
}
function unitIconSVG(sp) {
  const S = SPEC[sp], c = shade(S.body, 1), sn = shade(S.sn.c, 1);
  const ear = sp === 'rabbit' ? `<rect x="14" y="4" width="6" height="16" fill="${c}"/><rect x="28" y="4" width="6" height="16" fill="${c}"/>` :
    sp === 'panda' ? `<rect x="11" y="9" width="9" height="9" fill="#1f1f22"/><rect x="28" y="9" width="9" height="9" fill="#1f1f22"/>` :
    `<polygon points="12,20 14,6 22,14" fill="${c}"/><polygon points="36,20 34,6 26,14" fill="${c}"/>`;
  const patch = sp === 'panda' ? `<rect x="15" y="20" width="7" height="8" fill="#1f1f22"/><rect x="26" y="20" width="7" height="8" fill="#1f1f22"/>` : '';
  return `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ear}<rect x="10" y="14" width="28" height="24" fill="${c}"/>${patch}<rect x="17" y="27" width="14" height="11" fill="${sn}"/><rect x="20" y="27" width="8" height="4" fill="#1a1a1a"/><rect x="16" y="22" width="4" height="4" fill="#111"/><rect x="28" y="22" width="4" height="4" fill="#111"/></svg>`;
}
