// Yeni merkezi formatlama modülü
export const formatters = {
  number: (num) => {
    if (!num) return "0";
    num = parseInt(num);
    
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },
  
  currency: (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  },
  
  date: (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  channelAge: (publishedAt) => {
    if (!publishedAt) return 'Bilinmiyor';
    
    const publishDate = new Date(publishedAt);
    const now = new Date();
    const yearDiff = now.getFullYear() - publishDate.getFullYear();
    const monthDiff = now.getMonth() - publishDate.getMonth();
    
    if (monthDiff < 0) return `${yearDiff - 1} yıl ${monthDiff + 12} ay`;
    if (monthDiff === 0) return `${yearDiff} yıl`;
    return `${yearDiff} yıl ${monthDiff} ay`;
  }
}; 