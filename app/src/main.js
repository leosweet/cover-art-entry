// Wires the editor: the photo shelf, the panel and caption controls, dragging
// a panel's photo to reposition it, and the PNG export. The cover canvas is
// always rendered at the export resolution and CSS-scaled to fit the page, so
// what the person sees is what the PNG holds. A `?shot=` query sets up a
// fixed scene for a screenshot instead (./shots.js).

import { renderCover } from './cover.js';
import { GRADES } from './grades.js';
import { SIZES, layoutFor } from './layouts.js';
import { PhotoShelf } from './photos.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const shelf = new PhotoShelf();

// Collect page errors for the verification run to read back.
window.__errors = [];
window.addEventListener('error', (e) => window.__errors.push(String(e.message)));

/** A fresh cover: boulevard hero, pier beside it, boulevard detail below. */
function defaultState() {
  return {
    size: 'square',
    layout: 'duo',
    grade: 'sunset',
    title: 'Sunset Heist',
    subtitle: 'Boulevard Queen',
    titleSize: 1,
    titleColor: 'sunset',
    titlePlace: 'bottom',
    panels: [
      { photo: 0, fx: 0.55, fy: 0.38, zoom: 1, grade: null },
      { photo: 1, fx: 0.42, fy: 0.32, zoom: 1, grade: null },
      { photo: 0, fx: 0.16, fy: 0.62, zoom: 1.7, grade: null },
    ],
  };
}

const state = defaultState();
let selected = 0;

function redraw() {
  renderCover(canvas, state, shelf.list);
  document.querySelectorAll('[data-size]').forEach((b) =>
    b.classList.toggle('active', b.dataset.size === state.size));
  document.querySelectorAll('[data-layout]').forEach((b) =>
    b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('[data-panel-tab]').forEach((b) =>
    b.classList.toggle('active', Number(b.dataset.panelTab) === selected));
  const panel = state.panels[selected];
  const photoSelect = document.getElementById('panelPhoto');
  if (photoSelect) photoSelect.value = String(panel.photo);
  const zoom = document.getElementById('zoom');
  if (zoom) zoom.value = String(panel.zoom);
  const grade = document.getElementById('panelGrade');
  if (grade) grade.value = panel.grade ?? '';
  const zoomLabel = document.getElementById('zoomLabel');
  if (zoomLabel) zoomLabel.textContent = `${Math.round(panel.zoom * 100)}%`;
  const gradeSel = document.getElementById('grade');
  if (gradeSel) gradeSel.value = state.grade;
  const colorSel = document.getElementById('titleColor');
  if (colorSel) colorSel.value = state.titleColor;
  const placeSel = document.getElementById('titlePlace');
  if (placeSel) placeSel.value = state.titlePlace;
}

function say(text) {
  status.textContent = text;
}

/** Rebuilds the photo shelf buttons and the panel photo menu. */
function rebuildShelf() {
  const box = document.getElementById('shelf');
  box.textContent = '';
  const photoSelect = document.getElementById('panelPhoto');
  photoSelect.textContent = '';
  shelf.list.forEach((img, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = shelf.names[i] ?? `Photo ${i + 1}`;
    photoSelect.appendChild(o);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.title = shelf.names[i] ?? `Photo ${i + 1}`;
    const thumb = document.createElement('canvas');
    thumb.width = 96;
    thumb.height = 64;
    const t = thumb.getContext('2d');
    const s = Math.max(96 / img.naturalWidth, 64 / img.naturalHeight);
    t.drawImage(img, (96 - img.naturalWidth * s) / 2, (64 - img.naturalHeight * s) / 2,
      img.naturalWidth * s, img.naturalHeight * s);
    b.appendChild(thumb);
    b.addEventListener('click', () => {
      state.panels[selected].photo = i;
      redraw();
      say(`Panel ${selected + 1} now shows ${shelf.names[i] ?? 'that photo'}.`);
    });
    box.appendChild(b);
  });
}

async function addFiles(files) {
  let added = 0;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const index = await shelf.addFile(file);
    state.panels[selected].photo = index;
    added += 1;
  }
  if (added) {
    rebuildShelf();
    redraw();
    say(`Added ${added} photo${added > 1 ? 's' : ''} to panel ${selected + 1}.`);
  }
}

/** Exports the cover at full resolution as a PNG download. */
function exportPNG() {
  renderCover(canvas, state, shelf.list);
  const size = SIZES[state.size];
  canvas.toBlob((blob) => {
    if (!blob) {
      say('Export failed — the browser could not make the PNG.');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${size.file}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    say(`Saved cover-${size.file}.png (${size.w} x ${size.h}).`);
  }, 'image/png');
}

// ---- controls ----
document.querySelectorAll('[data-size]').forEach((b) =>
  b.addEventListener('click', () => { state.size = b.dataset.size; redraw(); }));
document.querySelectorAll('[data-layout]').forEach((b) =>
  b.addEventListener('click', () => { state.layout = b.dataset.layout; redraw(); }));
document.querySelectorAll('[data-panel-tab]').forEach((b) =>
  b.addEventListener('click', () => { selected = Number(b.dataset.panelTab); redraw(); }));

const gradeSelect = document.getElementById('grade');
for (const [key, g] of Object.entries(GRADES)) {
  const o = document.createElement('option');
  o.value = key;
  o.textContent = g.label;
  gradeSelect.appendChild(o);
}
gradeSelect.value = state.grade;
gradeSelect.addEventListener('change', () => { state.grade = gradeSelect.value; redraw(); });

const panelPhoto = document.getElementById('panelPhoto');
panelPhoto.addEventListener('change', () => {
  state.panels[selected].photo = Number(panelPhoto.value);
  redraw();
});
const panelGrade = document.getElementById('panelGrade');
panelGrade.addEventListener('change', () => {
  state.panels[selected].grade = panelGrade.value || null;
  redraw();
});
document.getElementById('zoom').addEventListener('input', (e) => {
  state.panels[selected].zoom = Number(e.target.value);
  redraw();
});
document.getElementById('zoomIn').addEventListener('click', () => {
  const p = state.panels[selected];
  p.zoom = Math.min(4, p.zoom * 1.25);
  redraw();
});
document.getElementById('zoomOut').addEventListener('click', () => {
  const p = state.panels[selected];
  p.zoom = Math.max(1, p.zoom / 1.25);
  redraw();
});

const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
document.getElementById('titleSize').addEventListener('input', (e) => {
  state.titleSize = Number(e.target.value);
  redraw();
});
document.getElementById('titleColor').addEventListener('change', (e) => {
  state.titleColor = e.target.value;
  redraw();
});
document.getElementById('titlePlace').addEventListener('change', (e) => {
  state.titlePlace = e.target.value;
  redraw();
});
document.getElementById('export').addEventListener('click', exportPNG);
document.getElementById('photo').addEventListener('change', (e) => addFiles(e.target.files));

// Drag & drop a photo anywhere on the preview: it lands in the selected panel.
canvas.addEventListener('dragover', (e) => e.preventDefault());
canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  addFiles(e.dataTransfer.files);
});

// ---- direct manipulation on the preview ----
// Click picks a panel; drag pans its photo; the wheel zooms it.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const nx = (e.clientX - r.left) / r.width;
  const ny = (e.clientY - r.top) / r.height;
  const { panels } = layoutFor(state.layout, state.size);
  const hit = panels.findIndex((p) => nx >= p.x && nx <= p.x + p.w && ny >= p.y && ny <= p.y + p.h);
  if (hit < 0) return;
  selected = hit;
  const panel = state.panels[selected];
  const photo = shelf.list[panel.photo];
  drag = { panel, photo, startX: e.clientX, startY: e.clientY, fx: panel.fx, fy: panel.fy, rect: r };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const { panel, photo, rect } = drag;
  const scale = Math.max(
    (canvas.width * 0.5) / (photo?.naturalWidth ?? 1),
    (canvas.height * 0.5) / (photo?.naturalHeight ?? 1),
  );
  const shownW = (photo?.naturalWidth ?? 1) * scale * panel.zoom;
  const shownH = (photo?.naturalHeight ?? 1) * scale * panel.zoom;
  const pxPerCanvas = canvas.width / rect.width;
  panel.fx = Math.min(1, Math.max(0, drag.fx - ((e.clientX - drag.startX) * pxPerCanvas) / shownW));
  panel.fy = Math.min(1, Math.max(0, drag.fy - ((e.clientY - drag.startY) * pxPerCanvas) / shownH));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = state.panels[selected];
  panel.zoom = Math.min(4, Math.max(1, panel.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
  redraw();
}, { passive: false });
canvas.addEventListener('keydown', (e) => {
  const panel = state.panels[selected];
  const step = 0.02;
  if (e.key === 'ArrowLeft') { panel.fx = Math.max(0, panel.fx - step); redraw(); }
  if (e.key === 'ArrowRight') { panel.fx = Math.min(1, panel.fx + step); redraw(); }
  if (e.key === 'ArrowUp') { panel.fy = Math.max(0, panel.fy - step); redraw(); }
  if (e.key === 'ArrowDown') { panel.fy = Math.min(1, panel.fy + step); redraw(); }
});

// ---- start ----
async function start() {
  await shelf.loadSamples();
  rebuildShelf();
  const query = new URLSearchParams(location.search);
  if (query.get('shot')) {
    await runShot(query, async (patch, photoName) => {
      Object.assign(state, patch);
      const idx = shelf.names.findIndex((n) => n.toLowerCase().startsWith(photoName));
      if (idx >= 0) {
        const other = idx === 0 ? 1 : 0;
        state.panels[0].photo = idx;
        state.panels[0].fx = 0.5;
        state.panels[0].fy = 0.38;
        state.panels[0].zoom = 1;
        state.panels[1].photo = other;
        state.panels[1].fx = 0.45;
        state.panels[1].fy = 0.35;
        state.panels[1].zoom = 1;
        state.panels[2].photo = idx;
        // The detail crop: the car's chrome for boulevard, the face for pier.
        const detail = photoName === 'pier' ? { fx: 0.42, fy: 0.28 } : { fx: 0.16, fy: 0.62 };
        state.panels[2].fx = detail.fx;
        state.panels[2].fy = detail.fy;
        state.panels[2].zoom = 1.7;
      }
      titleInput.value = state.title;
      subtitleInput.value = state.subtitle;
      redraw();
    });
  } else {
    redraw();
  }
  // Test hook: the verification script drives the same paths a person uses.
  window.__cover = { state, shelf, redraw, exportPNG, selectPanel: (i) => { selected = i; redraw(); } };
}

start().catch((err) => say(`Could not load the sample photos: ${err.message}`));
