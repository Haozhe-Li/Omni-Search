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

    fetch(`/getsuggestion?language=${language}`, { method: "GET" })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
        })
        .then(suggestions => {
            const randomSuggestions = suggestions
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

    const lastQuery = localStorage.getItem("lastSearchQuery")
    const lastResult = localStorage.getItem("lastSearchResult")
    if (lastQuery && lastResult) {
        searchInput.value = lastQuery
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
        const query = searchInput.value.trim()
        if (!query) return

        suggestionsContainer.style.display = "none"
        resultContainer.style.display = "block"

        const placeholderContent = `The user is asking about ${query}. To do this we begin by analyzing your query and gathering all the relevant details necessary to provide a clear and concise answer. Our system is currently processing your request, understanding the underlying context, and coordinating resources to deliver the best possible response. We understand that your inquiry is important and requires a thoughtful approach, so we are actively working behind the scenes.

During this brief waiting period, our algorithm is parsing your question and reviewing the latest data to ensure the response is accurate and comprehensive. Our multi-step process involves evaluating similar queries, consulting updated resources, and generating insights tailored to your specific needs. This helps us simulate a conversational tone that is presently engaging and closely aligned with your expectations.

While you see this placeholder text, we are effectively “reasoning” with our advanced AI, drawing on a vast repository of information. Our goal is to create a final output that not only matches your query but exceeds your expectations by providing contextual clarity and actionable insights. Please hold on just a moment as we complete the final steps of our processing. We appreciate your patience and are confident that your inquiry about ${query} will soon reveal a well-rounded and insightful result.
        `

        resultContainer.style.filter = "blur(5px)"
        resultContainer.style.transition = "filter 1s ease-out"
        resultContainer.style.userSelect = "none"

        const placeholderTimer = typeWriterEffect(placeholderContent, resultContainer, 50)

        loadingContainer.style.display = "block"
        progressFill.style.width = "0%"

        let progress = 0
        const progressInterval = setInterval(() => {
            progress += 10
            progressFill.style.width = `${progress}%`
            if (progress < 20) {
                loadingText.textContent = "Understanding your query..."
            } else if (progress < 50) {
                loadingText.textContent = "Searching the web..."
            } else if (progress < 70) {
                loadingText.textContent = "Reasoning with AI..."
            } else if (progress < 90) {
                loadingText.textContent = "Pulling things together..."
            } else {
                clearInterval(progressInterval)
                loadingText.textContent = "Performing final checks..."
            }
        }, 2500)

        fetch(`/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: query, mode: mode })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                return response.json()
            })
            .then(data => {
                clearInterval(placeholderTimer)
                resultContainer.textContent = ""
                resultContainer.innerHTML = marked.parse(data.result)
                resultContainer.style.userSelect = ""
                localStorage.setItem("lastSearchQuery", query)
                localStorage.setItem("lastSearchResult", data.result)
                loadingContainer.style.display = "none"
                requestAnimationFrame(() => {
                    resultContainer.style.filter = "blur(0px)"
                })

                const codeBlocks = resultContainer.querySelectorAll('pre code')
                codeBlocks.forEach(block => {
                    hljs.highlightElement(block)
                })
            })
            .catch(error => {
                clearInterval(placeholderTimer)
                loadingContainer.style.display = "none"
                resultContainer.style.filter = "none"
                resultContainer.innerHTML = `<p>Error fetching results: ${error.message}</p>`
                console.error(error)
            })
    }

    searchButton.addEventListener("click", handleSearch)
})