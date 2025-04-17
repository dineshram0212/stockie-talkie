import requests

def get_yahoo_finance_news(symbol: str, region="US", lang="en", count: int = 5):
    """
    Fetches news for a given stock symbol using Yahoo Finance's public search.
    """
    url = "https://query1.finance.yahoo.com/v1/finance/search"
    params = {
        "q": symbol,
        "news_count": count,
        "quotes_count": 0,
        "lang": lang,
        "region": region
    }
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()

        news_items = []
        for item in data.get("news", []):
            news_items.append({
                "title": item.get("title"),
                "href": item.get("link"),
                "summary": item.get("summary") or "",
            })

        return news_items

    except Exception as e:
        print(f"[ERROR] Failed to fetch news for {symbol}: {e}")
        return []
