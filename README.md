# Real-Time Collaborative Drawing Canvas

A WebSocket-based real-time whiteboarding tool utilizing native HTML5 Canvas API and Node.js.

## Features
- **Real-time collaborative drawing**: See strokes from other users instantly.
- **Live Cursors**: Track other users' mouse positions with color-coded identifiers.
- **Global Undo/Redo**: Synchronized history across all clients.
- **Optimized Rendering**: Dual-canvas architecture (Drawing Layer + Cursor Layer) for high performance.
- **Toolbox**: Brush, Eraser, Rectangle, Circle, Text, Color Picker, Adjustable Stroke Width.
- **Persistence**: Canvas state is saved to the server and restored on restart.
- **Creative Tools**: Draw geometric shapes and add text labels.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
1.  Clone the repository.
2.  Navigate to the project root:
    ```bash
    cd collaborative-canvas
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application
1.  Start the server:
    ```bash
    npm start
    ```
2.  Open your browser and navigate to:
    `http://localhost:3000`

### Testing with Multiple Users
1.  Open `http://localhost:3000` in multiple tabs or different browsers.
2.  Draw in one window and observe it appear in others.
3.  Move your mouse to see real-time cursor tracking.
4.  Click "Undo" to remove the last stroke globaly.

## Known Limitations / Bugs
- **Latency**: High network latency might cause slight delays in cursor updates (though volatile packets are used to mitigate blocking).
- **Scale**: The "Global History Replay" strategy for Undo requires re-sending the full drawing history. For extremely long sessions (10k+ strokes), this may consume bandwidth. *Mitigation: Future versions could implement snapshotting or delta updates.*
- **Mobile**: Touch support for drawing is implemented. Pinch-to-zoom is not currently implemented.

## Time Spent
- **Planning & Architecture**: ~6 hours
- **Core Implementation**: ~30 hours
- **Refining & Documentation**: ~6 hours
