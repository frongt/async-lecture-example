// 워커 스레드에서 이미지 처리 (노이즈 제거 + 샤프닝)
self.onmessage = function(e) {
    try {
        const { imageData, width, height, fileName, index, totalCount } = e.data;
        
        // ImageData의 픽셀 데이터를 가져옴
        const data = imageData.data;
        
        console.log(`워커에서 이미지 ${index + 1}/${totalCount} 처리 시작: ${fileName}`);
        console.log(`  노이즈 제거 중...`);
        // 노이즈 제거 (중간값 필터)
        applyMedianFilter(data, width, height);
        
        console.log(`  샤프닝 효과 적용 중...`);
        // 샤프닝 효과
        applySharpening(data, width, height);
        
        console.log(`워커에서 이미지 ${index + 1} 처리 완료`);
        
        // 처리 완료 후 메인 스레드로 결과 전송
        self.postMessage({
            success: true,
            imageData: imageData,
            fileName: fileName,
            index: index,
            totalCount: totalCount
        });
        
    } catch (error) {
        // 오류 발생 시 메인 스레드로 오류 전송
        self.postMessage({
            success: false,
            error: error.message
        });
    }
};

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