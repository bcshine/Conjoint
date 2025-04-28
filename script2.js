// 원 그래프 초기화 (참조용 - 이미 새 방식으로 구현됨)
function initPieChart() {
    // No-op - 차트는 이제 displayResults에서 직접 생성됨
}

// 시뮬레이션 제어 설정
function setupSimulationControls() {
    const simulationControls = document.getElementById('simulationControls');
    simulationControls.innerHTML = '';
    
    // 속성을 정렬하여 가격을 마지막으로
    const sortedSimAttributes = [...attributes].sort((a, b) => {
        if (a.name.includes('가격')) return 1;
        if (b.name.includes('가격')) return -1;
        return 0;
    });
    
    // 헤더 추가
    const header = document.createElement('div');
    header.className = 'slider-header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '10px';
    header.style.fontWeight = 'bold';
    
    const minLabel = document.createElement('span');
    minLabel.textContent = '-50%';
    minLabel.style.flexBasis = '15%';
    minLabel.style.textAlign = 'left';
    
    const midLabel = document.createElement('span');
    midLabel.textContent = '0%';
    midLabel.style.flexBasis = '70%';
    midLabel.style.textAlign = 'center';
    
    const maxLabel = document.createElement('span');
    maxLabel.textContent = '+50%';
    maxLabel.style.flexBasis = '15%';
    maxLabel.style.textAlign = 'right';
    
    header.appendChild(minLabel);
    header.appendChild(midLabel);
    header.appendChild(maxLabel);
    
    // 헤더를 컨트롤에 추가
    simulationControls.appendChild(header);
    
    // 본인 제품(첫 번째 제품)의 각 속성별 슬라이더 생성
    sortedSimAttributes.forEach(attribute => {
        const level = products[0].attributes[attribute.name];
        const utility = attribute.utilities[level];
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        const sliderLabel = document.createElement('div');
        sliderLabel.className = 'slider-label';
        
        const sliderName = document.createElement('span');
        sliderName.textContent = `${attribute.name} 조정`;
        
        const sliderValue = document.createElement('span');
        sliderValue.id = `slider_value_${attribute.id}`;
        sliderValue.textContent = '0%';
        
        sliderLabel.appendChild(sliderName);
        sliderLabel.appendChild(sliderValue);
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'simulation-slider';
        slider.id = `attr_slider_${attribute.id}`;
        slider.min = '-50';
        slider.max = '50';
        slider.value = '0';
        slider.step = '5';
        
        // 슬라이더 변경 시 실시간으로 시뮬레이션 업데이트
        slider.addEventListener('input', function() {
            const value = parseInt(this.value);
            
            // 가격 속성인 경우 UI 표시에 더 큰 효과가 있음을 보여줌 (1.5배 증폭 중임을 표시)
            if (attribute.name.includes('가격')) {
                const displayValue = value; // UI에는 원래 값 그대로 표시
                document.getElementById(`slider_value_${attribute.id}`).textContent = `${displayValue > 0 ? '+' : ''}${displayValue}% (영향력 1.5배)`;
                document.getElementById(`slider_value_${attribute.id}`).style.fontWeight = 'bold';
            } else {
                document.getElementById(`slider_value_${attribute.id}`).textContent = `${value > 0 ? '+' : ''}${value}%`;
            }
            
            // 실시간 시뮬레이션 업데이트 (미리보기)
            updateSimulationPreview();
        });
        
        sliderContainer.appendChild(sliderLabel);
        sliderContainer.appendChild(slider);
        
        simulationControls.appendChild(sliderContainer);
    });
    
    // 시뮬레이션 결과를 초기화 (원래 상태 표시)
    initializeSimulationResults();
}

// 실시간 시뮬레이션 미리보기 업데이트
function updateSimulationPreview() {
    // 원본 유틸리티 값을 복사하여 시뮬레이션
    const originalProducts = JSON.parse(JSON.stringify(products));
    const myProduct = products[0]; // 첫 번째 제품이 본인 제품
    
    // 기존 총 유틸리티 값 저장
    const originalTotalUtility = myProduct.utility;
    
    // 제품 유틸리티를 처음부터 다시 계산하기 위해 초기화
    myProduct.utility = 0;
    
    // 각 속성별로 새 유틸리티 합산
    attributes.forEach(attribute => {
        const slider = document.getElementById(`attr_slider_${attribute.id}`);
        const adjustmentPercent = parseInt(slider.value) / 100;
        
        const level = myProduct.attributes[attribute.name];
        const originalUtility = attribute.utilities[level];
        
        // 조정된 유틸리티 계산 - 속성별 특성 고려
        let adjustedUtility;
        
        // 증폭 없이 원래 조정 비율 사용
        const adjustment = adjustmentPercent;
        
        // 가격 속성은 특별 처리 (부호 고려 + 영향력 1.5배 증가)
        if (attribute.name.includes('가격')) {
            // 가격 영향력 증폭 계수 (1.5배 더 중요하게)
            const priceMultiplier = 1.5;
            
            // 가격 조정에 증폭 계수 적용
            const amplifiedAdjustment = adjustment * priceMultiplier;
            
            // 가격은 반대로 영향 (양의 조정값은 효용 감소, 음의 조정값은 효용 증가)
            // 가격 속성의 유틸리티는 일반적으로 음수 값 (비쌀수록 더 큰 음수)
            if (originalUtility < 0) {
                // 음수 유틸리티 (일반적인 가격 속성)
                // 가격 상승(양수 조정) -> 더 부정적 -> 절대값 증가
                // 가격 하락(음수 조정) -> 덜 부정적 -> 절대값 감소
                adjustedUtility = originalUtility * (1 + amplifiedAdjustment);
            } else {
                // 양수 유틸리티 (특이한 경우)
                // 가격 상승(양수 조정) -> 덜 긍정적 -> 값 감소
                // 가격 하락(음수 조정) -> 더 긍정적 -> 값 증가
                adjustedUtility = originalUtility * (1 - amplifiedAdjustment);
            }
            console.log(`가격 속성: ${attribute.name}, 원래값: ${originalUtility}, 조정: ${adjustmentPercent}, 증폭: ${amplifiedAdjustment}, 결과: ${adjustedUtility}`);
        } else if (originalUtility >= 0) {
            // 양수 유틸리티(좋은 속성)는 향상 시 증가
            adjustedUtility = originalUtility * (1 + adjustment);
        } else {
            // 음수 유틸리티(나쁜 속성)는 향상 시 덜 부정적
            adjustedUtility = originalUtility * (1 - adjustment);
        }
        
        // 조정된 유틸리티 적용 - 누적 합산
        myProduct.utility += adjustedUtility;
    });
    
    // 시뮬레이션 결과 계산 (다항 로지트 모델)
    const expUtilities = products.map(product => Math.exp(product.utility));
    const sumExpUtilities = expUtilities.reduce((a, b) => a + b, 0);
    
    products.forEach((product, index) => {
        product.simProbability = expUtilities[index] / sumExpUtilities;
    });
    
    // 파이 차트 업데이트
    updateSimulationPieChart();
    
    // 간략한 시장 점유율 표 업데이트
    updateSimulationTable();
    
    // 원래 유틸리티 값으로 복원
    products = originalProducts;
}

// 시뮬레이션 결과 초기화 (최초 표시)
function initializeSimulationResults() {
    const simulationResults = document.getElementById('simulationResults');
    simulationResults.innerHTML = '';
    
    // 통합된 타이틀 추가
    const unifiedTitle = document.createElement('div');
    unifiedTitle.className = 'unified-title';
    unifiedTitle.textContent = '현재 시장 점유율';
    simulationResults.appendChild(unifiedTitle);
    
    // 중앙에 원 그래프 추가
    const centerPieContainer = document.createElement('div');
    centerPieContainer.className = 'center-pie-container';
    centerPieContainer.style.width = '100%';
    centerPieContainer.style.textAlign = 'center';
    centerPieContainer.style.marginBottom = '30px';
    
    // 원 그래프 캔버스 생성
    const pieChartCanvas = document.createElement('canvas');
    pieChartCanvas.id = 'simulationPieChartCenter';
    pieChartCanvas.style.maxWidth = '400px';
    pieChartCanvas.style.margin = '0 auto';
    centerPieContainer.appendChild(pieChartCanvas);
    
    // 중앙 원 그래프를 결과 컨테이너에 추가
    simulationResults.appendChild(centerPieContainer);
    
    // 원 그래프 생성 (현재 상태)
    createSimulationPieChart();
    
    // 현재 시장 점유율 테이블 추가
    const tableTitle = document.createElement('div');
    tableTitle.className = 'chart-title';
    tableTitle.textContent = '현재 시장 점유율 분포';
    tableTitle.style.textAlign = 'center';
    tableTitle.style.marginBottom = '15px';
    simulationResults.appendChild(tableTitle);
    
    // 테이블 생성
    createSimulationTable(simulationResults);
    
    // 숨겨진 캔버스 (참조용)
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.display = 'none';
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.id = 'simulationPieChart';
    hiddenContainer.appendChild(hiddenCanvas);
    simulationResults.appendChild(hiddenContainer);
}

// 시뮬레이션 파이 차트 생성
function createSimulationPieChart() {
    const canvas = document.getElementById('simulationPieChartCenter');
    
    // 데이터 준비
    const labels = products.map(product => product.name);
    const data = products.map(product => {
        return isNaN(product.probability) ? 0 : product.probability * 100;
    });
    
    // 새 차트 생성
    simulationPieChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',    // 밝은 파란색
                    'rgba(255, 99, 132, 0.7)',    // 분홍색
                    'rgba(75, 192, 192, 0.7)',    // 청록색
                    'rgba(255, 159, 64, 0.7)',    // 주황색
                    'rgba(153, 102, 255, 0.7)'    // 보라색
                ].slice(0, products.length),
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)'
                ].slice(0, products.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Arial, sans-serif',
                            size: 13
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value.toFixed(1)}%`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// 시뮬레이션 파이 차트 업데이트
function updateSimulationPieChart() {
    if (!simulationPieChart) return;
    
    // 데이터 준비
    const data = products.map(product => {
        const prob = (product.simProbability || product.probability) * 100;
        return isNaN(prob) ? 0 : prob;
    });
    
    // 차트 업데이트
    simulationPieChart.data.datasets[0].data = data;
    simulationPieChart.update();
}

// 시뮬레이션 테이블 생성
function createSimulationTable(container) {
    // 테이블 생성
    const table = document.createElement('table');
    table.id = 'simulationTable';
    table.style.maxWidth = '600px';
    table.style.margin = '0 auto 30px auto';
    
    // 테이블 헤더
    const headerRow = document.createElement('tr');
    const headerCells = ['제품명', '조정 전 점유율', '조정 후 점유율', '변화량'];
    
    headerCells.forEach(cell => {
        const th = document.createElement('th');
        th.textContent = cell;
        headerRow.appendChild(th);
    });
    
    table.appendChild(headerRow);
    
    // 각 제품별 현재 결과
    products.forEach((product) => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        
        const probCell = document.createElement('td');
        const probValue = isNaN(product.probability) ? 0 : product.probability * 100;
        probCell.textContent = `${probValue.toFixed(1)}%`;
        
        // 시뮬레이션 전의 초기 상태라서 조정 전/후가 동일함
        // 조정 전 점유율과 조정 후 점유율은 동일한 값
        const afterProbCell = probCell.cloneNode(true);
        
        // 기본 테이블에도 변화량 열을 추가(초기화 시 0%)
        const changeCell = document.createElement('td');
        changeCell.textContent = '0.0%';
        changeCell.style.color = '#888'; // 회색으로 표시
        
        row.appendChild(nameCell);
        row.appendChild(probCell);       // 조정 전 점유율
        row.appendChild(afterProbCell);  // 조정 후 점유율
        row.appendChild(changeCell);
        
        table.appendChild(row);
    });
    
    container.appendChild(table);
}

// 시뮬레이션 테이블 업데이트
function updateSimulationTable() {
    const table = document.getElementById('simulationTable');
    if (!table) return;
    
    // 기존 행 제거 (헤더 제외)
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    
    // 가중치 제거 - 있는 그대로 표시
    const simChangeWeight = 1.0;
    
    // 각 제품별 현재 결과 추가
    products.forEach((product) => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        
        // 가중치를 적용한 변화량 계산
        const weightedChange = ((product.simProbability || 0) - (product.probability || 0)) * simChangeWeight;
        const weightedProb = (product.probability || 0) + weightedChange;
        const probValue = Math.max(0, weightedProb * 100);
        
        const probCell = document.createElement('td');
        probCell.textContent = `${probValue.toFixed(1)}%`;
        
        // 조정 전 점유율 셀 추가
        const beforeProbCell = document.createElement('td');
        const beforeProbValue = isNaN(product.probability) ? 0 : product.probability * 100;
        beforeProbCell.textContent = `${beforeProbValue.toFixed(1)}%`;
        
        // 변화량 셀 추가
        const changeCell = document.createElement('td');
        const changeValue = ((product.simProbability || 0) - (product.probability || 0)) * 100;
        changeCell.textContent = changeValue > 0 ? `+${changeValue.toFixed(1)}%` : `${changeValue.toFixed(1)}%`;
        
        // 변화에 따라 색상 표시
        if (weightedChange > 0) {
            probCell.style.color = 'green';
            changeCell.style.color = 'green';
            probCell.style.fontWeight = 'bold';
        } else if (weightedChange < 0) {
            probCell.style.color = 'red';
            changeCell.style.color = 'red';
            probCell.style.fontWeight = 'bold';
        }
        
        row.appendChild(nameCell);
        row.appendChild(beforeProbCell); // 조정 전 점유율
        row.appendChild(probCell);       // 조정 후 점유율
        row.appendChild(changeCell);     // 변화량 셀 추가
        
        table.appendChild(row);
    });
}

// 시뮬레이션 실행
function runSimulation() {
    // 시뮬레이션 컨트롤이 없으면 설정
    if (!document.querySelector('.simulation-slider')) {
        setupSimulationControls();
        return; // 컨트롤 설정 후 종료 (초기 화면 표시)
    }
    
    // 원본 유틸리티 값을 복사하여 시뮬레이션
    const originalProducts = JSON.parse(JSON.stringify(products));
    const myProduct = products[0]; // 첫 번째 제품이 본인 제품
    
    // 기존 총 유틸리티 값 저장
    const originalTotalUtility = myProduct.utility;
    
    // 제품 유틸리티를 처음부터 다시 계산하기 위해 초기화
    myProduct.utility = 0;
    
    // 각 속성별로 새 유틸리티 합산
    attributes.forEach(attribute => {
        const slider = document.getElementById(`attr_slider_${attribute.id}`);
        const adjustmentPercent = parseInt(slider.value) / 100;
        
        const level = myProduct.attributes[attribute.name];
        const originalUtility = attribute.utilities[level];
        
        // 조정된 유틸리티 계산 - 속성별 특성 고려
        let adjustedUtility;
        
        // 증폭 없이 원래 조정 비율 사용
        const adjustment = adjustmentPercent;
        
        // 가격 속성은 특별 처리 (부호 고려 + 영향력 1.5배 증가)
        if (attribute.name.includes('가격')) {
            // 가격 영향력 증폭 계수 (1.5배 더 중요하게)
            const priceMultiplier = 1.5;
            
            // 가격 조정에 증폭 계수 적용
            const amplifiedAdjustment = adjustment * priceMultiplier;
            
            // 가격은 반대로 영향 (양의 조정값은 효용 감소, 음의 조정값은 효용 증가)
            // 가격 속성의 유틸리티는 일반적으로 음수 값 (비쌀수록 더 큰 음수)
            if (originalUtility < 0) {
                // 음수 유틸리티 (일반적인 가격 속성)
                // 가격 상승(양수 조정) -> 더 부정적 -> 절대값 증가
                // 가격 하락(음수 조정) -> 덜 부정적 -> 절대값 감소
                adjustedUtility = originalUtility * (1 + amplifiedAdjustment);
            } else {
                // 양수 유틸리티 (특이한 경우)
                // 가격 상승(양수 조정) -> 덜 긍정적 -> 값 감소
                // 가격 하락(음수 조정) -> 더 긍정적 -> 값 증가
                adjustedUtility = originalUtility * (1 - amplifiedAdjustment);
            }
            console.log(`가격 속성: ${attribute.name}, 원래값: ${originalUtility}, 조정: ${adjustmentPercent}, 증폭: ${amplifiedAdjustment}, 결과: ${adjustedUtility}`);
        } else if (originalUtility >= 0) {
            // 양수 유틸리티(좋은 속성)는 향상 시 증가
            adjustedUtility = originalUtility * (1 + adjustment);
        } else {
            // 음수 유틸리티(나쁜 속성)는 향상 시 덜 부정적
            adjustedUtility = originalUtility * (1 - adjustment);
        }
        
        // 조정된 유틸리티 적용 - 누적 합산
        myProduct.utility += adjustedUtility;
        
        console.log(`속성: ${attribute.name}, 원래 값: ${originalUtility}, 조정: ${adjustmentPercent}, 새 값: ${adjustedUtility}`);
    });
    
    // 시뮬레이션 결과 계산 (다항 로지트 모델)
    const expUtilities = products.map(product => Math.exp(product.utility));
    const sumExpUtilities = expUtilities.reduce((a, b) => a + b, 0);
    
    products.forEach((product, index) => {
        product.simProbability = expUtilities[index] / sumExpUtilities;
    });
    
    // 시뮬레이션 결과 표시 (전체 결과)
    displayCompleteSimulationResults();
    
    // 원래 유틸리티 값으로 복원
    products = originalProducts;
}

// 시뮬레이션 완전 결과 표시 (버튼 클릭 후)
function displayCompleteSimulationResults() {
    const simulationResults = document.getElementById('simulationResults');
    simulationResults.innerHTML = '';
    
    // 통합된 타이틀 추가
    const unifiedTitle = document.createElement('div');
    unifiedTitle.className = 'unified-title';
    unifiedTitle.textContent = '시뮬레이션 결과 분석';
    simulationResults.appendChild(unifiedTitle);
    
    // 중앙에 원 그래프 추가
    const centerPieContainer = document.createElement('div');
    centerPieContainer.className = 'center-pie-container';
    centerPieContainer.style.width = '100%';
    centerPieContainer.style.textAlign = 'center';
    centerPieContainer.style.marginBottom = '30px';
    
    // 원 그래프 캔버스 생성
    const pieChartCanvas = document.createElement('canvas');
    pieChartCanvas.id = 'simulationPieChartCenter';
    pieChartCanvas.style.maxWidth = '400px';
    pieChartCanvas.style.margin = '0 auto';
    centerPieContainer.appendChild(pieChartCanvas);
    
    // 중앙 원 그래프를 결과 컨테이너에 추가
    simulationResults.appendChild(centerPieContainer);
    
    // 업데이트된 원 그래프 생성
    createSimulationPieChartWithSim();
    
    // 간격 추가
    const spacer = document.createElement('div');
    spacer.style.height = '30px';
    simulationResults.appendChild(spacer);
    
    // 시장 점유율 비교 테이블 추가
    const tableTitle = document.createElement('div');
    tableTitle.className = 'chart-title';
    tableTitle.textContent = '시장 점유율 변화 비교';
    tableTitle.style.textAlign = 'center';
    tableTitle.style.marginBottom = '15px';
    simulationResults.appendChild(tableTitle);
    
    // 비교 테이블 생성
    createComparisonTable(simulationResults);
    
    // 숨겨진 캔버스 (참조용)
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.display = 'none';
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.id = 'simulationPieChart';
    hiddenContainer.appendChild(hiddenCanvas);
    simulationResults.appendChild(hiddenContainer);
}

// 시뮬레이션 결과가 포함된 파이 차트 생성
function createSimulationPieChartWithSim() {
    const canvas = document.getElementById('simulationPieChartCenter');
    
    // 데이터 준비 (가중치 제거)
    const labels = products.map(product => product.name);
    const simChangeWeight = 1.0;
    const data = products.map(product => {
        // 원래 확률에 가중치를 적용한 변화량을 더함
        const weightedChange = ((product.simProbability || 0) - (product.probability || 0)) * simChangeWeight;
        const weightedProb = (product.probability || 0) + weightedChange;
        return isNaN(weightedProb) ? 0 : weightedProb * 100;
    });
    
    // 새 차트 생성
    simulationPieChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',    // 밝은 파란색
                    'rgba(255, 99, 132, 0.7)',    // 분홍색
                    'rgba(75, 192, 192, 0.7)',    // 청록색
                    'rgba(255, 159, 64, 0.7)',    // 주황색
                    'rgba(153, 102, 255, 0.7)'    // 보라색
                ].slice(0, products.length),
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)'
                ].slice(0, products.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Arial, sans-serif',
                            size: 13
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value.toFixed(1)}%`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// 비교 테이블 생성
function createComparisonTable(container) {
    // 테이블 생성
    const table = document.createElement('table');
    table.style.maxWidth = '800px';
    table.style.margin = '0 auto 30px auto';
    
    // 테이블 헤더
    const headerRow = document.createElement('tr');
    const headerCells = ['제품명', '조정 전 점유율', '조정 후 점유율', '변화'];
    
    headerCells.forEach(cell => {
        const th = document.createElement('th');
        th.textContent = cell;
        headerRow.appendChild(th);
    });
    
    table.appendChild(headerRow);
    
    // 각 제품별 현재 결과
    products.forEach((product) => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        
        const originalCell = document.createElement('td');
        const originalProb = isNaN(product.probability) ? 0 : product.probability * 100;
        originalCell.textContent = `${originalProb.toFixed(1)}%`;
        
        // 가중치를 적용하여 변화를 1.8배 증폭
        const simChangeWeight = 1.8;
        const weightedChange = ((product.simProbability || 0) - (product.probability || 0)) * simChangeWeight;
        
        // 변화를 적용한 새로운 조정 후 점유율 계산
        const weightedSimProb = (product.probability || 0) + weightedChange;
        const simProb = weightedSimProb * 100;
        
        // 조정 후 점유율 표시
        const simCell = document.createElement('td');
        simCell.textContent = `${Math.max(0, simProb).toFixed(1)}%`;
        
        // 변화량 표시
        const changeCell = document.createElement('td');
        const change = weightedChange * 100;
        changeCell.textContent = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
        
        // 변화에 따라 색상 표시 (단순하게 유지)
        if (change > 0) {
            changeCell.style.color = 'green';
            simCell.style.color = 'green';
        } else if (change < 0) {
            changeCell.style.color = 'red';
            simCell.style.color = 'red';
        }
        
        row.appendChild(nameCell);
        row.appendChild(originalCell);
        row.appendChild(simCell);
        row.appendChild(changeCell);
        
        table.appendChild(row);
    });
    
    container.appendChild(table);
}

// 시뮬레이션 리셋
function resetSimulation() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('productDetails').classList.add('hide');
    document.getElementById('attributeSetup').classList.add('hide');
    document.getElementById('productSetup').classList.add('hide');
    document.getElementById('populationGroup').classList.add('hide');
    
    document.getElementById('numProducts').value = 3;
    document.getElementById('numAttributes').value = 3;
    
    products = [];
    attributes = [];
    utilities = {};
}

// 제품 속성 조정
function adjustProduct() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('productDetails').classList.remove('hide');
    document.getElementById('populationGroup').classList.remove('hide');
    document.getElementById('productDetails').scrollIntoView({ behavior: 'smooth' });
}

// 페이지 로드 시 초기화
window.onload = function() {
    // 이 함수는 script.js로 이동됨
};

// 시뮬레이션 원 그래프 초기화
function initSimulationPieChart() {
    // 구현 제거됨 (새 방식으로 대체)
}

// 참고: calculateUtilities 함수는 script.js에 구현되어 있음

// 결과 표시
function displayResults() {
    document.getElementById('resultsSection').style.display = 'block';
    
    // 유틸리티 테이블 생성
    const utilityResults = document.getElementById('utilityResults');
    utilityResults.innerHTML = '';
    
    // 각 제품별 유틸리티 테이블 
    products.forEach((product, productIndex) => {
        const productTitle = document.createElement('h4');
        productTitle.textContent = product.name;
        utilityResults.appendChild(productTitle);
        
        // 속성 배열 복사 및 재정렬 (가격 속성을 마지막으로)
        const sortedAttributes = [...attributes].sort((a, b) => {
            if (a.name.includes('가격')) return 1;
            if (b.name.includes('가격')) return -1;
            return 0;
        });
        
        // 기존 테이블 추가
        const table = document.createElement('table');
        
        // 테이블 헤더
        const headerRow = document.createElement('tr');
        const headerCells = ['속성', '수준', '유틸리티'];
        headerCells.forEach(cell => {
            const th = document.createElement('th');
            th.textContent = cell;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        // 속성별 유틸리티
        let totalUtility = 0;
        
        // 속성별 유틸리티 계산 (가격을 마지막으로 정렬)
        sortedAttributes.forEach(attribute => {
            const level = product.attributes[attribute.name];
            const utility = attribute.utilities[level];
            totalUtility += utility;
            
            const row = document.createElement('tr');
            
            const attrCell = document.createElement('td');
            attrCell.textContent = attribute.name;
            
            const levelCell = document.createElement('td');
            levelCell.textContent = level;
            
            const utilityCell = document.createElement('td');
            utilityCell.textContent = utility > 0 ? `+${utility.toFixed(3)}` : utility.toFixed(3);
            
            row.appendChild(attrCell);
            row.appendChild(levelCell);
            row.appendChild(utilityCell);
            
            table.appendChild(row);
        });
        
        // 총 유틸리티 행 제거 (요청에 따라)
        
        utilityResults.appendChild(table);
    });
    
    // 다항 로지트 모델 계산 - 먼저 계산하여 products에 확률 설정
    const expUtilities = products.map(product => Math.exp(product.utility));
    const sumExpUtilities = expUtilities.reduce((a, b) => a + b, 0);
    
    products.forEach((product, index) => {
        const probability = expUtilities[index] / sumExpUtilities;
        const population = parseInt(document.getElementById('population').value);
        const expectedPopulation = Math.round(probability * population);
        
        product.probability = probability;
        product.expectedPopulation = expectedPopulation;
    });
    
    // 결과2: 경쟁제품별 시장점유율(추정) - 표시 순서 수정
    const marketShareResults = document.getElementById('marketShareResults');
    marketShareResults.innerHTML = '';
    
    // 통합된 타이틀 추가
    const unifiedTitle = document.createElement('div');
    unifiedTitle.className = 'unified-title';
    unifiedTitle.textContent = '시장 점유율 분석';
    marketShareResults.appendChild(unifiedTitle);
    
    // 중앙에 원 그래프 추가 (페이지 수정)
    const centerPieContainer = document.createElement('div');
    centerPieContainer.className = 'center-pie-container';
    centerPieContainer.style.width = '100%';
    centerPieContainer.style.textAlign = 'center';
    centerPieContainer.style.marginBottom = '25px';
    
    // 원 그래프 캔버스 복제하여 중앙 컨테이너에 추가
    const pieChartCanvas = document.createElement('canvas');
    pieChartCanvas.id = 'marketSharePieChartCenter';
    pieChartCanvas.style.maxWidth = '400px';
    pieChartCanvas.style.margin = '0 auto';
    centerPieContainer.appendChild(pieChartCanvas);
    
    // 중앙 원 그래프를 결과 컨테이너에 추가
    marketShareResults.appendChild(centerPieContainer);
    
    // 마켓 쉐어 파이 차트 생성
    new Chart(pieChartCanvas, {
        type: 'pie',
        data: {
            labels: products.map(product => product.name),
            datasets: [{
                data: products.map(product => {
                    return isNaN(product.probability) ? 0 : product.probability * 100;
                }),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',    // 밝은 파란색
                    'rgba(255, 99, 132, 0.7)',    // 분홍색
                    'rgba(75, 192, 192, 0.7)',    // 청록색
                    'rgba(255, 159, 64, 0.7)',    // 주황색
                    'rgba(153, 102, 255, 0.7)'    // 보라색
                ].slice(0, products.length),
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)'
                ].slice(0, products.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Arial, sans-serif',
                            size: 13
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value.toFixed(1)}%`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
    
    // 파이 차트 컨테이너 추가 (숨겨진 원본 참조용)
    const hiddenPieContainer = document.createElement('div');
    hiddenPieContainer.style.display = 'none';
    const hiddenCanvas = document.createElement('canvas');
    hiddenCanvas.id = 'marketSharePieChart';
    hiddenPieContainer.appendChild(hiddenCanvas);
    marketShareResults.appendChild(hiddenPieContainer);
    
    // 파이 차트와 요약 테이블 사이의 공간 줄임
    const spacer = document.createElement('div');
    spacer.style.height = '40px';
    marketShareResults.appendChild(spacer);
    
    // 요약 결과 표시
    const summaryResults = document.getElementById('summaryResults');
    summaryResults.innerHTML = '';
    
    // 요약 결과 테이블 추가
    const summaryTable = document.createElement('table');
    
    // 테이블 헤더
    const summaryHeaderRow = document.createElement('tr');
    const population = parseInt(document.getElementById('population').value);
    const summaryHeaderCells = ['제품명', '유틸리티 합', '선택 확률', `예상 인원 (도시 인구 ${population.toLocaleString()}명 기준)`];
    
    summaryHeaderCells.forEach(cell => {
        const th = document.createElement('th');
        th.textContent = cell;
        summaryHeaderRow.appendChild(th);
    });
    
    summaryTable.appendChild(summaryHeaderRow);
    
    // 각 제품별 결과
    products.forEach((product) => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        
        const utilityCell = document.createElement('td');
        utilityCell.textContent = product.utility.toFixed(3);
        
        const probCell = document.createElement('td');
        // NaN 문제 수정
        const probValue = isNaN(product.probability) ? 0 : product.probability * 100;
        probCell.textContent = `${probValue.toFixed(1)}%`;
        
        const popCell = document.createElement('td');
        // NaN 문제 수정
        const popValue = isNaN(product.expectedPopulation) ? 0 : product.expectedPopulation;
        popCell.textContent = `${popValue.toLocaleString()}명`;
        
        row.appendChild(nameCell);
        row.appendChild(utilityCell);
        row.appendChild(probCell);
        row.appendChild(popCell);
        
        summaryTable.appendChild(row);
    });
    
    summaryResults.appendChild(summaryTable);
    
    // 예시 테이블 숨기기 (실제 데이터가 표시되는 경우)
    document.querySelector('.example-result').style.display = products.length > 0 ? 'none' : 'block';
    
    // 위쪽으로 스크롤
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    
    // 원 그래프 업데이트
    initPieChart();
    
    // 시뮬레이션 원 그래프 초기화
    initSimulationPieChart();
    
    // 시뮬레이션 컨트롤 설정
    setupSimulationControls();
} 