# Todo App

간단한 Todo 애플리케이션입니다. Vite를 기반으로 구축되었으며, ESM 방식으로 개발되었습니다.

## 기능

- ✅ 할 일 추가/삭제
- ✅ 할 일 완료/미완료 토글
- ✅ 필터링 (전체/진행중/완료)
- ✅ 완료된 항목 일괄 삭제
- ✅ 로컬 스토리지에 데이터 저장
- ✅ 반응형 디자인

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 브라우저에서 `http://localhost:3000` 접속

## 빌드

프로덕션 빌드:
```bash
npm run build
```

빌드 결과 미리보기:
```bash
npm run preview
```

## 기술 스택

- **Vite**: 빠른 개발 서버 및 빌드 도구
- **ES6 Modules**: 모던 JavaScript 모듈 시스템
- **CSS3**: 모던 스타일링 및 애니메이션
- **LocalStorage**: 클라이언트 사이드 데이터 저장

## 프로젝트 구조

```
client/
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일
├── main.js            # JavaScript 로직
├── package.json       # 프로젝트 설정
├── vite.config.js     # Vite 설정
└── README.md          # 프로젝트 문서
``` 