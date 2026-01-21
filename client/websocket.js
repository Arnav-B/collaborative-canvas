export class SocketManager {
    constructor(canvasManager) {
        this.socket = io();
        this.canvasManager = canvasManager;
        this.setupListeners();
        this.setupEmitters();
    }

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('init', (data) => {

            this.canvasManager.loadHistory(data.history);
        });

        this.socket.on('draw', (data) => {
            this.canvasManager.drawRemote(data);
        });

        this.socket.on('history_update', (history) => {
            this.canvasManager.clear();
            this.canvasManager.loadHistory(history);
        });

        this.socket.on('cursor_update', (data) => {
            this.canvasManager.updateCursor(data);
        });

        this.socket.on('clear', () => {
            this.canvasManager.clear();
        });
    }

    setupEmitters() {

        this.canvasManager.onDraw = (data) => {
            this.socket.emit('draw', data);
        };



        let lastCursorEmit = 0;
        this.canvasManager.canvas.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastCursorEmit > 20) {
                this.socket.emit('cursor_move', {
                    x: e.offsetX,
                    y: e.offsetY
                });
                lastCursorEmit = now;
            }
        });


        const btnUndo = document.getElementById('action-undo');
        btnUndo.addEventListener('click', () => {
            this.socket.emit('undo');
        });


        const btnClear = document.getElementById('action-clear');

    }

    emitClear() {
        this.socket.emit('clear');
    }
}
