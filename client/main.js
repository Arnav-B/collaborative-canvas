import { CanvasManager } from './canvas.js';
import { SocketManager } from './websocket.js';

document.addEventListener('DOMContentLoaded', () => {

    const canvasEl = document.getElementById('drawing-canvas');
    const cursorCanvasEl = document.getElementById('cursor-canvas');

    const canvasManager = new CanvasManager(canvasEl, cursorCanvasEl);
    const socketManager = new SocketManager(canvasManager);


    const btnBrush = document.getElementById('tool-brush');
    const btnEraser = document.getElementById('tool-eraser');
    const btnRect = document.getElementById('tool-rectangle');
    const btnCircle = document.getElementById('tool-circle');
    const btnText = document.getElementById('tool-text');
    const colorPicker = document.getElementById('color-picker');
    const colorPresets = document.querySelectorAll('.color-btn');
    const rangeWidth = document.getElementById('line-width');
    const displayWidth = document.getElementById('line-width-display');
    const btnClear = document.getElementById('action-clear');




    btnBrush.addEventListener('click', () => {
        canvasManager.setTool('brush');
        setActiveTool(btnBrush);
    });

    btnEraser.addEventListener('click', () => {
        canvasManager.setTool('eraser');
        setActiveTool(btnEraser);
    });

    btnRect.addEventListener('click', () => {
        canvasManager.setTool('rectangle');
        setActiveTool(btnRect);
    });

    btnCircle.addEventListener('click', () => {
        canvasManager.setTool('circle');
        setActiveTool(btnCircle);
    });

    btnText.addEventListener('click', () => {
        canvasManager.setTool('text');
        setActiveTool(btnText);
    });

    function setActiveTool(btn) {
        document.querySelectorAll('.tool-group button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }


    colorPicker.addEventListener('input', (e) => {
        canvasManager.setColor(e.target.value);

        if (canvasManager.tool === 'eraser') {
            canvasManager.setTool('brush');
            setActiveTool(btnBrush);
        }
    });

    colorPresets.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            colorPicker.value = color;
            canvasManager.setColor(color);
            if (canvasManager.tool === 'eraser') {
                canvasManager.setTool('brush');
                setActiveTool(btnBrush);
            }
        });
    });


    rangeWidth.addEventListener('input', (e) => {
        const val = e.target.value;
        displayWidth.textContent = `${val}px`;
        canvasManager.setLineWidth(val);
    });


    btnClear.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            canvasManager.clear();

        }
    });

});
