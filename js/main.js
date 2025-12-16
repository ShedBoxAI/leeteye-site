// LeetEye Landing Page JavaScript

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.98)';
        nav.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    } else {
        nav.style.background = 'rgba(250, 250, 250, 0.9)';
        nav.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add fade-in class and observe elements
document.querySelectorAll('.feature-card, .problem-card, .step, .pattern-tag').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(el);
});

// Add visible class styles
const style = document.createElement('style');
style.textContent = `
    .visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Phone mockup tilt effect on mouse move (desktop only)
const phoneFrame = document.querySelector('.phone-frame');
if (phoneFrame && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xRotation = ((clientY / innerHeight) - 0.5) * 10;
        const yRotation = ((clientX / innerWidth) - 0.5) * -10;

        phoneFrame.style.transform = `rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
    });
}

// Typing effect for hero (optional enhancement)
// Uncomment below if you want a typing effect

/*
const heroTitle = document.querySelector('.hero-title-gradient');
const text = heroTitle.textContent;
heroTitle.textContent = '';
let i = 0;

function typeWriter() {
    if (i < text.length) {
        heroTitle.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    }
}

setTimeout(typeWriter, 500);
*/

// Code block rotation and typing animation
const codeFeature = document.getElementById('code-visual');
if (codeFeature) {
    const codeBlocks = codeFeature.querySelectorAll('.code-block');
    let currentBlockIndex = 0;
    let rotationInterval = null;

    // Function to reset lines to hidden state
    function resetLines(block) {
        const codeLines = block.querySelectorAll('.code-line');
        codeLines.forEach(line => {
            line.style.animation = 'none';
            line.style.opacity = '0';
        });
    }

    // Function to replay typing animation on a code block
    function replayTypingAnimation(block) {
        const codeLines = block.querySelectorAll('.code-line');
        codeLines.forEach((line, index) => {
            line.offsetHeight; // Trigger reflow
            line.style.animation = `type-line 0.4s ease forwards ${index * 0.15}s`;
        });
    }

    // Function to switch to next code block
    function switchToNextBlock() {
        const oldBlock = codeBlocks[currentBlockIndex];

        // Immediately hide old block (no transition)
        oldBlock.style.transition = 'none';
        oldBlock.style.opacity = '0';
        oldBlock.style.visibility = 'hidden';
        oldBlock.classList.remove('active');

        // Reset old block's transition after hiding
        setTimeout(() => {
            oldBlock.style.transition = '';
        }, 50);

        // Move to next block (loop back to 0)
        currentBlockIndex = (currentBlockIndex + 1) % codeBlocks.length;

        const newBlock = codeBlocks[currentBlockIndex];

        // Reset lines to hidden BEFORE making block active
        resetLines(newBlock);

        // Clear any inline styles from previous hide
        newBlock.style.opacity = '';
        newBlock.style.visibility = '';
        newBlock.style.transition = '';

        // Add active to new block
        newBlock.classList.add('active');

        // Start typing animation after a tiny delay
        setTimeout(() => {
            replayTypingAnimation(codeBlocks[currentBlockIndex]);
        }, 50);
    }

    // Initialize: reset all non-active blocks to have hidden lines
    codeBlocks.forEach((block, index) => {
        if (index !== 0) {
            resetLines(block);
        }
    });

    // Start rotation when code section is visible
    const codeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Start initial typing animation
                replayTypingAnimation(codeBlocks[currentBlockIndex]);

                // Start rotation every 5 seconds
                if (!rotationInterval) {
                    rotationInterval = setInterval(switchToNextBlock, 5000);
                }
                codeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    codeObserver.observe(codeFeature);
}

// Console easter egg for developers
console.log('%c🔥 LeetEye', 'font-size: 24px; font-weight: bold; color: #F97316;');
console.log('%cBuilding pattern recognition intuition for coding interviews.', 'color: #A1A1AA;');
console.log('%cCheck us out: https://leeteye.com', 'color: #14B8A6;');
