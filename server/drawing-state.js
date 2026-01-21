


const state = {
    history: [],
    undoStack: [],
    users: new Map()
};

const DrawingState = {

    addOperation: (op) => {
        state.history.push(op);

        if (state.undoStack.length > 0) {
            state.undoStack = [];
        }
        return state.history.length;
    },

    getHistory: () => {
        return state.history;
    },

    clearHistory: () => {
        state.history = [];
        state.undoStack = [];
    },

    undo: () => {
        if (state.history.length === 0) return null;
        const op = state.history.pop();
        state.undoStack.push(op);
        return op;
    },


    addUser: (socketId) => {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const user = {
            id: socketId,
            color: randomColor,
            cursor: null
        };
        state.users.set(socketId, user);
        return user;
    },

    removeUser: (socketId) => {
        state.users.delete(socketId);
    },

    updateCursor: (socketId, x, y) => {
        const user = state.users.get(socketId);
        if (user) {
            user.cursor = { x, y };
        }
    },

    getUsers: () => {
        return Array.from(state.users.values());
    },

    serialize: () => {
        return {
            history: state.history
        };
    },

    hydrate: (data) => {
        if (data && Array.isArray(data.history)) {
            state.history = data.history;
            state.undoStack = [];
        }
    }
};

module.exports = DrawingState;
