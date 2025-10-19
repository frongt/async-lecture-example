const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// CORS 설정 - 클라이언트에서 접근 가능하도록
app.use(cors());
app.use(express.json());

// 고정된 응답 데이터 배열 (10개 문장)
const responseData = [
  "안녕하세요! 무엇을 도와드릴까요?",
  "오늘 날씨가 정말 좋네요.",
  "프로그래밍을 배우는 것은 흥미로운 일입니다.",
  "커피 한 잔의 여유가 필요한 시간입니다.",
  "새로운 기술을 배우는 것은 항상 도전적입니다.",
  "친구들과의 대화는 정말 즐겁습니다.",
  "책을 읽는 것은 마음을 평화롭게 만듭니다.",
  "운동은 건강한 생활의 기본입니다.",
  "음악은 마음의 양식이라고 합니다.",
  "감사한 마음으로 하루를 마무리합니다."
];

/**
 * SSE 스트리밍 응답을 처리하는 함수
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
function handleStreamResponse(req, res) {
  // SSE 헤더 설정
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  let index = 0;

  /**
   * 다음 문장을 전송하는 함수
   */
  function sendNextSentence() {
    if (index < responseData.length) {
      // SSE 형식으로 데이터 전송
      res.write(`data: ${JSON.stringify({ message: responseData[index] })}\n\n`);
      index++;
      
      // 1초 후 다음 문장 전송
      setTimeout(sendNextSentence, 1000);
    } else {
      // 모든 문장 전송 완료
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  // 첫 번째 문장 전송 시작
  sendNextSentence();
}

// POST 요청으로 스트림 응답 처리
app.post('/stream', (req, res) => {
  console.log('스트림 요청 받음:', req.body);
  handleStreamResponse(req, res);
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
