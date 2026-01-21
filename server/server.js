const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'canvas_state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

const saveState = () => {
    try {
        const data = DrawingState.serialize();
        fs.writeFileSync(STATE_FILE, JSON.stringify(data));
    } catch (err) {
        console.error('Failed to save state:', err);
    }
};

const loadState = () => {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            DrawingState.hydrate(data);
            console.log('Canvas state loaded from disk');
        }
    } catch (err) {
        console.error('Failed to load state:', err);
    }
};

loadState();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../client')));

const DrawingState = require('./drawing-state');

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);


    const user = DrawingState.addUser(socket.id);


    socket.emit('init', {
        history: DrawingState.getHistory(),
        users: DrawingState.getUsers()
    });


    socket.broadcast.emit('user_joined', user);




    socket.on('draw', (data) => {

        DrawingState.addOperation(data);

        socket.broadcast.emit('draw', data);
        saveState();
    });


    socket.on('cursor_move', (data) => {
        DrawingState.updateCursor(socket.id, data.x, data.y);

        socket.broadcast.volatile.emit('cursor_update', {
            id: socket.id,
            x: data.x,
            y: data.y,
            color: user.color
        });
    });


    socket.on('undo', () => {
        const undoneOp = DrawingState.undo();
        if (undoneOp) {

            io.emit('history_update', DrawingState.getHistory());
            saveState();
        }
    });


    socket.on('clear', () => {
        DrawingState.clearHistory();
        io.emit('clear');
        saveState();
    });

    socket.on('disconnect', () => {
        DrawingState.removeUser(socket.id);
        io.emit('user_left', socket.id);
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the app at http://localhost:${PORT}`);
});
