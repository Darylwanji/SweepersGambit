// Add any additional animations or interactivity here
document.addEventListener('DOMContentLoaded', function() {
    // Example: Add a class to trigger animation after page load
    const text = document.querySelector('.animated-text');
    text.style.opacity = '0';
    
    setTimeout(() => {
        text.style.transition = 'opacity 1s ease-in-out';
        text.style.opacity = '1';
    }, 500);
});