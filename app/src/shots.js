// Fixed scenes for screenshots: a `?shot=` query sets the whole cover up
// from the URL instead of from clicks, so a screenshot run is repeatable.
// `cover` hides the editor and shows the finished cover alone; `editor`
// shows the page with a sample cover loaded. window.__shotReady is set once
// the cover has painted, so the shot script knows when to capture.

/**
 * Applies the query to `apply`, which takes (statePatch, photoName, title)
 * and returns a promise that resolves once the cover is drawn.
 */
export async function runShot(query, apply) {
  const shot = query.get('shot');
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const size = query.get('size') ?? 'square';
  const layout = query.get('layout') ?? 'duo';
  const grade = query.get('grade') ?? 'sunset';
  const photo = query.get('photo') ?? 'boulevard';
  const title = query.get('title') ?? 'Sunset Heist';
  const subtitle = query.get('subtitle') ?? 'Boulevard Queen';
  await apply({ size, layout, grade, title, subtitle }, photo);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
