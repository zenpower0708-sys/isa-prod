import './style.css'

document.querySelector('#app').innerHTML = `
  <!-- Vite's default mount point is cleared as I am using a custom index.html structure -->
`

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Parallax Effect for Hero Background
window.addEventListener('scroll', () => {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        const scrollValue = window.scrollY;
        heroBg.style.transform = `scale(1.05) translateY(${scrollValue * 0.2}px)`;
    }
});

// Book Card Hover Interaction
const bookCards = document.querySelectorAll('.book-card');
bookCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        // card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });
});

// Initialize Wow factor (Simple log for now)
console.log('ISA BOOK STORE Premium Platform Loaded Successfully');
