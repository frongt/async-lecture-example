# Todo API Server

Express와 node-persist v4를 사용한 Todo API 서버입니다.

## 기능

- ✅ Todo CRUD 작업 (생성, 조회, 수정, 삭제)
- ✅ 완료된 Todo 일괄 삭제
- ✅ node-persist v4를 사용한 데이터 영속성
- ✅ CORS 지원
- ✅ 보안 미들웨어 (Helmet)
- ✅ 로깅 (Morgan)
- ✅ 기본 Todo 항목 자동 생성

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 프로덕션 서버 실행:
```bash
npm start
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

## API 엔드포인트

### 기본 정보
- **GET /** - 서버 정보 및 사용 가능한 엔드포인트 목록

### Todo 관리
- **GET /todos** - 모든 Todo 조회
- **GET /todos/:id** - 특정 Todo 조회
- **POST /todos** - 새로운 Todo 생성
- **PUT /todos/:id** - Todo 수정
- **DELETE /todos/:id** - 특정 Todo 삭제
- **DELETE /todos** - 완료된 Todo들 일괄 삭제

## API 사용 예시

### 모든 Todo 조회
```bash
curl http://localhost:3001/todos
```

### 새로운 Todo 생성
```bash
curl -X POST http://localhost:3001/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "새로운 할 일"}'
```

### Todo 수정
```bash
curl -X PUT http://localhost:3001/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Todo 삭제
```bash
curl -X DELETE http://localhost:3001/todos/1
```

### 완료된 Todo들 삭제
```bash
curl -X DELETE http://localhost:3001/todos
```

## 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": [...],
  "count": 3
}
```

### 에러 응답
```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 정보"
}
```

## 기본 Todo 항목

서버 시작 시 자동으로 생성되는 기본 Todo 항목들:

1. **Express 서버 구축하기** (완료됨)
2. **node-persist v4 API 학습하기** (진행중)
3. **Todo API 엔드포인트 구현하기** (진행중)

## 기술 스택

- **Express.js**: 웹 프레임워크
- **node-persist v4**: 데이터 영속성
- **CORS**: Cross-Origin Resource Sharing
- **Helmet**: 보안 미들웨어
- **Morgan**: HTTP 요청 로깅

## 프로젝트 구조

```
server/
├── server.js          # 메인 서버 파일
├── package.json       # 프로젝트 설정
├── README.md          # 프로젝트 문서
└── data/             # node-persist 데이터 저장소 (자동 생성)
```

## 환경 변수

- `PORT`: 서버 포트 (기본값: 3001)
- `NODE_ENV`: 환경 설정 (development/production) 