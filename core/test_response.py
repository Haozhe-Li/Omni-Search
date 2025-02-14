# import requests
# sample_markdown_src = "https://cdn.jsdelivr.net/gh/Haozhe-Li/Omni-Search@main/README.md"
# markdown_content = requests.get(sample_markdown_src).text

def get_sample_response():
    return """### 概览

本文档提供了一个 Markdown 示例，展示了如何使用不同的格式特性。示例中包含 bullet list、表格、inline code、code block 以及 LaTeX 数学公式。以下是主要内容：

- 使用 `inline code` 标记代码片段。
- 支持多种文本格式，如加粗和斜体。
- 整合代码块，可用于展示实际代码示例。

下表展示了一个简单的示例：

| 项目名称 | 描述           |
| -------- | -------------- |
| 模块A    | 示例模块说明   |
| 模块B    | 另一个示例说明 |

下面是一段 Python 代码示例：
```python
def greet(name):
    print(f"Hello, {name}!")
```
"""