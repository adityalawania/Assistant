const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // or set to your frontend domain
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// POST route to run Python script
app.post('/run', (req, res) => {
  const command = req.body.command;

  if (!command) {
    return res.status(400).send('No command provided');
  }

  const pythonProcess = spawn('python3', ['assistant.py', command]);

  pythonProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Python Output: ${output}`);
    io.emit('chat', output);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data.toString()}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });

  res.send("Command received and Python process started");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
