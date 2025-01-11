document.addEventListener('DOMContentLoaded', () => {
    const todayReminders = document.getElementById('todayReminders');
    const medicationList = document.getElementById('medicationList');
    const addMedicationForm = document.getElementById('addMedicationForm');
    const todayLink = document.getElementById('todayLink');
    const allMedicationsLink = document.getElementById('allMedicationsLink');
    
    let medications = JSON.parse(localStorage.getItem('medications')) || [];

    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        });
    }

    function renderTodayReminders() {
        todayReminders.innerHTML = '<h2>Today\'s Reminders</h2>';
        const today = new Date().toLocaleDateString();
        const todayMeds = medications.filter(med => {
            const medDate = new Date();
            medDate.setHours(med.time.split(':')[0], med.time.split(':')[1]);
            return medDate.toLocaleDateString() === today;
        });

        todayMeds.forEach((med, index) => {
            const reminderItem = document.createElement('div');
            reminderItem.classList.add('reminder-item');
            if (med.taken) reminderItem.classList.add('taken');
            reminderItem.innerHTML = `
                <span>${med.name} - ${med.time}</span>
            `;
            reminderItem.addEventListener('click', () => toggleMedicationTaken(index));
            todayReminders.appendChild(reminderItem);
        });
    }

    function renderMedicationList() {
        medicationList.innerHTML = '<h2>All Medications</h2>';
        medications.forEach((med, index) => {
            const medItem = document.createElement('div');
            medItem.classList.add('medication-item');
            medItem.innerHTML = `
                <span>${med.name} - Reminder: ${med.time}</span>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            medicationList.appendChild(medItem);
        });
    }

    function toggleMedicationTaken(index) {
        medications[index].taken = !medications[index].taken;
        localStorage.setItem('medications', JSON.stringify(medications));
        renderTodayReminders();
    }

    function showTodayReminders() {
        todayReminders.style.display = 'block';
        medicationList.style.display = 'none';
        addMedicationForm.style.display = 'none';
        renderTodayReminders();
    }

    function showAllMedications() {
        todayReminders.style.display = 'none';
        medicationList.style.display = 'block';
        addMedicationForm.style.display = 'block';
        renderMedicationList();
    }

    function scheduleNotification(med) {
        const now = new Date();
        const [hours, minutes] = med.time.split(':');
        const scheduleTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        
        if (scheduleTime > now) {
            const timeUntilNotification = scheduleTime.getTime() - now.getTime();
            setTimeout(() => {
                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    navigator.serviceWorker.ready.then(function(registration) {
                        registration.showNotification('Medication Reminder', {
                            body: `It's time to take your medication: ${med.name}`,
                            icon: '/icon-192x192.png'
                        });
                    });
                }
            }, timeUntilNotification);
        }
    }

    todayLink.addEventListener('click', showTodayReminders);
    allMedicationsLink.addEventListener('click', showAllMedications);

    addMedicationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('medicationName').value;
        const time = document.getElementById('reminderTime').value;
        const newMed = { name, time, taken: false };
        medications.push(newMed);
        localStorage.setItem('medications', JSON.stringify(medications));
        renderMedicationList();
        addMedicationForm.reset();
        scheduleNotification(newMed); // Schedule notification for the new medication
    });

    medicationList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            medications.splice(index, 1);
            localStorage.setItem('medications', JSON.stringify(medications));
            renderMedicationList();
        }
    });

  // Schedule notifications for all medications
  medications.forEach(scheduleNotification);

  // Initial render
  showTodayReminders();
});
