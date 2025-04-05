import os
from dotenv import load_dotenv
from llama_index.llms.groq import Groq
from llama_index.core.tools import FunctionTool
from llama_index.core.agent import ReActAgent
from tools.prompts import system_prompt
from tools.utils import clean_tool_output
from tools.basics import search_ticker_yfinance
from tools.ohlcv_func import get_ohlcv, generate_statistical_insights
from tools.charts import CustomChartTool
from tools.web_search import search_web
import nest_asyncio

nest_asyncio.apply()
load_dotenv()

llm_apikey = os.getenv('GROQ_API_KEY')
llm = Groq(model="qwen-2.5-32b", api_key=llm_apikey)

search_ticker_tool = FunctionTool.from_defaults(fn=search_ticker_yfinance)
web_tool = FunctionTool.from_defaults(fn=search_web)
ohlc_tool = FunctionTool.from_defaults(fn=get_ohlcv)
insight_tool = FunctionTool.from_defaults(fn=generate_statistical_insights)
charts_tool = CustomChartTool()

agent = ReActAgent.from_tools(
    [search_ticker_tool, web_tool, ohlc_tool, insight_tool, charts_tool],
    llm=llm,
    verbose=True,
    system_prompt = system_prompt,
    max_iterations=15
)

def chat(query):
    response = agent.chat(query)

    # response.sources = [clean_tool_output(src) for src in response.sources]

    return response
