document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const challengeTitleEl = document.getElementById('challenge-title'); // New element
    const daysLeftEl = document.getElementById('days-left-in-year');
    const challengeGrid = document.getElementById('challenge-grid');
    const progressText = document.getElementById('challenge-progress');
    const modal = document.getElementById('notes-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalNotes = document.getElementById('modal-notes');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const TOTAL_DAYS = 100;
    let appState = {}; // Use an object to store all state
    let currentlyEditingDay = null;

    // --- State Management (localStorage) ---
    function saveState() {
        // Now we save the entire appState object, including the title
        appState.challengeTitle = challengeTitleEl.textContent;
        localStorage.setItem('appState', JSON.stringify(appState));
    }

    function loadState() {
        const savedState = localStorage.getItem('appState');
        if (savedState) {
            appState = JSON.parse(savedState);
        } else {
            // Default state if nothing is saved
            appState = {
                challengeTitle: "100 Day Challenge",
                days: Array.from({ length: TOTAL_DAYS }, (_, i) => ({
                    day: i + 1,
                    completed: false,
                    notes: ''
                }))
            };
        }
        challengeTitleEl.textContent = appState.challengeTitle;
    }

    // --- Initialization ---
    function initializeApp() {
        loadState();
        updateDaysLeftInYear();
        renderChallengeGrid();
        updateProgressHeader();
        
        // Add listener to save title when user clicks away
        challengeTitleEl.addEventListener('blur', saveState);

        setInterval(updateDaysLeftInYear, 60000);
    }

    // --- UI Rendering ---
    function renderChallengeGrid() {
        challengeGrid.innerHTML = '';
        appState.days.forEach(dayData => {
            const card = document.createElement('div');
            card.className = 'day-card';
            card.dataset.day = dayData.day;
            if (dayData.completed) card.classList.add('completed');

            card.innerHTML = `
                <div class="day-number">Day ${dayData.day}</div>
                <input type="checkbox" ${dayData.completed ? 'checked' : ''} />
                <div class="checkbox-custom"></div>
            `;
            
            const checkbox = card.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                handleDayCompletion(dayData.day, e.target.checked);
            });

            card.addEventListener('click', () => {
                openNotesModal(dayData.day);
            });

            challengeGrid.appendChild(card);
        });
    }

    function updateProgressHeader() {
        const completedCount = appState.days.filter(day => day.completed).length;
        progressText.textContent = `You have completed ${completedCount} out of ${TOTAL_DAYS} days. Keep going!`;
    }

    // --- Countdown Logic ---
    function updateDaysLeftInYear() {
        const now = new Date();
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        const diffInTime = endOfYear.getTime() - now.getTime();
        const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
        daysLeftEl.textContent = diffInDays;
    }

    // --- Event Handlers ---
    function handleDayCompletion(dayNumber, isCompleted) {
        const dayData = appState.days.find(d => d.day === dayNumber);
        if (dayData) {
            dayData.completed = isCompleted;
            saveState();
            renderChallengeGrid();
            updateProgressHeader();
        }
    }

    function openNotesModal(dayNumber) {
        currentlyEditingDay = dayNumber;
        const dayData = appState.days.find(d => d.day === dayNumber);
        modalTitle.textContent = `Notes for Day ${dayNumber}`;
        modalNotes.value = dayData.notes || '';
        modal.style.display = 'flex';
    }

    function closeNotesModal() {
        modal.style.display = 'none';
        currentlyEditingDay = null;
    }

    function saveNotes() {
        if (currentlyEditingDay) {
            const dayData = appState.days.find(d => d.day === currentlyEditingDay);
            dayData.notes = modalNotes.value;
            saveState();
            closeNotesModal();
        }
    }

    // --- Modal Event Listeners ---
    modalSaveBtn.addEventListener('click', saveNotes);
    modalCloseBtn.addEventListener('click', closeNotesModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeNotesModal();
    });

    // --- Start the App ---
    initializeApp();
});
