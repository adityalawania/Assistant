const express = require('express')
const app = express(); 
const { spawn } = require('child_process'); // Import spawn from child_process
const server = require('http').createServer(app);
const cors = require('cors');

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
    }
});

io.on("connection", (socket) => {
    console.log("Socket is active !!");

    socket.on("chat", (payload) => {
        io.emit("chat", payload);
    });
});

app.use(cors());
app.use(express.json())
express.urlencoded({extended:false})

app.get('/', (req, res) => {
  
    res.json({"Message":"Hello from Backend"});
});


app.post('/run', (req, res) => {
    const { command } = req.body; // Command from frontend
    const pythonProcess = spawn('python', ['assistant.py', command]);
    
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Output: ${data.toString()}`);
        io.emit('chat', data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data.toString()}`);
    });
    
    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
});


server.listen(8000, () => {
    console.log("Server is running on port yes", 8000);
});
