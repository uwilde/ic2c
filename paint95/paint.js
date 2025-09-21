// Custom paint application script
// This script is adapted from the original Paint95 project.  It has been
// trimmed down and tweaked to satisfy the requirements laid out by the user:
//  1. The flood‑fill (paint bucket) tool must not freeze the browser when
//     filling large areas.  A scanline algorithm is used to avoid
//     recursion and reduce memory pressure.
//  2. Zooming with the zoom tool should occur around the cursor position.
//     When zooming in or out, the pixel under the pointer will stay
//     stationary on screen.  This makes navigation intuitive when working
//     at high zoom levels.
//  3. When the canvas is zoomed in, scrollbars appear on the canvas frame
//     so the user can pan around.  The mouse wheel scrolls vertically and
//     pressing the middle mouse button (scroll wheel) allows free panning.

// Grab references from the DOM.  These elements must exist in the host
// page (paint.html) for the app to function correctly.  The ids and
// classes mirror those used in the original Paint95 implementation.
const canvas     = document.getElementById('paintCanvas');
const ctx        = canvas.getContext('2d', { willReadFrequently: true });
const toolButtons = document.querySelectorAll('.tool-button');
const sizeButtons = document.querySelectorAll('.size-button');
const shapeButtons = document.querySelectorAll('.shape-button');
const colorPalette = document.querySelector('.color-palette');
const primaryPreview   = document.querySelector('.color-primary');
const secondaryPreview = document.querySelector('.color-secondary');
const textArea   = document.getElementById('textTool');
// Frame is the element that encloses the canvas and can scroll when zoomed.
const frame      = canvas.closest('.canvas-frame') || canvas.parentElement;
const container  = canvas.closest('.canvas-container') || frame;

// Colour palette definition.  Colours are listed in hex values.
const paletteColors = [
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#808040','#004040','#0080ff','#00ffff','#00ff00','#ffff00',
  '#ffffff','#c0c0c0','#ff8080','#ff80ff','#80ff80','#80ffff','#8080ff','#ffff80','#ff8000','#ff0080','#8000ff','#00ff80','#80ff00','#ff0000'
];

// Current state
let currentTool   = 'pencil';
let brushSize     = 1;
let shapeMode     = 'outline';
let primaryColor   = '#000000';
let secondaryColor = '#ffffff';
let zoomLevel     = 1;

// Internal flags used during drawing and panning
let isDrawing = false;
let startX = 0, startY = 0;
let lastX  = 0, lastY  = 0;
let currentPointerButton = 0;
let strokeColor = primaryColor;
let fillColor   = secondaryColor;
let sprayInterval = null, sprayPoint = {x:0,y:0};
let textColor   = primaryColor;

// Temporary snapshot for shape preview (line, rectangle, ellipse)
let imageBeforeDraw = null;

// Undo/redo history
const historyStack = [];
const redoStack    = [];
function pushHistory(){
  try {
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyStack.push(snap);
    if (historyStack.length > 100) historyStack.shift();
    redoStack.length = 0;
  } catch(e) {
    // reading pixel data can sometimes throw due to security constraints
  }
}
function undo(){
  if (textArea && !textArea.hidden) commitText();
  if (!historyStack.length) return;
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const prev    = historyStack.pop();
  redoStack.push(current);
  ctx.putImageData(prev, 0, 0);
}
function redo(){
  if (!redoStack.length) return;
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const next    = redoStack.pop();
  historyStack.push(current);
  ctx.putImageData(next, 0, 0);
}
function clearCanvas(){
  pushHistory();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Initialise canvas with a white background and prep history
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineCap  = 'round';
ctx.lineJoin = 'round';
pushHistory();

// Build the colour palette
function updatePreviews(){
  primaryPreview.style.backgroundColor   = primaryColor;
  secondaryPreview.style.backgroundColor = secondaryColor;
}
function buildPalette(){
  paletteColors.forEach(color => {
    const swatch = document.createElement('button');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.setAttribute('aria-label', `Select colour ${color}`);
    swatch.addEventListener('pointerdown', evt => {
      evt.preventDefault();
      if (evt.button === 2) secondaryColor = color; else primaryColor = color;
      updatePreviews();
    });
    swatch.addEventListener('contextmenu', e => e.preventDefault());
    colorPalette.appendChild(swatch);
  });
}
buildPalette();
updatePreviews();

// Tool selection
toolButtons.forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
sizeButtons.forEach(button => button.addEventListener('click', () => {
  sizeButtons.forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  brushSize = parseInt(button.dataset.size, 10);
}));
shapeButtons.forEach(button => button.addEventListener('click', () => {
  shapeButtons.forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  shapeMode = button.dataset.shape;
}));

function setTool(tool){
  currentTool = tool;
  toolButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
  if (tool === 'zoom') {
    canvas.style.cursor = 'zoom-in';
  } else if (tool === 'picker') {
    canvas.style.cursor = "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'%3E%3Cpath fill=\'%23000\' d=\'M10 1L3 8v3L0 14l2 2 3-3h3l7-7-5-5zm0 2l3 3-4 4H6L5 9V7l5-4z\'/%3E%3C/svg%3E') 2 2, crosshair";
  } else {
    canvas.style.cursor = 'crosshair';
  }
}
setTool(currentTool);

// Convert a pointer event to canvas pixel coordinates, accounting for zoom
function getCanvasCoordinates(evt){
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.max(0, Math.min(canvas.width  - 1, Math.round((evt.clientX - rect.left) * scaleX))),
    y: Math.max(0, Math.min(canvas.height - 1, Math.round((evt.clientY - rect.top)  * scaleY)))
  };
}

// Prepare stroke/fill colours based on pointer button
function prepareColors(button){
  if (button === 2) {
    strokeColor = secondaryColor;
    fillColor   = primaryColor;
  } else {
    strokeColor = primaryColor;
    fillColor   = secondaryColor;
  }
}

// ---------- Flood fill (scanline) ----------
// Fills a contiguous region of pixels with the chosen colour.  This
// implementation uses a non‑recursive stack to process scanlines.  It
// prevents stack overflows and the performance issues associated with
// recursive flood fills.
function floodFill(x, y, hexColor){
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data      = new Uint32Array(imageData.data.buffer);
  const target    = data[y * canvas.width + x];
  const fill      = colorToUint32(hexColor);
  if (target === fill) return;

  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) continue;
    let idx = cy * canvas.width + cx;
    if (data[idx] !== target) continue;
    // Scan left
    let left = cx;
    while (left >= 0 && data[cy * canvas.width + left] === target) left--;
    left++;
    // Scan right
    let right = cx;
    while (right < canvas.width && data[cy * canvas.width + right] === target) right++;
    // Fill the scanline and enqueue neighbouring pixels
    for (let ix = left; ix < right; ix++) {
      const fillIdx = cy * canvas.width + ix;
      data[fillIdx] = fill;
      // Pixel above
      if (cy > 0 && data[(cy - 1) * canvas.width + ix] === target) {
        stack.push([ix, cy - 1]);
      }
      // Pixel below
      if (cy < canvas.height - 1 && data[(cy + 1) * canvas.width + ix] === target) {
        stack.push([ix, cy + 1]);
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// Convert a hex colour (e.g. "#ff0000") to a 32‑bit ARGB integer.  The
// alpha channel is set to 255 (opaque).  This helper is used by floodFill.
function colorToUint32(hex){
  let p = hex.replace('#', '');
  if (p.length === 3) p = p.split('').map(ch => ch + ch).join('');
  const bigint = parseInt(p, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8)  & 255;
  const b = bigint         & 255;
  return (255 << 24) | (b << 16) | (g << 8) | r;
}

// Pick a colour from the canvas and assign to primary/secondary
function pickColor(x, y, button){
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const colour = rgbToHex(pixel[0], pixel[1], pixel[2]);
  if (button === 2) secondaryColor = colour; else primaryColor = colour;
  updatePreviews();
}
function rgbToHex(r, g, b){
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ---------- Zoom handling ----------
// The zoom tool modifies zoomLevel and then applies a CSS transform on the
// canvas element.  To zoom around the cursor, we compute the pixel under
// the pointer before zooming and then adjust the scroll offsets so the
// same pixel stays under the cursor after zooming.
function handleZoom(button, evt){
  // Determine change in zoom level based on button.  Right click (button 2)
  // zooms out, any other button zooms in.  Zoom levels are clamped between
  // 1x and 8x to prevent excessive scaling.
  const oldZoom = zoomLevel;
  if (button === 2) {
    zoomLevel = Math.max(1, zoomLevel - 1);
  } else {
    zoomLevel = Math.min(8, zoomLevel + 1);
  }
  // No change?  Nothing to do.
  if (zoomLevel === oldZoom) return;

  // If we have an event and a scrollable frame, compute the pixel under
  // the pointer before zooming.  We'll use this to adjust scroll so the
  // pixel remains at the same client position after zooming.
  let prePixel = null;
  let clientX  = 0;
  let clientY  = 0;
  if (evt && frame) {
    clientX = evt.clientX;
    clientY = evt.clientY;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    prePixel = {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top)  * scaleY
    };
  }
  applyZoom();
  // After applying zoom, adjust scroll so that the same pixel stays under
  // the cursor.  This only works if we have an event and a frame.
  if (prePixel && frame) {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const newClientX = rect.left + (prePixel.x / scaleX);
    const newClientY = rect.top  + (prePixel.y / scaleY);
    const dx = newClientX - clientX;
    const dy = newClientY - clientY;
    frame.scrollLeft += dx;
    frame.scrollTop  += dy;
  }
}

// Set an explicit zoom level and apply it.  This function clamps
// incoming values to [1, 16] and then updates the transform on the
// canvas.  It's used by pinch‑to‑zoom and keyboard shortcuts.
function setZoom(level){
  const newLevel = Math.max(1, Math.min(16, level));
  if (newLevel === zoomLevel) return;
  zoomLevel = newLevel;
  applyZoom();
}

// Apply the CSS transform for the current zoom level.  The canvas is
// scaled visually but its intrinsic pixel resolution remains fixed.  We
// also update the scrollable frame's class so CSS can enable
// scrollbars only when zoomed in.
function applyZoom(){
  // Transform origin remains top left.  We adjust scroll offsets
  // separately in handleZoom.
  canvas.style.transformOrigin = 'top left';
  canvas.style.transform = `scale(${zoomLevel})`;
  canvas.style.imageRendering = 'pixelated';
  // Align text tool when zoomed
  if (textArea && !textArea.hidden && textArea.dataset.anchorX) {
    positionTextArea(parseInt(textArea.dataset.anchorX, 10), parseInt(textArea.dataset.anchorY, 10));
  }
  updateZoomedClass();
}

// Toggle a CSS class on the frame so that scrollbars appear only when the
// canvas is zoomed beyond 1×.  The CSS should define `.is-zoomed` to
// enable overflow on the frame or container.
function updateZoomedClass(){
  if (!frame) return;
  if (zoomLevel > 1) {
    frame.classList.add('is-zoomed');
    // When zoomed in, allow the frame to scroll in both directions.  We
    // explicitly set overflow to auto here so that even if the CSS
    // prohibits scrolling, the user will be able to pan using the
    // scrollbars or scroll wheel.  Clearing the property when not
    // zoomed restores the default styling.
    frame.style.overflow = 'auto';
  } else {
    frame.classList.remove('is-zoomed');
    frame.style.overflow = '';
  }
}

// ---------- Text tool ----------
function beginText(x, y, colour){
  if (!textArea) return;
  if (!textArea.hidden) commitText();
  textColor        = colour;
  textArea.hidden  = false;
  textArea.value   = '';
  textArea.style.color = textColor;
  textArea.dataset.anchorX = x;
  textArea.dataset.anchorY = y;
  positionTextArea(x, y);
  textArea.focus();
}
function positionTextArea(x, y){
  if (!textArea) return;
  const rect   = canvas.getBoundingClientRect();
  const scaleX = rect.width  / canvas.width;
  const scaleY = rect.height / canvas.height;
  textArea.style.left   = `${canvas.offsetLeft + x * scaleX}px`;
  textArea.style.top    = `${canvas.offsetTop  + y * scaleY}px`;
  textArea.style.fontSize = `${12 * zoomLevel}px`;
  textArea.style.transformOrigin = 'top left';
  textArea.style.transform = `scale(${1 / zoomLevel})`;
}
function commitText(){
  if (!textArea || textArea.hidden || !textArea.value.trim()) {
    cancelText();
    return;
  }
  const x = parseInt(textArea.dataset.anchorX, 10);
  const y = parseInt(textArea.dataset.anchorY, 10);
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.font = '12px "MS Sans Serif", Tahoma, sans-serif';
  const lines = textArea.value.replace(/\r/g, '').split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + 12 + i * 14);
  });
  ctx.restore();
  cancelText();
  pushHistory();
}
function cancelText(){
  if (!textArea) return;
  textArea.hidden = true;
  textArea.value  = '';
  delete textArea.dataset.anchorX;
  delete textArea.dataset.anchorY;
}
if (textArea) {
  textArea.addEventListener('keydown', evt => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      cancelText();
    } else if ((evt.key === 'Enter' && evt.ctrlKey) || evt.key === 'F2') {
      evt.preventDefault();
      commitText();
    }
  });
  textArea.addEventListener('blur', commitText);
}

// ---------- Spray tool ----------
function startSpray(){
  stopSpray();
  ctx.fillStyle = strokeColor;
  sprayInterval = setInterval(() => {
    ctx.fillStyle = currentTool === 'spray' ? strokeColor : ctx.fillStyle;
    for (let i = 0; i < 10 * brushSize; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = Math.random() * brushSize * 3;
      const dx     = Math.round(sprayPoint.x + Math.cos(angle) * radius);
      const dy     = Math.round(sprayPoint.y + Math.sin(angle) * radius);
      if (dx >= 0 && dy >= 0 && dx < canvas.width && dy < canvas.height) {
        ctx.fillRect(dx, dy, 1, 1);
      }
    }
  }, 30);
}
function stopSpray(){
  if (sprayInterval) {
    clearInterval(sprayInterval);
    sprayInterval = null;
  }
  isDrawing = false;
}

// ---------- Drawing helpers ----------
// Basic line width function, can be overridden for pressure support
function getLineWidth(){
  return brushSize;
}

// Draw freehand lines
function drawLine(x0, y0, x1, y1){
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

// Draw rectangles and ellipses
function drawShape(x0, y0, x1, y1){
  const w = x1 - x0;
  const h = y1 - y0;
  if (currentTool === 'rectangle') {
    if (shapeMode === 'filled' || shapeMode === 'filled-outline') {
      ctx.fillRect(x0, y0, w, h);
    }
    if (shapeMode === 'outline' || shapeMode === 'filled-outline') {
      ctx.strokeRect(x0, y0, w, h);
    }
  } else if (currentTool === 'ellipse') {
    // ellipse drawing using bezier approximation
    const rx = Math.abs(w) / 2;
    const ry = Math.abs(h) / 2;
    const cx = x0 + w / 2;
    const cy = y0 + h / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (shapeMode === 'filled' || shapeMode === 'filled-outline') ctx.fill();
    if (shapeMode === 'outline' || shapeMode === 'filled-outline') ctx.stroke();
  }
}

// ---------- Pointer handlers ----------
function handlePointerDown(evt){
  if (evt.button > 2) return;
  evt.preventDefault();
  const coords = getCanvasCoordinates(evt);
  currentPointerButton = evt.button;
  prepareColors(evt.button);

  switch (currentTool) {
    case 'fill':
      pushHistory();
      floodFill(coords.x, coords.y, strokeColor);
      return;
    case 'picker':
      pickColor(coords.x, coords.y, evt.button);
      return;
    case 'zoom':
      // Pass both button and event to handleZoom so we can zoom around the pointer
      handleZoom(evt.button, evt);
      return;
    case 'text':
      beginText(coords.x, coords.y, strokeColor);
      return;
  }
  // For drawing tools we capture the pointer
  if (!['fill', 'picker', 'zoom', 'text'].includes(currentTool)) {
    canvas.setPointerCapture(evt.pointerId);
  }
  isDrawing = true;
  startX = lastX = coords.x;
  startY = lastY = coords.y;
  ctx.beginPath();
  ctx.lineWidth   = getLineWidth();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle   = fillColor;
  // If we're about to draw a line or shape, capture the current state
  // so we can restore it while dragging a preview.  Without this
  // snapshot the preview would accumulate strokes.
  if (currentTool === 'line' || currentTool === 'rectangle' || currentTool === 'ellipse') {
    try {
      imageBeforeDraw = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch(e) {
      imageBeforeDraw = null;
    }
  }
  if (currentTool === 'spray') {
    sprayPoint = { x: coords.x, y: coords.y };
    startSpray();
  }
}

function handlePointerMove(evt){
  const coords = getCanvasCoordinates(evt);
  if (currentTool === 'spray' && sprayInterval) {
    sprayPoint = { x: coords.x, y: coords.y };
    return;
  }
  if (!isDrawing) return;
  if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
    ctx.lineWidth   = getLineWidth();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle   = fillColor;
    drawLine(lastX, lastY, coords.x, coords.y);
    lastX = coords.x;
    lastY = coords.y;
  } else if (currentTool === 'line') {
    // restore previous image and draw a preview line
    if (imageBeforeDraw) ctx.putImageData(imageBeforeDraw, 0, 0);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth   = getLineWidth();
    drawLine(startX, startY, coords.x, coords.y);
  } else if (currentTool === 'rectangle' || currentTool === 'ellipse') {
    if (imageBeforeDraw) ctx.putImageData(imageBeforeDraw, 0, 0);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle   = fillColor;
    ctx.lineWidth   = getLineWidth();
    drawShape(startX, startY, coords.x, coords.y);
  }
}

function handlePointerUp(evt){
  const coords = getCanvasCoordinates(evt);
  if (currentTool === 'spray') {
    stopSpray();
  }
  if (!isDrawing) return;
  if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
    drawLine(lastX, lastY, coords.x, coords.y);
  } else if (currentTool === 'line') {
    if (imageBeforeDraw) ctx.putImageData(imageBeforeDraw, 0, 0);
    ctx.lineWidth   = getLineWidth();
    ctx.strokeStyle = strokeColor;
    drawLine(startX, startY, coords.x, coords.y);
  } else if (currentTool === 'rectangle' || currentTool === 'ellipse') {
    if (imageBeforeDraw) ctx.putImageData(imageBeforeDraw, 0, 0);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle   = fillColor;
    ctx.lineWidth   = getLineWidth();
    drawShape(startX, startY, coords.x, coords.y);
  }
  isDrawing = false;
  pushHistory();
}

function handlePointerLeave(evt){
  if (currentTool === 'spray') stopSpray();
  if (!isDrawing) return;
  handlePointerUp(evt);
}

// Attach basic drawing events
canvas.addEventListener('pointerdown', handlePointerDown);
canvas.addEventListener('pointermove', handlePointerMove);
canvas.addEventListener('pointerup', handlePointerUp);
canvas.addEventListener('pointerleave', handlePointerLeave);
canvas.addEventListener('pointercancel', handlePointerUp);

// Disable the context menu inside the canvas to support right‑click tools
canvas.addEventListener('contextmenu', evt => evt.preventDefault());

// Keyboard shortcuts: undo/redo/save/clear
document.addEventListener('keydown', evt => {
  if (evt.ctrlKey && evt.key.toLowerCase() === 'z') {
    evt.preventDefault();
    undo();
  } else if (evt.ctrlKey && evt.key.toLowerCase() === 'y') {
    evt.preventDefault();
    redo();
  } else if (evt.ctrlKey && evt.key.toLowerCase() === 's') {
    evt.preventDefault();
    saveAsJPG();
  } else if (evt.key === 'Delete') {
    evt.preventDefault();
    clearCanvas();
  }
});

// ---------- Panning and scroll wheel handling ----------
// We allow panning via the middle mouse button or by holding the spacebar.
// Scroll wheel events scroll the frame vertically/horizontally by default,
// so we rely on the browser's native behaviour for vertical scroll.  When
// zoomed in, pressing the wheel button and moving the mouse pans the
// canvas in any direction.
let isPanning  = false;
let panStart   = null;
let spaceDown  = false;
document.addEventListener('keydown', e => {
  if (e.code === 'Space') spaceDown = true;
});
document.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    spaceDown = false;
    endPan();
  }
});

function beginPan(evt){
  if (!frame) return;
  isPanning = true;
  panStart = {
    clientX: evt.clientX,
    clientY: evt.clientY,
    scrollLeft: frame.scrollLeft,
    scrollTop:  frame.scrollTop
  };
  canvas.style.cursor = 'grab';
}
function movePan(evt){
  if (!isPanning || !panStart) return;
  const dx = evt.clientX - panStart.clientX;
  const dy = evt.clientY - panStart.clientY;
  frame.scrollLeft = panStart.scrollLeft - dx;
  frame.scrollTop  = panStart.scrollTop  - dy;
}
function endPan(){
  if (!isPanning) return;
  isPanning = false;
  panStart  = null;
  // Restore cursor based on tool
  if (currentTool === 'zoom') canvas.style.cursor = 'zoom-in';
  else if (currentTool === 'picker') {
    canvas.style.cursor = "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'%3E%3Cpath fill=\'%23000\' d=\'M10 1L3 8v3L0 14l2 2 3-3h3l7-7-5-5zm0 2l3 3-4 4H6L5 9V7l5-4z\'/%3E%3C/svg%3E') 2 2, crosshair";
  } else canvas.style.cursor = 'crosshair';
}

// Middle mouse button initiates pan
canvas.addEventListener('pointerdown', evt => {
  // If this handler fires, pointerdown for drawing will already have run, so
  // we only care about additional behaviours.
  if (evt.button === 1 || spaceDown) {
    evt.preventDefault();
    beginPan(evt);
  }
});
canvas.addEventListener('pointermove', evt => {
  if (isPanning) {
    evt.preventDefault();
    movePan(evt);
  }
});
canvas.addEventListener('pointerup', evt => {
  if (isPanning) {
    endPan();
  }
});
canvas.addEventListener('pointercancel', evt => {
  if (isPanning) {
    endPan();
  }
});

// When the user scrolls with the mouse wheel, allow the frame to scroll
// naturally.  On many browsers, the wheel will automatically scroll
// overflow containers.  We prevent the page from scrolling when the
// pointer is over the canvas by stopping propagation.
canvas.addEventListener('wheel', evt => {
  if (zoomLevel > 1 && frame) {
    // Prevent the whole page from scrolling when zoomed
    evt.stopPropagation();
    // Browser will scroll the frame automatically.  If the Ctrl key is
    // held during wheel, implement a convenience zoom in/out (like many
    // drawing apps).  Zoom around the cursor as usual.
    if (evt.ctrlKey) {
      evt.preventDefault();
      const direction = Math.sign(evt.deltaY);
      if (direction > 0) handleZoom(2, evt); // out
      else if (direction < 0) handleZoom(0, evt); // in; treat as primary
    }
  }
});

// ---------- Save canvas as JPG ----------
function saveAsJPG(){
  const link = document.createElement('a');
  link.download = 'painting.jpg';
  link.href = canvas.toDataURL('image/jpeg');
  link.click();
}

// Expose some functions on window for debug/testing if needed
window.PaintApp = {
  setTool,
  setZoom,
  handleZoom,
  undo,
  redo,
  clearCanvas
};