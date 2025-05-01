// Hata yönetimi ve loglama sistemi
const ErrorHandler = {
    // Hata seviyeleri
    LEVELS: {
        DEBUG: 'DEBUG',
        INFO: 'INFO',
        WARNING: 'WARNING',
        ERROR: 'ERROR',
        CRITICAL: 'CRITICAL'
    },

    // Hata kategorileri
    CATEGORIES: {
        API: 'API',
        NETWORK: 'NETWORK',
        UI: 'UI',
        CACHE: 'CACHE',
        VALIDATION: 'VALIDATION',
        SYSTEM: 'SYSTEM'
    },

    // Hata mesajları
    MESSAGES: {
        API_ERROR: 'API isteği başarısız oldu',
        NETWORK_ERROR: 'Ağ bağlantısı hatası',
        CACHE_ERROR: 'Önbellek işlemi başarısız',
        VALIDATION_ERROR: 'Geçersiz veri',
        SYSTEM_ERROR: 'Sistem hatası',
        UNKNOWN_ERROR: 'Bilinmeyen hata'
    },

    // Hata logları
    logs: [],

    // Maksimum log sayısı
    MAX_LOGS: 1000,

    // Hata yakalama
    handleError(error, category = 'SYSTEM', level = 'ERROR', context = {}) {
        const errorData = {
            timestamp: new Date().toISOString(),
            level,
            category,
            message: error.message || this.MESSAGES.UNKNOWN_ERROR,
            stack: error.stack,
            context
        };

        // Log kaydı
        this.log(errorData);

        // Kullanıcıya gösterilecek hata mesajı
        const userMessage = this.getUserFriendlyMessage(error, category);
        
        // UI'da hata gösterimi
        this.showErrorToUser(userMessage);

        // Kritik hataları sunucuya raporla
        if (level === this.LEVELS.CRITICAL) {
            this.reportToServer(errorData);
        }

        return errorData;
    },

    // Log kaydı
    log(errorData) {
        this.logs.push(errorData);
        
        // Maksimum log sayısını aşmamak için eski logları temizle
        if (this.logs.length > this.MAX_LOGS) {
            this.logs = this.logs.slice(-this.MAX_LOGS);
        }

        // Console'a log
        console.error(`[${errorData.level}] ${errorData.category}: ${errorData.message}`, errorData);
    },

    // Kullanıcı dostu hata mesajı
    getUserFriendlyMessage(error, category) {
        switch (category) {
            case this.CATEGORIES.API:
                return 'YouTube API ile iletişimde bir sorun oluştu. Lütfen daha sonra tekrar deneyin.';
            case this.CATEGORIES.NETWORK:
                return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
            case this.CATEGORIES.CACHE:
                return 'Veriler yüklenirken bir sorun oluştu. Sayfayı yenileyip tekrar deneyin.';
            case this.CATEGORIES.VALIDATION:
                return 'Lütfen geçerli bir kanal adı girin.';
            case this.CATEGORIES.SYSTEM:
                return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
            default:
                return 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        }
    },

    // UI'da hata gösterimi
    showErrorToUser(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            
            // 5 saniye sonra hata mesajını gizle
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    },

    // Sunucuya hata raporu gönder
    async reportToServer(errorData) {
        try {
            const response = await fetch('/api/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorData)
            });

            if (!response.ok) {
                console.error('Hata raporu gönderilemedi:', response.status);
            }
        } catch (error) {
            console.error('Hata raporu gönderilirken sorun oluştu:', error);
        }
    },

    // Hata istatistiklerini getir
    getErrorStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byCategory: {},
            recentErrors: this.logs.slice(-10)
        };

        // Seviye bazında istatistikler
        Object.values(this.LEVELS).forEach(level => {
            stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
        });

        // Kategori bazında istatistikler
        Object.values(this.CATEGORIES).forEach(category => {
            stats.byCategory[category] = this.logs.filter(log => log.category === category).length;
        });

        return stats;
    }
};

// Global hata yakalayıcı
window.onerror = function(message, source, lineno, colno, error) {
    ErrorHandler.handleError(error || new Error(message), 'SYSTEM', 'CRITICAL', {
        source,
        lineno,
        colno
    });
    return true;
};

// Promise hata yakalayıcı
window.onunhandledrejection = function(event) {
    ErrorHandler.handleError(event.reason, 'SYSTEM', 'ERROR');
    return true;
};

export default ErrorHandler; 