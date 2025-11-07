document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 2. Intersection Observer for fade-in animations
    const faders = document.querySelectorAll('.fade-in');
    const slideInImages = document.querySelectorAll(
        '.contexto-section .grid-item img, ' +
        '.transicao-section .grid-item img, ' +
        '.momento-section .grid-item img, ' +
        '.comunidade-section .grid-item img'
    );

    const appearOptions = {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Start 50px before the bottom of the viewport
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    slideInImages.forEach(image => {
        appearOnScroll.observe(image);
    });


    // 3. Video Background (Autoplay, Muted, Loop are set in HTML. Mobile fallback handled by poster attribute)
    const videoElement = document.querySelector('.hero-section video');
    if (videoElement) {
        // Play video if not playing (e.g., after user interaction)
        // This is often constrained by browser autoplay policies, but ensures it tries.
        videoElement.play().catch(error => {
            console.log("Video autoplay prevented:", error);
            // Fallback for when autoplay is blocked
            if (videoElement.hasAttribute('poster')) {
                videoElement.style.display = 'none'; // Hide video element
                const posterDiv = document.createElement('div');
                posterDiv.style.backgroundImage = `url(${videoElement.getAttribute('poster')})`;
                posterDiv.style.backgroundSize = 'cover';
                posterDiv.style.backgroundPosition = 'center';
                posterDiv.style.width = '100%';
                posterDiv.style.height = '100%';
                posterDiv.style.position = 'absolute';
                posterDiv.style.top = '0';
                posterDiv.style.left = '0';
                posterDiv.style.zIndex = '-3'; // Behind video overlay
                videoElement.parentNode.insertBefore(posterDiv, videoElement);
            }
        });
    }

    // 4. CTA Tracking (simple console log example)
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function() {
            console.log(`CTA Clicked: ${ctaId}`);
            // Integrate with analytics here (e.g., gtag('event', 'click_cta', { 'event_category': 'engagement', 'event_label': ctaId }));
        });
    });

    // 5. Mobile Menu (Placeholder - no header nav in this version, but structure for future)
    // If a mobile menu is added, this is where its toggle logic would go.
    // Example:
    /*
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    */

    // 6. Performance: Debounced scroll events (not strictly necessary for simple IO, but good practice for complex scroll effects)
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Example of a debounced scroll listener (not used for IO, but for other potential scroll effects)
    // window.addEventListener('scroll', debounce(() => {
    //     console.log('Scroll event debounced');
    // }, 100));


    // 7. WhatsApp Link with pre-filled message (already handled in HTML, but could be dynamic here)
    // Example of dynamic generation if needed:
    /*
    const whatsappNumber = 'SEU_NUMERO_AQUI'; // e.g., '5563999999999'
    const defaultMessage = encodeURIComponent('Olá! Tenho interesse no curso de Administração em Paraíso-TO.');

    document.querySelectorAll('.whatsapp-link-dynamic').forEach(link => {
        const customMessage = link.getAttribute('data-message') ? encodeURIComponent(link.getAttribute('data-message')) : defaultMessage;
        link.href = `https://wa.me/${whatsappNumber}?text=${customMessage}`;
    });
    */
});
