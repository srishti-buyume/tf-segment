const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '.'))); // Serve static files from current directory

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve your HTML file on root route
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});