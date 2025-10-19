const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정
const upload = multer({ dest: uploadDir });

// 이미지 업로드 API
app.post('/upload', upload.single('image'), (req, res) => {
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  setTimeout(() => {
    res.json({ url: fileUrl });
  }, 10000);
});

// 업로드된 파일 제공
app.use('/uploads', express.static(uploadDir));
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
}); 