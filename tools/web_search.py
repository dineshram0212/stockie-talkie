from duckduckgo_search import DDGS

async def search_web(symbol: str, query: str):
    '''
    Returns top five web search results for the given query.
    '''
    ddgs = DDGS().text(query, max_results=5)
    return ddgs
