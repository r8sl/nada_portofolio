/**
 * ========================================
 * VIDEO EDITOR PORTFOLIO 2026
 * Interactive features and timeline
 * ========================================
 */

// DOM Elements
const elements = {
    modal: document.getElementById('videoModal'),
    videoFrame: document.getElementById('videoFrame'),
    modalClose: document.querySelector('.modal-close'),
    modalBack: document.querySelector('.modal-back'),
    portfolioCards: document.querySelectorAll('.portfolio-card'),
    playBtns: document.querySelectorAll('.play-btn'),
    playhead: document.getElementById('playhead'),
    timelineBar: document.querySelector('.timeline-bar'),
    contactForm: document.getElementById('contactForm'),
    navLinks: document.querySelectorAll('.nav-menu a')
};

// Timeline State
const timeline = {
    progress: 0
};

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            elements.navLinks.forEach(l => l.classList.remove('active'));
            // Add active to clicked link
            link.classList.add('active');
        });
    });
    
    // Update active nav on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ========================================
// VIDEO MODAL
// ========================================
function openVideoModal(videoUrl) {
    if (!elements.modal || !elements.videoFrame) return;
    elements.videoFrame.src = videoUrl;
    elements.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    if (!elements.modal || !elements.videoFrame) return;
    elements.modal.classList.remove('active');
    elements.videoFrame.src = '';
    document.body.style.overflow = '';
}

function initVideoModal() {
    // Attach click handlers to play buttons within cards
    elements.playBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoUrl = btn.dataset.video;
            if (videoUrl) openVideoModal(videoUrl);
        });
    });
    
    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', closeVideoModal);
    }
    
    if (elements.modalBack) {
        elements.modalBack.addEventListener('click', closeVideoModal);
    }
    
    if (elements.modal) {
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) closeVideoModal();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
            closeVideoModal();
        }
    });
}

// ========================================
// PORTFOLIO FILTER
// ========================================
// Reveal only successfully decoded posters; failures leave the CSS fallback visible.
function initPortfolioPosters() {
    document.querySelectorAll('.portfolio-poster').forEach(poster => {
        const updatePoster = () => {
            poster.classList.toggle('is-loaded', poster.complete && poster.naturalWidth > 0);
        };
        poster.addEventListener('load', updatePoster);
        poster.addEventListener('error', () => poster.classList.remove('is-loaded'));
        updatePoster();
    });
}
function initPortfolioFilter() {
    const portfolio = document.getElementById('portfolio');
    const typeButtons = portfolio.querySelectorAll('[data-project-type].filter-btn');
    const categoryButtons = portfolio.querySelectorAll('[data-design-filter]');
    const designTabs = portfolio.querySelector('.design-tabs');
    const grid = portfolio.querySelector('.portfolio-grid');
    const emptyState = portfolio.querySelector('.portfolio-empty');
    const cards = [...portfolio.querySelectorAll('.portfolio-card')];
    const categoryNames = {
        all: 'design projects',
        posters: 'poster projects',
        logos: 'logo projects',
        'ai-generative': 'AI generative projects'
    };
    let projectType = 'video';
    let designFilter = 'all';

    function render(animate = true) {
        typeButtons.forEach(button => {
            const selected = button.dataset.projectType === projectType;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        categoryButtons.forEach(button => {
            const selected = button.dataset.designFilter === designFilter;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        designTabs.hidden = projectType !== 'design';
        const matchingCards = cards.filter(card =>
            card.dataset.projectType === projectType &&
            (projectType === 'video' || designFilter === 'all' || card.dataset.category === designFilter)
        );
        cards.forEach(card => {
            card.hidden = !matchingCards.includes(card);
        });
        grid.hidden = matchingCards.length === 0;
        emptyState.hidden = matchingCards.length > 0;
        emptyState.textContent = matchingCards.length ? '' :
            'No ' + (projectType === 'design' ? categoryNames[designFilter] : 'video projects') + ' to display yet.';

        if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const target = matchingCards.length ? grid : emptyState;
            target.getAnimations().forEach(animation => animation.cancel());
            target.animate(
                [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { duration: 220, easing: 'ease-out' }
            );
        }
    }

    typeButtons.forEach(button => button.addEventListener('click', () => {
        projectType = button.dataset.projectType;
        render();
    }));
    categoryButtons.forEach(button => button.addEventListener('click', () => {
        designFilter = button.dataset.designFilter;
        render();
    }));
    render(false);
}

// ========================================
// TIMELINE
// ========================================
function getPageHeight() {
    return document.documentElement.scrollHeight - window.innerHeight;
}

function updatePlayhead(progress) {
    if (!elements.playhead || !elements.timelineBar) return;
    const barWidth = elements.timelineBar.offsetWidth;
    const position = progress * barWidth;
    elements.playhead.style.left = `${position}px`;
}

function initTimeline() {
    if (!elements.timelineBar || !elements.playhead) return;
    
    // Make timeline bar clickable to jump to sections
    elements.timelineBar.addEventListener('click', (e) => {
        const rect = elements.timelineBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const progress = Math.max(0, Math.min(1, clickX / rect.width));
        
        timeline.progress = progress;
        updatePlayhead(timeline.progress);
        
        // Scroll to the clicked position
        const pageHeight = getPageHeight();
        const targetScroll = timeline.progress * pageHeight;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
    
    // Make playhead draggable
    let isDragging = false;
    
    elements.playhead.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const rect = elements.timelineBar.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const progress = Math.max(0, Math.min(1, mouseX / rect.width));
        
        timeline.progress = progress;
        updatePlayhead(progress);
        
        // Scroll to the dragged position
        const pageHeight = getPageHeight();
        const targetScroll = timeline.progress * pageHeight;
        window.scrollTo(0, targetScroll);
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Update playhead position when scrolling manually
    window.addEventListener('scroll', () => {
        const pageHeight = getPageHeight();
        const currentScroll = window.scrollY;
        timeline.progress = pageHeight > 0 ? Math.min(currentScroll / pageHeight, 1) : 0;
        updatePlayhead(timeline.progress);
    });
    
    window.addEventListener('resize', () => {
        updatePlayhead(timeline.progress);
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    const animatedElements = document.querySelectorAll('.portfolio-card, .service-card, .testimonial-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// CONTACT FORM
// ========================================
function initContactForm() {
    if (elements.contactForm) {
        elements.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! I will get back to you soon.');
            elements.contactForm.reset();
        });
    }
}

// ========================================
// INIT
// ========================================
function init() {
    // Re-query elements to ensure they're available after DOM load
    elements.modal = document.getElementById('videoModal');
    elements.videoFrame = document.getElementById('videoFrame');
    elements.modalClose = document.querySelector('.modal-close');
    elements.modalBack = document.querySelector('.modal-back');
    elements.portfolioCards = document.querySelectorAll('.portfolio-card');
    elements.playBtns = document.querySelectorAll('.play-btn');
    elements.playhead = document.getElementById('playhead');
    elements.timelineBar = document.querySelector('.timeline-bar');
    elements.contactForm = document.getElementById('contactForm');
    elements.navLinks = document.querySelectorAll('.nav-menu a');
    
    initNavigation();
    initVideoModal();
    initPortfolioPosters();
    initPortfolioFilter();
    initTimeline();
    initSmoothScroll();
    initScrollAnimations();
    initContactForm();
}

document.addEventListener('DOMContentLoaded', init);
