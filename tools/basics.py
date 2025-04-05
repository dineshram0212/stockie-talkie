import requests

def search_ticker_yfinance(query: str, region="IN"):
    url = "https://query1.finance.yahoo.com/v1/finance/search"
    params = {
        "q": query,
        "quotes_count": 10,
        "news_count": 0,
        "lang": "en",
        "region": region,
    }
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/119.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print("Request error:", e)
        return []
    except ValueError as e:
        print("JSON decode error:", e)
        print("Response text was:", response.text[:500])
        return []

    tickers = []
    for quote in data.get("quotes", []):
        tickers.append({
            "symbol": quote.get("symbol"),
            "name": quote.get("shortname"),
            "exchange": quote.get("exchange"),
            "type": quote.get("quoteType")
        })
    
    return tickers
