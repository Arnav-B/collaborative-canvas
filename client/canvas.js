export class CanvasManager {
    constructor(canvasElement, cursorCanvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');

        this.cursorCanvas = cursorCanvasElement;
        this.cursorCtx = this.cursorCanvas.getContext('2d');


        this.isDrawing = false;
        this.currentPath = [];
        this.tool = 'brush';
        this.color = '#000000';
        this.lineWidth = 5;
        this.onDraw = null;

        this.cursors = new Map();


        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.setupEventListeners();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setupEventListeners() {

        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));


        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing(this.getTouchPos(touch));
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw(this.getTouchPos(touch));
        });
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
    }

    getTouchPos(touch) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const x = e.offsetX;
        const y = e.offsetY;

        this.startX = x;
        this.startY = y;

        if (this.tool === 'text') {
            const text = prompt('Enter text:');
            if (text) {
                this.drawShape({
                    type: 'text',
                    x,
                    y,
                    text,
                    color: this.color,
                    size: this.lineWidth * 5 // Scale up a bit for visibility
                }, true);
            }
            this.isDrawing = false;
            return;
        }

        this.currentPath = [{ x, y }];

        if (this.tool === 'brush' || this.tool === 'eraser') {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.fillStyle = this.tool === 'eraser' ? '#ffffff' : this.color;
        }
    }

    draw(e) {
        if (!this.isDrawing) return;

        const x = e.offsetX;
        const y = e.offsetY;

        if (this.tool === 'brush' || this.tool === 'eraser') {
            this.currentPath.push({ x, y });

            if (this.currentPath.length >= 2) {
                const p1 = this.currentPath[this.currentPath.length - 2];
                const p2 = this.currentPath[this.currentPath.length - 1];

                this.ctx.beginPath();
                this.ctx.strokeStyle = this.tool === 'eraser' ? '#ffffff' : this.color;
                this.ctx.lineWidth = this.lineWidth;
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();

                if (this.onDraw) {
                    this.onDraw({
                        type: 'draw', // 'draw' implies freehand line
                        x: p2.x,
                        y: p2.y,
                        prevX: p1.x,
                        prevY: p1.y,
                        color: this.ctx.strokeStyle,
                        width: this.lineWidth
                    });
                }
            }
        } else if (this.tool === 'rectangle' || this.tool === 'circle') {
            // Preview on cursor canvas
            // We need to redraw cursors as well or they disappear? 
            // Ideally we separate, but for now we'll just clear and redraw the shape
            this.renderCursors(); // Clear and redraw other cursors

            this.cursorCtx.beginPath();
            this.cursorCtx.strokeStyle = this.color;
            this.cursorCtx.lineWidth = this.lineWidth;

            const w = x - this.startX;
            const h = y - this.startY;

            if (this.tool === 'rectangle') {
                this.cursorCtx.strokeRect(this.startX, this.startY, w, h);
            } else if (this.tool === 'circle') {
                const radius = Math.sqrt(w * w + h * h);
                this.cursorCtx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                this.cursorCtx.stroke();
            }
        }
    }

    stopDrawing(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        // Finalize shape
        if (this.tool === 'rectangle' || this.tool === 'circle') {
            // Clear preview
            this.renderCursors();

            const x = e.offsetX;
            const y = e.offsetY;
            const w = x - this.startX;
            const h = y - this.startY;

            const shapeData = {
                type: this.tool,
                x: this.startX,
                y: this.startY,
                w,
                h,
                color: this.color,
                width: this.lineWidth
            };

            this.drawShape(shapeData, true);
        }

        this.currentPath = [];
    }

    drawShape(data, emit = false) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = data.color;
        this.ctx.fillStyle = data.color;
        this.ctx.lineWidth = data.width || 1;

        if (data.type === 'rectangle') {
            this.ctx.strokeRect(data.x, data.y, data.w, data.h);
        } else if (data.type === 'circle') {
            const radius = Math.sqrt(data.w * data.w + data.h * data.h);
            this.ctx.arc(data.x, data.y, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        } else if (data.type === 'text') {
            this.ctx.font = `${data.size}px Arial`;
            this.ctx.fillText(data.text, data.x, data.y);
        }

        if (emit && this.onDraw) {
            this.onDraw(data);
        }
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;

        if (this.cursorCanvas) {
            this.cursorCanvas.width = parent.clientWidth;
            this.cursorCanvas.height = parent.clientHeight;
        }

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    drawRemote(data) {
        if (data.type === 'draw') {
            // Legacy/Brush line
            const { prevX, prevY, x, y, color, width } = data;
            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = width;
            this.ctx.moveTo(prevX, prevY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else {
            // Shapes and text
            this.drawShape(data, false);
        }
    }

    loadHistory(history) {
        this.clear();
        history.forEach(item => {
            this.drawRemote(item);
        });
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    updateCursor(data) {
        this.cursors.set(data.id, data);
        this.renderCursors();
    }

    renderCursors() {

        this.cursorCtx.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height);

        this.cursors.forEach(cursor => {
            const { x, y, color } = cursor;

            this.cursorCtx.beginPath();
            this.cursorCtx.fillStyle = color;
            this.cursorCtx.arc(x, y, 5, 0, Math.PI * 2);
            this.cursorCtx.fill();



        });
    }


    setTool(tool) { this.tool = tool; }
    setColor(color) { this.color = color; }
    setLineWidth(width) { this.lineWidth = width; }

}
