const express = require('express');
const app = express();
const PORT = 3000;

app.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  //res.setHeader('Transfer-Encoding', 'chunked');

  const lines = ['첫 줄입니다.\n', '두 번째 줄입니다.\n', '세번째 줄입니다\n', '마지막 줄입니다.\n'];

  for (const line of lines) {
    res.write(line);
    await new Promise(r => setTimeout(r, 1000));
  }

  res.end();
});

app.use(express.static('./public')); 
app.listen(PORT, () => console.log(`http://localhost:${PORT}`)); 