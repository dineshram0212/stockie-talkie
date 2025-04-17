import os
from dotenv import load_dotenv
import nest_asyncio

from llama_index.llms.groq import Groq
from llama_index.core.tools import FunctionTool
from llama_index.core.agent import ReActAgent

from tools.prompts import system_prompt
from tools.utils import search_ticker_yfinance
from tools.ohlcv_func import get_ohlcv, generate_statistical_insights
from tools.charts import CustomChartTool
from tools.web_search import get_yahoo_finance_news

nest_asyncio.apply()
load_dotenv()

llm_apikey = os.getenv('API_KEY')
llm = Groq(model="llama3-70b-8192", api_key=llm_apikey)

search_ticker_tool = FunctionTool.from_defaults(fn=search_ticker_yfinance)
news_tool = FunctionTool.from_defaults(fn=get_yahoo_finance_news)
ohlc_tool = FunctionTool.from_defaults(fn=get_ohlcv)
insight_tool = FunctionTool.from_defaults(fn=generate_statistical_insights)
charts_tool = CustomChartTool()

agent = ReActAgent.from_tools(
    [search_ticker_tool, news_tool, ohlc_tool, insight_tool, charts_tool],
    llm=llm,
    verbose=True,
    system_prompt = system_prompt,
    max_iterations=15
)

def chat(query):
    response = agent.chat(query)
    return response
