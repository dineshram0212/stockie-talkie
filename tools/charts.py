import pandas as pd
import plotly.graph_objects as go
from typing import List
from llama_index.core.tools import BaseTool, ToolMetadata, ToolOutput
from typing import Any

class CustomChartTool(BaseTool):
    @property
    def metadata(self) -> ToolMetadata:
        return ToolMetadata(
            name="plot_stock_chart",
            description="Generates multiple stock analysis charts for a given CSV file path.",
        )

    def __call__(self, filepath: str) -> ToolOutput:
        figures = plot_stock_chart(filepath)
        return ToolOutput(
            content="Charts generated.",  # clean, simple response
            raw_output=figures,
            raw_input={"filepath": filepath},
            tool_name="plot_stock_chart"
        )

def plot_stock_chart(filepath: str) -> List[go.Figure]:
    '''
    Generate a list of different stock charts from OHLCV data.
    '''
    df = pd.read_csv(filepath)
    df.set_index("date", inplace=True)

    figures = []

    # 1. Candlestick with MA
    if all(col in df.columns for col in ['Open', 'High', 'Low', 'Close']):
        fig_candle = go.Figure()
        fig_candle.add_trace(go.Candlestick(
            x=df.index,
            open=df['Open'], high=df['High'],
            low=df['Low'], close=df['Close'],
            name='OHLC'
        ))
        if 'MA20' in df.columns:
            fig_candle.add_trace(go.Scatter(x=df.index, y=df['MA20'], name='MA20', line=dict(width=1)))
        if 'MA50' in df.columns:
            fig_candle.add_trace(go.Scatter(x=df.index, y=df['MA50'], name='MA50', line=dict(width=1)))

        fig_candle.update_layout(
            title="Candlestick with Moving Averages",
            xaxis_title="Date", yaxis_title="Value",
            xaxis_rangeslider_visible=False
        )
        figures.append(fig_candle)

    # 2. RSI
    if 'RSI' in df.columns:
        fig_rsi = go.Figure()
        fig_rsi.add_trace(go.Scatter(x=df.index, y=df['RSI'], name='RSI'))
        fig_rsi.add_hline(y=70, line=dict(dash='dash', color='red'))
        fig_rsi.add_hline(y=30, line=dict(dash='dash', color='green'))
        fig_rsi.update_layout(title="RSI (Relative Strength Index)", xaxis_title="Date", yaxis_title="RSI")
        figures.append(fig_rsi)

    # 3. MACD
    if 'MACD' in df.columns and 'MACD_signal' in df.columns:
        fig_macd = go.Figure()
        fig_macd.add_trace(go.Scatter(x=df.index, y=df['MACD'], name='MACD'))
        fig_macd.add_trace(go.Scatter(x=df.index, y=df['MACD_signal'], name='Signal Line'))
        fig_macd.update_layout(title="MACD", xaxis_title="Date", yaxis_title="MACD")
        figures.append(fig_macd)

    # 4. Bollinger Bands
    if 'BB_upper' in df.columns and 'BB_lower' in df.columns:
        fig_bb = go.Figure()
        fig_bb.add_trace(go.Scatter(x=df.index, y=df['Close'], name='Close'))
        fig_bb.add_trace(go.Scatter(x=df.index, y=df['BB_upper'], name='Upper Band', line=dict(dash='dot')))
        fig_bb.add_trace(go.Scatter(x=df.index, y=df['BB_lower'], name='Lower Band', line=dict(dash='dot')))
        fig_bb.update_layout(title="Bollinger Bands", xaxis_title="Date", yaxis_title="Price")
        figures.append(fig_bb)

    # 5. Volume
    if 'volume' in df.columns:
        fig_vol = go.Figure()
        fig_vol.add_trace(go.Bar(x=df.index, y=df['volume'], name='Volume'))
        fig_vol.update_layout(title="Volume", xaxis_title="Date", yaxis_title="Volume")
        figures.append(fig_vol)

    print("Charts Generated")
    return figures

    
