document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")
  const dropdownMenu = document.getElementById("dropdown-menu")
  const suggestionsContainer = document.getElementById("suggestions")
  const loadingContainer = document.getElementById("loading-container")
  const progressFill = document.getElementById("progress-fill")
  const loadingText = document.getElementById("loading-text")
  const resultContainer = document.getElementById("result-container")

  const language = localStorage.getItem("language")
  
  const suggestedQueries = language === "zh" ? [
    "今年最好的电视节目？",
    "必看10大电影",
    "如何学编程？",
    "2025年的最佳旅行地",
    "晚餐健康食谱",
    "最新科技新闻",
    "如何创业？",
    "远程办公小贴士",
    "必读好书推荐",
    "如何冥想？",
    "如何提升效率？",
    "最佳健身方案",
    "如何省钱？",
    "2025年热门数码产品",
    "如何学习新语言？",
    "优质在线课程",
    "如何保持动力？",
    "改善睡眠的技巧",
    "如何高效管理时间？",
    "最佳投资策略",
    "如何搭建网站？",
    "热门编程语言推荐",
    "如何保持健康？",
    "必听播客推荐",
    "如何改善心理健康？",
    "高效工具应用推荐",
    "如何写简历？",
    "面试技巧分享",
    "如何开启博客？",
    "放松身心的妙招"
  ] : [
    "Best TV shows for this year?",
    "Top 10 movies to watch",
    "How to learn programming?",
    "Best places to travel in 2025",
    "Healthy recipes for dinner",
    "Latest tech news",
    "How to start a business?",
    "Tips for remote work",
    "Best books to read",
    "How to meditate?",
    "How to improve productivity?",
    "Best workout routines",
    "How to save money?",
    "Top 10 gadgets of 2025",
    "How to learn a new language?",
    "Best online courses",
    "How to stay motivated?",
    "Tips for better sleep",
    "How to manage time effectively?",
    "Best investment strategies",
    "How to build a website?",
    "Best programming languages to learn",
    "How to stay healthy?",
    "Top 10 podcasts to listen to",
    "How to improve mental health?",
    "Best productivity apps",
    "How to write a resume?",
    "Tips for job interviews",
    "How to start a blog?",
    "Best ways to relax",
  ]

  // Randomly select 6 suggestions from the array
  const randomSuggestions = suggestedQueries
    .sort(() => 0.5 - Math.random())
    .slice(0, 6)

  // Populate suggested queries as chips; clicking immediately triggers a search
  randomSuggestions.forEach((query) => {
    const chip = document.createElement("button")
    chip.className = "suggestion-chip"
    chip.textContent = query
    chip.addEventListener("click", () => {
      searchInput.value = query
      handleSearch()
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

  // Handle search
  function handleSearch() {
    const query = searchInput.value.trim()
    if (!query) return

    // 隐藏建议栏
    suggestionsContainer.style.display = "none"

    // 显示搜索结果占位文本并加上高斯模糊效果
    resultContainer.style.display = "block"
    resultContainer.innerHTML = `
      <h1>What is Omni Search</h1>
      <p style="padding: 20px;">
        Omni search is a powerful search engine that uses the latest AI technology to provide you with the most relevant information on the web.
        By doing so, we aim to make it easier for you to find the answers you need, when you need them.
      </p>
      <h2>How to use Omni Search</h2>
      <p style="padding: 20px;">
        To use Omni Search, simply type your question in the search bar above and press the search button.
        Our AI will then search the web for the most relevant information and present it to you in an easy-to-read format.
      </p>
      <h2>Why use Omni Search</h2>
      <p style="padding: 20px;">
        Omni Search is designed to help you find the answers you need quickly and easily.
        Whether you're looking for information on a specific topic or just want to learn something new, Omni Search has you covered.
      </p>
    `
    resultContainer.style.filter = "blur(5px)"

    // 显示进度条
    loadingContainer.style.display = "block"
    progressFill.style.width = "0%"

    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      progressFill.style.width = `${progress}%`
      if (progress < 20) {
        loadingText.textContent = "Understanding your query..."
      }
      if (progress >= 20) {
        loadingText.textContent = "Searching the web..."
      }
      if (progress >= 50) {
        loadingText.textContent = "Reasoning with AI..."
      }
      if (progress >= 70) {
        loadingText.textContent = "Pulling things together..."
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
        // 移除模糊效果，展示实际内容
        resultContainer.style.filter = "none"


        localStorage.setItem("lastSearchQuery", query)
        localStorage.setItem("lastSearchResult", data.result)
        resultContainer.innerHTML = marked.parse(data.result)

        const codeBlocks = resultContainer.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
          hljs.highlightElement(block);
        });
      })
      .catch((error) => {
        clearInterval(interval)
        loadingContainer.style.display = "none"
        resultContainer.style.filter = "none"
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