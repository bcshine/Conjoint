// 전역 변수
let products = [];
let attributes = [];
let utilities = {};
let marketSharePieChart = null;
let simulationPieChart = null;
let productCategory = '';

// 제품 설정
function setupProducts() {
    const numProducts = parseInt(document.getElementById('numProducts').value);
    if (numProducts < 2 || numProducts > 10) {
        alert('제품 수는 2에서 10 사이여야 합니다.');
        return;
    }
    
    productCategory = document.getElementById('productCategory').value;
    if (!productCategory) {
        alert('제품 카테고리를 입력해주세요.');
        return;
    }
    
    products = [];
    for (let i = 0; i < numProducts; i++) {
        products.push({
            id: i,
            name: i === 0 ? '신제품' : `기존 제품 ${String.fromCharCode(65 + i - 1)}`,
            attributes: {}
        });
    }
    
    document.getElementById('productSetup').classList.remove('hide');
    
    // 경쟁자 이름 입력 필드 생성
    const competitorNamesDiv = document.getElementById('competitorNames');
    competitorNamesDiv.innerHTML = '';
    
    // 첫번째 제품(신제품)은 별도 입력 필드가 있으므로 1부터 시작
    for (let i = 1; i < numProducts; i++) {
        const competitorGroup = document.createElement('div');
        competitorGroup.className = 'form-group';
        
        const competitorLabel = document.createElement('label');
        competitorLabel.textContent = `경쟁 제품 ${i} 이름:`;
        
        const competitorInput = document.createElement('input');
        competitorInput.type = 'text';
        competitorInput.id = `competitorName_${i}`;
        competitorInput.placeholder = `경쟁 제품 ${i}의 이름을 입력하세요`;
        
        competitorGroup.appendChild(competitorLabel);
        competitorGroup.appendChild(competitorInput);
        competitorNamesDiv.appendChild(competitorGroup);
    }
}

// 속성 설정
function setupAttributes() {
    const numAttributes = parseInt(document.getElementById('numAttributes').value);
    if (numAttributes < 2 || numAttributes > 5) {
        alert('속성 수는 2에서 5 사이여야 합니다.');
        return;
    }
    
    // 제품 이름 업데이트
    const myProductName = document.getElementById('myProductName').value;
    if (!myProductName) {
        alert('본인 신제품 이름을 입력해주세요.');
        return;
    }
    
    // 첫번째 제품은 본인 제품
    products[0].name = myProductName;
    
    // 경쟁 제품 이름 업데이트
    for (let i = 1; i < products.length; i++) {
        const competitorName = document.getElementById(`competitorName_${i}`).value;
        if (competitorName) {
            products[i].name = competitorName;
        }
    }
    
    attributes = [];
    const attributeSetup = document.getElementById('attributeSetup');
    attributeSetup.innerHTML = '';
    attributeSetup.classList.remove('hide');
    
    const attributeTitle = document.createElement('h3');
    attributeTitle.textContent = '2단계: 경쟁시장에서 중요한 속성 정의';
    attributeSetup.appendChild(attributeTitle);
    
    const attributeNames = ['품질', '디자인', '가격', '기능', '브랜드'];
    const scaleTypes = ['비율척도', '명목척도'];
    
    for (let i = 0; i < numAttributes; i++) {
        const attributeContainer = document.createElement('div');
        attributeContainer.className = 'attribute-container';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = `속성 ${i + 1} 이름:`;
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = `attributeName${i}`;
        nameInput.value = i < attributeNames.length ? attributeNames[i] : '';
        
        const scaleLabel = document.createElement('label');
        scaleLabel.textContent = '척도 유형:';
        
        const scaleSelect = document.createElement('select');
        scaleSelect.id = `attributeScale${i}`;
        
        // 입력된 속성 이름이 가격인 경우 비율척도로 자동 설정, 그 외에는 명목척도로 설정
        nameInput.onchange = function() {
            if (this.value.includes('가격')) {
                scaleSelect.value = '비율척도';
            } else {
                scaleSelect.value = '명목척도';
            }
        };
        
        scaleTypes.forEach(scale => {
            const option = document.createElement('option');
            option.value = scale;
            option.textContent = scale;
            scaleSelect.appendChild(option);
        });
        
        // 초기값 설정 - 가격 속성만 비율척도, 나머지는 명목척도로 설정
        if (attributeNames[i] && attributeNames[i].includes('가격')) {
            scaleSelect.value = '비율척도';
        } else {
            scaleSelect.value = '명목척도';
        }
        
        const levelCountLabel = document.createElement('label');
        levelCountLabel.textContent = '수준 개수:';
        
        const levelCountInput = document.createElement('input');
        levelCountInput.type = 'number';
        levelCountInput.id = `levelCount${i}`;
        levelCountInput.min = '2';
        levelCountInput.max = '5';
        levelCountInput.value = '3';
        
        const levelContainer = document.createElement('div');
        levelContainer.id = `levelContainer${i}`;
        
        const setupLevelsBtn = document.createElement('button');
        setupLevelsBtn.textContent = '수준 설정';
        setupLevelsBtn.onclick = function() {
            setupLevels(i);
        };
        
        attributeContainer.appendChild(nameLabel);
        attributeContainer.appendChild(nameInput);
        attributeContainer.appendChild(document.createElement('br'));
        attributeContainer.appendChild(scaleLabel);
        attributeContainer.appendChild(scaleSelect);
        attributeContainer.appendChild(document.createElement('br'));
        attributeContainer.appendChild(levelCountLabel);
        attributeContainer.appendChild(levelCountInput);
        attributeContainer.appendChild(setupLevelsBtn);
        attributeContainer.appendChild(levelContainer);
        
        attributeSetup.appendChild(attributeContainer);
    }
    
    // 모든 속성의 수준 확인 메시지
    const infoMsg = document.createElement('div');
    infoMsg.style.backgroundColor = 'lightyellow';
    infoMsg.style.padding = '10px';
    infoMsg.style.marginTop = '20px';
    infoMsg.style.borderRadius = '5px';
    infoMsg.innerHTML = `
        <p><strong>속성 별 수준 설정 안내:</strong></p>
        <ol>
            <li>각 속성별로 "수준 설정" 버튼을 클릭하여 수준을 정의해주세요.</li>
            <li>수준은 낮은 수준부터 높은 수준 순으로 입력하는 것이 좋습니다.</li>
            <li>예: 가격은 낮은 가격부터 높은 가격 순으로, 품질은 낮은 품질부터 높은 품질 순으로.</li>
            <li>모든 속성의 수준을 설정한 후 아래 버튼을 클릭하세요.</li>
            <li>비율척도는 숫자로 된것이고, 명목척도는 이름으로 된 것입니다.</li>
        </ol>
    `;
    attributeSetup.appendChild(infoMsg);
    
    const setupProductsBtn = document.createElement('button');
    setupProductsBtn.textContent = '속성 확정 후 제품 세부사항 입력';
    setupProductsBtn.style.marginTop = '15px';
    setupProductsBtn.onclick = function() {
        finalizeAttributes();
    };
    
    attributeSetup.appendChild(setupProductsBtn);
}

// 수준 설정
function setupLevels(attributeIndex) {
    const levelCount = parseInt(document.getElementById(`levelCount${attributeIndex}`).value);
    if (levelCount < 2 || levelCount > 5) {
        alert('수준 개수는 2에서 5 사이여야 합니다.');
        return;
    }
    
    const levelContainer = document.getElementById(`levelContainer${attributeIndex}`);
    levelContainer.innerHTML = '';
    
    const attributeName = document.getElementById(`attributeName${attributeIndex}`).value;
    const scale = document.getElementById(`attributeScale${attributeIndex}`).value;
    
    // 속성별 자세한 수준 설명과 예시 제공
    const attributeExamples = {
        '가격': {
            levels: ['3000원', '5000원', '7000원', '9000원', '12000원'],
            description: '제품 가격을 의미합니다. 일반적으로 가격이 낮을수록 소비자 선호도가 높아집니다.'
        },
        '품질': {
            levels: ['하', '중', '상', '최상', '프리미엄'],
            description: '제품의 품질 수준을 의미합니다. 일반적으로 품질이 높을수록 소비자 선호도가 높아집니다.'
        },
        '디자인': {
            levels: ['심플', '모던', '클래식', '유니크', '혁신적'],
            description: '제품의 디자인 스타일을 의미합니다. 목표 시장에 따라 선호되는 디자인이 다를 수 있습니다.'
        },
        '브랜드': {
            levels: ['신제품', '인기브랜드', '글로벌브랜드', '프리미엄브랜드', '럭셔리브랜드'],
            description: '제품의, 브랜드 인지도 또는 브랜드 가치를 의미합니다.'
        },
        '기능': {
            levels: ['기본형', '중급형', '고급형', '프리미엄형', '최고급형'],
            description: '제품이 제공하는 기능의 수준을 의미합니다.'
        }
    };
    
    // 기본 예시 값
    const defaultExamples = ['수준 1', '수준 2', '수준 3', '수준 4', '수준 5'];
    
    // 속성에 대한 설명 추가
    const attributeDescription = document.createElement('p');
    attributeDescription.className = 'attribute-description';
    attributeDescription.style.marginBottom = '15px';
    attributeDescription.style.fontStyle = 'italic';
    
    if (attributeExamples[attributeName]) {
        attributeDescription.textContent = attributeExamples[attributeName].description;
    } else {
        attributeDescription.textContent = `${attributeName}의 서로 다른 수준을 정의해주세요.`;
    }
    
    levelContainer.appendChild(attributeDescription);
    
    // 수준 정의 헤더
    const levelHeader = document.createElement('h4');
    levelHeader.textContent = `${attributeName}의 수준 정의 (낮은 수준 → 높은 수준 순으로 입력):`;
    levelContainer.appendChild(levelHeader);
    
    // 수준 정의 입력 필드
    for (let i = 0; i < levelCount; i++) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'level-container';
        
        const levelLabel = document.createElement('label');
        levelLabel.textContent = `수준 ${i + 1}:`;
        
        const levelInput = document.createElement('input');
        levelInput.type = 'text';
        levelInput.id = `level_${attributeIndex}_${i}`;
        levelInput.style.width = '250px';
        
        // 예시 값 설정
        if (attributeExamples[attributeName] && i < attributeExamples[attributeName].levels.length) {
            levelInput.value = attributeExamples[attributeName].levels[i];
        } else {
            levelInput.value = defaultExamples[i];
        }
        
        // 예시 표시
        const levelExample = document.createElement('span');
        levelExample.style.marginLeft = '10px';
        levelExample.style.color = '#666';
        levelExample.style.fontSize = '0.9em';
        
        if (i === 0) levelExample.textContent = '(가장 낮은 수준)';
        if (i === levelCount - 1) levelExample.textContent = '(가장 높은 수준)';
        
        // 유틸리티 값은 hidden input으로 변경 (AI가 자동 계산함)
        const utilityInput = document.createElement('input');
        utilityInput.type = 'hidden';
        utilityInput.id = `utility_${attributeIndex}_${i}`;
        utilityInput.value = '0'; // 초기값, 나중에 AI가 계산
        
        levelDiv.appendChild(levelLabel);
        levelDiv.appendChild(levelInput);
        levelDiv.appendChild(levelExample);
        levelDiv.appendChild(utilityInput);
        
        levelContainer.appendChild(levelDiv);
    }
}

// 속성 확정
function finalizeAttributes() {
    attributes = [];
    
    for (let i = 0; i < parseInt(document.getElementById('numAttributes').value); i++) {
        const name = document.getElementById(`attributeName${i}`).value;
        const scale = document.getElementById(`attributeScale${i}`).value;
        const levelCount = parseInt(document.getElementById(`levelCount${i}`).value);
        
        const levels = [];
        
        for (let j = 0; j < levelCount; j++) {
            const levelElement = document.getElementById(`level_${i}_${j}`);
            
            if (!levelElement) {
                alert(`${name} 속성의 수준을 먼저 설정해주세요.`);
                return;
            }
            
            const level = levelElement.value;
            levels.push(level);
        }
        
        attributes.push({
            id: i,
            name: name,
            scale: scale,
            levels: levels
        });
    }
    
    setupProductDetails();
}

// 제품 세부사항 설정
function setupProductDetails() {
    const productDetails = document.getElementById('productDetails');
    productDetails.innerHTML = '';
    productDetails.classList.remove('hide');
    
    const detailTitle = document.createElement('h3');
    detailTitle.textContent = '3단계: 경쟁제품별 세부 사항 입력';
    productDetails.appendChild(detailTitle);
    
    products.forEach(product => {
        const productContainer = document.createElement('div');
        productContainer.className = 'product-container';
        
        const productTitle = document.createElement('h3');
        productTitle.textContent = product.name;
        
        productContainer.appendChild(productTitle);
        
        // 제품명 표시 (이미 입력받았으므로 수정 불가)
        const nameGroup = document.createElement('div');
        nameGroup.className = 'form-group';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = '제품명:';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = `productName_${product.id}`;
        nameInput.value = product.name;
        nameInput.readOnly = true;
        
        nameGroup.appendChild(nameLabel);
        nameGroup.appendChild(nameInput);
        productContainer.appendChild(nameGroup);
        
        // 각 속성별 레벨 선택 (가격은 마지막으로)
        const sortedProductAttributes = [...attributes].sort((a, b) => {
            if (a.name.includes('가격')) return 1;
            if (b.name.includes('가격')) return -1;
            return 0;
        });
        
        sortedProductAttributes.forEach(attribute => {
            const attrGroup = document.createElement('div');
            attrGroup.className = 'form-group';
            
            const attrLabel = document.createElement('label');
            attrLabel.textContent = `${attribute.name} (${attribute.scale}):`;
            
            const attrSelect = document.createElement('select');
            attrSelect.id = `product_${product.id}_attr_${attribute.id}`;
            
            attribute.levels.forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = level;
                attrSelect.appendChild(option);
            });
            
            attrGroup.appendChild(attrLabel);
            attrGroup.appendChild(attrSelect);
            productContainer.appendChild(attrGroup);
        });
        
        productDetails.appendChild(productContainer);
    });
    
    document.getElementById('populationGroup').classList.remove('hide');
}

// AI를 사용하여 유틸리티 추정
function estimateUtilities() {
    // 파일에서 제공된 유틸리티 값 정의 - '속성별 척도구분, 효용값 게산.txt' 파일 내용 반영
    const predefinedUtilities = {
        "디자인": {
            "심미성 낮음": -1,
            "보통": 0,
            "매우 우수함": 1
        },
        "품질": {
            "낮음": -0.95,
            "보통": 0,
            "높음": 0.95
        },
        "성능": {
            "미스매치": -0.91,
            "보통": 0,
            "잘맞음": 0.91
        },
        "가격": {
            "비쌈": -0.85,
            "보통": 0,
            "저렴": 0.85
        },
        "배송": {
            "배송이 느림": -0.7,
            "보통": 0,
            "배송이 빠름": 0.7
        },
        "상품 다양성": {
            "적음": -0.64,
            "보통": 0,
            "다양함": 0.64
        },
        "A/S": {
            "나쁨": -0.6,
            "보통": 0,
            "좋음": 0.6
        },
        "색상": {
            "단일색상만": -0.85,
            "보통": 0,
            "여러내장색": 0.85
        }
    };

    // 속성 별로 유틸리티 추정 로직
    attributes.forEach(attribute => {
        const levelUtilities = {};
        
        // 유사 속성명 찾기
        let matchedAttrName = null;
        for (const attrName in predefinedUtilities) {
            if (attribute.name === attrName || 
                attribute.name.includes(attrName) || 
                attrName.includes(attribute.name)) {
                matchedAttrName = attrName;
                break;
            }
        }
        
        if (matchedAttrName) {
            console.log(`'${attribute.name}' 속성은 '${matchedAttrName}'와 매칭됩니다.`);
            // 미리 정의된 유틸리티 값 사용
            const predefinedValues = predefinedUtilities[matchedAttrName];
            
            attribute.levels.forEach((level, index) => {
                // 정확히 일치하는 수준 검색
                let matchedLevel = null;
                for (const predefinedLevel in predefinedValues) {
                    if (level === predefinedLevel || 
                        level.includes(predefinedLevel) || 
                        predefinedLevel.includes(level)) {
                        matchedLevel = predefinedLevel;
                        break;
                    }
                }
                
                if (matchedLevel) {
                    console.log(`'${level}' 수준은 '${matchedLevel}'와 매칭됩니다. 유틸리티: ${predefinedValues[matchedLevel]}`);
                    levelUtilities[level] = predefinedValues[matchedLevel];
                } else {
                    console.log(`'${level}' 수준에 매칭되는 참조 값이 없습니다. 인덱스 기반 할당.`);
                    // 매칭되는 수준이 없는 경우, 인덱스 위치에 따라 유틸리티 할당
                    if (index === 0) { // 첫 번째 레벨 (낮음)
                        levelUtilities[level] = Object.values(predefinedValues)[0];
                    } else if (index === attribute.levels.length - 1) { // 마지막 레벨 (높음)
                        levelUtilities[level] = Object.values(predefinedValues)[2];
                    } else { // 중간 레벨
                        levelUtilities[level] = Object.values(predefinedValues)[1];
                    }
                }
            });
        } else {
            console.log(`'${attribute.name}' 속성에 대한 참조 유틸리티가 없습니다. 기본 로직 적용.`);
            // 속성 타입에 따라 유틸리티 값 추정 (기존 로직 유지)
            if (attribute.name.includes('가격')) {
                // 가격: 낮을수록 높은 유틸리티 (음수 유틸리티, 가격이 높을수록 유틸리티가 낮음)
                attribute.levels.forEach((level, index) => {
                    if (index === 0) levelUtilities[level] = 0.85; // 가장 낮은 가격 (저렴)
                    else if (index === attribute.levels.length - 1) levelUtilities[level] = -0.85; // 가장 높은 가격 (비쌈)
                    else levelUtilities[level] = 0; // 중간 가격 (보통)
                });
            } else if (attribute.name.includes('품질') || attribute.name.includes('성능')) {
                // 품질/성능: 높을수록 높은 유틸리티 (양수 유틸리티)
                attribute.levels.forEach((level, index) => {
                    if (index === 0) levelUtilities[level] = -0.95; // 가장 낮은 품질
                    else if (index === attribute.levels.length - 1) levelUtilities[level] = 0.95; // 가장 높은 품질
                    else levelUtilities[level] = 0; // 중간 품질
                });
            } else if (attribute.name.includes('디자인')) {
                // 디자인: 디자인 품질에 따른 유틸리티
                attribute.levels.forEach((level, index) => {
                    if (index === 0) levelUtilities[level] = -1; // 가장 낮은 디자인 품질
                    else if (index === attribute.levels.length - 1) levelUtilities[level] = 1; // 가장 높은 디자인 품질
                    else levelUtilities[level] = 0; // 중간 디자인 품질
                });
            } else {
                // 기타 속성: 순서대로 점차 증가하는 유틸리티 (최대 1 사이로 정규화)
                attribute.levels.forEach((level, index) => {
                    if (index === 0) levelUtilities[level] = -0.6; // 가장 낮은 수준
                    else if (index === attribute.levels.length - 1) levelUtilities[level] = 0.6; // 가장 높은 수준
                    else levelUtilities[level] = 0; // 중간 수준
                });
            }
        }
        
        attribute.utilities = levelUtilities;
    });
    
    // 각 속성 별로 유틸리티 계산하여 제품에 적용
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
    
    console.log("참조 효용값이 적용되었습니다.");
    return true;
}

// 유틸리티 계산
function calculateUtilities() {
    // AI로 유틸리티 추정
    if (estimateUtilities()) {
        // 결과 표시
        displayResults();
    } else {
        alert('유틸리티 추정 중 오류가 발생했습니다.');
    }
}

// 페이지 로드 시 초기화
window.onload = function() {
    // 외부 script2.js 파일 로드
    const script2 = document.createElement('script');
    script2.src = 'script2.js';
    document.body.appendChild(script2);
}; 