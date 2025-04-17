import os
import uuid
import ast
import requests

import plotly.io as pio
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from stockie import chat


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/charts", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.post("/chat")
async def chat_endpoint(request: Request):
    body = await request.json()
    query = body.get("query")

    if not query:
        return {"error": "Missing query"}

    response = chat(query)

    output = {
        "symbol": "",
        "chatResponse": response.response,
        "insights": {},
        "charts": [],
        "news": []
    }

    os.makedirs("static/charts", exist_ok=True)

    for tool in response.sources:
        tool_name = tool.tool_name

        if tool_name == "generate_statistical_insights":
            try:
                content = tool.raw_output
                for k, v in content.items():
                    output["insights"][k] = str(v)
            except:
                continue

        elif tool_name == "plot_stock_chart" and isinstance(tool.raw_output, list):
            for fig in tool.raw_output:
                if fig:
                    filename = f"chart_{uuid.uuid4().hex}.html"
                    filepath = os.path.join("static", "charts", filename)
                    pio.write_html(fig, file=filepath, auto_open=False)
                    output["charts"].append({
                        "title": fig.layout.title.text if fig.layout.title else "Chart",
                        "url": f"/static/charts/{filename}"
                    })

        elif tool_name == "get_yahoo_finance_news":
            try:
                articles = ast.literal_eval(tool.content) if isinstance(tool.content, str) else tool.content
                output["news"].extend(articles[:3])
            except:
                continue
    
        elif tool_name == "get_ohlcv":
            try:
                result = ast.literal_eval(tool.content) if isinstance(tool.content, str) else tool.content
                filename, symbol = result
                output["symbol"] = symbol
            except:
                continue

    return output


@app.get("/ticker-search")
def ticker_search(q: str):
    url = "https://query1.finance.yahoo.com/v1/finance/search"
    params = {
        "q": q,
        "quotes_count": 5,
        "news_count": 0,
        "lang": "en",
    }
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
    }

    try:
        resp = requests.get(url, headers=headers, params=params, timeout=5)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}
