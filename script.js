document.addEventListener('DOMContentLoaded', () => {
    // Clock
    function updateClock() {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString('pt-BR');
    }
    setInterval(updateClock, 1000);
    updateClock();

    // DOM Elements
    const configSection = document.getElementById('config-section');
    const inputSection = document.getElementById('input-section');
    const resultSection = document.getElementById('result-section-container'); // Corrected ID
    const inputGrid = document.getElementById('input-grid');
    const slotCountInput = document.getElementById('slot-count');
    const initSystemBtn = document.getElementById('init-system-btn');
    const resetBtn = document.getElementById('reset-btn');
    const initiateBtn = document.getElementById('initiate-btn');
    const resultDisplay = document.getElementById('result-display');
    const historyList = document.getElementById('history-list');
    const statusBar = document.querySelector('.status-bar');

    // State
    const HISTORY_KEY = 'selector_history_v1';
    let historyData = loadHistory();

    // Initialize
    renderHistory();

    // Event Listeners
    initSystemBtn.addEventListener('click', initializeSystem);
    resetBtn.addEventListener('click', resetSystem);
    initiateBtn.addEventListener('click', startSelection);

    // --- Core Logic ---

    function initializeSystem() {
        const count = parseInt(slotCountInput.value, 10);

        if (isNaN(count) || count < 2 || count > 100) {
            alert('ERROR: SLOT COUNT MUST BE BETWEEN 2 AND 100.');
            return;
        }

        // Generate Inputs
        inputGrid.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-wrapper';
            wrapper.innerHTML = `
                <label>VAL ${i.toString().padStart(2, '0')}</label>
                <input type="number" class="hud-input generated-input" placeholder="00" min="0" max="50">
                <div class="input-light"></div>
            `;
            inputGrid.appendChild(wrapper);
        }

        // Switch Views
        configSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        resultSection.classList.remove('hidden');
        statusBar.innerText = 'SYSTEM: READY FOR DATA ENTRY';
    }

    function resetSystem() {
        inputSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        configSection.classList.remove('hidden');

        // Clear inputs logic if desired, or keep for next time
        statusBar.innerText = 'SYSTEM: ONLINE // WAITING FOR INPUT';
    }

    function startSelection() {
        // Collect values dynamically
        const allInputs = document.querySelectorAll('.generated-input');
        const validInputs = [];
        let hasError = false;

        allInputs.forEach(input => {
            const val = input.value.trim();
            if (val === '') return; // Skip empty

            const num = parseInt(val, 10);
            if (isNaN(num) || num < 0 || num > 50) {
                input.style.borderColor = 'var(--danger-color)';
                hasError = true;
            } else {
                input.style.borderColor = 'rgba(0, 243, 255, 0.3)';
                validInputs.push(num);
            }
        });

        if (hasError) {
            alert('ERROR: VALUES MUST BE BETWEEN 0 AND 50.');
            return;
        }

        if (validInputs.length < 2) {
            alert('ERROR: INSUFFICIENT DATA. PLEASE ENTER AT LEAST 2 VALID VALUES.');
            return;
        }

        // Start Animation
        initiateBtn.disabled = true;
        initiateBtn.querySelector('.btn-text').innerText = 'COMPUTING...';
        statusBar.innerText = 'SYSTEM: PROCESSING ALGORITHM...';
        statusBar.style.color = 'var(--secondary-color)';

        let steps = 0;
        const maxSteps = 20;
        const intervalTime = 100;

        const interval = setInterval(() => {
            const randomPreview = validInputs[Math.floor(Math.random() * validInputs.length)];
            resultDisplay.innerText = randomPreview;
            resultDisplay.classList.remove('active');
            resultDisplay.style.color = 'rgba(255, 255, 255, 0.5)';

            steps++;
            if (steps >= maxSteps) {
                clearInterval(interval);
                finalizeSelection(validInputs);
            }
        }, intervalTime);
    }

    function finalizeSelection(values) {
        // Smart Random Logic
        const lastWinners = historyData.slice(0, 5).map(h => h.value);
        const freshOptions = values.filter(v => !lastWinners.includes(v));

        let finalValue;
        if (freshOptions.length > 0) {
            finalValue = freshOptions[Math.floor(Math.random() * freshOptions.length)];
        } else {
            finalValue = values[Math.floor(Math.random() * values.length)];
        }

        // Update UI
        resultDisplay.innerText = finalValue;
        resultDisplay.style.color = '';
        resultDisplay.classList.add('active');

        initiateBtn.disabled = false;
        initiateBtn.querySelector('.btn-text').innerText = 'INITIATE SEQUENCE';
        statusBar.innerText = 'SYSTEM: RESULT CONFIRMED';

        addToHistory(finalValue);
    }

    // --- Persistence Functions ---

    function loadHistory() {
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load history', e);
            return [];
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
        } catch (e) {
            console.error('Failed to save history', e);
        }
    }

    function addToHistory(value) {
        const now = new Date();
        const entry = {
            value: value,
            timestamp: now.toLocaleString('pt-BR')
        };

        historyData.unshift(entry);
        if (historyData.length > 50) historyData.pop();

        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        historyData.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item';
            el.innerHTML = `
                <span class="val">${item.value}</span>
                <span class="time">${item.timestamp}</span>
            `;
            historyList.appendChild(el);
        });
    }
});
