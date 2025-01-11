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
