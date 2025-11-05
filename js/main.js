// ==============================================
// CONFIGURAÇÕES E CONSTANTES
// ==============================================

// ⚠️ IMPORTANTE: Substitua este link pelo link real do seu grupo do WhatsApp
const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/EI0A77baSs4Kuu3XYMjYhb";

// Configurações da aplicação
const CONFIG = {
    loadingDuration: 300,   // Tempo mínimo de loading (300ms = quase instantâneo)
    animationDelay: 100,    // Delay entre animações
    scrollOffset: 100,      // Offset para animações no scroll
    retryAttempts: 3,       // Tentativas de carregamento de mídia
};

// ==============================================
// ESTADOS DA APLICAÇÃO
// ==============================================
let isLoading = true;
let mediaLoadedCount = 0;
let totalMediaCount = 0;
let intersectionObserver = null;

// ==============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando aplicação...');
    
    // Inicializar componentes
    initializeApp();
    
    // Event listeners
    setupEventListeners();
    
    // Carregar mídia
    loadMediaContent();
    
    // Configurar animações
    setupScrollAnimations();
    
    // Analytics (se necessário)
    trackPageLoad();
});

// ==============================================
// INICIALIZAÇÃO PRINCIPAL
// ==============================================
function initializeApp() {
    try {
        // Verificar suporte do navegador
        checkBrowserSupport();
        
        // Configurar viewport
        setupViewport();
        
        // Preload crítico
        preloadCriticalResources();
        
        // Configurar service worker (opcional)
        registerServiceWorker();
        
        console.log('✅ Aplicação inicializada com sucesso');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        handleInitializationError(error);
    }
}

// ==============================================
// CARREGAMENTO DE MÍDIA
// ==============================================
function loadMediaContent() {
    const images = document.querySelectorAll('img[data-src]');
    const videos = document.querySelectorAll('video');
    
    totalMediaCount = images.length + videos.length;
    
    if (totalMediaCount === 0) {
        finishLoading();
        return;
    }
    
    // Carregar imagens lazy
    loadLazyImages(images);
    
    // Carregar vídeos
    loadVideos(videos);
    
    // Timeout de segurança
    setTimeout(() => {
        if (isLoading) {
            console.warn('⚠️ Timeout no carregamento de mídia');
            finishLoading();
        }
    }, CONFIG.loadingDuration * 2);
}

function loadLazyImages(images) {
    images.forEach((img, index) => {
        const actualSrc = img.dataset.src;
        
        if (actualSrc) {
            const imageLoader = new Image();
            
            imageLoader.onload = function() {
                img.src = actualSrc;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                
                mediaLoadedCount++;
                updateLoadingProgress();
                
                console.log(`📷 Imagem ${index + 1} carregada`);
            };
            
            imageLoader.onerror = function() {
                console.error(`❌ Erro ao carregar imagem: ${actualSrc}`);
                handleImageError(img, actualSrc);
                
                mediaLoadedCount++;
                updateLoadingProgress();
            };
            
            imageLoader.src = actualSrc;
        }
    });
}

function loadVideos(videos) {
    videos.forEach((video, index) => {
        video.addEventListener('loadedmetadata', function() {
            mediaLoadedCount++;
            updateLoadingProgress();
            console.log(`🎥 Vídeo ${index + 1} carregado`);
        });
        
        video.addEventListener('error', function() {
            console.error('❌ Erro ao carregar vídeo:', video.src);
            handleVideoError(video);
            
            mediaLoadedCount++;
            updateLoadingProgress();
        });
        
        // Iniciar carregamento
        video.load();
    });
}

function updateLoadingProgress() {
    const progress = (mediaLoadedCount / totalMediaCount) * 100;
    
    // Atualizar UI do loading se necessário
    updateLoadingUI(progress);
    
    if (mediaLoadedCount >= totalMediaCount) {
        setTimeout(finishLoading, 500);
    }
}

// No js/main.js, substitua a função finishLoading() por:
function finishLoading() {
    isLoading = false;
    
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        loadingScreen.style.display = 'none';
    }
    
    if (mainContent) {
        mainContent.classList.add('visible');
        triggerInitialAnimations();
    }
    
    console.log('✅ Conteúdo visível (imagens carregando em background)');
}

// ==============================================
// ANIMAÇÕES DE SCROLL
// ==============================================
function setupScrollAnimations() {
    // Verificar suporte ao IntersectionObserver
    if (!window.IntersectionObserver) {
        console.warn('⚠️ IntersectionObserver não suportado');
        return;
    }
    
    // Configurar observer
    const observerOptions = {
        root: null,
        rootMargin: `${CONFIG.scrollOffset}px`,
        threshold: 0.1
    };
    
    intersectionObserver = new IntersectionObserver(handleIntersection, observerOptions);
    
    // Observar elementos animáveis
    const animatableElements = document.querySelectorAll([
        '.animate-fade-in',
        '.animate-slide-left',
        '.animate-slide-right',
        '.animate-slide-up',
        '.feature-item',
        '.event-card'
    ].join(', '));
    
    animatableElements.forEach(element => {
        intersectionObserver.observe(element);
    });
}

function handleIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            
            // Adicionar delay baseado no index se for lista
            const delay = getAnimationDelay(element);
            
            setTimeout(() => {
                element.classList.add('animate-visible');
                element.style.animationPlayState = 'running';
            }, delay);
            
            // Parar de observar após animação
            intersectionObserver.unobserve(element);
        }
    });
}

function getAnimationDelay(element) {
    // Calcular delay baseado na posição do elemento
    const parent = element.closest('.features-list, .events-content');
    if (parent) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(element);
        return index * CONFIG.animationDelay;
    }
    return 0;
}

function triggerInitialAnimations() {
    // Animar hero content
    const heroElements = document.querySelectorAll('.hero-content .animate-fade-in, .hero-content .animate-fade-in-delay');
    
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.animationPlayState = 'running';
        }, index * 300);
    });
}

// ==============================================
// FUNCIONALIDADE WHATSAPP
// ==============================================
function joinWhatsApp() {
    try {
        // Validar link do WhatsApp
        if (!isValidWhatsAppLink(WHATSAPP_GROUP_LINK)) {
            console.error('❌ Link do WhatsApp inválido');
            showWhatsAppError();
            return;
        }
        
        // Analytics - rastrear clique
        trackWhatsAppClick();
        
        // Detectar dispositivo e tipo de navegador
        const deviceInfo = getDeviceInfo();
        
        // Executar redirecionamento baseado no dispositivo
        handleWhatsAppRedirection(deviceInfo);
        
        console.log('📱 Redirecionando para WhatsApp...');
        
    } catch (error) {
        console.error('❌ Erro ao abrir WhatsApp:', error);
        handleWhatsAppError(error);
    }
}

function isValidWhatsAppLink(link) {
    const whatsappPattern = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
    return whatsappPattern.test(link) && !link.includes('SEU_CODIGO_DO_GRUPO_AQUI');
}

function getDeviceInfo() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    return {
        isAndroid: /android/i.test(userAgent),
        browser: getBrowserInfo(userAgent),
        hasWhatsAppApp: checkWhatsAppApp()
    };
}

function getBrowserInfo(userAgent) {
    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';
    return 'unknown';
}

function checkWhatsAppApp() {
    // Detectar se o app do WhatsApp está instalado (aproximação)
    return (navigator.userAgent.includes('Mobile') && 
}

function handleWhatsAppRedirection(deviceInfo) {
    const link = WHATSAPP_GROUP_LINK;
    
    if (deviceInfo.isMobile) {
        // Mobile: tentar abrir app primeiro, depois web
        if (deviceInfo.hasWhatsAppApp) {
            // Tentar abrir no app
            const appLink = link.replace('https://chat.whatsapp.com/', 'whatsapp://chat?code=');
            
            window.location.href = appLink;
            
            // Fallback para web após timeout
            setTimeout(() => {
                window.open(link, '_blank', 'noopener,noreferrer');
            }, 1000);
        } else {
            // Abrir direto na web
            window.location.href = link;
        }
    } else {
        // Desktop: abrir em nova aba
        const newWindow = window.open(link, '_blank', 'noopener,noreferrer');
        
        if (!newWindow) {
            // Popup bloqueado
            showPopupBlockedMessage();
        }
    }
}

// ==============================================
// TRATAMENTO DE ERROS
// ==============================================
function handleImageError(img, src) {
    // Substituir por placeholder
    img.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f0f0f0'/><text x='50%' y='50%' text-anchor='middle' dy='0.3em' fill='%23999'>Imagem não disponível</text></svg>`;
    img.alt = 'Imagem não disponível';
    
    // Retry após delay
    setTimeout(() => {
        retryImageLoad(img, src);
    }, 2000);
}

function handleVideoError(video) {
    // Ocultar vídeo com erro
    video.style.display = 'none';
    
    // Mostrar placeholder se necessário
    const placeholder = video.nextElementSibling;
    if (placeholder && placeholder.classList.contains('video-placeholder')) {
        placeholder.style.display = 'block';
    }
}

function retryImageLoad(img, src, attempts = 0) {
    if (attempts >= CONFIG.retryAttempts) {
        console.error(`❌ Falha definitiva ao carregar: ${src}`);
        return;
    }
    
    const retryLoader = new Image();
    retryLoader.onload = function() {
        img.src = src;
        console.log(`✅ Imagem carregada após ${attempts + 1} tentativas: ${src}`);
    };
    
    retryLoader.onerror = function() {
        setTimeout(() => {
            retryImageLoad(img, src, attempts + 1);
        }, 3000 * (attempts + 1));
    };
    
    retryLoader.src = src;
}

function handleInitializationError(error) {
    // Exibir mensagem de erro amigável
    const errorMessage = document.createElement('div');
    errorMessage.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            text-align: center;
            max-width: 90%;
            z-index: 10000;
        ">
            <h3 style="margin-bottom: 1rem; color: #e74c3c;">
                Oops! Algo deu errado
            </h3>
            <p style="margin-bottom: 1.5rem; color: #666;">
                Tivemos um problema ao carregar a página. 
                Por favor, recarregue a página ou tente novamente mais tarde.
            </p>
            <button 
                onclick="window.location.reload()" 
                style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                "
            >
                Recarregar Página
            </button>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        "></div>
    `;
    
    document.body.appendChild(errorMessage);
}

function handleWhatsAppError(error) {
    console.error('Erro no WhatsApp:', error);
    
    // Mostrar mensagem alternativa
    const message = `
        Não foi possível abrir o WhatsApp automaticamente.
        
        Por favor, copie e cole este link no seu navegador:
        ${WHATSAPP_GROUP_LINK}
        
        Ou procure pelo grupo "Comunidade Administração Paraíso" no WhatsApp.
    `;
    
    if (confirm(message)) {
        // Copiar link para clipboard
        copyToClipboard(WHATSAPP_GROUP_LINK);
    }
}

function showWhatsAppError() {
    alert('Erro: O link do grupo do WhatsApp ainda não foi configurado. Entre em contato com o administrador.');
}

function showPopupBlockedMessage() {
    const message = `
        Seu navegador bloqueou o popup do WhatsApp.
        
        Por favor, permita popups para este site ou 
        copie e cole este link: ${WHATSAPP_GROUP_LINK}
    `;
    
    if (confirm(message)) {
        copyToClipboard(WHATSAPP_GROUP_LINK);
    }
}

// ==============================================
// UTILITÁRIOS
// ==============================================
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Link copiado para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Link copiado!');
    } catch (err) {
        console.error('Erro ao copiar:', err);
        showNotification('Não foi possível copiar automaticamente');
    }
    
    document.body.removeChild(textArea);
}

function showNotification(message) {
    // Criar notificação toast
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: #25D366;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function checkBrowserSupport() {
    const requiredFeatures = [
        'querySelector',
        'addEventListener',
        'classList',
        'JSON'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => 
        typeof window[feature] === 'undefined' && 
        typeof document[feature] === 'undefined'
    );
    
    if (missingFeatures.length > 0) {
        throw new Error(`Recursos não suportados: ${missingFeatures.join(', ')}`);
    }
}

function setupViewport() {
    // Configurar viewport para dispositivos móveis
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0';
}

function preloadCriticalResources() {
    // Preload do vídeo hero se existir
    const heroVideo = document.querySelector('.video-background video');
    if (heroVideo) {
        heroVideo.preload = 'metadata';
    }
    
    // Preload das primeiras imagens
    const firstImages = document.querySelectorAll('img');
    Array.from(firstImages).slice(0, 3).forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        document.head.appendChild(link);
    });
}

function registerServiceWorker() {
    // Service Worker opcional para cache
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('✅ Service Worker registrado');
        }).catch(error => {
            console.log('ℹ️ Service Worker não registrado:', error);
        });
    }
}

function updateLoadingUI(progress) {
    // Atualizar barra de progresso se existir
    const progressBar = document.querySelector('.loading-progress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

// ==============================================
// ANALYTICS E TRACKING
// ==============================================
function trackPageLoad() {
    // Google Analytics ou similar
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
    
    console.log('📊 Page load tracked');
}

function trackWhatsAppClick() {
    // Analytics para cliques no WhatsApp
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
            event_category: 'engagement',
            event_label: 'join_community',
            transport_type: 'beacon'
        });
    }
    
    console.log('📊 WhatsApp click tracked');
}

// ==============================================
// EVENT LISTENERS
// ==============================================
function setupEventListeners() {
    // Scroll suave para âncoras
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a[href^="#"]');
        if (target) {
            e.preventDefault();
            const targetId = target.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
    
    // Otimização de performance no scroll
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                handleScrollOptimized();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Redimensionamento da janela
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleWindowResize, 250);
    });
    
    // Visibilidade da página
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log('👁️ Página visível');
            // Retomar animações se necessário
        } else {
            console.log('💤 Página oculta');
            // Pausar animações pesadas
        }
    });
}

function handleScrollOptimized() {
    // Atualizar botão flutuante baseado no scroll
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Mostrar/ocultar botão flutuante
    const floatingBtn = document.querySelector('.floating-whatsapp');
    if (floatingBtn) {
        if (scrollY > windowHeight * 0.3) {
            floatingBtn.style.opacity = '1';
            floatingBtn.style.transform = 'scale(1)';
        } else {
            floatingBtn.style.opacity = '0.7';
            floatingBtn.style.transform = 'scale(0.9)';
        }
    }
}

function handleWindowResize() {
    // Recalcular layouts se necessário
    console.log('📱 Window resized');
    
    // Reconfigurar observer se necessário
    if (intersectionObserver) {
        intersectionObserver.disconnect();
        setupScrollAnimations();
    }
}

// ==============================================
// LIMPEZA E PERFORMANCE
// ==============================================
window.addEventListener('beforeunload', function() {
    // Limpar observers
    if (intersectionObserver) {
        intersectionObserver.disconnect();
    }
    
    console.log('🧹 Cleanup executado');
});

// ==============================================
// EXPORT PARA TESTES (se necessário)
// ==============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        joinWhatsApp,
        isValidWhatsAppLink,
        getDeviceInfo,
        copyToClipboard
    };
}

console.log('🎯 JavaScript carregado com sucesso!');
