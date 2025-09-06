document.addEventListener('DOMContentLoaded', () => {

    const daysLeftEl = document.getElementById('days-left-in-year');
    const challengeGrid = document.getElementById('challenge-grid');
    const progressText = document.getElementById('challenge-progress');
    const modal = document.getElementById('notes-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalNotes = document.getElementById('modal-notes');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const TOTAL_DAYS = 100;
    let challengeState = [];
    let currentlyEditingDay = null;

    // =======================================================
    // == LOCALSTORAGE FUNCTIONS TO SAVE AND LOAD PROGRESS ===
    // =======================================================

    function saveState() {
        // Convert the challengeState array to a string and save it.
        localStorage.setItem('challengeState', JSON.stringify(challengeState));
    }

    function loadState() {
        // Try to get the saved data from localStorage.
        const savedState = localStorage.getItem('challengeState');
        if (savedState) {
            // If data exists, parse it back into an array.
            return JSON.parse(savedState);
        }
        // If no data exists (first visit), create a default array.
        return Array.from({ length: TOTAL_DAYS }, (_, i) => ({
            day: i + 1,
            completed: false,
            notes: ''
        }));
    }

    // --- Main App Initialization ---
    function initializeApp() {
        // === LOAD STATE on startup ===
        challengeState = loadState();

        updateDaysLeftInYear();
        renderChallengeGrid();
        updateProgressHeader();
        setInterval(updateDaysLeftInYear, 60000);
    }

    function renderChallengeGrid() {
        challengeGrid.innerHTML = '';
        challengeState.forEach(dayData => {
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
        const completedCount = challengeState.filter(day => day.completed).length;
        progressText.textContent = `You have completed ${completedCount} out of ${TOTAL_DAYS} days. Keep going!`;
    }

    function updateDaysLeftInYear() {
        const now = new Date();
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        const diffInTime = endOfYear.getTime() - now.getTime();
        const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
        daysLeftEl.textContent = diffInDays;
    }

    function handleDayCompletion(dayNumber, isCompleted) {
        const dayData = challengeState.find(d => d.day === dayNumber);
        if (dayData) {
            dayData.completed = isCompleted;
            // === SAVE STATE after a change ===
            saveState();
            renderChallengeGrid();
            updateProgressHeader();
        }
    }

    function openNotesModal(dayNumber) {
        currentlyEditingDay = dayNumber;
        const dayData = challengeState.find(d => d.day === dayNumber);
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
            const dayData = challengeState.find(d => d.day === currentlyEditingDay);
            dayData.notes = modalNotes.value;
            // === SAVE STATE after a change ===
            saveState();
            closeNotesModal();
        }
    }

    modalSaveBtn.addEventListener('click', saveNotes);
    modalCloseBtn.addEventListener('click', closeNotesModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeNotesModal();
    });

    initializeApp();
});
