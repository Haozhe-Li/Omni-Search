document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")
  // const modeButton = document.getElementById("mode-button")
  // const modeText = document.getElementById("mode-text")
  const dropdownMenu = document.getElementById("dropdown-menu")
  const suggestionsContainer = document.getElementById("suggestions")
  const loadingContainer = document.getElementById("loading-container")
  const progressFill = document.getElementById("progress-fill")
  const loadingText = document.getElementById("loading-text")
  const resultContainer = document.getElementById("result-container")

  // let searchMode = "quick"
  const suggestedQueries = [
    "Best TV shows 2025?",
    "Healthiest cooking oils?",
    "Latest AI developments",
    "Climate change solutions",
  ]

  // Populate suggested queries
  suggestedQueries.forEach((query) => {
    const chip = document.createElement("button")
    chip.className = "suggestion-chip"
    chip.textContent = query
    chip.addEventListener("click", () => {
      searchInput.value = query
    })
    suggestionsContainer.appendChild(chip)
  })

  // Load last search result if available
  const lastQuery = localStorage.getItem("lastSearchQuery")
  const lastResult = localStorage.getItem("lastSearchResult")
  if (lastQuery && lastResult) {
    searchInput.value = lastQuery
    resultContainer.style.display = "block"
    resultContainer.innerHTML = marked.parse(lastResult)
  }

  // // Toggle dropdown menu
  // modeButton.addEventListener("click", () => {
  //   dropdownMenu.style.display = dropdownMenu.style.display === "none" ? "block" : "none"
  // })

  // // Handle mode selection
  // dropdownMenu.addEventListener("click", (event) => {
  //   if (event.target.classList.contains("dropdown-item")) {
  //     searchMode = event.target.dataset.mode
  //     modeText.textContent = searchMode === "quick" ? "Quick" : "omni"
  //     dropdownMenu.style.display = "none"
  //   }
  // })

  // Handle search
  function handleSearch() {
    const query = searchInput.value.trim()
    if (!query) return
  
    loadingContainer.style.display = "block"
    resultContainer.style.display = "none"
    progressFill.style.width = "0%"
  
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      progressFill.style.width = `${progress}%`
      if (progress < 20) {
        loadingText.textContent = "Understanding your questions..."
      }
      if (progress >= 20) {
        loadingText.textContent = "Searching the web..."
      }
      if (progress >= 50) {
        loadingText.textContent = "Reasoning over results..."
      }
      if (progress >= 70) {
        loadingText.textContent = "Generating summary..."
      }
      if (progress >= 90) {
        clearInterval(interval)
        loadingText.textContent = "Performing final checks..."
      }
    }, 2500)
  
    // Updated API call to /search using POST and JSON body
    fetch(`/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: query })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        clearInterval(interval)
        loadingContainer.style.display = "none"
        resultContainer.style.display = "block"
        resultContainer.innerHTML = marked.parse(data.result)
        // Store current query and result in localStorage
        localStorage.setItem("lastSearchQuery", query)
        localStorage.setItem("lastSearchResult", data.result)
      })
      .catch((error) => {
        clearInterval(interval)
        loadingContainer.style.display = "none"
        resultContainer.style.display = "block"
        resultContainer.innerHTML = `<p>Error fetching results: ${error.message}</p>`
        console.error(error)
      })
  }
  
  searchButton.addEventListener("click", handleSearch)
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSearch()
    }
  })
})