// ====== Setup references ======
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const toolButtons = document.querySelectorAll('.tool-button');
const sizeButtons = document.querySelectorAll('.size-button');
const shapeButtons = document.querySelectorAll('.shape-button');
const colorPalette = document.querySelector('.color-palette');
const primaryPreview = document.querySelector('.color-primary');
const secondaryPreview = document.querySelector('.color-secondary');
const textArea = document.getElementById('textTool');
const menuBar = document.querySelector('.menu-bar');
const menuRoot = document.getElementById('menu-root');

// ====== Palette ======
const paletteColors = [
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#808040','#004040','#0080ff','#00ffff','#00ff00','#ffff00',
  '#ffffff','#c0c0c0','#ff8080','#ff80ff','#80ff80','#80ffff','#8080ff','#ffff80','#ff8000','#ff0080','#8000ff','#00ff80','#80ff00','#ff0000'
];

let currentTool = 'pencil';
let brushSize = 1;
let shapeMode = 'outline';
let primaryColor = '#000000';
let secondaryColor = '#ffffff';
let zoomLevel = 1;

let isDrawing = false;
let startX = 0, startY = 0, lastX = 0, lastY = 0;
let currentPointerButton = 0;
let imageBeforeDraw = null;
let strokeColor = primaryColor;
let fillColor = secondaryColor;
let sprayInterval = null, sprayPoint = {x:0,y:0};
let textColor = primaryColor;

// ===== Bucket config & helpers =====
let bucketTolerance = 0;          // 0..255; adjust with [ and ]
let bucketConnectivity8 = true;   // toggle with key '8'

// RGBA / pixel helpers
function hexToRGBA(hex) {
  let h = hex.replace('#','');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  return [r,g,b,255];
}
function idx(x, y, w) { return (y * w + x) << 2; }
function colorDistSq(r1,g1,b1, r2,g2,b2) {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return dr*dr + dg*dg + db*db;
}

// ====== History (Undo/Redo) ======
const historyStack = [];
const redoStack = [];
function pushHistory() {
  try {
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyStack.push(snap);
    if (historyStack.length > 100) historyStack.shift();
    redoStack.length = 0;
  } catch(e) {}
}
function undo() {
  if (textArea && !textArea.hidden) commitText();
  if (historyStack.length === 0) return;
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const prev = historyStack.pop();
  redoStack.push(current);
  ctx.putImageData(prev, 0, 0);
}
function redo() {
  if (redoStack.length === 0) return;
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const next = redoStack.pop();
  historyStack.push(current);
  ctx.putImageData(next, 0, 0);
}
function clearCanvas() {
  pushHistory();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ====== Boot ======
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
pushHistory();

function updatePreviews(){
  primaryPreview.style.backgroundColor = primaryColor;
  secondaryPreview.style.backgroundColor = secondaryColor;
}
function buildPalette(){
  paletteColors.forEach(color => {
    const swatch = document.createElement('button');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.setAttribute('aria-label', `Select color ${color}`);
    swatch.addEventListener('pointerdown', evt => {
      evt.preventDefault();
      if (evt.button === 2) secondaryColor = color; else primaryColor = color;
      updatePreviews();
    });
    swatch.addEventListener('contextmenu', e => e.preventDefault());
    colorPalette.appendChild(swatch);
  });
}
buildPalette(); updatePreviews();

toolButtons.forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
sizeButtons.forEach(button => button.addEventListener('click', () => {
  sizeButtons.forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  brushSize = parseInt(button.dataset.size,10);
}));
shapeButtons.forEach(button => button.addEventListener('click', () => {
  shapeButtons.forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  shapeMode = button.dataset.shape;
}));

setTool(currentTool);
function setTool(tool){
  currentTool = tool;
  toolButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tool === tool));
  if (tool === 'zoom') canvas.style.cursor = 'zoom-in';
  else if (tool === 'picker') canvas.style.cursor =
    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'%3E%3Cpath fill=\'%23000\' d=\'M10 1L3 8v3L0 14l2 2 3-3h3l7-7-5-5zm0 2l3 3-4 4H6L5 9V7l5-4z\'/%3E%3C/svg%3E") 2 2, crosshair';
  else canvas.style.cursor = 'crosshair';
}

function getCanvasCoordinates(evt){
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.max(0, Math.min(canvas.width-1, Math.round((evt.clientX - rect.left) * scaleX))),
    y: Math.max(0, Math.min(canvas.height-1, Math.round((evt.clientY - rect.top) * scaleY)))
  };
}

function prepareColors(button){
  if (button === 2){ strokeColor = secondaryColor; fillColor = primaryColor; }
  else { strokeColor = primaryColor; fillColor = secondaryColor; }
}

function handlePointerDown(evt){
  if (evt.button > 2) return;
  evt.preventDefault();
  const coords = getCanvasCoordinates(evt);
  currentPointerButton = evt.button;
  prepareColors(evt.button);

  switch(currentTool){
    case 'fill': pushHistory(); handleBucketPointerDown(evt, coords); return;
    case 'picker': pickColor(coords.x, coords.y, evt.button); return;
    case 'zoom': handleZoom(evt); return; // pass the event so we can center on cursor
    case 'text': beginText(coords.x, coords.y, strokeColor); return;
  }

  if (!['fill','picker','zoom','text'].includes(currentTool)) canvas.setPointerCapture(evt.pointerId);

  if (currentTool === 'spray'){
    isDrawing = true; sprayPoint = coords; pushHistory(); startSpray(); return;
  }

  isDrawing = true;
  startX = lastX = coords.x;
  startY = lastY = coords.y;

  if (isShapeTool(currentTool)){
    imageBeforeDraw = ctx.getImageData(0,0,canvas.width,canvas.height);
  } else {
    pushHistory();
    ctx.globalCompositeOperation = 'source-over';
    drawFreehand(coords.x, coords.y);
  }
}

function handlePointerMove(evt){
  if (!isDrawing){
    if (currentTool === 'spray' && sprayInterval) sprayPoint = getCanvasCoordinates(evt);
    return;
  }
  evt.preventDefault();
  const coords = getCanvasCoordinates(evt);
  if (currentTool === 'spray'){ sprayPoint = coords; return; }
  if (isShapeTool(currentTool)){
    ctx.putImageData(imageBeforeDraw, 0, 0);
    drawShape(startX, startY, coords.x, coords.y);
    return;
  }
  drawFreehand(coords.x, coords.y);
  lastX = coords.x; lastY = coords.y;
}

function handlePointerUp(evt){
  try{ if (evt.pointerId !== undefined) canvas.releasePointerCapture(evt.pointerId); } catch(e){}
  if (currentTool === 'spray') stopSpray();
  if (!isDrawing) return;
  isDrawing = false;
  if (isShapeTool(currentTool) && imageBeforeDraw){
    const coords = getCanvasCoordinates(evt);
    ctx.putImageData(imageBeforeDraw, 0, 0);
    drawShape(startX, startY, coords.x, coords.y);
    imageBeforeDraw = null;
    pushHistory();
  }
  ctx.beginPath();
}

function drawFreehand(x,y){
  const startX = lastX, startY = lastY;
  const lineWidth = currentTool === 'brush' ? Math.max(brushSize*2, 2) : getLineWidth();
  const color = currentTool === 'eraser'
    ? (currentPointerButton === 2 ? primaryColor : secondaryColor)
    : strokeColor;

  ctx.lineWidth = currentTool === 'pencil' ? 1 : lineWidth;
  ctx.lineCap = currentTool === 'pencil' ? 'butt' : 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.moveTo(startX,startY); ctx.lineTo(x,y); ctx.stroke();

  if (startX === x && startY === y){
    const dotSize = Math.max(1, Math.round(ctx.lineWidth/2));
    ctx.fillStyle = color; ctx.fillRect(x - dotSize/2, y - dotSize/2, dotSize, dotSize);
  }
  lastX = x; lastY = y;
}

function isShapeTool(tool){ return ['line','rectangle','ellipse','rounded'].includes(tool); }

function drawShape(x0,y0,x1,y1){
  ctx.lineWidth = getLineWidth();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = shapeMode === 'filled' ? strokeColor : fillColor;

  if (currentTool === 'line'){
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke(); return;
  }

  const rectX = Math.min(x0,x1), rectY = Math.min(y0,y1);
  const rectW = Math.abs(x1-x0), rectH = Math.abs(y1-y0);
  ctx.beginPath();
  if (currentTool === 'ellipse'){
    ctx.ellipse(rectX + rectW/2, rectY + rectH/2, rectW/2, rectH/2, 0, 0, Math.PI*2);
  } else if (currentTool === 'rounded'){
    drawRoundedRect(rectX, rectY, rectW, rectH, Math.min(20, rectW/4, rectH/4));
  } else {
    ctx.rect(rectX, rectY, rectW, rectH);
  }
  if (shapeMode === 'filled') ctx.fill();
  else if (shapeMode === 'filled-outline'){ ctx.fillStyle = fillColor; ctx.fill(); ctx.stroke(); }
  else ctx.stroke();
}

function drawRoundedRect(x,y,w,h,r){
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
}

function getLineWidth(){
  if (currentTool === 'pencil') return 1;
  if (currentTool === 'eraser') return Math.max(brushSize*3, 8);
  return brushSize;
}

// ====== Fill / Picker (tolerance + global) ======

// Contiguous fill with tolerance (scanline)
function floodFillContiguousTolerance(imageData, sx, sy, fillRGBA, tolerance = 0, connectivity8 = true) {
  const { data, width: W, height: H } = imageData;
  if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;

  const start = idx(sx, sy, W);
  const tr = data[start], tg = data[start+1], tb = data[start+2], ta = data[start+3];

  const tolSq = tolerance * tolerance * 3;
  const targetIsExact = (tolerance <= 0);

  // If target equals fill within tolerance, bail
  if (colorDistSq(tr,tg,tb, fillRGBA[0],fillRGBA[1],fillRGBA[2]) <= tolSq && Math.abs(ta - fillRGBA[3]) <= tolerance) {
    return;
  }

  const stack = [[sx, sy]];
  const visited = new Uint8Array(W * H);

  while (stack.length) {
    let [x, y] = stack.pop();

    // find span
    let xL = x; while (xL >= 0 && matchAt(xL, y)) xL--;
    xL++;
    let xR = x; while (xR < W && matchAt(xR, y)) xR++;
    xR--;

    // fill span
    for (let xi = xL; xi <= xR; xi++) {
      const p = idx(xi, y, W);
      data[p]   = fillRGBA[0];
      data[p+1] = fillRGBA[1];
      data[p+2] = fillRGBA[2];
      data[p+3] = fillRGBA[3];
      visited[y * W + xi] = 1;
    }

    // queue up/down spans
    for (const ny of [y - 1, y + 1]) {
      if (ny < 0 || ny >= H) continue;
      let xi = xL;
      while (xi <= xR) {
        while (xi <= xR && !matchAt(xi, ny)) xi++;
        if (xi > xR) break;
        const spanStart = xi;
        while (xi <= xR && matchAt(xi, ny)) xi++;
        stack.push([Math.floor((spanStart + xi - 1)/2), ny]);
      }
    }

    // 8-connectivity: diagonals at span edges
    if (connectivity8) {
      for (const [ex, ey] of [[xL-1, y-1],[xL-1, y+1],[xR+1, y-1],[xR+1, y+1]]) {
        if (ex >= 0 && ex < W && ey >= 0 && ey < H && matchAt(ex, ey)) stack.push([ex, ey]);
      }
    }
  }

  function matchAt(px, py) {
    if (visited[py * W + px]) return false;
    const p = idx(px, py, W);
    const r = data[p], g = data[p+1], b = data[p+2], a = data[p+3];
    if (Math.abs(a - ta) > tolerance) return false;
    if (targetIsExact) return (r === tr && g === tg && b === tb);
    return colorDistSq(r,g,b, tr,tg,tb) <= tolSq;
  }
}

// Global (non-contiguous) fill with tolerance
function floodFillGlobalTolerance(imageData, targetRGBA, fillRGBA, tolerance = 0) {
  const { data } = imageData;
  const tolSq = tolerance * tolerance * 3;
  for (let p = 0; p < data.length; p += 4) {
    const r = data[p], g = data[p+1], b = data[p+2], a = data[p+3];
    if (Math.abs(a - targetRGBA[3]) > tolerance) continue;
    if (colorDistSq(r,g,b, targetRGBA[0],targetRGBA[1],targetRGBA[2]) <= tolSq) {
      data[p]   = fillRGBA[0];
      data[p+1] = fillRGBA[1];
      data[p+2] = fillRGBA[2];
      data[p+3] = fillRGBA[3];
    }
  }
}

// Main bucket handler (uses your primary/secondary via prepareColors())
function handleBucketPointerDown(evt, coords) {
  // choose fill from your already-set strokeColor (prepareColors ran before switch)
  const fillRGBA = hexToRGBA(strokeColor);

  // seed/sample color at click
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const p = idx(coords.x, coords.y, imageData.width);
  const target = [
    imageData.data[p],
    imageData.data[p+1],
    imageData.data[p+2],
    imageData.data[p+3]
  ];

  if (evt.shiftKey) {
    // Global fill (like PS contiguous OFF)
    floodFillGlobalTolerance(imageData, target, fillRGBA, bucketTolerance);
  } else {
    // Contiguous fill (like PS contiguous ON)
    floodFillContiguousTolerance(imageData, coords.x, coords.y, fillRGBA, bucketTolerance, bucketConnectivity8);
  }

  ctx.putImageData(imageData, 0, 0);
}

// Reuse your existing color picker exactly as-is
function pickColor(x,y,button){
  const pixel = ctx.getImageData(x,y,1,1).data;
  const color = rgbToHex(pixel[0],pixel[1],pixel[2]);
  if (button===2) secondaryColor = color; else primaryColor = color;
  updatePreviews();
}

// (keep rgbToHex if not already above)
function rgbToHex(r,g,b){ return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); }


// ====== Zoom ======
function handleZoom(evt){
  const zoomOut = (evt.button === 2);
  const next = zoomOut ? Math.max(1, zoomLevel - 1) : Math.min(16, zoomLevel + 1);
  zoomAtClientPoint(next, evt.clientX, evt.clientY);
}
function zoomAtClientPoint(newZoom, clientX, clientY){
  const before = canvas.getBoundingClientRect();
  const fx = (clientX - before.left) / before.width;   // 0..1 across
  const fy = (clientY - before.top)  / before.height;  // 0..1 down

  zoomLevel = Math.max(1, Math.min(16, newZoom));
  applyZoom(); // updates scaling + toggles CSS class

  const scroller =
    document.querySelector('.canvas-frame') ||
    document.querySelector('.canvas-container');

  if (!scroller) return;

  const after = canvas.getBoundingClientRect();
  const dx = (fx * after.width)  - (fx * before.width);
  const dy = (fy * after.height) - (fy * before.height);

  scroller.scrollLeft += dx;
  scroller.scrollTop  += dy;
}
function setZoom(level){ zoomLevel = Math.max(1, Math.min(16, level)); applyZoom(); }
function applyZoom(){
  canvas.style.transformOrigin = 'top left';
  canvas.style.transform = `scale(${zoomLevel})`;
  canvas.style.imageRendering = 'pixelated';

  // ⬇️ Make CSS react to zoom state
  canvas.classList.toggle('zoomed', zoomLevel > 1);

  // keep text tool aligned while zoomed
  if (!textArea.hidden && textArea.dataset.anchorX){
    positionTextArea(parseInt(textArea.dataset.anchorX,10), parseInt(textArea.dataset.anchorY,10));
  }
}

// ====== Text ======
function beginText(x,y,color){
  if (!textArea.hidden) commitText();
  textColor = color;
  textArea.hidden = false;
  textArea.value = '';
  textArea.style.color = textColor;
  textArea.dataset.anchorX = x; textArea.dataset.anchorY = y;
  positionTextArea(x,y);
  textArea.focus();
}
function positionTextArea(x,y){
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;
  textArea.style.left = `${canvas.offsetLeft + x*scaleX}px`;
  textArea.style.top = `${canvas.offsetTop + y*scaleY}px`;
  textArea.style.fontSize = `${12 * zoomLevel}px`;
  textArea.style.transformOrigin = 'top left';
  textArea.style.transform = `scale(${1/zoomLevel})`;
}
function commitText(){
  if (textArea.hidden || !textArea.value.trim()){ cancelText(); return; }
  const x = parseInt(textArea.dataset.anchorX,10), y = parseInt(textArea.dataset.anchorY,10);
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.font = '12px "MS Sans Serif", Tahoma, sans-serif';
  const lines = textArea.value.replace(/\r/g,'').split('\n');
  lines.forEach((line,i)=> ctx.fillText(line, x, y + 12 + i*14) );
  ctx.restore();
  cancelText();
  pushHistory();
}
function cancelText(){
  textArea.hidden = true; textArea.value='';
  delete textArea.dataset.anchorX; delete textArea.dataset.anchorY;
}
textArea.addEventListener('keydown', evt => {
  if (evt.key === 'Escape'){ evt.preventDefault(); cancelText(); }
  else if ((evt.key === 'Enter' && evt.ctrlKey) || evt.key === 'F2'){ evt.preventDefault(); commitText(); }
});
textArea.addEventListener('blur', commitText);

// ====== Spray ======
function startSpray(){
  stopSpray();
  ctx.fillStyle = strokeColor;
  sprayInterval = setInterval(()=>{
    ctx.fillStyle = currentTool==='spray' ? strokeColor : ctx.fillStyle;
    for (let i=0;i<10*brushSize;i++){
      const angle = Math.random()*Math.PI*2;
      const radius = Math.random()*brushSize*3;
      const dx = Math.round(sprayPoint.x + Math.cos(angle)*radius);
      const dy = Math.round(sprayPoint.y + Math.sin(angle)*radius);
      if (dx>=0 && dy>=0 && dx<canvas.width && dy<canvas.height) ctx.fillRect(dx,dy,1,1);
    }
  }, 30);
}
function stopSpray(){ if (sprayInterval){ clearInterval(sprayInterval); sprayInterval=null; } isDrawing = false; }

// ====== Pointer Bindings ======
function beginDrawingEvents(){
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointerleave', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);
}
beginDrawingEvents(); applyZoom();
document.addEventListener('contextmenu', evt => {
  if (evt.target === canvas || canvas.contains(evt.target)) evt.preventDefault();
});
window.addEventListener('resize', applyZoom);

// ====== Menu System ======
const menus = {
  File: [
    { label: 'Save\tCtrl+S', action: saveAsJPG },
  ],
  Edit: [
    { label: 'Undo\tCtrl+Z', action: undo },
    { label: 'Redo\tCtrl+Y', action: redo },
    { type: 'divider' },
    { label: 'Clear\tDel', action: clearCanvas },
  ],
  View: [
    { label: 'Zoom In\t(+)', action: () => setZoom(zoomLevel + 1) },
    { label: 'Zoom Out\t(-)', action: () => setZoom(zoomLevel - 1) },
    { label: 'Reset Zoom\t(1:1)', action: () => setZoom(1) },
  ],
  Image: [
    { label: 'Flip Horizontal', action: () => transformImage('flipH') },
    { label: 'Flip Vertical', action: () => transformImage('flipV') },
    { label: 'Invert Colors', action: invertColors },
    { label: 'Resize…', action: resizeImagePrompt },
  ],
  Colors: [
    { label: 'Swap Primary/Secondary\t(X)', action: swapColors },
    { label: 'Edit Primary…', action: () => editColor('primary') },
    { label: 'Edit Secondary…', action: () => editColor('secondary') },
  ],
  Help: [
    { label: 'Help Topics', action: showHelp },
    { type: 'divider' },
    { label: 'About Paint…', action: () => alert('Paint 95 — totally legit.') },
  ]
};

function buildMenus(){
  menuRoot.innerHTML = '';
  const buttons = menuBar.querySelectorAll('.menu-item');
  buttons.forEach(btn => {
    const name = btn.dataset.menu;
    const def = menus[name];
    if (!def) return;
    const drop = document.createElement('div');
    drop.className = 'menu-dropdown';
    drop.dataset.menu = name;
    def.forEach(entry => {
      if (entry.type === 'divider'){
        const d = document.createElement('div'); d.className='menu-divider'; drop.appendChild(d); return;
      }
      const row = document.createElement('button');
      row.className = 'menu-item-row';
      row.textContent = entry.label;
      row.addEventListener('click', () => { closeAllMenus(); entry.action(); });
      drop.appendChild(row);
    });
    menuRoot.appendChild(drop);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(name, btn);
    });
  });
  document.addEventListener('click', closeAllMenus);
}
function toggleMenu(name, buttonEl){
  const drop = menuRoot.querySelector(`.menu-dropdown[data-menu="${name}"]`);
  if (!drop) return;
  const wasOpen = drop.classList.contains('open');
  closeAllMenus();
  if (!wasOpen){
    const barRect = menuBar.getBoundingClientRect();
    const btnRect = buttonEl.getBoundingClientRect();
    drop.style.left = `${btnRect.left - barRect.left}px`;
    drop.style.top = `${btnRect.bottom - barRect.top}px`;
    drop.classList.add('open');
  }
}
function closeAllMenus(){
  menuRoot.querySelectorAll('.menu-dropdown.open').forEach(d => d.classList.remove('open'));
}
buildMenus();

// ====== Menu Actions ======
function saveAsJPG(){
  if (!textArea.hidden) commitText();
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/jpeg', 0.92);
  a.download = 'untitled.jpg';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function transformImage(kind){
  pushHistory();
  const temp = document.createElement('canvas');
  temp.width = canvas.width; temp.height = canvas.height;
  const tctx = temp.getContext('2d');
  tctx.save();
  if (kind === 'flipH'){
    tctx.translate(canvas.width, 0); tctx.scale(-1, 1);
  } else if (kind === 'flipV'){
    tctx.translate(0, canvas.height); tctx.scale(1, -1);
  }
  tctx.drawImage(canvas, 0, 0);
  tctx.restore();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(temp, 0, 0);
}
function invertColors(){
  pushHistory();
  const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const d = imageData.data;
  for (let i=0;i<d.length;i+=4){
    d[i] = 255 - d[i];
    d[i+1] = 255 - d[i+1];
    d[i+2] = 255 - d[i+2];
  }
  ctx.putImageData(imageData, 0, 0);
}
function resizeImagePrompt(){
  const w = parseInt(prompt('New width (px):', canvas.width), 10);
  const h = parseInt(prompt('New height (px):', canvas.height), 10);
  if (!w || !h) return;
  pushHistory();
  const temp = document.createElement('canvas'); temp.width = w; temp.height = h;
  temp.getContext('2d').drawImage(canvas, 0, 0, w, h);
  canvas.width = w; canvas.height = h;
  ctx.drawImage(temp, 0, 0);
  applyZoom();
}
function swapColors(){ const t = primaryColor; primaryColor = secondaryColor; secondaryColor = t; updatePreviews(); }
function editColor(which){
  const current = which === 'primary' ? primaryColor : secondaryColor;
  const pick = prompt(`Enter a hex color for ${which} (e.g., #ff00aa):`, current);
  if (!pick) return;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(pick)){
    if (which === 'primary') primaryColor = pick; else secondaryColor = pick;
    updatePreviews();
  } else alert('Invalid hex color.');
}
function showHelp(){
  alert("To get help, find your nearest therapists office and choke on a bag of *********s. Or email our customer service team at efawf@nope.com.net.gov.edu");
}

// ====== Keyboard shortcuts ======
document.addEventListener('keydown', (e)=>{
  if (e.ctrlKey && e.key.toLowerCase() === 's'){ e.preventDefault(); saveAsJPG(); }
  else if (e.ctrlKey && e.key.toLowerCase() === 'z'){ e.preventDefault(); undo(); }
  else if ((e.ctrlKey && e.key.toLowerCase() === 'y') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z')){ e.preventDefault(); redo(); }
  else if (e.key === 'Delete'){ e.preventDefault(); clearCanvas(); }
  else if (e.key === 'x' || e.key === 'X'){ swapColors(); }
  else if (e.key === '+'){ setZoom(zoomLevel + 1); }
  else if (e.key === '-'){ setZoom(zoomLevel - 1); }
  else if (e.key === '1'){ setZoom(1); }
  else if (e.key === '[') { // lower tolerance
    bucketTolerance = Math.max(0, bucketTolerance - 5);
    const st = document.querySelector('.status-bar');
    if (st) st.textContent = `Bucket tolerance: ${bucketTolerance}`;
  }
  else if (e.key === ']') { // raise tolerance
    bucketTolerance = Math.min(255, bucketTolerance + 5);
    const st = document.querySelector('.status-bar');
    if (st) st.textContent = `Bucket tolerance: ${bucketTolerance}`;
  }
  else if (e.key === '8') { // toggle 4/8 connectivity
    bucketConnectivity8 = !bucketConnectivity8;
    const st = document.querySelector('.status-bar');
    if (st) st.textContent = `Connectivity: ${bucketConnectivity8 ? '8-connected' : '4-connected'}`;
  }
});

// ====== Touch & Gesture Add-Ons (mouse/pen/touch friendly)
const frame = document.querySelector('.canvas-frame');
const container = document.querySelector('.canvas-container');

if (container){
  container.addEventListener('wheel', (e) => {
    // Optional: Ctrl+wheel to zoom at the cursor
    if (e.ctrlKey){
      const factor = (e.deltaY > 0) ? 0.9 : 1.1; // smooth in/out
      const next = Math.max(1, Math.min(16, zoomLevel * factor));
      zoomAtClientPoint(next, e.clientX, e.clientY);
      e.preventDefault(); // prevent browser zoom
      return;
    }

    // Normal wheel scrolls the zoomed canvas
    if (zoomLevel > 1){
      container.scrollBy({ left: e.deltaX, top: e.deltaY, behavior: 'auto' });
      e.preventDefault(); // so page doesn't scroll
    }
  }, { passive: false });
}

let pointers = new Map();            // pointerId -> {x,y,clientX,clientY}
let pinch = null;                    // {startDist, startZoom, centerX, centerY, startScrollLeft, startScrollTop}
let isPanning = false;
let panStart = null;                 // {clientX, clientY, scrollLeft, scrollTop}
let spaceDown = false;
let lastTapTime = 0;
let longPressTimer = null;
let longPressArmed = false;
let movedSinceDown = false;

// Make frame scrollable only when zoomed
function updateZoomedClass(){
  if (!frame) return;
  if (zoomLevel > 1) frame.classList.add('is-zoomed');
  else frame.classList.remove('is-zoomed');
}
const _applyZoomOriginal = applyZoom;
applyZoom = function(){
  _applyZoomOriginal();
  updateZoomedClass();
};
applyZoom();

// Keep browser from rubber-banding / scrolling the page on mobile
['touchstart','touchmove','touchend','gesturestart'].forEach(type => {
  if (container) container.addEventListener(type, (e)=> e.preventDefault(), {passive:false});
});

// Wheel scroll when zoomed
if (container){
  container.addEventListener('wheel', (e) => {
    if (zoomLevel > 1){
      container.scrollBy({ left: e.deltaX, top: e.deltaY, behavior: 'auto' });
      e.preventDefault();
    }
  }, { passive: false });
}

// ---- Utilities
function distance(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.hypot(dx,dy); }
function midpoint(a,b){ return { x:(a.x+b.x)/2, y:(a.y+b.y)/2 }; }
function getClientPoint(evt){ return { x: evt.clientX, y: evt.clientY }; }
// Convert client coords to canvas pixel coords (before zoom scaling)
function clientToCanvasXY(clientX, clientY){
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.max(0, Math.min(canvas.width-1, Math.round((clientX - rect.left) * scaleX))),
    y: Math.max(0, Math.min(canvas.height-1, Math.round((clientY - rect.top) * scaleY)))
  };
}

// ---- Pan helpers
function beginPan(evt){
  if (!frame) return;
  isPanning = true;
  panStart = {
    clientX: evt.clientX,
    clientY: evt.clientY,
    scrollLeft: frame.scrollLeft,
    scrollTop: frame.scrollTop
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
  isPanning = false;
  panStart = null;
  if (currentTool === 'zoom') canvas.style.cursor = 'zoom-in';
  else if (currentTool === 'picker') canvas.style.cursor =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath fill='%23000' d='M10 1L3 8v3L0 14l2 2 3-3h3l7-7-5-5zm0 2l3 3-4 4H6L5 9V7l5-4z'/%3E%3C/svg%3E\") 2 2, crosshair";
  else canvas.style.cursor = 'crosshair';
}

// ---- Pinch-to-zoom (two pointers)
function startPinch(){
  if (pointers.size < 2) return;
  const [p1, p2] = Array.from(pointers.values());
  pinch = {
    startDist: distance(p1, p2),
    startZoom: zoomLevel,
    centerX: (p1.clientX + p2.clientX)/2,
    centerY: (p1.clientY + p2.clientY)/2,
    startScrollLeft: frame ? frame.scrollLeft : 0,
    startScrollTop: frame ? frame.scrollTop : 0
  };
}
function movePinch(){
  if (!pinch || pointers.size < 2) return;
  const [p1, p2] = Array.from(pointers.values());
  const dist = distance(p1, p2);
  if (pinch.startDist <= 0) return;

  const raw = pinch.startZoom * (dist / pinch.startDist);
  setZoom(Math.max(1, Math.min(16, raw)));

  if (frame){
    const deltaX = (pinch.centerX - (p1.clientX + p2.clientX)/2);
    const deltaY = (pinch.centerY - (p1.clientY + p2.clientY)/2);
    frame.scrollLeft = pinch.startScrollLeft + deltaX;
    frame.scrollTop  = pinch.startScrollTop  + deltaY;
  }
}
function endPinch(){ pinch = null; }

// ---- Long-press to emulate right-click (palette + canvas tools)
function armLongPress(evt, ms=450){
  clearTimeout(longPressTimer);
  longPressArmed = false;
  movedSinceDown = false;
  longPressTimer = setTimeout(()=>{ longPressArmed = true; }, ms);
}
function disarmLongPress(){ clearTimeout(longPressTimer); longPressArmed = false; }

// ---- Pressure-sensitive brush width (stylus & some touch)
const baseBrushSize = ()=> brushSize;
function pressureWidth(evt){
  const p = (typeof evt.pressure === 'number') ? evt.pressure : 0.5;
  if (currentTool === 'pencil') return 1;
  const min = (currentTool === 'eraser') ? 8 : baseBrushSize();
  const max = (currentTool === 'eraser') ? Math.max(18, min*3) : Math.max(min*2, min + 6);
  return Math.round(min + (max - min) * p);
}

// Patch into your freehand drawing width
const _getLineWidthOriginal = getLineWidth;
getLineWidth = function(){
  if (lastActivePressureWidth != null) return lastActivePressureWidth;
  return _getLineWidthOriginal();
};
let lastActivePressureWidth = null;

// ---- Double-tap zoom (mobile): quick in/out
function handleDoubleTap(evt){
  const now = Date.now();
  if (now - lastTapTime < 350){
    if (zoomLevel > 1) setZoom(1);
    else setZoom(2);
    lastTapTime = 0;
    return true;
  }
  lastTapTime = now;
  return false;
}

// ---- Keyboard: hold Space to pan
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') spaceDown = true;
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') { spaceDown = false; endPan(); }
});

// ====== Enhanced Pointer Bindings ======
const _down = handlePointerDown;
const _move = handlePointerMove;
const _up   = handlePointerUp;

canvas.addEventListener('pointerdown', (evt) => {
  pointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY, clientX: evt.clientX, clientY: evt.clientY });

  if (pointers.size === 2){
    startPinch();
    disarmLongPress();
    return;
  }

  if (evt.pointerType === 'touch'){
    if (handleDoubleTap(evt)) { evt.preventDefault(); return; }
    armLongPress(evt);
  }

  if (evt.button === 1 || spaceDown){
    evt.preventDefault();
    beginPan(evt);
    return;
  }

  movedSinceDown = false;
  lastActivePressureWidth = null;

  _down(evt);
});

canvas.addEventListener('pointermove', (evt) => {
  if (pointers.has(evt.pointerId)){
    pointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY, clientX: evt.clientX, clientY: evt.clientY });
  }

  if (pinch){
    evt.preventDefault();
    disarmLongPress();
    movePinch();
    return;
  }

  if (isPanning){
    evt.preventDefault();
    movePan(evt);
    return;
  }

  movedSinceDown = true;

  if (evt.pressure && evt.pressure > 0){
    lastActivePressureWidth = pressureWidth(evt);
  } else {
    lastActivePressureWidth = null;
  }

  _move(evt);
});

canvas.addEventListener('pointerup', (evt) => {
  if (evt.pointerType === 'touch' && longPressArmed && !movedSinceDown){
    const fake = new PointerEvent('pointerdown', {
      pointerId: evt.pointerId,
      clientX: evt.clientX,
      clientY: evt.clientY,
      button: 2,
      pointerType: 'touch',
      bubbles: true,
      cancelable: true
    });
    canvas.dispatchEvent(fake);
  }

  disarmLongPress();

  if (pinch){
    endPinch();
  } else if (isPanning){
    endPan();
  } else {
    _up(evt);
  }

  pointers.delete(evt.pointerId);
  lastActivePressureWidth = null;
});
canvas.addEventListener('pointercancel', (evt) => {
  pointers.delete(evt.pointerId);
  disarmLongPress();
  if (pinch) endPinch();
  if (isPanning) endPan();
});

// Prevent context menu on long-press/right within canvas
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// ====== Palette: long-press = secondary color ======
document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('pointerdown', (evt) => {
    if (evt.pointerType === 'touch') armLongPress(evt, 380);
  });
  swatch.addEventListener('pointerup', (evt) => {
    const color = getComputedStyle(swatch).backgroundColor;
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    const toHex = (r,g,b)=> '#' + [r,g,b].map(v=>Number(v).toString(16).padStart(2,'0')).join('');
    const hex = m ? toHex(m[1],m[2],m[3]) : color;

    if (evt.pointerType === 'touch' && longPressArmed){
      secondaryColor = hex; updatePreviews();
    } else {
      if (evt.button === 2) secondaryColor = hex; else primaryColor = hex;
      updatePreviews();
    }
    disarmLongPress();
  });
});
