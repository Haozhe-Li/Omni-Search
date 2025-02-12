import random

chinese_suggestion = [
    "什么时候是最佳旅行时间？",  # When
    "如何学习一门新语言？",      # How
    "谁是最伟大的科学家？",      # Who
    "在哪里可以找到最好的咖啡？", # Where
    "什么是区块链技术？",        # What
    "为什么天空是蓝色的？",      # Why
    "什么时候开始投资最好？",    # When
    "如何提高工作效率？",        # How
    "谁发明了电灯？",           # Who
    "在哪里可以学习编程？",       # Where
    "什么是人工智能？",          # What
    "为什么我们需要睡眠？",      # Why
    "什么时候是购买股票的最佳时机？", # When
    "如何保持健康的生活方式？",   # How
    "谁是最有名的音乐家？",      # Who
    "在哪里可以找到最好的旅游景点？", # Where
    "什么是量子计算？",          # What
    "为什么我们需要保护环境？",   # Why
    "什么时候是种植蔬菜的最佳季节？", # When
    "如何有效地管理时间？",       # How
    "谁是最有影响力的历史人物？", # Who
    "在哪里可以找到最好的餐厅？",  # Where
    "什么是机器学习？",           # What
    "为什么我们需要锻炼身体？",   # Why
]

english_suggestion = [
    "When is the best time to travel?",  # When
    "How to learn a new language?",      # How
    "Who is the greatest scientist?",    # Who
    "Where can I find the best coffee?", # Where
    "What is blockchain technology?",   # What
    "Why is the sky blue?",              # Why
    "When is the best time to start investing?", # When
    "How to improve work efficiency?",   # How
    "Who invented the light bulb?",      # Who
    "Where can I learn programming?",    # Where
    "What is artificial intelligence?",  # What
    "Why do we need sleep?",             # Why
    "When is the best time to buy stocks?", # When
    "How to maintain a healthy lifestyle?", # How
    "Who is the most famous musician?",  # Who
    "Where can I find the best tourist attractions?", # Where
    "What is quantum computing?",       # What
    "Why do we need to protect the environment?", # Why
    "When is the best season to plant vegetables?", # When
    "How to manage time effectively?",  # How
    "Who is the most influential historical figure?", # Who
    "Where can I find the best restaurants?", # Where
    "What is machine learning?",        # What
    "Why do we need to exercise?",       # Why
]

def get_suggestion(language):
    if language == "zh":
        # random 6 suggestions
        return random.sample(chinese_suggestion, 6)
    else:
        return random.sample(english_suggestion, 6)

def get_suggestion(language):
    if language == "zh":
        return random.sample(chinese_suggestion, 6)
    else:
        return random.sample(english_suggestion, 6)