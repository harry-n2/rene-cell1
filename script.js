// DOM Elements
const screens = {
    entrance: document.getElementById('entrance'),
    scanning: document.getElementById('scanning'),
    result: document.getElementById('result')
};

const startBtn = document.getElementById('start-btn');
const cameraInput = document.getElementById('camera-input');
const cameraBtn = document.getElementById('camera-btn');
const cameraBtnText = document.getElementById('camera-btn-text');
const previewImg = document.getElementById('preview-img');

const statusBox = document.getElementById('status-box');
const statusText = document.getElementById('scan-status-text');
const progressFill = document.getElementById('progress-fill');
const scanLine = document.getElementById('scan-line');

const stepTitle = document.getElementById('step-title');
const stepDesc = document.getElementById('step-desc');

const lineBtn = document.getElementById('line-connect-btn');
const ageResult = document.getElementById('age-result');
const ageDiffText = document.getElementById('age-diff-text');
const metricsList = document.getElementById('metrics-list');

// New UI Elements for Dynamic Content
const dangerLabel = document.querySelector('.danger-label'); // "総合判定:"
const dangerGrade = document.querySelector('.danger-grade'); // Rank Text
const simulationTitle = document.querySelector('.future-simulation h3');
const simulationText = document.querySelector('.simulation-text');

// State
let currentStepIdx = 0;
let selectedPattern = null; // Will hold the random result

const STEPS = [
    { title: "STEP 1: 正面", desc: "顔全体を枠に合わせてください", label: "正面を撮影" },
    { title: "STEP 2: 右頬 (シミ解析)", desc: "右頬の「シミ」を解析します", label: "右頬を撮影" },
    { title: "STEP 3: 左頬 (キメ解析)", desc: "左頬の「毛穴」を解析します", label: "左頬を撮影" }
];

const SCAN_DURATION = 5000;
const LINE_ID = "@renecell_ginza";

// --- 10 DIAGNOSIS PATTERNS ---
const PATTERNS = [
    {
        id: "severe_aging",
        name: "激老化リスク型",
        ageDiff: 10,
        rank: "S (危険)",
        scores: [95, 90, 85, 92, 88], // Radar: Melanin, Dry, Pore, Clarity, Spot
        metrics: [ // 12 items order: SurfaceM, DeepM, PoreOpen, PoreBlack, DeepWrinkle, FineLine, Texture, Moisture, Sebum, Red, Acne, Radiance
            { n: "表皮シミ", s: 92, l: "danger" }, { n: "深層シミ", s: 98, l: "danger" }, { n: "毛穴開き", s: 85, l: "danger" }, { n: "毛穴黒ずみ", s: 70, l: "warning" },
            { n: "深いシワ", s: 80, l: "danger" }, { n: "小ジワ", s: 90, l: "danger" }, { n: "キメ", s: 85, l: "danger" }, { n: "水分量", s: 10, l: "danger" },
            { n: "皮脂過多", s: 60, l: "warning" }, { n: "赤み炎症", s: 50, l: "safe" }, { n: "アクネ菌", s: 30, l: "safe" }, { n: "透明感欠如", s: 95, l: "danger" }
        ],
        warning: "【全身崩壊警報】\n肌の土台が完全に崩れています。今すぐ処置しないと、来年には+12歳まで加速します。",
        lineMsg: "【緊急S】肌年齢+10歳(激老化)。土台から崩壊しています。院長、至急リセット処方をください。"
    },
    {
        id: "hidden_spot",
        name: "隠れジミ爆弾型",
        ageDiff: 8,
        rank: "S (危険)",
        scores: [98, 70, 60, 85, 90],
        metrics: [
            { n: "表皮シミ", s: 60, l: "warning" }, { n: "深層シミ", s: 99, l: "danger" }, { n: "毛穴開き", s: 50, l: "safe" }, { n: "毛穴黒ずみ", s: 40, l: "safe" },
            { n: "深いシワ", s: 30, l: "safe" }, { n: "小ジワ", s: 50, l: "warning" }, { n: "キメ", s: 60, l: "warning" }, { n: "水分量", s: 40, l: "warning" },
            { n: "皮脂過多", s: 40, l: "safe" }, { n: "赤み炎症", s: 30, l: "safe" }, { n: "アクネ菌", s: 20, l: "safe" }, { n: "透明感欠如", s: 88, l: "danger" }
        ],
        warning: "【時限爆弾警告】\n表面は綺麗に見えますが、真皮層は「シミの海」です。3年後に顔中がシミだらけになる確率98%。",
        lineMsg: "【緊急S】肌年齢+8歳(隠れジミ)。真皮がシミだらけと診断されました。手遅れになる前に排出ケアを希望します。"
    },
    {
        id: "desert",
        name: "砂漠化進行型",
        ageDiff: 7,
        rank: "A (要処置)",
        scores: [60, 98, 70, 80, 50],
        metrics: [
            { n: "表皮シミ", s: 50, l: "safe" }, { n: "深層シミ", s: 60, l: "warning" }, { n: "毛穴開き", s: 70, l: "warning" }, { n: "毛穴黒ずみ", s: 30, l: "safe" },
            { n: "深いシワ", s: 40, l: "safe" }, { n: "小ジワ", s: 88, l: "danger" }, { n: "キメ", s: 90, l: "danger" }, { n: "水分量", s: 5, l: "danger" },
            { n: "皮脂過多", s: 20, l: "safe" }, { n: "赤み炎症", s: 65, l: "warning" }, { n: "アクネ菌", s: 10, l: "safe" }, { n: "透明感欠如", s: 80, l: "danger" }
        ],
        warning: "【水分枯渇】\n砂漠にお花は咲きません。バリア機能が壊滅しており、どんな高級化粧水も「ザル」のように漏れています。",
        lineMsg: "【緊急A】肌年齢+7歳(砂漠化)。水分量が5%しかありません。保水力を取り戻す処方箋をください。"
    },
    {
        id: "pore_collapse",
        name: "毛穴崩壊型",
        ageDiff: 5,
        rank: "A (要処置)",
        scores: [50, 60, 95, 70, 80],
        metrics: [
            { n: "表皮シミ", s: 40, l: "safe" }, { n: "深層シミ", s: 50, l: "safe" }, { n: "毛穴開き", s: 95, l: "danger" }, { n: "毛穴黒ずみ", s: 90, l: "danger" },
            { n: "深いシワ", s: 20, l: "safe" }, { n: "小ジワ", s: 40, l: "safe" }, { n: "キメ", s: 85, l: "danger" }, { n: "水分量", s: 50, l: "warning" },
            { n: "皮脂過多", s: 85, l: "danger" }, { n: "赤み炎症", s: 60, l: "warning" }, { n: "アクネ菌", s: 50, l: "warning" }, { n: "透明感欠如", s: 70, l: "warning" }
        ],
        warning: "【たるみ毛穴連鎖】\n重カに負けて毛穴が涙型に伸びています。これを放置すると、顔全体の「ブルドッグ化」が止まりません。",
        lineMsg: "【緊急A】肌年齢+5歳(毛穴崩壊)。毛穴が開ききっています。引き締めと細胞再生のプランを教えてください。"
    },
    {
        id: "glycation",
        name: "糖化くすみ型",
        ageDiff: 9,
        rank: "S (危険)",
        scores: [80, 85, 70, 98, 75],
        metrics: [
            { n: "表皮シミ", s: 70, l: "warning" }, { n: "深層シミ", s: 80, l: "danger" }, { n: "毛穴開き", s: 60, l: "warning" }, { n: "毛穴黒ずみ", s: 50, l: "safe" },
            { n: "深いシワ", s: 65, l: "warning" }, { n: "小ジワ", s: 70, l: "warning" }, { n: "キメ", s: 75, l: "warning" }, { n: "水分量", s: 30, l: "danger" },
            { n: "皮脂過多", s: 50, l: "safe" }, { n: "赤み炎症", s: 40, l: "safe" }, { n: "アクネ菌", s: 30, l: "safe" }, { n: "透明感欠如", s: 99, l: "danger" }
        ],
        warning: "【肌の焦げ付き】\n糖化現象により、肌が内側から黄色く濁っています。透明感を取り戻すには、通常のケアでは不可能です。",
        lineMsg: "【緊急S】肌年齢+9歳(糖化)。肌が黄色く濁っていると診断されました。透明感を取り戻す最後の手段をください。"
    },
    {
        id: "inflammation",
        name: "炎症赤み型",
        ageDiff: 4,
        rank: "B (注意)",
        scores: [40, 80, 50, 60, 40],
        metrics: [
            { n: "表皮シミ", s: 30, l: "safe" }, { n: "深層シミ", s: 40, l: "safe" }, { n: "毛穴開き", s: 50, l: "safe" }, { n: "毛穴黒ずみ", s: 30, l: "safe" },
            { n: "深いシワ", s: 20, l: "safe" }, { n: "小ジワ", s: 50, l: "warning" }, { n: "キメ", s: 80, l: "danger" }, { n: "水分量", s: 20, l: "danger" },
            { n: "皮脂過多", s: 30, l: "safe" }, { n: "赤み炎症", s: 95, l: "danger" }, { n: "アクネ菌", s: 60, l: "warning" }, { n: "透明感欠如", s: 60, l: "warning" }
        ],
        warning: "【慢性火災】\n肌内部で微弱炎症が続いています。今は+4歳ですが、この炎症が「シミ工場」をフル稼働させる原因になります。",
        lineMsg: "【相談B】肌年齢+4歳(炎症)。常に肌が赤くヒリつきます。鎮静と修復のためのアドバイスをお願いします。"
    },
    {
        id: "early_aging",
        name: "初期老化型",
        ageDiff: 3,
        rank: "B (注意)",
        scores: [50, 60, 55, 65, 45],
        metrics: [
            { n: "表皮シミ", s: 40, l: "safe" }, { n: "深層シミ", s: 50, l: "warning" }, { n: "毛穴開き", s: 45, l: "safe" }, { n: "毛穴黒ずみ", s: 40, l: "safe" },
            { n: "深いシワ", s: 10, l: "safe" }, { n: "小ジワ", s: 85, l: "danger" }, { n: "キメ", s: 60, l: "warning" }, { n: "水分量", s: 35, l: "warning" },
            { n: "皮脂過多", s: 50, l: "safe" }, { n: "赤み炎症", s: 30, l: "safe" }, { n: "アクネ菌", s: 20, l: "safe" }, { n: "透明感欠如", s: 55, l: "warning" }
        ],
        warning: "【曲がり角警報】\n目尻や口元の小ジワ(Fine Lines)が定着し始めています。今ならまだ「無かったこと」にできます。",
        lineMsg: "【相談B】肌年齢+3歳(初期老化)。小ジワが気になり始めました。本格的なエイジングケアを始めたいです。"
    },
    {
        id: "sebum_oxid",
        name: "皮脂酸化型",
        ageDiff: 6,
        rank: "A (要処置)",
        scores: [60, 50, 90, 80, 95],
        metrics: [
            { n: "表皮シミ", s: 50, l: "safe" }, { n: "深層シミ", s: 60, l: "warning" }, { n: "毛穴開き", s: 80, l: "danger" }, { n: "毛穴黒ずみ", s: 95, l: "danger" },
            { n: "深いシワ", s: 30, l: "safe" }, { n: "小ジワ", s: 40, l: "safe" }, { n: "キメ", s: 70, l: "warning" }, { n: "水分量", s: 45, l: "warning" },
            { n: "皮脂過多", s: 98, l: "danger" }, { n: "赤み炎症", s: 70, l: "warning" }, { n: "アクネ菌", s: 85, l: "danger" }, { n: "透明感欠如", s: 75, l: "warning" }
        ],
        warning: "【酸化腐敗】\n排出されない皮脂が毛穴の中で酸化し、肌細胞を攻撃しています。放置するとクレーター肌になります。",
        lineMsg: "【緊急A】肌年齢+6歳(皮脂酸化)。Tゾーンのベタつきと黒ずみが限界です。根本的な体質改善が必要です。"
    },
    {
        id: "sagging",
        name: "たるみ進行型",
        ageDiff: 6,
        rank: "A (要処置)",
        scores: [55, 65, 80, 70, 60],
        metrics: [
            { n: "表皮シミ", s: 45, l: "safe" }, { n: "深層シミ", s: 55, l: "warning" }, { n: "毛穴開き", s: 85, l: "danger" }, { n: "毛穴黒ずみ", s: 50, l: "safe" },
            { n: "深いシワ", s: 80, l: "danger" }, { n: "小ジワ", s: 60, l: "warning" }, { n: "キメ", s: 75, l: "warning" }, { n: "水分量", s: 40, l: "warning" },
            { n: "皮脂過多", s: 30, l: "safe" }, { n: "赤み炎症", s: 40, l: "safe" }, { n: "アクネ菌", s: 20, l: "safe" }, { n: "透明感欠如", s: 65, l: "warning" }
        ],
        warning: "【輪郭崩壊】\n真皮のコラーゲンネットが切れ、皮膚が重力に負けて雪崩を起こしています。法令線が深くなる前に補修が必要です。",
        lineMsg: "【緊急A】肌年齢+6歳(たるみ)。法令線とフェイスラインの崩れが指摘されました。リフトアップの特別プラン希望。"
    },
    {
        id: "melasma",
        name: "肝斑リスク型",
        ageDiff: 7,
        rank: "A (要処置)",
        scores: [90, 80, 60, 75, 85],
        metrics: [
            { n: "表皮シミ", s: 85, l: "danger" }, { n: "深層シミ", s: 95, l: "danger" }, { n: "毛穴開き", s: 50, l: "safe" }, { n: "毛穴黒ずみ", s: 40, l: "safe" },
            { n: "深いシワ", s: 50, l: "warning" }, { n: "小ジワ", s: 60, l: "warning" }, { n: "キメ", s: 70, l: "warning" }, { n: "水分量", s: 50, l: "warning" },
            { n: "皮脂過多", s: 30, l: "safe" }, { n: "赤み炎症", s: 75, l: "warning" }, { n: "アクネ菌", s: 10, l: "safe" }, { n: "透明感欠如", s: 80, l: "danger" }
        ],
        warning: "【ホルモンバランス崩壊】\n頬に広がるモヤっとしたシミは、摩擦やレーザーで悪化する「肝斑」の疑いがあります。自己流ケアは危険です。",
        lineMsg: "【緊急A】肌年齢+7歳(肝斑)。頬のシミが肝斑かもしれないと診断されました。プロの目で正しく見てほしいです。"
    }
];

// Logic Init
startBtn.addEventListener('click', () => {
    switchScreen('scanning');
    resetScanFlow();
});

cameraBtn.addEventListener('click', () => cameraInput.click());

cameraInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewImg.style.filter = "none";
            runAnalysisAnimation();
        }
        reader.readAsDataURL(e.target.files[0]);
    }
});

lineBtn.addEventListener('click', openLineProtocol);

function switchScreen(screenName) {
    Object.values(screens).forEach(el => el.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function resetScanFlow() {
    currentStepIdx = 0;
    updateStepUI();
}

function updateStepUI() {
    const step = STEPS[currentStepIdx];
    stepTitle.innerText = step.title;
    stepDesc.innerText = step.desc;
    cameraBtnText.innerText = step.label;

    statusBox.classList.add('hidden');
    progressFill.style.width = '0%';
    scanLine.classList.remove('scanning');
    cameraInput.value = '';
}

function runAnalysisAnimation() {
    cameraBtn.style.display = 'none';
    statusBox.classList.remove('hidden');
    scanLine.classList.add('scanning');

    let startTime = Date.now();
    const interval = setInterval(() => {
        let elapsed = Date.now() - startTime;
        let progress = Math.min((elapsed / SCAN_DURATION) * 100, 100);

        progressFill.style.width = `${progress}%`;

        // Update Text for High Fidelity Immersive Experience
        if (progress < 40) statusText.innerText = "深層メラニン抽出中...";
        else if (progress < 70) statusText.innerText = "真皮層スキャニング...";
        else if (progress < 90) statusText.innerText = "細胞活性データ解析中...";
        else statusText.innerText = "解析完了";

        if (progress >= 100) {
            clearInterval(interval);
            finishOneStep();
        }
    }, 30);
}


function finishOneStep() {
    setTimeout(() => {
        currentStepIdx++;
        if (currentStepIdx < STEPS.length) {
            updateStepUI();
            cameraBtn.style.display = 'flex';
            previewImg.src = "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=2070&auto=format&fit=crop";
            previewImg.style.filter = "grayscale(100%)";
        } else {
            // FINISH - SELECT RANDOM PATTERN
            selectRandomPattern();
            switchScreen('result');
            animateResult();
            renderMetrics();
            drawRadarChart();
        }
    }, 500);
}

function selectRandomPattern() {
    // Random integer between 0 and 9
    const randIdx = Math.floor(Math.random() * PATTERNS.length);
    selectedPattern = PATTERNS[randIdx];
    console.log("Selected Pattern:", selectedPattern.name);

    // Update Text UI
    dangerGrade.innerText = `${selectedPattern.rank} - ${selectedPattern.name}`;
    simulationTitle.innerText = "⚠ " + selectedPattern.warning.split("\n")[0];
    simulationText.innerHTML = selectedPattern.warning.split("\n")[1].replace("。", "。<br>");
}

function animateResult() {
    let currentAge = 0;
    const targetAge = 40 + selectedPattern.ageDiff; // Assume base 40 for demo context

    const interval = setInterval(() => {
        currentAge++;
        ageResult.innerText = currentAge;
        if (currentAge >= targetAge) {
            clearInterval(interval);
            ageDiffText.innerText = `(+${selectedPattern.ageDiff}歳)`;
        }
    }, 20);
}

function renderMetrics() {
    metricsList.innerHTML = '';
    selectedPattern.metrics.forEach(m => {
        const li = document.createElement('li');
        let colorClass = "";
        let text = "";

        if (m.l === 'danger') {
            colorClass = "danger";
            text = "危険";
        } else if (m.l === 'warning') {
            colorClass = "warning";
            text = "注意";
        } else {
            colorClass = "safe";
            text = "正常";
        }

        li.innerHTML = `
            <span class="metric-name">${m.n}</span>
            <span class="metric-val ${colorClass}">${m.s}% (${text})</span>
        `;
        metricsList.appendChild(li);
    });
}

function drawRadarChart() {
    const ctx = document.getElementById('skinRadarChart').getContext('2d');

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['シミ', '乾燥', '毛穴', '透明感', '黒ずみ'],
            datasets: [{
                label: selectedPattern.name,
                data: selectedPattern.scores,
                backgroundColor: 'rgba(200, 70, 70, 0.2)',
                borderColor: 'rgba(200, 70, 70, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(200, 70, 70, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: '#eee' },
                    grid: { color: '#eee' },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

function openLineProtocol() {
    window.location.href = 'https://drive.google.com/file/d/16-c4jAIqPUvDV0XX97SzzHE7uaO_MTVg/view?usp=sharing';
}
