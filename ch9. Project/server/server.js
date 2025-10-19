import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// node-persist v4 import
import nodePersist from 'node-persist';

const app = express();
const PORT = process.env.PORT || 3001;

// JWT 시크릿 키 (실제 프로덕션에서는 환경변수로 관리해야 함)
const JWT_SECRET = 'your-secret-key-change-in-production';

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT 토큰 검증 미들웨어
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: '인증 토큰이 필요합니다.'
        });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }
        req.user = user;
        next();
    });
}

// node-persist 초기화 (v4 API 사용)
const storage = nodePersist.create({
    dir: join(__dirname, 'data'),
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false,
    continuous: true,
    interval: false,
    ttl: false,
    forgiveParseErrors: false
});

// 초기화 함수
async function initializeStorage() {
    await storage.init();
    
    // 초기 데이터가 없으면 기본 todo 항목들 생성
    const todos = await storage.getItem('todos');
    if (!todos || todos.length === 0) {
        const defaultTodos = [
            {
                id: 1,
                text: "Express 서버 구축하기",
                completed: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                text: "node-persist v4 API 학습하기",
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                text: "Todo API 엔드포인트 구현하기",
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        await storage.setItem('todos', defaultTodos);
        console.log('기본 Todo 항목들이 생성되었습니다.');
    }
}

// Todo 관련 라우터
const todoRouter = express.Router();

// GET /todos - 모든 todo 조회 (2초 지연)
todoRouter.get('/', async (req, res) => {
    try {
        // 2초 지연 (로딩 테스트용)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const todos = await storage.getItem('todos') || [];
        res.json({
            success: true,
            data: todos,
            count: todos.length
        });
    } catch (error) {
        console.error('Todo 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: 'Todo 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// GET /todos/:id - 특정 todo 조회
todoRouter.get('/:id', async (req, res) => {
    try {
        const todos = await storage.getItem('todos') || [];
        const todo = todos.find(t => t.id === parseInt(req.params.id));
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: '해당 Todo를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            data: todo
        });
    } catch (error) {
        console.error('Todo 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: 'Todo 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// POST /todos - 새로운 todo 생성
todoRouter.post('/', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Todo 텍스트는 필수입니다.'
            });
        }
        
        const todos = await storage.getItem('todos') || [];
        const newTodo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        todos.push(newTodo);
        await storage.setItem('todos', todos);
        
        res.status(201).json({
            success: true,
            data: newTodo,
            message: 'Todo가 성공적으로 생성되었습니다.'
        });
    } catch (error) {
        console.error('Todo 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: 'Todo 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// PUT /todos/:id - todo 수정
todoRouter.put('/:id', async (req, res) => {
    try {
        const { text, completed } = req.body;
        const todos = await storage.getItem('todos') || [];
        const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
        
        if (todoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '해당 Todo를 찾을 수 없습니다.'
            });
        }
        
        const updatedTodo = {
            ...todos[todoIndex],
            ...(text !== undefined && { text: text.trim() }),
            ...(completed !== undefined && { completed }),
            updatedAt: new Date().toISOString()
        };
        
        todos[todoIndex] = updatedTodo;
        await storage.setItem('todos', todos);
        
        res.json({
            success: true,
            data: updatedTodo,
            message: 'Todo가 성공적으로 수정되었습니다.'
        });
    } catch (error) {
        console.error('Todo 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: 'Todo 수정 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// DELETE /todos/:id - todo 삭제 (강제로 500 에러 반환)
todoRouter.delete('/:id', async (req, res) => {
    try {
        // 강제로 500 에러 반환 (에러 처리 테스트용)
        res.status(500).json({
            success: false,
            message: 'Todo 삭제 중 서버 오류가 발생했습니다. (테스트용)',
            error: '강제로 발생시킨 500 에러입니다.'
        });
        return;
        
        // 아래 코드는 실행되지 않음 (테스트용)
        const todos = await storage.getItem('todos') || [];
        const todoIndex = todos.findIndex(t => t.id === parseInt(req.params.id));
        
        if (todoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '해당 Todo를 찾을 수 없습니다.'
            });
        }
        
        const deletedTodo = todos.splice(todoIndex, 1)[0];
        await storage.setItem('todos', todos);
        
        res.json({
            success: true,
            data: deletedTodo,
            message: 'Todo가 성공적으로 삭제되었습니다.'
        });
    } catch (error) {
        console.error('Todo 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: 'Todo 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// DELETE /todos - 완료된 todo들 일괄 삭제
todoRouter.delete('/', async (req, res) => {
    try {
        const todos = await storage.getItem('todos') || [];
        const activeTodos = todos.filter(todo => !todo.completed);
        
        await storage.setItem('todos', activeTodos);
        
        res.json({
            success: true,
            data: {
                deletedCount: todos.length - activeTodos.length,
                remainingCount: activeTodos.length
            },
            message: '완료된 Todo들이 성공적으로 삭제되었습니다.'
        });
    } catch (error) {
        console.error('완료된 Todo 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '완료된 Todo 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 로그인 라우터
app.post('/login', (req, res) => {
    try {
        // 간단한 로그인 (ID/PW 없이 바로 토큰 생성)
        const user = {
            id: Date.now(),
            username: 'user',
            role: 'user'
        };
        
        // JWT 토큰 생성 (24시간 유효)
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({
            success: true,
            data: {
                token: token,
                user: user
            },
            message: '로그인이 성공했습니다.'
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({
            success: false,
            message: '로그인 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 라우터 등록 (인증 미들웨어 적용)
app.use('/todos', authenticateToken, todoRouter);

// 루트 경로
app.get('/', (req, res) => {
    res.json({
        message: 'Todo API 서버가 실행 중입니다.',
        endpoints: {
            'POST /login': '로그인 (토큰 발급)',
            'GET /todos': '모든 todo 조회 (인증 필요)',
            'GET /todos/:id': '특정 todo 조회 (인증 필요)',
            'POST /todos': '새로운 todo 생성 (인증 필요)',
            'PUT /todos/:id': 'todo 수정 (인증 필요)',
            'DELETE /todos/:id': '특정 todo 삭제 (인증 필요)',
            'DELETE /todos': '완료된 todo들 일괄 삭제 (인증 필요)'
        }
    });
});

// 404 핸들러
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '요청한 엔드포인트를 찾을 수 없습니다.'
    });
});

// 에러 핸들러
app.use((error, req, res, next) => {
    console.error('서버 오류:', error);
    res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
});

// 서버 시작
async function startServer() {
    try {
        await initializeStorage();
        
        app.listen(PORT, () => {
            console.log(`🚀 Todo API 서버가 포트 ${PORT}에서 실행 중입니다.`);
            console.log(`📝 API 엔드포인트: http://localhost:${PORT}/todos`);
            console.log(`📊 서버 정보: http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
        process.exit(1);
    }
}

startServer(); 