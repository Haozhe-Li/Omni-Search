document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")
  const suggestionsContainer = document.getElementById("suggestions")
  const loadingContainer = document.getElementById("loading-container")
  const progressFill = document.getElementById("progress-fill")
  const loadingText = document.getElementById("loading-text")
  const resultContainer = document.getElementById("result-container")
  const modeToggle = document.getElementById("mode-toggle")
  // 获取滑块元素
  const slider = document.querySelector(".mode-toggle-label .slider")
  
  // 读取用户选择的语言
  const language = localStorage.getItem("language")
  
  // 当用户未选择模式时，默认选择 "fast"
  let mode = localStorage.getItem("mode") || "fast"
  
  // 初始化模式切换按钮状态
  modeToggle.checked = mode === "universal"
  
  // 初始化滑块颜色
  if (mode === "universal") {
      slider.style.background = "linear-gradient(90deg, #FF7E5F, #6f99e9)"  // 全能模式渐变色
  } else {
      slider.style.backgroundColor = "#20818e"  // 快速模式淡蓝色
  }

  // 监听模式切换
  modeToggle.addEventListener("change", () => {
      mode = modeToggle.checked ? "universal" : "fast"
      localStorage.setItem("mode", mode)
      if (mode === "universal") {
          slider.style.background = "linear-gradient(90deg, #FF7E5F, #6f99e9)"
      } else {
          slider.style.background = "#20818e"
      }
  })

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

  // 随机选取6个建议
  const randomSuggestions = suggestedQueries
    .sort(() => 0.5 - Math.random())
    .slice(0, 6)

  // 填充建议按钮；点击后立即触发搜索
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

  // 如果存在上一次搜索结果则加载
  const lastQuery = localStorage.getItem("lastSearchQuery")
  const lastResult = localStorage.getItem("lastSearchResult")
  if (lastQuery && lastResult) {
    searchInput.value = lastQuery
    resultContainer.style.display = "block"
    resultContainer.innerHTML = marked.parse(lastResult)
  }

  // 打字机效果函数，返回定时器ID
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

  // 处理搜索
  function handleSearch() {
    const query = searchInput.value.trim()
    if (!query) return

    // 隐藏建议栏，显示结果容器
    suggestionsContainer.style.display = "none"
    resultContainer.style.display = "block"

    const placeholderContent = `    The user is asking about ${query}. To do this we begin by analyzing your query and gathering all the relevant details necessary to provide a clear and concise answer. Our system is currently processing your request, understanding the underlying context, and coordinating resources to deliver the best possible response. We understand that your inquiry is important and requires a thoughtful approach, so we are actively working behind the scenes.
    
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
        clearInterval(progressInterval)
        loadingText.textContent = "Performing final checks..."
      }
    }, 2500)

    // 发起搜索请求，携带mode参数
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
      .then((data) => {
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
        codeBlocks.forEach((block) => {
          hljs.highlightElement(block)
        })
      })
      .catch((error) => {
        clearInterval(placeholderTimer)
        loadingContainer.style.display = "none"
        resultContainer.style.filter = "none"
        resultContainer.innerHTML = `<p>Error fetching results: ${error.message}</p>`
        console.error(error)
      })
  }

  searchButton.addEventListener("click", handleSearch)
})