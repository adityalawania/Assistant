const express = require('express');
const app = express();
const { spawn } = require('child_process'); // Import spawn from child_process
const server = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(server, {
    cors: {
        origin: "*", // Allow WebSocket connections from any origin
    },
});

// CORS configuration
const allowedOrigins = ['https://assistant-pearl.vercel.app', 'http://localhost:3000']; // Add your production and development URLs
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow requests from specified origins
        } else {
            callback(new Error('Not allowed by CORS')); // Block other origins
        }
    },
    methods: ['GET', 'POST'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type'], // Allowed headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Socket.io connection
io.on("connection", (socket) => {
    console.log("Socket is active !!");

    socket.on("chat", (payload) => {
        io.emit("chat", payload);
    });
});

// Routes
app.get('/', (req, res) => {
    res.json({ "Message": "Hello from Backend" });
});

app.get('/try', (req, res) => {
    console.log("done");
    const pythonProcess = spawn('python', ['a.py', 'Dekho']);
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Output: ${data.toString()}`);
        // io.emit('chat', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
    res.json("Working fine");
});

app.post('/run', (req, res) => {
    const { command } = req.body; // Command from frontend
    const pythonProcess = spawn('python', ['assistant.py', command]);
    let result = 'This is result';
    pythonProcess.stdout.on('data', (data) => {
        result=data.toString();
        console.log(`Python Output: ${data.toString()}`);
        io.emit('chat', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
        result=data.toString();
        console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });

    res.json({ message: result });
});

// Start the server
server.listen(8000, () => {
    console.log("Server is running on port 8000");
});
