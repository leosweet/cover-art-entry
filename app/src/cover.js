// Renders the cover onto a canvas: three photo panels in the chosen layout, a
// sunset or neon grade per panel, film grain, and the big condensed caption.
// `state` is { size, layout, grade, title, subtitle, titleSize, titleColor,
// titlePlace, panels: [{ photo, fx, fy, zoom, grade }] }; `photos` is the
// loaded-image list the panels index into. Nothing here touches the network.

import { GRADES, applyGrade, applyVignette } from './grades.js';
import { SIZES, layoutFor } from './layouts.js';

const BACKING = '#160818';
const FRAME = '#f5e9d3';
const INK = '#14060f';

let grainCanvas = null;

/** A 128 px tile of random grey noise, reused as the film-grain pattern. */
function grainTile() {
  if (grainCanvas) return grainCanvas;
  grainCanvas = document.createElement('canvas');
  grainCanvas.width = 128;
  grainCanvas.height = 128;
  const g = grainCanvas.getContext('2d');
  const data = g.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 96 + Math.floor(Math.random() * 96);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  return grainCanvas;
}

/**
 * Draws one photo into `rect` (pixels), cover-fit, centred on the crop focus
 * (fx, fy in 0..1) at `zoom`, then the panel's grade, vignette and frame.
 */
export function drawPhotoPanel(ctx, rect, photo, crop, gradeKey) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (photo) {
    const nw = photo.naturalWidth;
    const nh = photo.naturalHeight;
    const base = Math.max(rect.w / nw, rect.h / nh);
    const scale = base * (crop.zoom || 1);
    const pw = nw * scale;
    const ph = nh * scale;
    let ox = rect.x + rect.w / 2 - (crop.fx ?? 0.5) * pw;
    let oy = rect.y + rect.h / 2 - (crop.fy ?? 0.5) * ph;
    ox = Math.min(rect.x, Math.max(rect.x + rect.w - pw, ox));
    oy = Math.min(rect.y, Math.max(rect.y + rect.h - ph, oy));
    const grade = GRADES[gradeKey] ?? GRADES.sunset;
    ctx.filter = grade.filter;
    ctx.drawImage(photo, ox, oy, pw, ph);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#3a1c40';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  applyGrade(ctx, rect, gradeKey);
  applyVignette(ctx, rect);
  ctx.restore();
  ctx.strokeStyle = FRAME;
  ctx.lineWidth = Math.max(2, rect.w * 0.012);
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

/** The condensed poster face: system fonts, squeezed horizontally. */
function displayFont(px) {
  return `900 ${Math.round(px)}px "Noto Sans Condensed", "Arial Narrow", "Liberation Sans Narrow", "DejaVu Sans Condensed", Impact, sans-serif`;
}

/**
 * Draws the title and subtitle inside `band` (pixels). The title is squeezed
 * to 0.82 of its width, stroked dark and filled with the chosen colour; the
 * subtitle sits above it, letterspaced, with a short rule on each side.
 */
export function drawTitle(ctx, band, state) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  const cx = band.x + band.w / 2;
  if (subtitle) {
    const subPx = Math.max(12, band.h * 0.17);
    ctx.save();
    ctx.font = `700 ${Math.round(subPx)}px "Noto Sans", "DejaVu Sans", sans-serif`;
    try { ctx.letterSpacing = `${Math.round(subPx * 0.32)}px`; } catch { /* older canvas */ }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffe9a8';
    const subY = band.y + band.h * 0.24;
    ctx.fillText(subtitle, cx, subY);
    const sw = ctx.measureText(subtitle).width;
    ctx.strokeStyle = '#ffe9a8';
    ctx.lineWidth = Math.max(1, subPx * 0.08);
    ctx.beginPath();
    ctx.moveTo(cx - sw / 2 - 46, subY - subPx * 0.32);
    ctx.lineTo(cx - sw / 2 - 14, subY - subPx * 0.32);
    ctx.moveTo(cx + sw / 2 + 14, subY - subPx * 0.32);
    ctx.lineTo(cx + sw / 2 + 46, subY - subPx * 0.32);
    ctx.stroke();
    ctx.restore();
  }
  if (!title) return;
  let size = band.h * 0.58 * (state.titleSize || 1);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const fit = () => {
    ctx.font = displayFont(size);
    return ctx.measureText(title).width * 0.82;
  };
  while (fit() > band.w * 0.97 && size > 10) size -= 2;
  ctx.font = displayFont(size);
  const baseline = band.y + band.h * (subtitle ? 0.88 : 0.72);
  ctx.translate(cx, baseline);
  ctx.transform(1, 0, -0.05, 1, 0, 0);
  ctx.scale(0.82, 1);
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, size * 0.07);
  ctx.strokeStyle = state.titleColor === 'black' ? '#f5e9d3' : INK;
  ctx.strokeText(title, 0, 0);
  if (state.titleColor === 'white') {
    ctx.fillStyle = '#ffffff';
  } else if (state.titleColor === 'black') {
    ctx.fillStyle = '#14060f';
  } else {
    const grad = ctx.createLinearGradient(-band.w / 2, 0, band.w / 2, 0);
    grad.addColorStop(0, '#ffd319');
    grad.addColorStop(0.5, '#ff2975');
    grad.addColorStop(1, '#8c1eff');
    ctx.fillStyle = grad;
  }
  ctx.fillText(title, 0, 0);
  ctx.restore();
}

/** Renders the whole cover for `state` onto `canvas` at its export size. */
export function renderCover(canvas, state, photos) {
  const size = SIZES[state.size] ?? SIZES.square;
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  const W = size.w;
  const H = size.h;
  ctx.fillStyle = BACKING;
  ctx.fillRect(0, 0, W, H);
  const { panels, title } = layoutFor(state.layout, state.size);
  const top = state.titlePlace === 'top';
  if (top) {
    const scrim = ctx.createLinearGradient(0, 0, 0, H * 0.2);
    scrim.addColorStop(0, 'rgba(10, 2, 16, 0.55)');
    scrim.addColorStop(1, 'rgba(10, 2, 16, 0)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, W, H * 0.2);
  }
  state.panels.forEach((panel, i) => {
    const r = panels[i];
    if (!r) return;
    drawPhotoPanel(ctx, { x: r.x * W, y: r.y * H, w: r.w * W, h: r.h * H },
      photos[panel.photo] ?? null, panel, panel.grade || state.grade);
  });
  const band = top
    ? { x: title.x * W, y: H * 0.015, w: title.w * W, h: title.h * H }
    : { x: title.x * W, y: title.y * H, w: title.w * W, h: title.h * H };
  drawTitle(ctx, band, state);
  // Film grain over everything, faint.
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // Thin poster frame around the whole cover.
  ctx.strokeStyle = FRAME;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(2, W * 0.004);
  ctx.strokeRect(W * 0.008, H * 0.008, W * 0.984, H * 0.984);
  ctx.globalAlpha = 1;
}
