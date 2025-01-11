document.addEventListener('DOMContentLoaded', () => {
    const todayReminders = document.getElementById('todayReminders');
    const medicationList = document.getElementById('medicationList');
    const addMedicationForm = document.getElementById('addMedicationForm');
    const todayLink = document.getElementById('todayLink');
    const allMedicationsLink = document.getElementById('allMedicationsLink');
    
    let medications = [];
    try {
        medications = JSON.parse(localStorage.getItem('medications')) || [];
    } catch (error) {
        console.error('Error parsing medications from localStorage:', error);
    }

    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        });
    }

    // ... (keep all other functions as they are) ...

    todayLink.addEventListener('click', showTodayReminders);
    allMedicationsLink.addEventListener('click', showAllMedications);

    addMedicationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('medicationName').value;
        const time = document.getElementById('reminderTime').value;
        const newMed = { name, time, taken: false };
        medications.push(newMed);
        try {
            localStorage.setItem('medications', JSON.stringify(medications));
        } catch (error) {
            console.error('Error saving medications to localStorage:', error);
        }
        renderMedicationList();
        addMedicationForm.reset();
        scheduleNotification(newMed);
    });

    medicationList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            medications.splice(index, 1);
            try {
                localStorage.setItem('medications', JSON.stringify(medications));
            } catch (error) {
                console.error('Error saving medications to localStorage:', error);
            }
            renderMedicationList();
        }
    });

    medications.forEach(scheduleNotification);
    showTodayReminders();
});
