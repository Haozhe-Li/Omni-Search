function switchLanguage(lang, triggerRefresh = false) {
    const translations = {
        en: {
            title: "Omni Knows X.Y.Z.",
            footer: "Omni Search",
            searchButton: "Search",
            searchPlaceholder: "Got any questions?"
        },
        zh: {
            title: "奥秘尽知",
            footer: "奥秘搜索",
            searchButton: "搜索",
            searchPlaceholder: "想问些什么？"
        }
    };

    localStorage.setItem('language', lang);

    const titleLink = document.querySelector("h1.gradient-title a");
    if (titleLink && translations[lang]) {
        titleLink.textContent = translations[lang].title;
    }

    const footerLink = document.querySelector("footer a[href='/']");
    if (footerLink && translations[lang]) {
        footerLink.textContent = translations[lang].footer;
    }

    const searchButtonSpan = document.querySelector("#search-button span");
    if (searchButtonSpan && translations[lang]) {
        searchButtonSpan.textContent = translations[lang].searchButton;
    }

    const searchInput = document.getElementById("search-input");
    if (searchInput && translations[lang]) {
        searchInput.placeholder = translations[lang].searchPlaceholder;
    }

    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = lang;
    }

    if (triggerRefresh) {
        location.reload();
    }
}

(function initializeLanguage() {
    let lang = localStorage.getItem('language');

    if (!lang) {
        const userLang = navigator.language || navigator.userLanguage;
        lang = userLang.includes('zh') ? 'zh' : 'en';
    }
    switchLanguage(lang);
})();