// Post sizes and multi-panel layouts. A layout is three panel rectangles in
// 0..1 space plus the title band, so the same layout works at every export size.
// Panels are inset by a gutter; the dark backing shows through as the poster's
// frame. The title band overlaps the panels' lower edge, poster style.

/** Export sizes, in pixels, with the label the size buttons show. */
export const SIZES = {
  square: { label: 'Square 1:1', w: 1080, h: 1080, file: '1080x1080' },
  portrait: { label: 'Portrait 4:5', w: 1080, h: 1350, file: '1080x1350' },
  story: { label: 'Story 9:16', w: 1080, h: 1920, file: '1080x1920' },
  wide: { label: 'Wide 16:9', w: 1920, h: 1080, file: '1920x1080' },
};

/** The three poster layouts, in the order the editor lists them. */
export const LAYOUTS = {
  duo: { label: 'Duo — hero + two' },
  trio: { label: 'Trio — hero over two' },
  strips: { label: 'Strips — three columns' },
};

/**
 * Returns the panel rectangles for `layout` at the aspect of `sizeKey`,
 * each as {x, y, w, h} in 0..1, plus the title band {x, y, w, h}.
 * Tall canvases stack the hero on top; wide ones put it on the left.
 */
export function layoutFor(layout, sizeKey) {
  const tall = sizeKey === 'story' || sizeKey === 'portrait';
  const wide = sizeKey === 'wide';
  if (layout === 'trio') {
    if (tall) {
      return {
        panels: [
          { x: 0.03, y: 0.025, w: 0.94, h: 0.52 },
          { x: 0.03, y: 0.56, w: 0.46, h: 0.235 },
          { x: 0.51, y: 0.56, w: 0.46, h: 0.235 },
        ],
        title: { x: 0.03, y: 0.80, w: 0.94, h: 0.175 },
      };
    }
    return {
      panels: [
        { x: 0.03, y: 0.03, w: 0.94, h: 0.56 },
        { x: 0.03, y: 0.61, w: 0.46, h: 0.20 },
        { x: 0.51, y: 0.61, w: 0.46, h: 0.20 },
      ],
      title: { x: 0.03, y: 0.82, w: 0.94, h: 0.15 },
    };
  }
  if (layout === 'strips') {
    if (tall) {
      return {
        panels: [
          { x: 0.03, y: 0.025, w: 0.94, h: 0.46 },
          { x: 0.03, y: 0.50, w: 0.46, h: 0.28 },
          { x: 0.51, y: 0.50, w: 0.46, h: 0.28 },
        ],
        title: { x: 0.03, y: 0.79, w: 0.94, h: 0.185 },
      };
    }
    if (wide) {
      return {
        panels: [
          { x: 0.025, y: 0.04, w: 0.36, h: 0.74 },
          { x: 0.40, y: 0.04, w: 0.29, h: 0.74 },
          { x: 0.705, y: 0.04, w: 0.27, h: 0.74 },
        ],
        title: { x: 0.025, y: 0.79, w: 0.95, h: 0.17 },
      };
    }
    return {
      panels: [
        { x: 0.03, y: 0.03, w: 0.30, h: 0.78 },
        { x: 0.345, y: 0.03, w: 0.315, h: 0.78 },
        { x: 0.675, y: 0.03, w: 0.295, h: 0.78 },
      ],
      title: { x: 0.03, y: 0.82, w: 0.94, h: 0.15 },
    };
  }
  // duo (default): hero panel plus two stacked beside/below it.
  if (tall) {
    return {
      panels: [
        { x: 0.03, y: 0.025, w: 0.94, h: 0.50 },
        { x: 0.03, y: 0.54, w: 0.46, h: 0.25 },
        { x: 0.51, y: 0.54, w: 0.46, h: 0.25 },
      ],
      title: { x: 0.03, y: 0.80, w: 0.94, h: 0.175 },
    };
  }
  if (wide) {
    return {
      panels: [
        { x: 0.025, y: 0.04, w: 0.52, h: 0.74 },
        { x: 0.56, y: 0.04, w: 0.415, h: 0.355 },
        { x: 0.56, y: 0.41, w: 0.415, h: 0.37 },
      ],
      title: { x: 0.025, y: 0.79, w: 0.95, h: 0.17 },
    };
  }
  return {
    panels: [
      { x: 0.03, y: 0.03, w: 0.56, h: 0.78 },
      { x: 0.61, y: 0.03, w: 0.36, h: 0.375 },
      { x: 0.61, y: 0.42, w: 0.36, h: 0.39 },
    ],
    title: { x: 0.03, y: 0.82, w: 0.94, h: 0.15 },
  };
}
