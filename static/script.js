document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input")
    const searchButton = document.getElementById("search-button")
    const suggestionsContainer = document.getElementById("suggestions")
    const loadingContainer = document.getElementById("loading-container")
    const progressFill = document.getElementById("progress-fill")
    const loadingText = document.getElementById("loading-text")
    const resultContainer = document.getElementById("result-container")
    const modeToggle = document.getElementById("mode-toggle")
    const slider = document.querySelector(".mode-toggle-label .slider")

    const language = localStorage.getItem("language")
    let mode = localStorage.getItem("mode") || "fast"
    modeToggle.checked = mode === "universal"

    if (mode === "universal") {
        slider.style.background = "linear-gradient(90deg, #FF7E5F, #6f99e9)"
    } else {
        slider.style.backgroundColor = "#20818e"
    }

    function updateDescriptionText() {
        const description = document.getElementById('description-mode')
        const isUniversalMode = modeToggle.checked

        description.classList.remove('update')
        void description.offsetWidth
        description.classList.add('update')

        if (language === 'zh') {
            description.textContent = isUniversalMode ?
                "全面解析，深度挖掘每个细节以及3X更多来源。" :
                "快速响应，即时提供必要答案。"
        } else {
            description.textContent = isUniversalMode ?
                "Comprehensive insights with in-depth exploration of every detail and 3X more sources." :
                "Lightning-fast responses with essential answers in an instant."
        }
    }

    modeToggle.addEventListener("change", () => {
        mode = modeToggle.checked ? "universal" : "fast"
        localStorage.setItem("mode", mode)
        if (mode === "universal") {
            slider.style.background = "linear-gradient(90deg, #FF7E5F, #6f99e9)"
        } else {
            slider.style.background = "#20818e"
        }
        updateDescriptionText()
    })

    updateDescriptionText()

    function getSuggestion() {
        fetch(`/getsuggestion?language=${language}`, { method: "GET" })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                return response.json()
            })
            .then(suggestions => {
                const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3)
                randomSuggestions.forEach(query => {
                    const chip = document.createElement("button")
                    chip.className = "suggestion-chip"
                    chip.textContent = query
                    chip.addEventListener("click", () => {
                        searchInput.value = query
                        handleSearch()
                    })
                    suggestionsContainer.appendChild(chip)
                })
            })
            .catch(error => console.error("Failed to load suggestions:", error))
    }

    getSuggestion();

    // const lastQuery = localStorage.getItem("lastSearchQuery")
    const lastResult = localStorage.getItem("lastSearchResult")
    if (lastResult) {
        resultContainer.style.display = "block"
        resultContainer.innerHTML = marked.parse(lastResult)
    }

    function typeWriterEffect(text, element, speed, callback) {
        element.textContent = ""
        let i = 0
        const timer = setInterval(() => {
            element.textContent += text.charAt(i)
            i++
            if (i >= text.length) {
                clearInterval(timer)
                if (callback) callback()
            }
        }, speed)
        return timer
    }

    function handleSearch() {

        const query = searchInput.value.trim();
        if (!query) return;

        searchButton.disabled = true;
        searchButton.classList.add("loading");

        suggestionsContainer.style.display = "none";
        resultContainer.style.display = "block";

        suggestionsContainer.innerHTML = "";
        getSuggestion();

        const placeholderContent = `You've found a hidden gem—or rather, a completely meaningless placeholder text! This section doesn’t actually contain any real information. It's just here to fill space while we work on something awesome.
Maybe it's a secret code? Maybe it's an elaborate inside joke? Or maybe… it’s just text with no purpose at all. Who knows? The possibilities are endless (but probably not).
For now, enjoy this completely random piece of text. If you were expecting something insightful, we’re sorry to disappoint—but hey, at least you found a cool little Easter egg!
Stay tuned for actual content coming soon. Or don’t. Either way, thanks for stopping by!`;
        resultContainer.style.filter = "blur(5px)";
        resultContainer.style.transition = "filter 1s ease-out";
        resultContainer.style.userSelect = "none";

        const speed = mode === "universal" ? 50 : 10;
        const placeholderTimer = typeWriterEffect(placeholderContent, resultContainer, speed);

        loadingContainer.style.display = "block";
        progressFill.style.width = "0%";

        if (mode == "universal") {
            loadingText.textContent = language === 'zh' ? "正在全面搜索结果中，请稍等，预计需要 10-15 秒..." : "Performing a comprehensive search, please wait, it may take 10-15 seconds...";
        } else {
            loadingText.textContent = language === 'zh' ? "正在极速查询" : "Performing a lightning-fast search";
        }

        fetch(`/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: query, mode: mode })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                clearInterval(placeholderTimer);
                resultContainer.textContent = "";
                suggestionsContainer.style.display = "";
                resultContainer.innerHTML = marked.parse(data.result);
                resultContainer.style.userSelect = "";
                // localStorage.setItem("lastSearchQuery", query);
                localStorage.setItem("lastSearchResult", data.result);
                searchInput.value = "";
                loadingContainer.style.display = "none";
                requestAnimationFrame(() => {
                    resultContainer.style.filter = "blur(0px)";
                });

                const codeBlocks = resultContainer.querySelectorAll('pre code');
                codeBlocks.forEach(block => {
                    hljs.highlightElement(block);
                });
                searchButton.disabled = false;
                searchButton.classList.remove("loading");
            })
            .catch(error => {
                clearInterval(placeholderTimer);
                suggestionsContainer.style.display = "";
                loadingContainer.style.display = "none";
                resultContainer.style.filter = "none";
                resultContainer.innerHTML = `<p>Error fetching results: ${error.message}</p>`;
                console.error(error);
                searchButton.disabled = false;
                searchButton.classList.remove("loading");
            });
    }

    searchButton.addEventListener("click", handleSearch)
})

function startOver() {
    localStorage.removeItem("lastSearchQuery");
    localStorage.removeItem("lastSearchResult");
    location.reload();
}