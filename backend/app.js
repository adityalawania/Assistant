const express = require('express');
const app = express();
const { spawn } = require('child_process');
const server = require('http').createServer(app);
const cors = require('cors');

const allowedOrigins = [
  'https://assistant-pearl.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Backend' });
});

app.post('/run', (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'No command provided' });
  }

  const pythonProcess = spawn('python', ['assistant.py', command]);

  let output = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0 && output) {
      res.send(output.trim());
    } else {
      res.status(500).json({ error: error || 'An error occurred while processing the command.' });
    }
  });
});

server.listen(8000, () => {
  console.log("🚀 Server is running on port 8000");
});
