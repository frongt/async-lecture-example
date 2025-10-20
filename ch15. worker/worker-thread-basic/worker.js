self.onmessage = (e) => {
    console.log('Worker received message:', e.data);
    self.postMessage('Hello, Main!');
    doWorkLongTime(); 
}

// 긴 작업 실행
function doWorkLongTime() {
    const startTime = Date.now();
    while (Date.now() - startTime < 5000) {
        // 5초 동안 루프
    }
    self.postMessage('오래걸리는 작업이 끝났어요 ');
}