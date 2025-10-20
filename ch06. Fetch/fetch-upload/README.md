# 이미지 업로드 간단 예제

Fetch API를 사용한 이미지 업로드 기본 예제입니다.

## 기능

- 이미지 파일 선택 및 업로드
- 서버에서 이미지 저장 후 URL 반환
- 업로드된 이미지 미리보기

## 실행

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3000` 접속

## API

### POST /upload
이미지 파일 업로드

**요청:**
- Content-Type: multipart/form-data
- Body: FormData with 'image' field

**응답:**
```json
{
  "url": "http://localhost:3000/uploads/1234567890-123456789.jpg"
}
```

## 파일 구조

```
├── server.js          # Express 서버
├── public/
│   └── index.html     # 클라이언트
└── uploads/           # 업로드된 이미지 저장
``` 