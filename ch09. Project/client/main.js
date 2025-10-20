// Todo 데이터 관리
let todos = [];
let currentFilter = 'all';

// API 서버 URL
const API_BASE_URL = 'http://localhost:3001';

// DOM 요소들
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');
const loginBtn = document.getElementById('loginBtn');

// 토큰 관리 함수들
function getToken() {
    return localStorage.getItem('authToken');
}

function setToken(token) {
    localStorage.setItem('authToken', token);
}

function removeToken() {
    localStorage.removeItem('authToken');
}

function isLoggedIn() {
    return !!getToken();
}

function updateLoginButton() {
    if (isLoggedIn()) {
        loginBtn.textContent = '로그아웃';
        loginBtn.classList.add('logged-in');
    } else {
        loginBtn.textContent = '로그인';
        loginBtn.classList.remove('logged-in');
    }
}

// 로그인 함수
async function login() {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            setToken(result.data.token);
            updateLoginButton();
            console.log('로그인이 성공했습니다.');
            // 로그인 후 Todo 리스트 가져오기
            fetchTodos();
        } else {
            console.error('로그인 실패:', result.message);
            alert('로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('로그인 중 오류 발생:', error);
        alert('로그인 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
    }
}

// 로그아웃 함수
function logout() {
    removeToken();
    updateLoginButton();
    todos = [];
    renderTodos();
    console.log('로그아웃되었습니다.');
}

// 인증 헤더를 포함한 fetch 함수
async function authenticatedFetch(url, options = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    return fetch(url, {
        ...options,
        headers
    });
}

// 서버에서 Todo 리스트 가져오기
async function fetchTodos() {
    try {
        // 로그인 상태 확인
        if (!isLoggedIn()) {
            todoList.innerHTML = '<li class="error">❌ 로그인이 필요합니다. 로그인 버튼을 클릭해주세요.</li>';
            totalCount.textContent = '0';
            return;
        }
        
        // 로딩 상태 표시
        todoList.innerHTML = '<li class="loading">⏳ Todo 리스트를 불러오는 중... (2초 소요)</li>';
        totalCount.textContent = '로딩 중...';
        
        const response = await authenticatedFetch(`${API_BASE_URL}/todos`);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // 인증 오류 시 토큰 제거하고 로그인 상태로 변경
                removeToken();
                updateLoginButton();
                todoList.innerHTML = '<li class="error">❌ 인증이 만료되었습니다. 다시 로그인해주세요.</li>';
                totalCount.textContent = '0';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.success) {
            todos = result.data;
            renderTodos();
            console.log('Todo 리스트를 성공적으로 가져왔습니다.');
        } else {
            console.error('Todo 조회 실패:', result.message);
            todoList.innerHTML = '<li class="error">❌ Todo 리스트 조회에 실패했습니다.</li>';
            totalCount.textContent = '0';
        }
    } catch (error) {
        console.error('서버 연결 오류:', error);
        if (error.message.includes('인증 토큰이 없습니다')) {
            todoList.innerHTML = '<li class="error">❌ 로그인이 필요합니다. 로그인 버튼을 클릭해주세요.</li>';
        } else {
            todoList.innerHTML = '<li class="error">❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.</li>';
        }
        todos = [];
        totalCount.textContent = '0';
    }
}

// Todo 추가 함수
async function addTodo(text) {
    if (text.trim() === '') return;
    
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            body: JSON.stringify({ text: text.trim() })
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                removeToken();
                updateLoginButton();
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // 새로운 Todo를 리스트에 추가
            todos.push(result.data);
            renderTodos();
            todoInput.value = '';
            console.log('Todo가 성공적으로 추가되었습니다.');
        } else {
            console.error('Todo 추가 실패:', result.message);
        }
    } catch (error) {
        console.error('Todo 추가 중 오류 발생:', error);
        if (error.message.includes('인증 토큰이 없습니다')) {
            alert('로그인이 필요합니다.');
        } else {
            alert('Todo 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }
}

// Todo 삭제 함수
async function deleteTodo(id) {
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                removeToken();
                updateLoginButton();
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // 삭제된 Todo를 리스트에서 제거
            todos = todos.filter(todo => todo.id !== id);
            renderTodos();
            console.log('Todo가 성공적으로 삭제되었습니다.');
        } else {
            console.error('Todo 삭제 실패:', result.message);
        }
    } catch (error) {
        console.error('Todo 삭제 중 오류 발생:', error);
        if (error.message.includes('인증 토큰이 없습니다')) {
            alert('로그인이 필요합니다.');
        } else {
            alert('Todo 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }
}

// Todo 완료 상태 토글 함수 (현재는 비활성화)
function toggleTodo(id) {
    // TODO: 서버 API 연동 예정
    console.log('Todo 완료 상태 변경 기능은 아직 구현되지 않았습니다.');
}

// 필터 변경 함수
function changeFilter(filter) {
    currentFilter = filter;
    
    // 필터 버튼 활성화 상태 변경
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderTodos();
}

// 완료된 항목 삭제 함수 (현재는 비활성화)
function clearCompleted() {
    // TODO: 서버 API 연동 예정
    console.log('완료된 항목 삭제 기능은 아직 구현되지 않았습니다.');
}

// Todo 렌더링 함수
function renderTodos() {
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });
    
    todoList.innerHTML = '';
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
            >
            <span class="todo-text">${todo.text}</span>
            <button class="todo-delete">×</button>
        `;
        
        // 체크박스 이벤트
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        // 삭제 버튼 이벤트
        const deleteBtn = li.querySelector('.todo-delete');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        todoList.appendChild(li);
    });
    
    // 총 개수 업데이트
    totalCount.textContent = todos.length;
}

// 이벤트 리스너 등록
addBtn.addEventListener('click', () => addTodo(todoInput.value));

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo(todoInput.value);
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => changeFilter(btn.dataset.filter));
});

// 로그인 버튼 이벤트 리스너
loginBtn.addEventListener('click', () => {
    if (isLoggedIn()) {
        logout();
    } else {
        login();
    }
});

// 초기화: 로그인 상태 확인 및 Todo 리스트 가져오기
updateLoginButton();
fetchTodos(); 