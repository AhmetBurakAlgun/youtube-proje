/**
 * Kategori isimleri ve çevirileri
 */

// Kategori isimleri
const CATEGORIES = {
    NEWS: 'News',
    EDUCATION: 'Education',
    FINANCE: 'Finance',
    GAMING: 'Gaming',
    TECH: 'Tech',
    ENTERTAINMENT: 'Entertainment',
    VLOG: 'Vlog',
    SPORTS: 'Sports',
    BEAUTY: 'Beauty',
    COOKING: 'Cooking',
    UNCATEGORIZED: 'Uncategorized'
};

// Kategori Türkçe çevirileri
const CATEGORY_TRANSLATIONS = {
    [CATEGORIES.NEWS]: 'Haber',
    [CATEGORIES.EDUCATION]: 'Eğitim',
    [CATEGORIES.FINANCE]: 'Finans',
    [CATEGORIES.GAMING]: 'Oyun',
    [CATEGORIES.TECH]: 'Teknoloji',
    [CATEGORIES.ENTERTAINMENT]: 'Eğlence',
    [CATEGORIES.VLOG]: 'Vlog',
    [CATEGORIES.SPORTS]: 'Spor',
    [CATEGORIES.BEAUTY]: 'Güzellik',
    [CATEGORIES.COOKING]: 'Yemek',
    [CATEGORIES.UNCATEGORIZED]: 'Kategorisiz'
};

module.exports = {
    CATEGORIES,
    CATEGORY_TRANSLATIONS
}; 