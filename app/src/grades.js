// Colour grades for the cover: each one paints a sunset or neon wash over a photo
// panel with canvas blend modes, then a vignette to pull the edges in. No photo is
// ever re-coloured by hand; the grade is a transparent overlay, so the photo stays
// recognisable under it. `applyGrade` draws inside the caller's clip.

/** The grades the editor offers, in menu order. `filter` runs on the photo itself. */
export const GRADES = {
  sunset: {
    label: 'Sunset',
    filter: 'saturate(1.25) contrast(1.06)',
    wash: [
      { from: 'rgba(255, 122, 26, 0.30)', to: 'rgba(255, 45, 120, 0.34)', mode: 'overlay' },
      { from: 'rgba(255, 190, 90, 0.10)', to: 'rgba(120, 20, 90, 0.16)', mode: 'soft-light' },
    ],
  },
  neon: {
    label: 'Neon Nights',
    filter: 'saturate(1.4) contrast(1.1)',
    wash: [
      { from: 'rgba(0, 229, 255, 0.30)', to: 'rgba(255, 41, 117, 0.34)', mode: 'overlay' },
      { from: 'rgba(140, 30, 255, 0.12)', to: 'rgba(0, 40, 90, 0.18)', mode: 'soft-light' },
    ],
  },
  vice: {
    label: 'Vice Pink',
    filter: 'saturate(1.3) contrast(1.08)',
    wash: [
      { from: 'rgba(255, 46, 136, 0.26)', to: 'rgba(90, 20, 160, 0.30)', mode: 'overlay' },
      { from: 'rgba(255, 120, 200, 0.14)', to: 'rgba(40, 0, 60, 0.20)', mode: 'soft-light' },
    ],
  },
  clean: {
    label: 'Clean',
    filter: 'saturate(1.08) contrast(1.04)',
    wash: [
      { from: 'rgba(255, 255, 255, 0.04)', to: 'rgba(0, 0, 0, 0.06)', mode: 'soft-light' },
    ],
  },
};

/** Paints `grade` over the rectangle `rect` on `ctx` (caller holds the clip). */
export function applyGrade(ctx, rect, grade) {
  const g = GRADES[grade] ?? GRADES.sunset;
  for (const layer of g.wash) {
    const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    wash.addColorStop(0, layer.from);
    wash.addColorStop(1, layer.to);
    ctx.globalCompositeOperation = layer.mode;
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  ctx.globalCompositeOperation = 'source-over';
}

/** Darkens the corners of `rect` so the panel reads as a poster plate. */
export function applyVignette(ctx, rect, strength = 0.34) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const r = Math.hypot(rect.w, rect.h) / 2;
  const shade = ctx.createRadialGradient(cx, cy, r * 0.42, cx, cy, r);
  shade.addColorStop(0, 'rgba(10, 2, 16, 0)');
  shade.addColorStop(1, `rgba(10, 2, 16, ${strength})`);
  ctx.fillStyle = shade;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}
