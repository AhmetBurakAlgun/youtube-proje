// Sayı formatlama fonksiyonları
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatNumberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatMoney(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
}

// Kanal renkleri oluşturma
function generateChannelColors(channelName) {
  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
    '#00FFFF', '#FFA500', '#800080', '#008000', '#000080'
  ];
  
  const hash = channelName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

// Tarih formatlama
function formatPublishDate(publishedAt) {
  const date = new Date(publishedAt);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Kanal yaşı hesaplama
function calculateChannelAge(publishedAt) {
  const startDate = new Date(publishedAt);
  const now = new Date();
  const diffTime = Math.abs(now - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffYears = Math.floor(diffDays / 365);
  const remainingDays = diffDays % 365;
  
  if (diffYears > 0) {
    return `${diffYears} yıl${diffYears > 1 ? '' : ''}${remainingDays > 0 ? ` ${remainingDays} gün` : ''}`;
  }
  return `${diffDays} gün`;
}

export {
  formatNumber,
  formatNumberWithCommas,
  formatMoney,
  generateChannelColors,
  formatPublishDate,
  calculateChannelAge
}; 