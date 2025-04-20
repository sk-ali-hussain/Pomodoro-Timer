document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const startBtn = document.getElementById('start');
    const pauseBtn = document.getElementById('pause');
    const resetBtn = document.getElementById('reset');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const progressRing = document.querySelector('.progress-ring__circle');
    const yearEl = document.getElementById('year');
    
    // Set current year in footer
    yearEl.textContent = new Date().getFullYear();
    
    // Timer variables
    let timer;
    let minutes = 25;
    let seconds = 0;
    let isRunning = false;
    let totalSeconds = minutes * 60;
    let remainingSeconds = totalSeconds;
    let currentMode = 'pomodoro';
    let pomodoroCount = 0;
    
    // Original circle circumference
    const circumference = parseFloat(getComputedStyle(progressRing).strokeDasharray);
    
    // Initialize progress ring
    updateProgressRing(remainingSeconds, totalSeconds);
    
    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // Mode buttons
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const timeValue = parseInt(button.getAttribute('data-time'));
            changeMode(button, timeValue);
        });
    });
    
    // Timer Functions
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            timer = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        timerComplete();
                        return;
                    }
                    minutes--;
                    seconds = 59;
                } else {
                    seconds--;
                }
                
                remainingSeconds--;
                updateDisplay();
                updateProgressRing(remainingSeconds, totalSeconds);
            }, 1000);
        }
    }
    
    function pauseTimer() {
        if (isRunning) {
            isRunning = false;
            clearInterval(timer);
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }
    
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        setTimerValues(minutes, 0);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        updateProgressRing(totalSeconds, totalSeconds);
    }
    
    function timerComplete() {
        clearInterval(timer);
        isRunning = false;
        
        // Play notification sound and show notification
        playNotificationSound();
        showNotification();
        
        if (currentMode === 'pomodoro') {
            pomodoroCount++;
            
            // After 4 pomodoros, suggest a long break
            if (pomodoroCount % 4 === 0) {
                changeMode(document.querySelector('[data-time="15"]'), 15);
            } else {
                changeMode(document.querySelector('[data-time="5"]'), 5);
            }
        } else {
            // If coming from a break, go back to pomodoro
            changeMode(document.querySelector('[data-time="25"]'), 25);
        }
        
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    function changeMode(clickedButton, timeValue) {
        // Reset active state on all buttons
        modeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active state to clicked button
        clickedButton.classList.add('active');
        
        // Remove previous mode classes from body
        document.body.classList.remove('pomodoro', 'short-break', 'long-break');
        
        // Set current mode
        if (timeValue === 25) {
            currentMode = 'pomodoro';
            document.body.classList.add('pomodoro');
        } else if (timeValue === 5) {
            currentMode = 'short-break';
            document.body.classList.add('short-break');
        } else if (timeValue === 15) {
            currentMode = 'long-break';
            document.body.classList.add('long-break');
        }
        
        // Reset timer with new values
        clearInterval(timer);
        isRunning = false;
        setTimerValues(timeValue, 0);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        updateProgressRing(totalSeconds, totalSeconds);
    }
    
    function setTimerValues(mins, secs) {
        minutes = mins;
        seconds = secs;
        totalSeconds = minutes * 60;
        remainingSeconds = totalSeconds;
        updateDisplay();
    }
    
    function updateDisplay() {
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    function updateProgressRing(remaining, total) {
        const percent = remaining / total;
        const offset = circumference - (circumference * percent);
        progressRing.style.strokeDashoffset = offset;
    }
    
    function playNotificationSound() {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
    
    function showNotification() {
        // Check if browser supports notifications
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                createNotification();
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        createNotification();
                    }
                });
            }
        }
    }
    
    function createNotification() {
        let message = '';
        
        if (currentMode === 'pomodoro') {
            message = 'Great job! Time for a break.';
        } else {
            message = 'Break is over. Time to focus!';
        }
        
        const notification = new Notification('Pomodoro Timer', {
            body: message,
            icon: 'https://cdn-icons-png.flaticon.com/512/3388/3388730.png'
        });
        
        // Close notification after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
    
    // Initialize the display
    updateDisplay();
}); 