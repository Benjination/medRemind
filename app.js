document.addEventListener('DOMContentLoaded', () => {
    const todayReminders = document.getElementById('todayReminders');
    const medicationList = document.getElementById('medicationList');
    const addMedicationForm = document.getElementById('addMedicationForm');

    medications.forEach(scheduleNotification);
    
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

    function renderTodayReminders() {
        const today = new Date().toLocaleDateString();
        const todayMeds = medications.filter(med => {
            const medDate = new Date();
            medDate.setHours(med.time.split(':')[0], med.time.split(':')[1]);
            return medDate.toLocaleDateString() === today;
        }).sort((a, b) => {
            // Convert times to comparable format
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            
            // Compare hours first, then minutes
            if (timeA[0] !== timeB[0]) {
                return timeA[0] - timeB[0];
            }
            return timeA[1] - timeB[1];
        });
    
        if (todayMeds.length === 0) {
            todayReminders.style.display = 'none';
        } else {
            todayReminders.style.display = 'block';
            todayReminders.innerHTML = '<h2>Today\'s Reminders</h2>';
            todayMeds.forEach((med) => {
                const reminderItem = document.createElement('div');
                reminderItem.classList.add('reminder-item');
                if (med.taken) reminderItem.classList.add('taken');
                reminderItem.innerHTML = `
                    <span>${med.name} - ${med.time}</span>
                `;
                reminderItem.addEventListener('click', () => toggleMedicationTaken(med));
                todayReminders.appendChild(reminderItem);
            });
        }
    }
    

    function renderMedicationList() {
        if (medications.length === 0) {
            medicationList.style.display = 'none';
        } else {
            medicationList.style.display = 'block';
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
    }

    function toggleMedicationTaken(med) {
        med.taken = !med.taken;
        localStorage.setItem('medications', JSON.stringify(medications));
        renderTodayReminders();
    }

    function scheduleNotification(med) {
        const now = new Date();
        const [hours, minutes] = med.time.split(':');
        const scheduleTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        
        if (scheduleTime > now) {
            const timeUntilNotification = scheduleTime.getTime() - now.getTime();
            setTimeout(() => {
                new Notification('Medication Reminder', {
                    body: `It's time to take your medication: ${med.name}`,
                    icon: '/icon-192x192.png'
                });
            }, timeUntilNotification);
        }
    }
    

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
        renderTodayReminders();
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
            renderTodayReminders();
        }
    });

    medications.forEach(scheduleNotification);
    renderMedicationList();
    renderTodayReminders();

    // Add these console logs for debugging
    console.log('Medications:', medications);
    console.log('Today\'s medications:', medications.filter(med => {
        const medDate = new Date();
        medDate.setHours(med.time.split(':')[0], med.time.split(':')[1]);
        return medDate.toLocaleDateString() === new Date().toLocaleDateString();
    }));
});