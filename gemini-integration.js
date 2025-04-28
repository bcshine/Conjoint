// Google Gemini API 통합 모듈

// 설정 변수
let geminiApiKey = '';
let useGeminiApi = false;

// HTML 페이지 로드 후 초기화
document.addEventListener('DOMContentLoaded', initializeGeminiIntegration);

// Gemini 통합 초기화 함수
function initializeGeminiIntegration() {
    // 사용자 인터페이스 요소 추가
    setupGeminiUI();
    
    // 저장된 API 키 및 설정 불러오기
    loadGeminiSettings();
    
    // 기존 함수 확장
    extendExistingFunctions();
}

// Gemini API 관련 UI 생성
function setupGeminiUI() {
    // API 설정 컨테이너 생성
    const container = document.querySelector('.container');
    const stepSection = document.getElementById('step1');
    
    // API 설정 섹션 생성
    const apiSection = document.createElement('div');
    apiSection.className = 'api-section';
    apiSection.innerHTML = `
        <h2>Google Gemini API 설정 <span class="optional">(선택사항)</span></h2>
        <p>Gemini API를 연결하면 콘조인트 분석의 정확도가 향상됩니다. API 키가 없으면 기본 내장 계산 방식이 사용됩니다.</p>
        
        <div class="form-group api-controls">
            <div class="toggle-container">
                <label for="useGeminiApi">Gemini API 사용:</label>
                <label class="switch">
                    <input type="checkbox" id="useGeminiApi">
                    <span class="slider round"></span>
                </label>
            </div>
            <button id="connectGeminiApi" class="btn-primary">Google Gemini API 연결</button>
        </div>
        
        <div id="apiStatus" class="api-status"></div>
        
        <!-- API 키 입력 필드 (숨김 상태) -->
        <div id="apiKeyContainer" style="display: none; margin-top: 15px;">
            <div class="form-group">
                <label for="geminiApiKey">Gemini API 키:</label>
                <div class="api-input-container">
                    <input type="password" id="geminiApiKey" placeholder="Gemini API 키를 입력하세요">
                    <button id="toggleApiKey" class="btn-icon">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            <div class="button-group">
                <button id="saveApiSettings" class="btn-secondary">API 설정 저장</button>
                <button id="verifyApiKey" class="btn-secondary">API 키 확인</button>
                <button id="hideApiKey" class="btn-secondary">취소</button>
            </div>
        </div>
    `;
    
    // 컨테이너에 API 섹션 추가
    container.insertBefore(apiSection, stepSection);
    
    // 이벤트 리스너 추가
    document.getElementById('toggleApiKey').addEventListener('click', toggleApiKeyVisibility);
    document.getElementById('saveApiSettings').addEventListener('click', saveGeminiSettings);
    document.getElementById('verifyApiKey').addEventListener('click', verifyGeminiApiKey);
    document.getElementById('connectGeminiApi').addEventListener('click', showApiKeyInput);
    document.getElementById('hideApiKey').addEventListener('click', hideApiKeyInput);
    
    // CSS 스타일 추가
    addGeminiStyles();
}

// API 키 입력 필드 표시
function showApiKeyInput() {
    const apiKeyContainer = document.getElementById('apiKeyContainer');
    const connectButton = document.getElementById('connectGeminiApi');
    const apiStatus = document.getElementById('apiStatus');
    
    // 저장된 API 키가 있으면 이미 연결되었다고 표시
    if (geminiApiKey) {
        apiStatus.innerHTML = '<span class="success">Gemini API가 이미 연결되어 있습니다.</span>';
        apiStatus.style.display = 'block';
        
        // 3초 후 상태 메시지 숨김
        setTimeout(() => {
            apiStatus.style.display = 'none';
        }, 3000);
        return;
    }
    
    // API 키 입력 필드 표시
    apiKeyContainer.style.display = 'block';
    connectButton.style.display = 'none';
}

// API 키 입력 필드 숨김
function hideApiKeyInput() {
    const apiKeyContainer = document.getElementById('apiKeyContainer');
    const connectButton = document.getElementById('connectGeminiApi');
    
    // API 키 입력 필드 숨김
    apiKeyContainer.style.display = 'none';
    connectButton.style.display = 'inline-block';
}

// API 키 표시/숨김 전환
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('geminiApiKey');
    const toggleBtn = document.getElementById('toggleApiKey').querySelector('i');
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        apiKeyInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Gemini 설정 저장
function saveGeminiSettings() {
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    const useApi = document.getElementById('useGeminiApi').checked;
    
    // 로컬 스토리지에 설정 저장
    localStorage.setItem('geminiApiKey', apiKey);
    localStorage.setItem('useGeminiApi', useApi);
    
    // 전역 변수 업데이트
    geminiApiKey = apiKey;
    useGeminiApi = useApi;
    
    // 상태 메시지 업데이트
    const apiStatus = document.getElementById('apiStatus');
    apiStatus.innerHTML = '<span class="success">Gemini API가 연결되었습니다.</span>';
    apiStatus.style.display = 'block';
    
    // API 키 입력 영역 숨김
    hideApiKeyInput();
    
    // 일정 시간 후 상태 메시지 숨김
    setTimeout(() => {
        apiStatus.style.display = 'none';
    }, 3000);
}

// 저장된 Gemini 설정 불러오기
function loadGeminiSettings() {
    // 로컬 스토리지에서 설정 불러오기
    const savedApiKey = localStorage.getItem('geminiApiKey') || '';
    const savedUseApi = localStorage.getItem('useGeminiApi') === 'true';
    
    // 입력 필드 업데이트
    document.getElementById('geminiApiKey').value = savedApiKey;
    document.getElementById('useGeminiApi').checked = savedUseApi;
    
    // 연결 버튼 상태 업데이트
    updateConnectButtonStatus(savedApiKey);
    
    // 전역 변수 업데이트
    geminiApiKey = savedApiKey;
    useGeminiApi = savedUseApi;
}

// API 연결 버튼 상태 업데이트
function updateConnectButtonStatus(apiKey) {
    const connectButton = document.getElementById('connectGeminiApi');
    
    if (apiKey) {
        // API 키가 있는 경우
        connectButton.textContent = 'Google Gemini API 연결됨';
        connectButton.classList.add('connected');
        connectButton.disabled = true;  // 이미 연결된 경우 버튼 비활성화
        
        // 상태 메시지에 작은 툴팁 추가
        connectButton.title = '이미 Gemini API가 연결되어 있습니다';
    } else {
        // API 키가 없는 경우
        connectButton.textContent = 'Google Gemini API 연결';
        connectButton.classList.remove('connected');
        connectButton.disabled = false;
        connectButton.title = 'Gemini API 키를 입력하여 연결합니다';
    }
}

// API 키 유효성 검증
async function verifyGeminiApiKey() {
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    const apiStatus = document.getElementById('apiStatus');
    
    if (!apiKey) {
        apiStatus.innerHTML = '<span class="error">API 키를 입력해주세요.</span>';
        apiStatus.style.display = 'block';
        return;
    }
    
    // 로딩 표시
    apiStatus.innerHTML = '<span class="loading"><i class="fas fa-spinner fa-spin"></i> Google Gemini API 연결 중...</span>';
    apiStatus.style.display = 'block';
    
    try {
        // Gemini API 테스트 요청
        const testResult = await testGeminiApi(apiKey);
        
        if (testResult.success) {
            apiStatus.innerHTML = '<span class="success">Google Gemini API가 성공적으로 연결되었습니다.</span>';
            // API 사용 토글 활성화
            document.getElementById('useGeminiApi').checked = true;
            // 연결 버튼 상태 업데이트
            updateConnectButtonStatus(apiKey);
            // 설정 저장
            saveGeminiSettings();
        } else {
            apiStatus.innerHTML = `<span class="error">Google Gemini API 연결 실패: ${testResult.message}</span>`;
        }
    } catch (error) {
        apiStatus.innerHTML = `<span class="error">Google Gemini API 연결 중 오류 발생: ${error.message}</span>`;
    }
}

// Gemini API 테스트
async function testGeminiApi(apiKey) {
    try {
        // 간단한 테스트 요청 - 수정된 API 엔드포인트
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Hello, this is a test request for the conjoint analysis program." }]
                }]
            })
        });
        
        const data = await response.json();
        
        // 응답 확인
        if (data.candidates && data.candidates.length > 0) {
            return { success: true };
        } else if (data.error) {
            return { success: false, message: data.error.message };
        } else {
            return { success: false, message: "알 수 없는 응답 형식" };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// 기존 함수 확장 (estimateUtilities)
function extendExistingFunctions() {
    // 원래 함수 참조 저장
    const originalEstimateUtilities = window.estimateUtilities;
    
    // 함수 재정의
    window.estimateUtilities = async function() {
        // Gemini API 사용이 활성화되어 있고, API 키가 있는 경우
        if (useGeminiApi && geminiApiKey) {
            try {
                // 로딩 표시
                showLoadingIndicator();
                
                // Gemini API로 유틸리티 계산
                const success = await estimateUtilitiesWithGemini();
                
                // 로딩 숨김
                hideLoadingIndicator();
                
                return success;
            } catch (error) {
                console.error("Gemini API 사용 중 오류 발생:", error);
                hideLoadingIndicator();
                
                // 오류 발생 시 원래 함수 호출
                return originalEstimateUtilities();
            }
        } else {
            // API 사용이 비활성화되어 있거나 API 키가 없는 경우 원래 함수 호출
            return originalEstimateUtilities();
        }
    };
    
    // calculateUtilities 함수도 확장
    const originalCalculateUtilities = window.calculateUtilities;
    
    window.calculateUtilities = async function() {
        // Gemini API 사용이 활성화되어 있는 경우 비동기 처리
        if (useGeminiApi && geminiApiKey) {
            if (await window.estimateUtilities()) {
                displayResults();
            } else {
                alert('유틸리티 추정 중 오류가 발생했습니다.');
            }
        } else {
            // API 사용이 비활성화되어 있는 경우 원래 함수 호출
            originalCalculateUtilities();
        }
    };
}

// Gemini API를 사용한 유틸리티 계산
async function estimateUtilitiesWithGemini() {
    try {
        // 프롬프트 생성
        const prompt = generateGeminiPrompt();
        
        // Gemini API 호출
        const utilities = await callGeminiApi(prompt);
        
        if (!utilities) {
            throw new Error("유틸리티 계산에 실패했습니다.");
        }
        
        // 계산된 유틸리티를 속성에 적용
        applyGeminiUtilities(utilities);
        
        // 제품별 유틸리티 계산
        calculateProductUtilities();
        
        return true;
    } catch (error) {
        console.error("Gemini로 유틸리티 계산 중 오류:", error);
        return false;
    }
}

// Gemini API용 프롬프트 생성
function generateGeminiPrompt() {
    // 기본 프롬프트
    let prompt = `이것은 콘조인트 분석을 위한 유틸리티 값 계산 요청입니다.
제품 카테고리: ${document.getElementById('productCategory').value || '일반 제품'}

아래 속성과 수준에 대한 유틸리티 값을 계산해주세요. 유틸리티 값은 다항 로지트 모델에 사용되며, 
일반적으로 -1에서 1 사이의 값으로 정규화됩니다. 높은 유틸리티 값은 더 높은 소비자 선호도를 나타냅니다.

속성과 수준:
`;

    // 각 속성과 수준 정보 추가
    attributes.forEach(attribute => {
        prompt += `\n속성: ${attribute.name} (${attribute.scale})\n수준:`;
        attribute.levels.forEach((level, index) => {
            prompt += ` ${index+1}) ${level}`;
        });
    });

    // 응답 형식 지정
    prompt += `\n
응답 형식:
{
  "속성1": {
    "수준1": 유틸리티값,
    "수준2": 유틸리티값,
    ...
  },
  "속성2": {
    ...
  }
}

중요 규칙:
1. 가격 속성은 일반적으로 낮은 가격이 높은 유틸리티, 높은 가격이 낮은 유틸리티를 가집니다.
2. 품질, 성능, 디자인 등의 속성은 일반적으로 높은 수준이 높은 유틸리티를, 낮은 수준이 낮은 유틸리티를 가집니다.
3. 응답은 JSON 형식으로만 제공해주세요.`;

    return prompt;
}

// Gemini API 호출
async function callGeminiApi(prompt) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.2,
                    topP: 0.8,
                    topK: 40
                }
            })
        });

        const data = await response.json();
        
        // 응답 확인 및 파싱
        if (data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
            
            const responseText = data.candidates[0].content.parts[0].text;
            
            // JSON 부분 추출 (마크다운 코드 블록 처리 포함)
            let jsonStr = responseText;
            
            // 마크다운 코드 블록 패턴 확인
            const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
            const match = responseText.match(jsonRegex);
            
            if (match && match[1]) {
                jsonStr = match[1];
            }
            
            // JSON 파싱
            try {
                return JSON.parse(jsonStr);
            } catch (parseError) {
                console.error("JSON 파싱 오류:", parseError);
                console.log("파싱하려고 시도한 텍스트:", jsonStr);
                
                // 안전한 JSON 추출 재시도
                const jsonStart = responseText.indexOf('{');
                const jsonEnd = responseText.lastIndexOf('}');
                
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                    jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
                    try {
                        return JSON.parse(jsonStr);
                    } catch (retryError) {
                        console.error("두 번째 JSON 파싱 시도 실패:", retryError);
                        return null;
                    }
                }
                
                return null;
            }
        } else if (data.error) {
            console.error("Gemini API 오류:", data.error);
            return null;
        } else {
            console.error("Gemini API 응답에 예상된 데이터가 없습니다.", data);
            return null;
        }
    } catch (error) {
        console.error("Gemini API 호출 오류:", error);
        return null;
    }
}

// Gemini로부터 받은 유틸리티 속성에 적용
function applyGeminiUtilities(geminiUtilities) {
    attributes.forEach(attribute => {
        const levelUtilities = {};
        
        // Gemini 결과에서 매칭되는 속성명 찾기
        let matchedAttrName = null;
        for (const attrName in geminiUtilities) {
            if (attribute.name === attrName || 
                attribute.name.includes(attrName) || 
                attrName.includes(attribute.name)) {
                matchedAttrName = attrName;
                break;
            }
        }
        
        if (matchedAttrName) {
            console.log(`'${attribute.name}' 속성은 Gemini에서 '${matchedAttrName}'와 매칭됩니다.`);
            // Gemini가 계산한 유틸리티 값 사용
            const geminiValues = geminiUtilities[matchedAttrName];
            
            attribute.levels.forEach((level, index) => {
                // 정확히 일치하는 수준 검색
                let matchedLevel = null;
                for (const geminiLevel in geminiValues) {
                    if (level === geminiLevel || 
                        level.includes(geminiLevel) || 
                        geminiLevel.includes(level)) {
                        matchedLevel = geminiLevel;
                        break;
                    }
                }
                
                if (matchedLevel) {
                    console.log(`'${level}' 수준은 Gemini에서 '${matchedLevel}'와 매칭됩니다. 유틸리티: ${geminiValues[matchedLevel]}`);
                    levelUtilities[level] = geminiValues[matchedLevel];
                } else {
                    console.log(`'${level}' 수준에 매칭되는 Gemini 값이 없습니다. 인덱스 기반 할당.`);
                    // 매칭되는 수준이 없는 경우, 인덱스 위치에 따라 유틸리티 할당
                    // 모든 값을 배열로 변환
                    const utilitiesArray = Object.values(geminiValues);
                    if (utilitiesArray.length > 0) {
                        // 인덱스가 범위를 벗어나면 처음이나 마지막 값 사용
                        const valueIndex = Math.min(index, utilitiesArray.length - 1);
                        levelUtilities[level] = utilitiesArray[valueIndex];
                    } else {
                        // 대체 값이 없는 경우 기본 로직 적용
                        applyDefaultUtility(attribute, level, index, levelUtilities);
                    }
                }
            });
        } else {
            console.log(`'${attribute.name}' 속성에 대한 Gemini 유틸리티가 없습니다. 기본 로직 적용.`);
            // 속성 타입에 따라 유틸리티 값 추정 (기존 로직 적용)
            attribute.levels.forEach((level, index) => {
                applyDefaultUtility(attribute, level, index, levelUtilities);
            });
        }
        
        attribute.utilities = levelUtilities;
    });
}

// 기본 유틸리티 값 적용 (Gemini 결과가 없을 때)
function applyDefaultUtility(attribute, level, index, levelUtilities) {
    if (attribute.name.includes('가격')) {
        // 가격: 낮을수록 높은 유틸리티
        if (index === 0) levelUtilities[level] = 0.85; // 가장 낮은 가격 (저렴)
        else if (index === attribute.levels.length - 1) levelUtilities[level] = -0.85; // 가장 높은 가격 (비쌈)
        else levelUtilities[level] = 0; // 중간 가격 (보통)
    } else if (attribute.name.includes('품질') || attribute.name.includes('성능')) {
        // 품질/성능: 높을수록 높은 유틸리티
        if (index === 0) levelUtilities[level] = -0.95; // 가장 낮은 품질
        else if (index === attribute.levels.length - 1) levelUtilities[level] = 0.95; // 가장 높은 품질
        else levelUtilities[level] = 0; // 중간 품질
    } else if (attribute.name.includes('디자인')) {
        // 디자인: 디자인 품질에 따른 유틸리티
        if (index === 0) levelUtilities[level] = -1; // 가장 낮은 디자인 품질
        else if (index === attribute.levels.length - 1) levelUtilities[level] = 1; // 가장 높은 디자인 품질
        else levelUtilities[level] = 0; // 중간 디자인 품질
    } else {
        // 기타 속성: 순서대로 점차 증가하는 유틸리티
        if (index === 0) levelUtilities[level] = -0.6; // 가장 낮은 수준
        else if (index === attribute.levels.length - 1) levelUtilities[level] = 0.6; // 가장 높은 수준
        else levelUtilities[level] = 0; // 중간 수준
    }
}

// 각 제품의 총 유틸리티 계산
function calculateProductUtilities() {
    products.forEach(product => {
        product.name = document.getElementById(`productName_${product.id}`).value;
        product.attributes = {};
        product.utility = 0;
        
        attributes.forEach(attribute => {
            const levelElement = document.getElementById(`product_${product.id}_attr_${attribute.id}`);
            const level = levelElement.value;
            
            product.attributes[attribute.name] = level;
            product.utility += attribute.utilities[level];
        });
    });
    
    console.log("Gemini 유틸리티가 적용되었습니다.");
}

// 로딩 인디케이터 표시
function showLoadingIndicator() {
    // 로딩 오버레이 요소가 이미 있는지 확인
    let loadingOverlay = document.getElementById('loadingOverlay');
    
    if (!loadingOverlay) {
        // 로딩 오버레이 생성
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'loading-overlay';
        
        // 로딩 컨테이너
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-container';
        
        // 스피너
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        // 로딩 텍스트
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Gemini API로 유틸리티 계산 중...';
        
        // 요소 조합
        loadingContainer.appendChild(spinner);
        loadingContainer.appendChild(loadingText);
        loadingOverlay.appendChild(loadingContainer);
        
        // 본문에 추가
        document.body.appendChild(loadingOverlay);
    } else {
        // 기존 오버레이 표시
        loadingOverlay.style.display = 'flex';
    }
}

// 로딩 인디케이터 숨김
function hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Gemini 스타일 추가
function addGeminiStyles() {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .api-section {
            background-color: #f0f8ff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .api-section h2 {
            color: #2970ff;
            margin-top: 0;
            display: flex;
            align-items: center;
        }
        
        .api-section h2 .optional {
            font-size: 0.7em;
            background-color: #e1e9ff;
            padding: 2px 8px;
            border-radius: 12px;
            margin-left: 10px;
            font-weight: normal;
            color: #4a74d9;
        }
        
        .api-input-container {
            display: flex;
            align-items: center;
        }
        
        .api-input-container input {
            flex-grow: 1;
        }
        
        .btn-icon {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            margin-left: 5px;
            color: #555;
        }
        
        .btn-icon:hover {
            color: #000;
        }
        
        .api-controls {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 10px;
        }
        
        .toggle-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        .btn-primary {
            background-color: #4285f4;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        
        .btn-primary:hover {
            background-color: #3367d6;
        }
        
        .btn-primary.connected {
            background-color: #34a853;
            cursor: default;
        }
        
        .btn-primary.connected:before {
            content: "✓ ";
        }
        
        .btn-primary:disabled {
            opacity: 0.7;
            cursor: default;
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 46px;
            height: 24px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
        }
        
        input:checked + .slider {
            background-color: #2196F3;
        }
        
        input:focus + .slider {
            box-shadow: 0 0 1px #2196F3;
        }
        
        input:checked + .slider:before {
            transform: translateX(22px);
        }
        
        .slider.round {
            border-radius: 24px;
        }
        
        .slider.round:before {
            border-radius: 50%;
        }
        
        .api-status {
            margin-top: 10px;
            padding: 8px;
            border-radius: 4px;
            display: none;
            background-color: #f1f8e9;
            border-left: 3px solid #8bc34a;
        }
        
        .api-status .success {
            color: #2e7d32;
            font-weight: bold;
        }
        
        .api-status .error {
            color: #c62828;
        }
        
        .api-status .loading {
            color: #1565c0;
        }
        
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        
        .loading-container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .loading-spinner {
            border: 6px solid #f3f3f3;
            border-top: 6px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        .loading-text {
            font-size: 18px;
            color: #333;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleSheet);
}