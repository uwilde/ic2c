const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const toolButtons = document.querySelectorAll('.tool-button');
const sizeButtons = document.querySelectorAll('.size-button');
const shapeButtons = document.querySelectorAll('.shape-button');
const colorPalette = document.querySelector('.color-palette');
const primaryPreview = document.querySelector('.color-primary');
const secondaryPreview = document.querySelector('.color-secondary');
const textArea = document.getElementById('textTool');

const paletteColors = [
    '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#00ffff', '#00ff00', '#ffff00',
    '#ffffff', '#c0c0c0', '#ff8080', '#ff80ff', '#80ff80', '#80ffff', '#8080ff', '#ffff80', '#ff8000', '#ff0080', '#8000ff', '#00ff80', '#80ff00', '#ff0000'
];

let currentTool = 'pencil';
let brushSize = 1;
let shapeMode = 'outline';
let primaryColor = '#000000';
let secondaryColor = '#ffffff';
let zoomLevel = 1;

let isDrawing = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let currentPointerButton = 0;
let imageBeforeDraw = null;
let strokeColor = primaryColor;
let fillColor = secondaryColor;
let sprayInterval = null;
let sprayPoint = { x: 0, y: 0 };
let textColor = primaryColor;

ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function updatePreviews() {
    primaryPreview.style.backgroundColor = primaryColor;
    secondaryPreview.style.backgroundColor = secondaryColor;
}

function buildPalette() {
    paletteColors.forEach(color => {
        const swatch = document.createElement('button');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.setAttribute('aria-label', `Select color ${color}`);
        swatch.addEventListener('pointerdown', evt => {
            evt.preventDefault();
            if (evt.button === 2) {
                secondaryColor = color;
            } else {
                primaryColor = color;
            }
            updatePreviews();
        });
        swatch.addEventListener('contextmenu', evt => evt.preventDefault());
        colorPalette.appendChild(swatch);
    });
}

buildPalette();
updatePreviews();

toolButtons.forEach(button => {
    button.addEventListener('click', () => {
        setTool(button.dataset.tool);
    });
});

sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
        sizeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        brushSize = parseInt(button.dataset.size, 10);
    });
});

shapeButtons.forEach(button => {
    button.addEventListener('click', () => {
        shapeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        shapeMode = button.dataset.shape;
    });
});

setTool(currentTool);

function setTool(tool) {
    currentTool = tool;
    toolButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tool === tool));
    if (tool === 'zoom') {
        canvas.style.cursor = 'zoom-in';
    } else if (tool === 'picker') {
        canvas.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'%3E%3Cpath fill=\'%23000\' d=\'M10 1L3 8v3L0 14l2 2 3-3h3l7-7-5-5zm0 2l3 3-4 4H6L5 9V7l5-4z\'/%3E%3C/svg%3E") 2 2, crosshair';
    } else {
        canvas.style.cursor = 'crosshair';
    }
}

function getCanvasCoordinates(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: Math.max(0, Math.min(canvas.width - 1, Math.round((evt.clientX - rect.left) * scaleX))),
        y: Math.max(0, Math.min(canvas.height - 1, Math.round((evt.clientY - rect.top) * scaleY)))
    };
}

function prepareColors(button) {
    if (button === 2) {
        strokeColor = secondaryColor;
        fillColor = primaryColor;
    } else {
        strokeColor = primaryColor;
        fillColor = secondaryColor;
    }
}

function handlePointerDown(evt) {
    if (evt.button > 2) {
        return;
    }
    evt.preventDefault();
    const coords = getCanvasCoordinates(evt);
    currentPointerButton = evt.button;
    prepareColors(evt.button);

    switch (currentTool) {
        case 'fill':
            floodFill(coords.x, coords.y, strokeColor);
            return;
        case 'picker':
            pickColor(coords.x, coords.y, evt.button);
            return;
        case 'zoom':
            handleZoom(evt.button);
            return;
        case 'text':
            beginText(coords.x, coords.y, strokeColor);
            return;
        default:
            break;
    }

    if (!['fill', 'picker', 'zoom', 'text'].includes(currentTool)) {
        canvas.setPointerCapture(evt.pointerId);
    }

    if (currentTool === 'spray') {
        isDrawing = true;
        sprayPoint = coords;
        startSpray();
        return;
    }

    isDrawing = true;
    startX = coords.x;
    startY = coords.y;
    lastX = coords.x;
    lastY = coords.y;

    if (isShapeTool(currentTool)) {
        imageBeforeDraw = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
        ctx.globalCompositeOperation = 'source-over';
        drawFreehand(coords.x, coords.y);
    }
}

function handlePointerMove(evt) {
    if (!isDrawing) {
        if (currentTool === 'spray' && sprayInterval) {
            sprayPoint = getCanvasCoordinates(evt);
        }
        return;
    }
    evt.preventDefault();
    const coords = getCanvasCoordinates(evt);

    if (currentTool === 'spray') {
        sprayPoint = coords;
        return;
    }

    if (isShapeTool(currentTool)) {
        ctx.putImageData(imageBeforeDraw, 0, 0);
        drawShape(startX, startY, coords.x, coords.y);
        return;
    }

    drawFreehand(coords.x, coords.y);
    lastX = coords.x;
    lastY = coords.y;
}

function handlePointerUp(evt) {
    try {
        if (evt.pointerId !== undefined) {
            canvas.releasePointerCapture(evt.pointerId);
        }
    } catch (err) {
        // ignore when pointer was not captured
    }

    if (currentTool === 'spray') {
        stopSpray();
    }
    if (!isDrawing) {
        return;
    }
    isDrawing = false;
    if (isShapeTool(currentTool) && imageBeforeDraw) {
        const coords = getCanvasCoordinates(evt);
        ctx.putImageData(imageBeforeDraw, 0, 0);
        drawShape(startX, startY, coords.x, coords.y);
        imageBeforeDraw = null;
    }
    ctx.beginPath();
}

function drawFreehand(x, y) {
    const startX = lastX;
    const startY = lastY;
    const lineWidth = currentTool === 'brush' ? Math.max(brushSize * 2, 2) : getLineWidth();
    const color = currentTool === 'eraser' ? (currentPointerButton === 2 ? primaryColor : secondaryColor) : strokeColor;

    ctx.lineWidth = currentTool === 'pencil' ? 1 : lineWidth;
    ctx.lineCap = currentTool === 'pencil' ? 'butt' : 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (startX === x && startY === y) {
        const dotSize = Math.max(1, Math.round(ctx.lineWidth / 2));
        ctx.fillStyle = color;
        ctx.fillRect(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize);
    }

    lastX = x;
    lastY = y;
}

function isShapeTool(tool) {
    return ['line', 'rectangle', 'ellipse', 'rounded'].includes(tool);
}

function drawShape(x0, y0, x1, y1) {
    ctx.lineWidth = getLineWidth();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = shapeMode === 'filled' ? strokeColor : fillColor;

    if (currentTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        return;
    }

    const rectX = Math.min(x0, x1);
    const rectY = Math.min(y0, y1);
    const rectW = Math.abs(x1 - x0);
    const rectH = Math.abs(y1 - y0);

    ctx.beginPath();

    if (currentTool === 'ellipse') {
        ctx.ellipse(rectX + rectW / 2, rectY + rectH / 2, rectW / 2, rectH / 2, 0, 0, Math.PI * 2);
    } else if (currentTool === 'rounded') {
        drawRoundedRect(rectX, rectY, rectW, rectH, Math.min(20, rectW / 4, rectH / 4));
    } else {
        ctx.rect(rectX, rectY, rectW, rectH);
    }

    if (shapeMode === 'filled') {
        ctx.fill();
    } else if (shapeMode === 'filled-outline') {
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.stroke();
    } else {
        ctx.stroke();
    }
}

function drawRoundedRect(x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

function getLineWidth() {
    if (currentTool === 'pencil') {
        return 1;
    }
    if (currentTool === 'eraser') {
        return Math.max(brushSize * 3, 8);
    }
    return brushSize;
}

function floodFill(x, y, hexColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = new Uint32Array(imageData.data.buffer);
    const target = data[y * canvas.width + x];
    const fill = colorToUint32(hexColor);

    if (target === fill) {
        return;
    }

    const stack = [[x, y]];
    while (stack.length) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) {
            continue;
        }
        const idx = cy * canvas.width + cx;
        if (data[idx] !== target) {
            continue;
        }

        let left = cx;
        while (left >= 0 && data[cy * canvas.width + left] === target) {
            left--;
        }
        left++;

        let right = cx;
        while (right < canvas.width && data[cy * canvas.width + right] === target) {
            right++;
        }

        for (let ix = left; ix < right; ix++) {
            const fillIdx = cy * canvas.width + ix;
            data[fillIdx] = fill;

            if (cy > 0 && data[(cy - 1) * canvas.width + ix] === target) {
                stack.push([ix, cy - 1]);
            }
            if (cy < canvas.height - 1 && data[(cy + 1) * canvas.width + ix] === target) {
                stack.push([ix, cy + 1]);
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function colorToUint32(hex) {
    let parsed = hex.replace('#', '');
    if (parsed.length === 3) {
        parsed = parsed.split('').map(ch => ch + ch).join('');
    }
    const bigint = parseInt(parsed, 16);
    const r = (bigint >> 16) & 0xff;
    const g = (bigint >> 8) & 0xff;
    const b = bigint & 0xff;
    return (255 << 24) | (b << 16) | (g << 8) | r;
}

function pickColor(x, y, button) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = rgbToHex(pixel[0], pixel[1], pixel[2]);
    if (button === 2) {
        secondaryColor = color;
    } else {
        primaryColor = color;
    }
    updatePreviews();
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function handleZoom(button) {
    if (button === 2) {
        zoomLevel = Math.max(1, zoomLevel - 1);
    } else {
        zoomLevel = Math.min(8, zoomLevel + 1);
    }
    applyZoom();
}

function applyZoom() {
    canvas.style.width = `${canvas.width * zoomLevel}px`;
    canvas.style.height = `${canvas.height * zoomLevel}px`;
    if (!textArea.hidden && textArea.dataset.anchorX) {
        positionTextArea(parseInt(textArea.dataset.anchorX, 10), parseInt(textArea.dataset.anchorY, 10));
    }
}

function beginText(x, y, color) {
    if (!textArea.hidden) {
        commitText();
    }
    textColor = color;
    textArea.hidden = false;
    textArea.value = '';
    textArea.style.color = textColor;
    textArea.dataset.anchorX = x;
    textArea.dataset.anchorY = y;
    positionTextArea(x, y);
    textArea.focus();
}

function positionTextArea(x, y) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    textArea.style.left = `${canvas.offsetLeft + x * scaleX}px`;
    textArea.style.top = `${canvas.offsetTop + y * scaleY}px`;
    textArea.style.fontSize = `${12 * zoomLevel}px`;
    textArea.style.transformOrigin = 'top left';
    textArea.style.transform = `scale(${1 / zoomLevel})`;
}

function commitText() {
    if (textArea.hidden || !textArea.value.trim()) {
        cancelText();
        return;
    }
    const x = parseInt(textArea.dataset.anchorX, 10);
    const y = parseInt(textArea.dataset.anchorY, 10);
    ctx.save();
    ctx.fillStyle = textColor;
    ctx.font = '12px "MS Sans Serif", Tahoma, sans-serif';
    const lines = textArea.value.replace(/\r/g, '').split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, x, y + 12 + index * 14);
    });
    ctx.restore();
    cancelText();
}

function cancelText() {
    textArea.hidden = true;
    textArea.value = '';
    delete textArea.dataset.anchorX;
    delete textArea.dataset.anchorY;
}

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

function startSpray() {
    stopSpray();
    ctx.fillStyle = strokeColor;
    sprayInterval = setInterval(() => {
        ctx.fillStyle = currentTool === 'spray' ? strokeColor : ctx.fillStyle;
        for (let i = 0; i < 10 * brushSize; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * brushSize * 3;
            const dx = Math.round(sprayPoint.x + Math.cos(angle) * radius);
            const dy = Math.round(sprayPoint.y + Math.sin(angle) * radius);
            if (dx >= 0 && dy >= 0 && dx < canvas.width && dy < canvas.height) {
                ctx.fillRect(dx, dy, 1, 1);
            }
        }
    }, 30);
}

function stopSpray() {
    if (sprayInterval) {
        clearInterval(sprayInterval);
        sprayInterval = null;
    }
    isDrawing = false;
}

function beginDrawingEvents() {
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
}

beginDrawingEvents();
applyZoom();

document.addEventListener('contextmenu', evt => {
    if (evt.target === canvas || canvas.contains(evt.target)) {
        evt.preventDefault();
    }
});

window.addEventListener('resize', applyZoom);