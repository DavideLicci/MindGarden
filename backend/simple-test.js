const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/auth/register', (req, res) => {
  console.log('Register request:', req.body);
  res.json({ message: 'User registered' });
});

app.listen(PORT, () => {
  console.log(`Simple test server running on http://localhost:${PORT}`);
});
