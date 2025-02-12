import requests
sample_markdown_src = "https://cdn.jsdelivr.net/gh/Haozhe-Li/Omni-Search@main/README.md"
markdown_content = requests.get(sample_markdown_src).text

def get_sample_response():
    return markdown_content