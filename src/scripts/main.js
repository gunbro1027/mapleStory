// --- 데이터 로드/저장 ---
let data = JSON.parse(localStorage.getItem('financeData') || '{"income":0,"assets":[],"liabilities":[]}');

function save() {
  localStorage.setItem('financeData', JSON.stringify(data));
  render();
}

// --- 수입 ---
function saveIncome() {
  const val = parseInt(document.getElementById('monthly-income').value);
  if (!val || val < 0) return;
  data.income = val;
  save();
}

// --- 자산 ---
function addAsset() {
  const name = document.getElementById('asset-name').value.trim();
  const category = document.getElementById('asset-category').value;
  const amount = parseInt(document.getElementById('asset-amount').value);
  if (!name || !amount || amount < 0) return alert('자산명과 금액을 입력해주세요.');
  data.assets.push({ id: Date.now(), name, category, amount });
  document.getElementById('asset-name').value = '';
  document.getElementById('asset-amount').value = '';
  save();
}

function deleteAsset(id) {
  data.assets = data.assets.filter(a => a.id !== id);
  save();
}

// --- 부채 ---
function addLiability() {
  const name = document.getElementById('liability-name').value.trim();
  const total = parseInt(document.getElementById('liability-total').value);
  const monthly = parseInt(document.getElementById('liability-monthly').value);
  if (!name || !total || !monthly) return alert('모든 항목을 입력해주세요.');
  data.liabilities.push({ id: Date.now(), name, total, monthly });
  document.getElementById('liability-name').value = '';
  document.getElementById('liability-total').value = '';
  document.getElementById('liability-monthly').value = '';
  save();
}

function deleteLiability(id) {
  data.liabilities = data.liabilities.filter(l => l.id !== id);
  save();
}

// --- 숫자 포맷 ---
function fmt(n) {
  return '₩' + Math.round(n).toLocaleString('ko-KR');
}

// --- 계산 ---
function calcTotals() {
  const totalAssets = data.assets.reduce((s, a) => s + a.amount, 0);
  const totalLiabilities = data.liabilities.reduce((s, l) => s + l.total, 0);
  const monthlyPayment = data.liabilities.reduce((s, l) => s + l.monthly, 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlySavings = data.income - monthlyPayment;
  return { totalAssets, totalLiabilities, monthlyPayment, netWorth, monthlySavings };
}

// --- 렌더링 ---
let categoryChart = null;
let growthChart = null;

function render() {
  const { totalAssets, totalLiabilities, monthlyPayment, netWorth, monthlySavings } = calcTotals();

  // 헤더
  document.getElementById('header-networth').textContent = fmt(netWorth);
  document.getElementById('header-saving').textContent = fmt(monthlySavings > 0 ? monthlySavings : 0);

  // 요약 카드
  document.getElementById('total-assets').textContent = fmt(totalAssets);
  document.getElementById('total-liabilities').textContent = fmt(totalLiabilities);
  document.getElementById('net-worth').textContent = fmt(netWorth);
  document.getElementById('monthly-payment').textContent = fmt(monthlyPayment);

  // 수입 인풋
  if (data.income) document.getElementById('monthly-income').value = data.income;

  // 자산 목록
  const assetList = document.getElementById('asset-list');
  assetList.innerHTML = data.assets.length === 0
    ? '<p style="color:var(--muted);font-size:0.9rem;padding:8px 0">등록된 자산이 없습니다.</p>'
    : data.assets.map(a => `
      <div class="item-row">
        <div class="item-info">
          <span class="item-badge">${a.category}</span>
          <div>
            <div class="item-name">${a.name}</div>
          </div>
        </div>
        <div class="item-right">
          <span class="item-amount asset">${fmt(a.amount)}</span>
          <button class="btn icon" onclick="deleteAsset(${a.id})">✕</button>
        </div>
      </div>`).join('');

  // 부채 목록
  const liabilityList = document.getElementById('liability-list');
  liabilityList.innerHTML = data.liabilities.length === 0
    ? '<p style="color:var(--muted);font-size:0.9rem;padding:8px 0">등록된 부채가 없습니다.</p>'
    : data.liabilities.map(l => `
      <div class="item-row">
        <div class="item-info">
          <div>
            <div class="item-name">${l.name}</div>
            <div class="item-sub">월 상환 ${fmt(l.monthly)}</div>
          </div>
        </div>
        <div class="item-right">
          <span class="item-amount liability">${fmt(l.total)}</span>
          <button class="btn icon" onclick="deleteLiability(${l.id})">✕</button>
        </div>
      </div>`).join('');

  // 월별 요약
  document.getElementById('sum-income').textContent = fmt(data.income);
  document.getElementById('sum-payment').textContent = fmt(monthlyPayment);
  document.getElementById('sum-savings').textContent = fmt(monthlySavings > 0 ? monthlySavings : 0);
  document.getElementById('sum-1year').textContent = fmt(netWorth + (monthlySavings > 0 ? monthlySavings * 12 : 0));
  document.getElementById('sum-3year').textContent = fmt(netWorth + (monthlySavings > 0 ? monthlySavings * 36 : 0));

  renderCharts(netWorth, monthlySavings);
}

function renderCharts(netWorth, monthlySavings) {
  // 카테고리 차트
  const categories = {};
  data.assets.forEach(a => {
    categories[a.category] = (categories[a.category] || 0) + a.amount;
  });

  const catLabels = Object.keys(categories);
  const catData = Object.values(categories);
  const catColors = ['#6366f1','#4ade80','#60a5fa','#fb923c','#f472b6'];

  if (categoryChart) categoryChart.destroy();
  const catCtx = document.getElementById('category-chart').getContext('2d');
  categoryChart = new Chart(catCtx, {
    type: 'doughnut',
    data: {
      labels: catLabels.length ? catLabels : ['자산 없음'],
      datasets: [{
        data: catData.length ? catData : [1],
        backgroundColor: catColors,
        borderWidth: 0,
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#8b90a0', font: { family: 'Noto Sans KR' } }
        }
      },
      cutout: '65%',
    }
  });

  // 성장 예측 차트
  const months = ['현재'];
  const growthData = [netWorth];
  for (let i = 1; i <= 12; i++) {
    months.push(`${i}개월 후`);
    growthData.push(netWorth + (monthlySavings > 0 ? monthlySavings * i : 0));
  }

  if (growthChart) growthChart.destroy();
  const growCtx = document.getElementById('growth-chart').getContext('2d');
  growthChart = new Chart(growCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: '예상 순자산',
        data: growthData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#8b90a0', maxTicksLimit: 7 },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          ticks: {
            color: '#8b90a0',
            callback: v => '₩' + (v / 10000).toFixed(0) + '만'
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

// 초기 렌더
render();
