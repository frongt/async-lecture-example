// 워커 인스턴스 생성
let worker;
let selectedImages = [];

function onEvents() {
    const fileInput = document.getElementById('fileInput');
    const invertButton = document.getElementById('invertButton');
    const canvas = document.getElementById('canvas');
    const testInput = document.getElementById('testInput');
    const status = document.getElementById('status');
    const selectedImagesDiv = document.getElementById('selectedImages');
    const previewContainer = document.getElementById('previewContainer');
    const processedContainer = document.getElementById('processedContainer');

    // 워커 초기화
    worker = new Worker('worker.js');
    
    // 워커로부터 메시지 수신 처리
    worker.onmessage = function(e) {
        const { success, imageData, error, fileName, index, totalCount } = e.data;
        
        if (success) {
            console.log(`워커에서 이미지 ${index + 1}/${totalCount} 처리 완료!`);
            
            // 처리된 이미지를 미리보기에 표시
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = imageData.width;
            tempCanvas.height = imageData.height;
            tempCtx.putImageData(imageData, 0, 0);
            
            // 미리보기에 처리된 이미지 표시
            displayProcessedImage(tempCanvas, fileName, index);
            
            // 마지막 이미지인 경우 메인 캔버스에 표시
            if (index === totalCount - 1) {
                const mainCanvas = document.getElementById('canvas');
                const mainCtx = mainCanvas.getContext('2d');
                mainCanvas.width = imageData.width;
                mainCanvas.height = imageData.height;
                mainCtx.putImageData(imageData, 0, 0);
                
                status.textContent = `워커 스레드에서 모든 이미지 처리 완료! (${totalCount}개)`;
                status.style.backgroundColor = '#d4edda';
            }
        } else {
            console.error('이미지 처리 중 오류 발생:', error);
            alert('이미지 처리 중 오류가 발생했습니다: ' + error);
            status.textContent = '처리 오류 발생';
            status.style.backgroundColor = '#f8d7da';
        }
    };

    // 워커 오류 처리
    worker.onerror = function(error) {
        console.error('워커 오류:', error);
        alert('워커 스레드에서 오류가 발생했습니다.');
    };

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            selectedImages = files;
            displaySelectedImages();
            displayImagePreviews();
            processedContainer.innerHTML = '';
            loadImage(files[0]);
        }
    });

    invertButton.addEventListener('click', () => {
        const canvas = document.getElementById('canvas');
        if (canvas.width === 0 || canvas.height === 0) {
            alert('먼저 이미지를 선택해주세요.');
            return;
        }
        
        status.textContent = '이미지 처리 중... (UI가 블로킹되는지 확인해보세요)';
        status.style.backgroundColor = '#fff3cd';
        
        // 처리 방식 선택
        processAllSelectedImages(); // 메인 스레드 처리
        //processAllImagesWithWorker(); // 워커 스레드 처리
    });

    // 테스트 인풋 이벤트 처리
    testInput.addEventListener('input', (e) => {
        const value = e.target.value;
        const timestamp = new Date().toLocaleTimeString();
        status.textContent = `입력됨: "${value}" (${timestamp})`;
        status.style.backgroundColor = '#d4edda';
    });

    testInput.addEventListener('keydown', (e) => {
        const timestamp = new Date().toLocaleTimeString();
        status.textContent = `키 입력: ${e.key} (${timestamp})`;
        status.style.backgroundColor = '#cce5ff';
    });
}

// 선택된 이미지들을 표시하는 함수
function displaySelectedImages() {
    const selectedImagesDiv = document.getElementById('selectedImages');
    selectedImagesDiv.innerHTML = '';
    
    selectedImages.forEach((file, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'margin: 5px 0; padding: 5px; border: 1px solid #ccc; background-color: white;';
        div.innerHTML = `
            <strong>이미지 ${index + 1}:</strong> ${file.name} 
            <span style="color: #666;">(${Math.round(file.size / 1024)}KB)</span>
        `;
        selectedImagesDiv.appendChild(div);
    });
}

// 이미지 미리보기를 표시하는 함수
function displayImagePreviews() {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';
    
    selectedImages.forEach((file, index) => {
        const image = new Image();
        image.onload = () => {
            const previewDiv = document.createElement('div');
            previewDiv.style.cssText = `
                border: 2px solid #ddd;
                border-radius: 8px;
                padding: 10px;
                background-color: white;
                text-align: center;
                max-width: 450px;
                margin: 10px;
            `;
            
            const maxSize = 400;
            let width = image.width;
            let height = image.height;
            
            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            canvas.style.cssText = 'border: 1px solid #ccc; max-width: 100%; cursor: pointer;';
            
            canvas.addEventListener('click', () => {
                const mainCanvas = document.getElementById('canvas');
                const mainCtx = mainCanvas.getContext('2d');
                mainCanvas.width = image.width;
                mainCanvas.height = image.height;
                mainCtx.fillStyle = '#ffffff';
                mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
                mainCtx.drawImage(image, 0, 0, image.width, image.height);
                
                const status = document.getElementById('status');
                status.textContent = `원본 이미지 ${index + 1} (${file.name})을 메인 캔버스에 표시했습니다.`;
                status.style.backgroundColor = '#e7f3ff';
            });
            
            ctx.drawImage(image, 0, 0, width, height);
            
            previewDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">원본 이미지 ${index + 1}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${file.name}</div>
                <div style="font-size: 11px; color: #999;">${image.width}x${image.height}</div>
                <div style="font-size: 10px; color: #007bff; margin-top: 5px;">클릭하여 메인 캔버스에 표시</div>
            `;
            
            previewDiv.appendChild(canvas);
            previewContainer.appendChild(previewDiv);
        };
        image.src = URL.createObjectURL(file);
    });
}

// 선택된 모든 이미지를 처리하는 함수 (메인 스레드)
function processAllSelectedImages() {
    if (selectedImages.length === 0) {
        alert('먼저 이미지를 선택해주세요.');
        return;
    }
    
    console.log(`${selectedImages.length}개의 이미지 처리 시작...`);
    
    selectedImages.forEach((file, index) => {
        const image = new Image();
        image.onload = () => {
            console.log(`이미지 ${index + 1}/${selectedImages.length} 처리 중: ${file.name}`);
            
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = image.width;
            tempCanvas.height = image.height;
            tempCtx.drawImage(image, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            const width = tempCanvas.width;
            const height = tempCanvas.height;
            
            console.log(`  노이즈 제거 중...`);
            applyMedianFilter(data, width, height);
            
            console.log(`  샤프닝 효과 적용 중...`);
            applySharpening(data, width, height);
            
            tempCtx.putImageData(imageData, 0, 0);
            displayProcessedImage(tempCanvas, file.name, index);
            
            console.log(`이미지 ${index + 1} 처리 완료`);
            
            if (index === selectedImages.length - 1) {
                const mainCanvas = document.getElementById('canvas');
                const mainCtx = mainCanvas.getContext('2d');
                mainCanvas.width = image.width;
                mainCanvas.height = image.height;
                mainCtx.drawImage(tempCanvas, 0, 0);
                
                const status = document.getElementById('status');
                status.textContent = `모든 이미지 처리 완료! (${selectedImages.length}개)`;
                status.style.backgroundColor = '#d4edda';
            }
        };
        image.src = URL.createObjectURL(file);
    });
}

// 워커를 사용하여 여러 이미지 처리
function processAllImagesWithWorker() {
    if (selectedImages.length === 0) {
        alert('먼저 이미지를 선택해주세요.');
        return;
    }
    
    console.log(`${selectedImages.length}개의 이미지를 워커에서 처리 시작...`);
    
    selectedImages.forEach((file, index) => {
        const image = new Image();
        image.onload = () => {
            console.log(`워커에 이미지 ${index + 1}/${selectedImages.length} 전송: ${file.name}`);
            
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = image.width;
            tempCanvas.height = image.height;
            tempCtx.drawImage(image, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            worker.postMessage({
                imageData: imageData,
                width: image.width,
                height: image.height,
                fileName: file.name,
                index: index,
                totalCount: selectedImages.length
            });
        };
        image.src = URL.createObjectURL(file);
    });
}

// 처리된 이미지를 표시하는 함수
function displayProcessedImage(canvas, fileName, index) {
    const processedContainer = document.getElementById('processedContainer');
    
    const processedDiv = document.createElement('div');
    processedDiv.style.cssText = `
        border: 2px solid #28a745;
        border-radius: 8px;
        padding: 10px;
        background-color: #f8f9fa;
        text-align: center;
        max-width: 450px;
        margin: 10px;
    `;
    
    const maxSize = 400;
    let width = canvas.width;
    let height = canvas.height;
    
    if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
    }
    
    const displayCanvas = document.createElement('canvas');
    const displayCtx = displayCanvas.getContext('2d');
    displayCanvas.width = width;
    displayCanvas.height = height;
    displayCanvas.style.cssText = 'border: 1px solid #28a745; max-width: 100%; cursor: pointer;';
    
    displayCanvas.addEventListener('click', () => {
        const mainCanvas = document.getElementById('canvas');
        const mainCtx = mainCanvas.getContext('2d');
        mainCanvas.width = canvas.width;
        mainCanvas.height = canvas.height;
        mainCtx.drawImage(canvas, 0, 0);
        
        const status = document.getElementById('status');
        status.textContent = `이미지 ${index + 1} (${fileName})을 메인 캔버스에 표시했습니다.`;
        status.style.backgroundColor = '#cce5ff';
    });
    
    displayCtx.drawImage(canvas, 0, 0, width, height);
    
    processedDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; color: #28a745;">처리된 이미지 ${index + 1}</div>
        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${fileName}</div>
        <div style="font-size: 11px; color: #999;">${canvas.width}x${canvas.height}</div>
        <div style="font-size: 10px; color: #28a745; margin-top: 5px;">클릭하여 메인 캔버스에 표시</div>
    `;
    
    processedDiv.appendChild(displayCanvas);
    processedContainer.appendChild(processedDiv);
}

// 워커를 사용하여 단일 이미지 처리 (기존 함수)
function invertImageWithWorker(canvas) {
    if (!worker) {
        console.error('워커가 초기화되지 않았습니다.');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    worker.postMessage({
        imageData: imageData,
        width: canvas.width,
        height: canvas.height
    });
    
    console.log('워커에 이미지 처리 요청 전송됨...');
}

function loadImage(file) {
    const image = new Image();
    image.onload = () => {  
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, image.width, image.height);
        
        console.log(`이미지 로드 완료: ${image.width}x${image.height}`);
    }
    image.src = URL.createObjectURL(file);
}

// 중간값 필터 (노이즈 제거)
function applyMedianFilter(data, width, height) {
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const rValues = [], gValues = [], bValues = [];
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const idx = ((y + dy) * width + (x + dx)) * 4;
                    rValues.push(tempData[idx]);
                    gValues.push(tempData[idx + 1]);
                    bValues.push(tempData[idx + 2]);
                }
            }
            
            rValues.sort((a, b) => a - b);
            gValues.sort((a, b) => a - b);
            bValues.sort((a, b) => a - b);
            
            const idx = (y * width + x) * 4;
            data[idx] = rValues[4];
            data[idx + 1] = gValues[4];
            data[idx + 2] = bValues[4];
        }
    }
}

// 샤프닝 효과
function applySharpening(data, width, height) {
    const tempData = new Uint8ClampedArray(data);
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let r = 0, g = 0, b = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const kernelIdx = (ky + 1) * 3 + (kx + 1);
                    r += tempData[idx] * kernel[kernelIdx];
                    g += tempData[idx + 1] * kernel[kernelIdx];
                    b += tempData[idx + 2] * kernel[kernelIdx];
                }
            }
            
            const idx = (y * width + x) * 4;
            data[idx] = Math.max(0, Math.min(255, r));
            data[idx + 1] = Math.max(0, Math.min(255, g));
            data[idx + 2] = Math.max(0, Math.min(255, b));
        }
    }
}

onEvents();