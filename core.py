import os
import asyncio
import json
from datetime import datetime
from tavily import TavilyClient
from openai import AsyncOpenAI

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class AISearch:
    def __init__(self):
        self.tavily = TavilyClient(api_key=TAVILY_API_KEY)
        self.oai = AsyncOpenAI(api_key=OPENAI_API_KEY)
        self.cache = {}
        self.max_retries = 2
        self.current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    async def _call_gpt(self, prompt, json_format=False):
        response = await self.oai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            response_format=(
                {"type": "json_object"} if json_format else {"type": "text"}
            ),
        )
        return response.choices[0].message.content.strip()

    async def _web_search(self, query):
        if query in self.cache:
            return self.cache[query]

        result = self.tavily.search(
            query=query, search_depth="advanced", max_results=6, include_answer=True
        )

        formatted = []
        for i, res in enumerate(result["results"]):
            formatted.append(
                f"Title: {res['title']} URL: {res['url']} Content: {res['content'][:250]}..."
            )
        self.cache[query] = "\n\n".join(formatted)
        return self.cache[query]

    async def _generate_initial_answer(self, query):
        prompt = f"""Today is {self.current_date}. Generate a preliminary answer to this question:
        {query}
        
        Include:
        1. Key points you already know
        2. Potential data needed
        3. Suggested structure
        
        Example for "NVIDIA's 2024 financial report":
        - Known: NVIDIA dominates AI chip market
        - Needed: Q4 revenue growth rate, net profit margin
        - Structure: Market context -> Financial numbers -> Analyst opinions"""

        return await self._call_gpt(prompt)

    async def _breakdown_question(self, query):
        prompt = f"""Today is {self.current_date}. Break down this complex question into 3-5 sub-questions. 
        When breaking down the questions, consider the different aspects that need to be covered to provide a comprehensive answer.

        You are encouraged to generate sub-questions with different language as the original question, if you think it will help to get a better answer.
        Follow this template as json format:
        {{
            "sub_questions": [
                "subquestion1",
                "subquestion2"
            ],
            "reasoning": "step-by-step explanation"
        }}
        
        Example Input: "How did NVIDIA's Q4 2024 financial performance compare to competitors?"
        Example Output: {{
            "sub_questions": [
                "NVIDIA Q4 2024 revenue figures",
                "AMD Q4 2024 GPU market share",
                "Analyst comparison of AI chip manufacturers 2024"
            ],
            "reasoning": "Breakdown focuses on financial metrics, market share, and expert analysis for accurate comparison"
        }}

        Example Input: "谁是C罗？"
        # Chinese question, but the sub-questions can be in English (but not all the time)
        Example Output: {{
            "sub_questions": [
                "Who is Cristiano Ronaldo?",
                "What is Cristiano Ronaldo known for?",
                "What are Cristiano Ronaldo's achievements?"
                "C罗是否访问过中国？"
            ],
            "reasoning": "Breakdown focuses on financial metrics, market share, and expert analysis for accurate comparison"
        }}

        Example Input: "What is the capital of China?"
        # English question, but the sub-questions can be in Chinese (but not all the time)
        Example Output: {{
            "sub_questions": [
                "中国的首都是什么？",
                "北京有什么名胜古迹？",
                "北京的气候如何？"
            ],
            "reasoning": "Breakdown focuses on financial metrics, market share, and expert analysis for accurate comparison"
        }}

        
        Current Question: {query}"""

        response = await self._call_gpt(prompt, json_format=True)
        return json.loads(response)

    async def _evaluate_answer(self, query, answer, skip=False):
        if skip:
            return {
            "score": 10,
            "feedback": "Accurate data but needs better source organization",
            "detailed": {{
                "strengths": ["Correct revenue figures", "Good market context"],
                "weaknesses": ["Missing Q4 comparisons", "Uncited market share data"],
                "improvements": ["Add 2023 vs 2024 growth rates", "Link to official financial reports"]
            }}
        }

        prompt = f"""Today is {self.current_date}. Evaluate this answer using these criteria:
        1. Factual accuracy (verify against known facts)
        2. Source citation quality (markdown links [title](url))
        3. Structure (clear sections with headings)

        However, if the answer contains information that is closely related to time-sensitive events, please ignore the factual accuracy.
        For example, if the question is about the latest news, the answer should be evaluated based on the structure and source citation quality only, and not the factual accuracy.
        
        Follow this format as json format:
        {{
            "score": 0-10,
            "feedback": "summary of evaluation",
            "detailed": {{
                "strengths": ["list"],
                "weaknesses": ["list"],
                "improvements": ["suggestions"]
            }}
        }}
        
        Example Evaluation:
        {{
            "score": 8,
            "feedback": "Accurate data but needs better source organization",
            "detailed": {{
                "strengths": ["Correct revenue figures", "Good market context"],
                "weaknesses": ["Missing Q4 comparisons", "Uncited market share data"],
                "improvements": ["Add 2023 vs 2024 growth rates", "Link to official financial reports"]
            }}
        }}
        
        Question: {query}
        Answer: {answer}"""

        return json.loads(await self._call_gpt(prompt, json_format=True))

    async def _synthesize_answer(self, query, contexts, initial_ans, feedback=None):
        prompt = f"""Today is {self.current_date}. Combine these elements into a final answer:
        
        [Question]
        {query}
        
        [Initial Analysis by LLM (could not be accurate)]
        {initial_ans}
        
        [Research Context]
        {contexts}
        
        {f"[Previous Feedback] {feedback}" if feedback else ""}
        
        Requirements:
        1. Use markdown formatting
        2. Cite sources as [Title](url)
        3. Include data points from research
        4. Current date: {self.current_date}
        5. use same language as the original question
        6. You have to create a reference list at the end, see the example.
        
        Example Structure:
        ## Overview
        Market context... [Reuters](https://...)
        
        ## Financial Performance
        - Q4 Revenue: $22.1B [NVIDIA Newsroom](https://...)
        - Net Margin: 56% [Bloomberg](https://...)
        
        ## Analysis
        "The growth reflects..." [Financial Times](https://...)

        ## References
        - [NVIDIA Newsroom](https://...)
        - [Bloomberg](https://...)
        - [Financial Times](https://...)
        """

        return await self._call_gpt(prompt)

    async def search(self, query):
        initial_ans = await self._generate_initial_answer(query)
        breakdown = await self._breakdown_question(query)
        # print(f"Question Breakdown: {json.dumps(breakdown, indent=2)}")

        best = None
        attempts = 0

        while attempts <= self.max_retries:
            if attempts == 0:
                search_results = await asyncio.gather(
                    *[self._web_search(q) for q in breakdown["sub_questions"]]
                )
                context = "\n\n".join(search_results)

            answer = await self._synthesize_answer(
                query, context, initial_ans, feedback=best["feedback"] if best else None
            )

            evaluation = await self._evaluate_answer(query, answer)
            # print(
            #     f"Attempt {attempts+1} Evaluation: {json.dumps(evaluation, indent=2)}"
            # )

            if not best or evaluation["score"] > best["score"]:
                sources = list(
                    set(
                        line.split("URL: ")[1]
                        for res in search_results
                        for line in res.split("\n")
                        if line.startswith("URL:")
                    )
                )[:5]

                best = {
                    "answer": answer,
                    "score": evaluation["score"],
                    "feedback": evaluation,
                    "sources": sources,
                }

            if evaluation["score"] >= 6 or attempts >= self.max_retries:
                break

            attempts += 1

        return {
            "answer": best["answer"],
            "sources": best["sources"],
            "evaluation": best["feedback"],
        }

    async def quick_search(self, query):
        # use openai to quickly generate a response based on websearch
        websearch = await self._web_search(query)
        prompt = f"""Today is {self.current_date}. Answer the question based on the following web search results:
        {websearch}

        Question: {query}"""
        result = await self._call_gpt(prompt)
        return result
