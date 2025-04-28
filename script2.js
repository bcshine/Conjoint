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
            document.getElementById(`slider_value_${attribute.id}`).textContent = `${value > 0 ? '+' : ''}${value}%`;
            
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
    
    // 각 속성별 슬라이더 값에 따라 유틸리티 조정
    attributes.forEach(attribute => {
        const slider = document.getElementById(`attr_slider_${attribute.id}`);
        const adjustmentPercent = parseInt(slider.value) / 100;
        
        const level = myProduct.attributes[attribute.name];
        const originalUtility = attribute.utilities[level];
        
        // 조정된 유틸리티 계산
        const adjustedUtility = originalUtility * (1 + adjustmentPercent);
        
        // 조정된 유틸리티 적용
        myProduct.utility += (adjustedUtility - originalUtility);
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
    const headerCells = ['제품명', '현재 점유율'];
    
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
        
        row.appendChild(nameCell);
        row.appendChild(probCell);
        
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
    
    // 각 제품별 현재 결과 추가
    products.forEach((product) => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        
        const probCell = document.createElement('td');
        const probValue = isNaN(product.simProbability) ? 0 : product.simProbability * 100;
        probCell.textContent = `${probValue.toFixed(1)}%`;
        
        // 변화에 따라 색상 표시
        if (product.simProbability > product.probability) {
            probCell.style.color = 'green';
        } else if (product.simProbability < product.probability) {
            probCell.style.color = 'red';
        }
        
        row.appendChild(nameCell);
        row.appendChild(probCell);
        
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
    
    // 각 속성별 슬라이더 값에 따라 유틸리티 조정
    attributes.forEach(attribute => {
        const slider = document.getElementById(`attr_slider_${attribute.id}`);
        const adjustmentPercent = parseInt(slider.value) / 100;
        
        const level = myProduct.attributes[attribute.name];
        const originalUtility = attribute.utilities[level];
        
        // 조정된 유틸리티 계산
        const adjustedUtility = originalUtility * (1 + adjustmentPercent);
        
        // 조정된 유틸리티 적용
        myProduct.utility += (adjustedUtility - originalUtility);
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
    
    // 데이터 준비
    const labels = products.map(product => product.name);
    const data = products.map(product => {
        const prob = (product.simProbability || product.probability) * 100;
        return isNaN(prob) ? 0 : prob;
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
    const headerCells = ['제품명', '원래 점유율', '조정 후 점유율', '변화'];
    
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
        
        const simCell = document.createElement('td');
        const simProb = isNaN(product.simProbability) ? 0 : product.simProbability * 100;
        simCell.textContent = `${simProb.toFixed(1)}%`;
        
        const changeCell = document.createElement('td');
        const change = ((product.simProbability || 0) - (product.probability || 0)) * 100;
        changeCell.textContent = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
        
        // 변화에 따라 색상 표시
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
    
    // 각 제품별 유틸리티 테이블과 막대 그래프
    products.forEach((product, productIndex) => {
        const productTitle = document.createElement('h4');
        productTitle.textContent = product.name;
        utilityResults.appendChild(productTitle);
        
        // 막대 그래프 추가
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container product-chart';
        
        const chartTitle = document.createElement('div');
        chartTitle.className = 'chart-title';
        chartTitle.textContent = '속성별 유틸리티 시각화';
        chartContainer.appendChild(chartTitle);
        
        const barChart = document.createElement('div');
        barChart.className = 'bar-chart';
        
        // Add grid lines for better readability
        const barChartGrid = document.createElement('div');
        barChartGrid.className = 'bar-chart-grid';
        
        // 속성별 유틸리티 값과 색상 - 더 예쁜 색상으로 업데이트
        const barColors = [
            'rgba(54, 162, 235, 0.8)',    // 밝은 파란색
            'rgba(255, 99, 132, 0.8)',    // 분홍색
            'rgba(75, 192, 192, 0.8)',    // 청록색
            'rgba(255, 159, 64, 0.8)',    // 주황색
            'rgba(153, 102, 255, 0.8)'    // 보라색
        ];
        
        // 최대 유틸리티 값 찾기 (스케일링용)
        let maxUtilityAbs = 0;
        attributes.forEach(attribute => {
            const level = product.attributes[attribute.name];
            const utility = attribute.utilities[level];
            maxUtilityAbs = Math.max(maxUtilityAbs, Math.abs(utility));
        });
        
        maxUtilityAbs = Math.max(maxUtilityAbs, 1); // 최소 스케일 설정
        
        // Create grid lines
        for (let i = 0; i <= 5; i++) {
            const gridLine = document.createElement('div');
            gridLine.className = 'grid-line';
            gridLine.style.left = `${i * 20}%`;
            barChartGrid.appendChild(gridLine);
        }
        
        barChart.appendChild(barChartGrid);
        
        // Create x-axis labels
        const xAxis = document.createElement('div');
        xAxis.className = 'bar-chart-x-axis';
        for (let i = 0; i <= 5; i++) {
            const label = document.createElement('div');
            label.textContent = `${i * 0.2}`;
            xAxis.appendChild(label);
        }
        
        // 속성 배열 복사 및 재정렬 (가격 속성을 마지막으로)
        const sortedAttributes = [...attributes].sort((a, b) => {
            if (a.name.includes('가격')) return 1;
            if (b.name.includes('가격')) return -1;
            return 0;
        });
        
        // 각 속성에 대한 바 생성
        sortedAttributes.forEach((attribute, index) => {
            const level = product.attributes[attribute.name];
            const utility = attribute.utilities[level];
            
            // Calculate percentage for display
            const percentage = Math.abs(utility) / maxUtilityAbs * 100;
            
            const barGroup = document.createElement('div');
            barGroup.className = 'bar-group';
            
            const barLabel = document.createElement('div');
            barLabel.className = 'bar-label';
            barLabel.textContent = attribute.name;
            barGroup.appendChild(barLabel);
            
            const barWrapper = document.createElement('div');
            barWrapper.className = 'bar-wrapper';
            
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.width = `${percentage}%`;
            
            // Find the original index for coloring
            const originalIndex = attributes.findIndex(attr => attr.name === attribute.name);
            bar.style.backgroundColor = barColors[originalIndex % barColors.length];
            
            barWrapper.appendChild(bar);
            
            const barValue = document.createElement('div');
            barValue.className = 'bar-value';
            barValue.textContent = `${Math.round(percentage)}%`;
            bar.appendChild(barValue);
            
            barGroup.appendChild(barWrapper);
            barChart.appendChild(barGroup);
        });
        
        // 총 유틸리티 바 제거 (요청에 따라)
        
        barChart.appendChild(xAxis);
        
        chartContainer.appendChild(barChart);
        utilityResults.appendChild(chartContainer);
        
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
        
        // 같은 정렬 순서 사용 (가격을 마지막으로)
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
    centerPieContainer.style.marginBottom = '50px';
    
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
    
    // 원 그래프와 막대 그래프 사이에 충분한 간격 추가
    const spacer = document.createElement('div');
    spacer.style.height = '80px';
    marketShareResults.appendChild(spacer);
    
    // 시장 점유율 막대 차트 타이틀 추가
    const shareBarTitle = document.createElement('div');
    shareBarTitle.className = 'chart-title';
    shareBarTitle.textContent = '시장 점유율';
    marketShareResults.appendChild(shareBarTitle);
    
    // 시장 점유율 차트 추가
    const shareChartContainer = document.createElement('div');
    shareChartContainer.className = 'chart-container';
    
    const shareBarChart = document.createElement('div');
    shareBarChart.className = 'bar-chart';
    
    // Add grid lines for better readability
    const shareChartGrid = document.createElement('div');
    shareChartGrid.className = 'bar-chart-grid';
    
    // 최대 점유율 계산 (반올림하여 눈금 계산 용이하게)
    let maxSharePercentage = 0;
    products.forEach(product => {
        const sharePercentage = product.probability * 100;
        if (!isNaN(sharePercentage) && sharePercentage > maxSharePercentage) {
            maxSharePercentage = sharePercentage;
        }
    });
    
    // 최대값을 10% 단위로 올림
    maxSharePercentage = Math.ceil(maxSharePercentage / 10) * 10;
    maxSharePercentage = Math.max(maxSharePercentage, 50); // 최소 50%는 되게
    maxSharePercentage = Math.min(maxSharePercentage, 100); // 최대 100%
    
    // 눈금 개수 설정
    const gridLines = 5;
    
    // Create grid lines
    for (let i = 0; i <= gridLines; i++) {
        const gridLine = document.createElement('div');
        gridLine.className = 'grid-line';
        gridLine.style.left = `${i * (100 / gridLines)}%`;
        shareChartGrid.appendChild(gridLine);
    }
    
    shareBarChart.appendChild(shareChartGrid);
    
    // Create x-axis labels
    const shareXAxis = document.createElement('div');
    shareXAxis.className = 'bar-chart-x-axis';
    for (let i = 0; i <= gridLines; i++) {
        const label = document.createElement('div');
        label.textContent = `${Math.round(i * maxSharePercentage / gridLines)}%`;
        shareXAxis.appendChild(label);
    }
    
    // 제품별 시장 점유율 바 생성 - 색상 업데이트
    products.forEach((product, index) => {
        const shareBarGroup = document.createElement('div');
        shareBarGroup.className = 'bar-group';
        
        const shareBarLabel = document.createElement('div');
        shareBarLabel.className = 'bar-label';
        shareBarLabel.textContent = product.name;
        shareBarGroup.appendChild(shareBarLabel);
        
        const shareBarWrapper = document.createElement('div');
        shareBarWrapper.className = 'bar-wrapper';
        
        const shareBar = document.createElement('div');
        shareBar.className = 'bar';
        const sharePercentage = product.probability * 100;
        // 상대적 너비 계산 (최대값을 기준으로)
        const relativeWidth = (sharePercentage / maxSharePercentage) * 100;
        shareBar.style.width = `${relativeWidth}%`;
        
        // 새로운 예쁜 색상
        const barColors = [
            'rgba(54, 162, 235, 0.8)',    // 밝은 파란색
            'rgba(255, 99, 132, 0.8)',    // 분홍색
            'rgba(75, 192, 192, 0.8)',    // 청록색
            'rgba(255, 159, 64, 0.8)',    // 주황색
            'rgba(153, 102, 255, 0.8)'    // 보라색
        ];
        shareBar.style.backgroundColor = barColors[index % barColors.length];
        
        shareBarWrapper.appendChild(shareBar);
        
        const shareBarValue = document.createElement('div');
        shareBarValue.className = 'bar-value';
        
        // NaN 문제 수정
        const displayValue = isNaN(sharePercentage) ? '0.0%' : `${sharePercentage.toFixed(1)}%`;
        shareBarValue.textContent = displayValue;
        
        shareBar.appendChild(shareBarValue);
        
        shareBarGroup.appendChild(shareBarWrapper);
        shareBarChart.appendChild(shareBarGroup);
    });
    
    shareBarChart.appendChild(shareXAxis);
    shareChartContainer.appendChild(shareBarChart);
    marketShareResults.appendChild(shareChartContainer);
    
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