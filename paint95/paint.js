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

// ====== History (Undo/Redo) ======
const historyStack = [];
const redoStack = [];
function pushHistory() {
  try {
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyStack.push(snap);
    // Trim history (optional)
    if (historyStack.length > 100) historyStack.shift();
    // New action invalidates redo stack
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
  else if (tool === 'picker') canvas.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'%3E%3Cpath fill=\'%23000\' d=\'M10 1L3 8v3L0 14l2 2 3-3h3l7-7-5-5zm0 2l3 3-4 4H6L5 9V7l5-4z\'/%3E%3C/svg%3E") 2 2, crosshair';
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
    case 'fill': pushHistory(); floodFill(coords.x, coords.y, strokeColor); return;
    case 'picker': pickColor(coords.x, coords.y, evt.button); return;
    case 'zoom': handleZoom(evt.button); return;
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
    // shape draw is a single history entry
    pushHistory();
  }
  ctx.beginPath();
}

function drawFreehand(x,y){
  const startX = lastX, startY = lastY;
  const lineWidth = currentTool === 'brush' ? Math.max(brushSize*2, 2) : getLineWidth();
  const color = currentTool === 'eraser' ? (currentPointerButton === 2 ? primaryColor : secondaryColor) : strokeColor;

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

// ====== Fill / Picker ======
function floodFill(x,y,hexColor){
  const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
  const data = new Uint32Array(imageData.data.buffer);
  const target = data[y*canvas.width + x];
  const fill = colorToUint32(hexColor);
  if (target === fill) return;

  const stack = [[x,y]];
  while(stack.length){
    const [cx,cy] = stack.pop();
    if (cx<0||cy<0||cx>=canvas.width||cy>=canvas.height) continue;
    const idx = cy*canvas.width + cx;
    if (data[idx] !== target) continue;
    let left = cx; while (left>=0 && data[cy*canvas.width + left]===target) left--; left++;
    let right = cx; while (right<canvas.width && data[cy*canvas.width + right]===target) right++;
    for(let ix=left; ix<right; ix++){
      const fillIdx = cy*canvas.width + ix;
      data[fillIdx] = fill;
      if (cy>0 && data[(cy-1)*canvas.width + ix]===target) stack.push([ix,cy-1]);
      if (cy<canvas.height-1 && data[(cy+1)*canvas.width + ix]===target) stack.push([ix,cy+1]);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
function colorToUint32(hex){
  let p = hex.replace('#',''); if (p.length===3) p = p.split('').map(ch=>ch+ch).join('');
  const bigint = parseInt(p,16); const r=(bigint>>16)&255, g=(bigint>>8)&255, b=bigint&255;
  return (255<<24) | (b<<16) | (g<<8) | r;
}
function pickColor(x,y,button){
  const pixel = ctx.getImageData(x,y,1,1).data;
  const color = rgbToHex(pixel[0],pixel[1],pixel[2]);
  if (button===2) secondaryColor = color; else primaryColor = color;
  updatePreviews();
}
function rgbToHex(r,g,b){ return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); }

// ====== Zoom ======
function handleZoom(button){
  if (button===2) zoomLevel = Math.max(1, zoomLevel-1);
  else zoomLevel = Math.min(8, zoomLevel+1);
  applyZoom();
}
function setZoom(level){ zoomLevel = Math.max(1, Math.min(16, level)); applyZoom(); }
function applyZoom(){
  // keep the canvas’ layout size fixed; scale the pixels visually
  canvas.style.transformOrigin = 'top left';
  canvas.style.transform = `scale(${zoomLevel})`;

  // keep the intrinsic bitmap crisp
  canvas.style.imageRendering = 'pixelated';

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
  // remove existing
  menuRoot.innerHTML = '';
  // for each menu item button, create dropdown
  const buttons = menuBar.querySelectorAll('.menu-item');
  buttons.forEach(btn => {
    const name = btn.dataset.menu;
    const def = menus[name];
    if (!def) return;
    const drop = document.createElement('div');
    drop.className = 'menu-dropdown';
    drop.dataset.menu = name;
    // position: align under button
    const rect = btn.getBoundingClientRect();
    // We'll position dynamically on open
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
    // position under button
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
    // alpha unchanged
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
});

// ====== Touch & Gesture Add-Ons (mouse/pen/touch friendly) ======
const frame = document.querySelector('.canvas-frame');
const container = document.querySelector('.canvas-container');

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
  container.addEventListener(type, (e)=> e.preventDefault(), {passive:false});
});

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
  // restore cursor if not in zoom tool
  if (currentTool === 'zoom') canvas.style.cursor = 'zoom-in';
  else if (currentTool === 'picker') canvas.style.cursor = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath fill='%23000' d='M10 1L3 8v3L0 14l2 2 3-3h3l7-7-5-5zm0 2l3 3-4 4H6L5 9V7l5-4z'/%3E%3C/svg%3E\") 2 2, crosshair";
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

  // Scale and clamp
  const raw = pinch.startZoom * (dist / pinch.startDist);
  setZoom(Math.max(1, Math.min(16, raw))); // clamps + calls applyZoom

  // Keep the visual focus near the pinch midpoint by nudging scroll
  if (frame){
    // Convert pinch center change into scroll offsets (heuristic that feels right)
    const deltaX = ((pinch.centerX - (p1.clientX + p2.clientX)/2));
    const deltaY = ((pinch.centerY - (p1.clientY + p2.clientY)/2));
    frame.scrollLeft = pinch.startScrollLeft + deltaX;
    frame.scrollTop  = pinch.startScrollTop  + deltaY;
  }
}
function endPinch(){
  pinch = null;
}

// ---- Long-press to emulate right-click (palette + canvas tools)
function armLongPress(evt, ms=450){
  clearTimeout(longPressTimer);
  longPressArmed = false;
  movedSinceDown = false;
  longPressTimer = setTimeout(()=>{
    longPressArmed = true;
  }, ms);
}
function disarmLongPress(){ clearTimeout(longPressTimer); longPressArmed = false; }

// ---- Pressure-sensitive brush width (stylus & some touch)
const baseBrushSize = ()=> brushSize;
function pressureWidth(evt){
  const p = (typeof evt.pressure === 'number') ? evt.pressure : 0.5; // 0..1
  // pencil stays 1px; brush/eraser scale; feels natural w/ min width
  if (currentTool === 'pencil') return 1;
  const min = (currentTool === 'eraser') ? 8 : baseBrushSize();
  const max = (currentTool === 'eraser') ? Math.max(18, min*3) : Math.max(min*2, min + 6);
  return Math.round(min + (max - min) * p);
}

// Patch into your freehand drawing width
const _getLineWidthOriginal = getLineWidth;
getLineWidth = function(){
  // If we have an active pointer with pressure, use that dynamically
  // (fallback to your original function otherwise)
  if (lastActivePressureWidth != null) return lastActivePressureWidth;
  return _getLineWidthOriginal();
};
let lastActivePressureWidth = null;

// ---- Double-tap zoom (mobile): quick in/out
function handleDoubleTap(evt){
  const now = Date.now();
  if (now - lastTapTime < 350){
    // toggle between 1x and 2x centered where you tapped
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
// We'll wrap your existing handlers so tools still work as before.
const _down = handlePointerDown;
const _move = handlePointerMove;
const _up   = handlePointerUp;

canvas.addEventListener('pointerdown', (evt) => {
  // Track all pointers
  pointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY, clientX: evt.clientX, clientY: evt.clientY });

  // Two-finger -> pinch mode (never start drawing)
  if (pointers.size === 2){
    startPinch();
    disarmLongPress();
    return; // consume; don't draw
  }

  // Double-tap zoom (only touch)
  if (evt.pointerType === 'touch'){
    if (handleDoubleTap(evt)) { evt.preventDefault(); return; }
    armLongPress(evt);
  }

  // Pan if middle mouse or Space held
  if (evt.button === 1 || spaceDown){
    evt.preventDefault();
    beginPan(evt);
    return;
  }

  movedSinceDown = false;
  lastActivePressureWidth = null;

  // If long-press is armed on touch, we’ll treat as secondary later
  _down(evt);
});

canvas.addEventListener('pointermove', (evt) => {
  // Update pointer map
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

  // If finger moved far, cancel long-press
  movedSinceDown = true;

  // Track pressure for dynamic width when drawing
  if (evt.pressure && evt.pressure > 0){
    lastActivePressureWidth = pressureWidth(evt);
  } else {
    lastActivePressureWidth = null;
  }

  _move(evt);
});

canvas.addEventListener('pointerup', (evt) => {
  // If we armed a long-press with no move, emulate right-click on touch
  if (evt.pointerType === 'touch' && longPressArmed && !movedSinceDown){
    // Re-dispatch a synthetic "right button" click into your existing handler
    const fake = new PointerEvent('pointerdown', {
      pointerId: evt.pointerId,
      clientX: evt.clientX,
      clientY: evt.clientY,
      button: 2,               // right
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
    // parse rgb(...) to hex
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

