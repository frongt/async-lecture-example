const express = require('express');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = 'frongt-secret';

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

app.use(cors({
    origin: 'http://127.0.0.1:8080',
    credentials: true
}));

const sessionStore = {};

app.get('/get-token', (req, res) => {
    const token = jwt.sign({ username: 'crong' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/profile', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    //예시로 서버에 DB에 조회를 해서 필요한 프로필 정보를 만들어서 응답
    res.json({ username: decoded.username });
});

app.post('/login', (req, res) => {
    const sessionId = uuidv4();
    sessionStore[sessionId] = {
        username: 'crong', createdAt: new Date()
    };

    res.cookie('sessionId', sessionId, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'none',
        secure: true
    });

    res.json({ message: 'Login successful' });
});

app.get("/me", (req, res) => {
    const sessionId = req.cookies.sessionId;
    const session = sessionStore[sessionId];

    if (session) {
        res.json({ message: `안녕하세요, ${session.username}님` });
    } else {
        res.status(401).json({ message: "세션이 없습니다" });
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));