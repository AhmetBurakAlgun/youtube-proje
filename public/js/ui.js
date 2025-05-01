import {
  formatNumber,
  formatMoney,
  generateChannelColors,
  formatPublishDate,
  calculateChannelAge
} from './utils.js';
import ErrorHandler from './errorHandler.js';

// DOM elementlerini cache'leme
const DOMCache = {
  elements: {},
  get: function(id) {
    if (!this.elements[id]) {
      this.elements[id] = document.getElementById(id);
    }
    return this.elements[id];
  }
};

// UI state yönetimi
const UIState = {
  isLoading: false,
  currentChannel: null,
  setLoading: function(state) {
    this.isLoading = state;
    const loadingElement = DOMCache.get('loading');
    if (loadingElement) {
      loadingElement.style.display = state ? 'block' : 'none';
    }
  }
};

// Event delegation için container
const setupEventDelegation = () => {
  const container = DOMCache.get('results');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('.copy-button')) {
      handleCopyClick(target);
    } else if (target.matches('.share-button')) {
      handleShareClick(target);
    }
  });
};

// Copy işlemi
const handleCopyClick = (button) => {
  const text = button.dataset.copyText;
  if (text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        const originalText = button.textContent;
        button.textContent = 'Kopyalandı!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      })
      .catch(err => console.error('Kopyalama hatası:', err));
  }
};

// Share işlemi
const handleShareClick = (button) => {
  const shareData = {
    title: button.dataset.shareTitle,
    text: button.dataset.shareText,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData)
      .catch(err => console.error('Paylaşım hatası:', err));
  }
};

// Progressive rendering için chunk işleme
const processInChunks = (items, chunkSize, processFn) => {
  let index = 0;
  
  const processChunk = () => {
    const chunk = items.slice(index, index + chunkSize);
    chunk.forEach(processFn);
    index += chunkSize;
    
    if (index < items.length) {
      requestAnimationFrame(processChunk);
    }
  };
  
  processChunk();
};

// UI hataları için hata yönetimi
const handleUIError = (error, context = {}) => {
  return ErrorHandler.handleError(error, ErrorHandler.CATEGORIES.UI, ErrorHandler.LEVELS.ERROR, context);
};

// Loading göstergesi
export const showLoading = () => {
  try {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
  } catch (error) {
    handleUIError(error, { action: 'showLoading' });
  }
};

export const hideLoading = () => {
  try {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  } catch (error) {
    handleUIError(error, { action: 'hideLoading' });
  }
};

// Hata mesajı
export const showError = (message) => {
  try {
    const errorElement = document.getElementById('error-container');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
  } catch (error) {
    handleUIError(error, { action: 'showError', message });
  }
};

// Sonuçları sıfırlama
export const resetResults = () => {
  try {
    const resultsContainer = document.getElementById('results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
    }
  } catch (error) {
    handleUIError(error, { action: 'resetResults' });
  }
};

// Arama animasyonu
export const applySearchAnimation = () => {
  try {
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
      searchButton.classList.add('searching');
      setTimeout(() => {
        searchButton.classList.remove('searching');
      }, 1000);
    }
  } catch (error) {
    handleUIError(error, { action: 'applySearchAnimation' });
  }
};

// Kanal bilgilerini gösterme
export const displayChannelInfo = (channelData) => {
  try {
    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) {
      throw new Error('Results container not found');
    }

    const channelColor = generateChannelColors(channelData.channelTitle);
    
    // Progressive rendering için veriyi chunk'lara böl
    const chunks = [
      { type: 'header', data: channelData },
      { type: 'stats', data: channelData },
      { type: 'earnings', data: channelData },
      { type: 'description', data: channelData }
    ];

    processInChunks(chunks, 1, (chunk) => {
      const element = createChunkElement(chunk);
      if (element) {
        resultsContainer.appendChild(element);
      }
    });
  } catch (error) {
    handleUIError(error, { action: 'displayChannelInfo', channelData });
  }
};

// Chunk element oluşturma
const createChunkElement = (chunk) => {
  const { type, data } = chunk;
  
  switch (type) {
    case 'header':
      return createHeaderElement(data);
    case 'stats':
      return createStatsElement(data);
    case 'earnings':
      return createEarningsElement(data);
    case 'description':
      return createDescriptionElement(data);
    default:
      return null;
  }
};

// Header element oluşturma
const createHeaderElement = (data) => {
  const header = document.createElement('div');
  header.className = 'channel-header';
  header.innerHTML = `
    <h2 style="color: ${generateChannelColors(data.channelTitle)}">${data.channelTitle}</h2>
    <div class="channel-meta">
      <span class="channel-age">${calculateChannelAge(data.publishedAt)}</span>
      <span class="channel-country">${data.country || 'Bilinmiyor'}</span>
    </div>
  `;
  return header;
};

// Stats element oluşturma
const createStatsElement = (data) => {
  const stats = document.createElement('div');
  stats.className = 'channel-stats';
  stats.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Aboneler</span>
      <span class="stat-value">${formatNumber(data.subscriberCount)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">İzlenme</span>
      <span class="stat-value">${formatNumber(data.viewCount)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Video</span>
      <span class="stat-value">${formatNumber(data.videoCount)}</span>
    </div>
  `;
  return stats;
};

// Earnings element oluşturma
const createEarningsElement = (data) => {
  const earnings = document.createElement('div');
  earnings.className = 'channel-earnings';
  earnings.innerHTML = `
    <h3>Tahmini Kazanç</h3>
    <div class="earnings-grid">
      <div class="earnings-item">
        <span class="earnings-label">Günlük</span>
        <span class="earnings-value">${formatMoney(data.earnings.daily.estimated)}</span>
      </div>
      <div class="earnings-item">
        <span class="earnings-label">Haftalık</span>
        <span class="earnings-value">${formatMoney(data.earnings.weekly.estimated)}</span>
      </div>
      <div class="earnings-item">
        <span class="earnings-label">Aylık</span>
        <span class="earnings-value">${formatMoney(data.earnings.monthly.estimated)}</span>
      </div>
      <div class="earnings-item">
        <span class="earnings-label">Yıllık</span>
        <span class="earnings-value">${formatMoney(data.earnings.yearly.estimated)}</span>
      </div>
    </div>
  `;
  return earnings;
};

// Description element oluşturma
const createDescriptionElement = (data) => {
  const description = document.createElement('div');
  description.className = 'channel-description';
  description.innerHTML = `
    <h3>Kanal Açıklaması</h3>
    <p>${data.channelDescription || 'Açıklama bulunamadı'}</p>
  `;
  return description;
};

// Event delegation'ı başlat
setupEventDelegation();

export {
  showLoading,
  hideLoading,
  showError,
  resetResults,
  applySearchAnimation,
  displayChannelInfo
}; 