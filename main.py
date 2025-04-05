from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from stockie import chat
import plotly.io as pio
import os
import uuid
import ast

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for charts
os.makedirs("static/charts", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.post("/chat")
async def chat_endpoint(request: Request):
    body = await request.json()
    query = body.get("query")  # ✅ frontend sends 'query', not 'message'

    if not query:
        return {"error": "Missing query"}

    response = chat(query)

    output = {
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

        elif tool_name == "search_web":
            try:
                articles = ast.literal_eval(tool.content) if isinstance(tool.content, str) else tool.content
                output["news"].extend(articles[:3])
            except:
                continue

    return output
