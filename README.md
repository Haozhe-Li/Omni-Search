# Omni Search

Omni Search is an AI-powered search engine that leverages cutting-edge APIs to provide detailed, context-rich answers based on web search results and AI synthesis. With support for multiple languages and a clean, responsive interface, Omni Search makes finding answers fast and easy.

## Features

- **AI-Powered Answers:** Combines web search data with AI synthesis for accurate and comprehensive responses.
- **Multi-Language Support:** Automatically detects and translates between English and Chinese queries.
- **Dynamic UI:** Provides real-time feedback with progress indicators and animated search suggestions.
- **Cache & Retry Mechanism:** Implements caching for search queries and retry logic to enhance result quality.
- **Markdown Formatting:** Displays search results with markdown formatting and in-text citations.

## Project Structure

- **Backend**
  - [`app.py`](app.py): The Flask application that serves the web interface and search endpoint.
  - [`core.py`](core.py): Contains the `AISearch` class responsible for handling search requests, breaking down queries, synthesizing answers, and performing web searches.
  - [`requirements.txt`](requirements.txt): Lists project dependencies including Flask, OpenAI, and Tavily.

- **Frontend**
  - [`templates/index.html`](templates/index.html): HTML template for the web UI.
  - [`static/styles.css`](static/styles.css): CSS styles for a sleek, responsive design.
  - [`static/script.js`](static/script.js): Handles client-side interactions, API requests, and dynamic UI updates.
  - [`static/language.js`](static/language.js): JavaScript logic for handling language switching.
  - Static image assets and icons under [`static/img/`](static/img/).

- **Deployment**
  - [`vercel.json`](vercel.json): Configuration file for deploying the project on Vercel.

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/omni-search.git
   cd omni-search

2. **Set up a virtual environment and install dependencies:**
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
3. **Set Environment Variables**
4. **Start the App**
    ```sh
    python3 app.py

