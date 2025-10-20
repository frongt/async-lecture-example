# Stream 예시 프로젝트

이 프로젝트는 Node.js Express 서버와 브라우저 간의 스트림 통신을 보여주는 예시입니다.

## 기능

- Express 서버에서 청크 단위로 데이터를 스트리밍
- 브라우저에서 `fetch()` API와 `TextDecoderStream`을 사용하여 스트림 데이터 수신
- 실시간으로 데이터가 화면에 표시되는 과정을 확인

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 서버 실행:
```bash
npm start
```

또는 개발 모드로 실행 (자동 재시작):
```bash
npm run dev
```

3. 브라우저에서 접속:
```
http://localhost:3000
```

## 동작 방식

1. **서버 측 (`server.js`)**:
   - `/stream` 엔드포인트에서 3개의 텍스트 라인을 1초 간격으로 스트리밍
   - `res.write()`를 사용하여 청크 단위로 데이터 전송
   - `Transfer-Encoding: chunked` 헤더 설정

2. **클라이언트 측 (`public/index.html`)**:
   - `fetch('/stream')`으로 스트림 요청
   - `TextDecoderStream`을 사용하여 바이너리 데이터를 텍스트로 변환
   - `for await...of` 루프로 스트림 데이터를 실시간으로 처리

## 예상 결과

브라우저에서 다음과 같은 순서로 텍스트가 1초 간격으로 나타납니다:
```
첫 줄입니다.
두 번째 줄입니다.
마지막 줄입니다.
```

## 기술 스택

- **서버**: Node.js, Express
- **클라이언트**: HTML5, JavaScript (Fetch API, Streams API)
- **개발 도구**: nodemon (개발 모드) 