// DOM 요소들을 변수로 선언
const outputElement = document.getElementById('output');
const statusElement = document.getElementById('status');

// 상태 업데이트 함수
function updateStatus(message, color = '#666') {
    statusElement.textContent = message;
    statusElement.style.color = color;
}

// 출력 내용 추가 함수
function appendOutput(text) {
    outputElement.textContent += text;
}

// 에러 처리 함수
function handleError(error) {
    console.error('스트림 오류:', error);
    updateStatus('스트림 오류 발생', '#f44336');
}

// 스트림 데이터 처리 함수
async function processStreamData(stream) {
    for await (const chunk of stream) {
        appendOutput(chunk);
    }
}

// 스트림 연결 함수
async function connectToStream() {
    try {
        updateStatus('스트림 연결 중...');
        
        const response = await fetch('/stream');
        const stream = response.body.pipeThrough(new TextDecoderStream());
        
        await processStreamData(stream);
        
        updateStatus('스트림 완료!', '#4CAF50');
    } catch (error) {
        handleError(error);
    }
}

// 페이지 로드 시 스트림 시작
document.addEventListener('DOMContentLoaded', () => {
    connectToStream();
}); 