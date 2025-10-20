/**
 * 메시지 추가 함수
 * @param {string} content - 메시지 내용
 * @param {string} type - 메시지 타입 ('user' 또는 'assistant')
 */
function addMessage(content, type) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // 스크롤을 맨 아래로
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * 타이핑 인디케이터 표시 함수
 * @returns {HTMLElement} 타이핑 인디케이터 엘리먼트
 */
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typingIndicator';
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        indicatorDiv.appendChild(dot);
    }
    
    typingDiv.appendChild(indicatorDiv);
    chatMessages.appendChild(typingDiv);
    
    // 스크롤을 맨 아래로
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

/**
 * 타이핑 인디케이터 제거 함수
 */
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * 서버로 메시지 전송 및 스트림 응답 처리 함수
 * @param {string} message - 사용자 메시지
 */
async function sendMessage(message) {
    try {
        // 사용자 메시지 표시
        addMessage(message, 'user');
        
        // 타이핑 인디케이터 표시
        showTypingIndicator();
        
        // 입력 필드 비활성화
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        // 서버로 POST 요청 전송
        const response = await fetch('http://localhost:3000/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 타이핑 인디케이터 제거
        hideTypingIndicator();
        
        // POST 응답 스트림을 직접 처리
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let assistantMessage = '';
        let isFirstChunk = true;
        
        /**
         * 스트림 데이터 읽기 함수
         */
        async function readStream() {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        // 스트림 완료
                        messageInput.disabled = false;
                        sendButton.disabled = false;
                        messageInput.focus();
                        break;
                    }
                    
                    // 청크 데이터를 텍스트로 디코딩
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6); // 'data: ' 제거
                            
                            if (data === '[DONE]') {
                                // 스트림 완료
                                messageInput.disabled = false;
                                sendButton.disabled = false;
                                messageInput.focus();
                                return;
                            }
                            
                            try {
                                const parsedData = JSON.parse(data);
                                
                                if (isFirstChunk) {
                                    // 첫 번째 청크 - 새 메시지 생성
                                    assistantMessage = parsedData.message;
                                    addMessage(assistantMessage, 'assistant');
                                    isFirstChunk = false;
                                } else {
                                    // 후속 청크 - 기존 메시지에 추가
                                    assistantMessage += parsedData.message;
                                    const lastMessage = document.querySelector('.message.assistant:last-child .message-content');
                                    if (lastMessage) {
                                        lastMessage.textContent = assistantMessage;
                                        // 스크롤을 맨 아래로
                                        document.getElementById('chatMessages').scrollTop = 
                                            document.getElementById('chatMessages').scrollHeight;
                                    }
                                }
                            } catch (parseError) {
                                console.error('JSON 파싱 오류:', parseError);
                            }
                        }
                    }
                }
            } catch (streamError) {
                console.error('스트림 읽기 오류:', streamError);
                hideTypingIndicator();
                messageInput.disabled = false;
                sendButton.disabled = false;
                addMessage('스트림 처리에 문제가 발생했습니다.', 'assistant');
            }
        }
        
        // 스트림 읽기 시작
        readStream();
        
    } catch (error) {
        console.error('메시지 전송 오류:', error);
        hideTypingIndicator();
        
        // 입력 필드 다시 활성화
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        messageInput.disabled = false;
        sendButton.disabled = false;
        
        addMessage('서버 연결에 실패했습니다.', 'assistant');
    }
}

/**
 * 메시지 전송 처리 함수
 */
function handleSendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        messageInput.value = '';
        sendMessage(message);
    }
}

// DOM 로드 완료 후 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // 전송 버튼 클릭 이벤트
    sendButton.addEventListener('click', handleSendMessage);
    
    // 엔터키 입력 이벤트
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });
    
    // 초기 포커스
    messageInput.focus();
});
