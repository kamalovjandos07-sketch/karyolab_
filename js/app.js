// 1. Состояние приложения (State)
let activeClinicalCase = null;
let currentStepIdx = 0;
let isAnimating = false;
let isSanitized = false;
const expectedSequence = ['pha', 'inc', 'col', 'spin', 'kcl', 'fix', 'drop', 'micro'];

// 2. Навигация
function switchScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

// 3. Запуск и выбор кейса
function startApp() {
    // Скрываем лендинг
    const landing = document.getElementById('landing-page');
    if (landing) landing.style.display = 'none';

    // Выбираем рандомный кейс
    activeClinicalCase = clinicalCases[Math.floor(Math.random() * clinicalCases.length)];
    
    populateCase(activeClinicalCase);
    switchScreen('app-case');
}

function populateCase(caseData) {
    document.getElementById('case-patient-info').innerHTML = caseData.patient;
    document.getElementById('case-error').classList.add('hidden');
    document.querySelectorAll('#diagnostic-options .choice-card').forEach(el => el.classList.remove('wrong'));
}

// 4. Логика СИЗ (Антисептик -> Перчатки)
function prepAction(item) {
    const err = document.getElementById('prep-error');
    const hint = document.getElementById('prep-hint');

    if (item === 'sanitizer') {
        isSanitized = true;
        hint.textContent = 'Правило: Теперь наденьте перчатки';
        hint.className = 'text-green-400 font-bold mono bg-green-900/30 px-4 py-1 rounded-full text-xs';
        err.textContent = '';
        document.getElementById('prep-sanitizer').style.filter = 'drop-shadow(0 0 15px rgba(59,130,246,0.8))';
    } else if (item === 'gloves') {
        if (!isSanitized) {
            err.textContent = 'Ошибка! Сначала необходимо обработать руки антисептиком.';
        } else {
            document.getElementById('prep-gloves').style.filter = 'drop-shadow(0 0 15px rgba(59,130,246,0.8))';
            setTimeout(() => switchScreen('app-lab'), 1000);
        }
    }
}

// 5. Лабораторный процесс
function setLabHint(text, type) {
    const hint = document.getElementById('lab-hint');
    hint.textContent = text;
    if (type === 'error') {
        hint.className = 'text-red-400 font-bold uppercase mono tracking-widest text-xs bg-red-900/50 px-4 py-1 rounded-full transition-colors duration-300';
    } else if (type === 'success') {
        hint.className = 'text-green-400 font-bold uppercase mono tracking-widest text-xs bg-green-900/50 px-4 py-1 rounded-full transition-colors duration-300';
    } else {
        hint.className = 'text-slate-400 font-bold uppercase mono tracking-widest text-xs bg-slate-900 px-4 py-1 rounded-full transition-colors duration-300';
    }
}

function labProcess(action, element) {
    if (isAnimating) return;

    const expectedAction = expectedSequence[currentStepIdx];
    const tube = document.getElementById('main-tube');

    if (action === expectedAction) {
        isAnimating = true;
        currentStepIdx++;

        if (action === 'pha') {
            setLabHint('Успешно: ФГА добавлен. Клетки готовы к стимуляции.', 'success');
            tube.classList.add('scale-105');
            setTimeout(() => { tube.classList.remove('scale-105'); isAnimating = false; setLabHint('Статус: Ожидание'); }, 1500);
        }
        else if (action === 'inc') {
            setLabHint('Успешно: Термостат (37°C). Инкубация...', 'success');
            tube.classList.add('opacity-0');
            setTimeout(() => { tube.classList.remove('opacity-0'); isAnimating = false; setLabHint('Статус: Ожидание'); }, 2000);
        }
        else if (action === 'col') {
            setLabHint('Успешно: Колхицин добавлен. Метафазный арест.', 'success');
            tube.classList.add('scale-105');
            setTimeout(() => { tube.classList.remove('scale-105'); isAnimating = false; setLabHint('Статус: Ожидание'); }, 1500);
        }
        else if (action === 'spin') {
            setLabHint('Успешно: Центрифугирование...', 'success');
            element.classList.add('spinning');
            tube.classList.add('opacity-0');
            setTimeout(() => { 
                element.classList.remove('spinning'); 
                tube.src = 'assets/tube_pellet.png'; 
                tube.classList.remove('opacity-0'); 
                isAnimating = false;
                setLabHint('Статус: Осадок сформирован'); 
            }, 3000);
        }
        else if (action === 'kcl') {
            setLabHint('Успешно: Гипотонический шок KCl.', 'success');
            tube.classList.add('scale-105');
            setTimeout(() => { tube.classList.remove('scale-105'); isAnimating = false; setLabHint('Статус: Ожидание'); }, 1500);
                tube.src = 'assets/tube_swollen.png';
        }
        else if (action === 'fix') {
            setLabHint('Успешно: Фиксатор Карнуа добавлен.', 'success');
            tube.classList.add('scale-105');
            setTimeout(() => { tube.classList.remove('scale-105'); isAnimating = false; setLabHint('Статус: Ожидание'); }, 1500);
        }
        else if (action === 'drop') {
            setLabHint('Успешно: Нанесение на стекло...', 'success');
            tube.classList.add('opacity-0');
            document.getElementById('main-slide').classList.remove('hidden-item');
            const drop = document.getElementById('drop-anim');
            drop.classList.remove('hidden-item');
            drop.classList.add('dropping');
            setTimeout(() => {
                drop.classList.add('hidden-item');
                drop.classList.remove('dropping');
                isAnimating = false;
                setLabHint('Препарат готов'); 
            }, 1000);
        }
        else if (action === 'micro') {
            setLabHint('Успешно: Анализ...', 'success');
            setTimeout(() => {
                prepareResultView();
                switchScreen('app-res');
            }, 1500);
        }
    } else {
        setLabHint(`Ошибка протокола!`, 'error');
        element.classList.add('error-shake');
        setTimeout(() => element.classList.remove('error-shake'), 500);
    }
}

// 6. Результаты и диагностика
function prepareResultView() {
    document.getElementById('res-title').textContent = '(кариограмма готова)';
    document.getElementById('res-formula').textContent = '-';
    document.getElementById('final-img').classList.add('hidden-item');
    document.getElementById('karyotype-button').classList.remove('hidden-item');
    document.getElementById('diagnostic-selection').classList.add('hidden');
    document.getElementById('diagnostic-feedback').textContent = '';
}

function revealKaryotype() {
    const finalImg = document.getElementById('final-img');
    
    finalImg.src = activeClinicalCase.resultImg || 'assets/default_karyo.png';
    finalImg.classList.remove('hidden-item', 'placeholder');
    document.getElementById('karyotype-button').classList.add('hidden-item');
    
    if (activeClinicalCase.isComplex) {
        const warning = document.getElementById('fish-warning');
        if (warning) warning.classList.remove('hidden-item');
        document.getElementById('diagnostic-selection').classList.add('hidden');
    } else {
        const warning = document.getElementById('fish-warning');
        if (warning) warning.classList.add('hidden-item');
        renderDiagnosisButtons();
    }
}

function renderDiagnosisButtons() {
    const container = document.getElementById('diagnostic-selection');
    container.classList.remove('hidden');
    container.innerHTML = ''; 

    activeClinicalCase.options.forEach((opt, idx) => {
        const card = document.createElement('div');
        card.className = 'choice-card bg-slate-900 p-6 rounded-xl text-center cursor-pointer hover:bg-slate-800 transition border border-white/5';
        card.innerHTML = `<h4 class="font-bold text-white text-lg">${opt.title}</h4>`;
        card.onclick = () => chooseDiagnosis(idx);
        container.appendChild(card);
    });
}

function chooseDiagnosis(idx) {
    const chosen = activeClinicalCase.options[idx];
    const feedback = document.getElementById('diagnostic-feedback');
    
    if (chosen.correct) {
        document.getElementById('res-title').textContent = chosen.title;
        document.getElementById('res-formula').textContent = activeClinicalCase.formula;
        document.getElementById('res-desc').textContent = 'Диагноз подтвержден.';
        document.getElementById('res-method').textContent = activeClinicalCase.method;

        const infoContainer = document.getElementById('res-disease-info');
        const d = activeClinicalCase.details;
        infoContainer.innerHTML = `
            <details class="bg-slate-900 p-4 rounded-xl mb-2"><summary class="text-white font-bold">Патогенез</summary><p class="text-slate-300 text-sm">${d.pathogenesis}</p></details>
            <details class="bg-slate-900 p-4 rounded-xl mb-2"><summary class="text-white font-bold">Клиника</summary><p class="text-slate-300 text-sm">${d.clinic}</p></details>
            <details class="bg-slate-900 p-4 rounded-xl mb-2"><summary class="text-white font-bold">Лечение</summary><p class="text-slate-300 text-sm">${d.therapy}</p></details>
        `;
        feedback.textContent = 'Верно!';
        feedback.className = 'text-green-400 font-bold mb-8';
    } else {
        feedback.textContent = 'Неверно. Посмотрите на кариограмму внимательнее.';
        feedback.className = 'text-red-400 font-bold mb-8';
    }
}

// Функции для кнопок в HTML
function checkMethod(element, isCorrect) {
    if (isCorrect) switchScreen('app-theory');
    else {
        element.classList.add('wrong');
        document.getElementById('case-error').classList.remove('hidden');
        setTimeout(() => element.classList.remove('wrong'), 500);
    }
}

function goToPrep() { switchScreen('app-prep'); }