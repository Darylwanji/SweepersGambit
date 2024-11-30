// Theme handling functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode based on user preference
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const icon = darkModeToggle.querySelector('i');
    
    // Check for saved theme preference, default to dark mode
    const isDarkMode = localStorage.getItem('darkMode') === 'false' ? false : true;
    document.body.classList.toggle('light-mode', !isDarkMode);
    updateIcon(isDarkMode);
    
    // Dark mode toggle handler
    darkModeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('light-mode');
        localStorage.setItem('darkMode', !isDark);
        updateIcon(!isDark);
    });
    
    function updateIcon(isDark) {
        icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Theme selector handler
    const themeSelect = document.getElementById('theme');
    if (themeSelect) {
        // Load saved theme preference
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            themeSelect.value = savedTheme;
        }
        
        themeSelect.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            localStorage.setItem('selectedTheme', selectedTheme);
            
            // Add any theme-specific logic here
            document.documentElement.setAttribute('data-theme', selectedTheme);
        });
    }
});

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.menu-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.className = 'ripple';
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });
    });
});