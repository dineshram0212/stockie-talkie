import numpy as np
import pandas as pd
import yfinance as yf


def count_macd_crossovers(macd, signal):
    crossover_up = ((macd > signal) & (macd.shift(1) <= signal.shift(1))).sum()
    crossover_down = ((macd < signal) & (macd.shift(1) >= signal.shift(1))).sum()
    return int(crossover_up), int(crossover_down)


def compute_indicators(df):
    df = df.copy()
    
    # Moving Averages
    df['MA20'] = df['Close'].rolling(window=20).mean()
    df['MA50'] = df['Close'].rolling(window=50).mean()
    df['MA200'] = df['Close'].rolling(window=200).mean()
    df['EMA12'] = df['Close'].ewm(span=12, adjust=False).mean()
    df['EMA26'] = df['Close'].ewm(span=26, adjust=False).mean()
    
    # MACD & Signal
    df['MACD'] = df['EMA12'] - df['EMA26']
    df['MACD_signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
    
    # RSI
    delta = df['Close'].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(14).mean()
    avg_loss = loss.rolling(14).mean()
    rs = avg_gain / avg_loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # OBV
    obv = [0]
    for i in range(1, len(df)):
        if df['Close'].iloc[i] > df['Close'].iloc[i-1]:
            obv.append(obv[-1] + df['Volume'].iloc[i])
        elif df['Close'].iloc[i] < df['Close'].iloc[i-1]:
            obv.append(obv[-1] - df['Volume'].iloc[i])
        else:
            obv.append(obv[-1])
    df['OBV'] = obv

    # Daily & Cumulative Returns
    df['Daily_Return'] = df['Close'].pct_change()
    df['Cumulative_Return'] = (1 + df['Daily_Return']).cumprod() - 1

    # Bollinger Bands
    bb_ma = df['Close'].rolling(window=20).mean()
    bb_std = df['Close'].rolling(window=20).std()
    df['BB_upper'] = bb_ma + (2 * bb_std)
    df['BB_mid'] = bb_ma
    df['BB_lower'] = bb_ma - (2 * bb_std)

    # ATR
    tr1 = df['High'] - df['Low']
    tr2 = abs(df['High'] - df['Close'].shift())
    tr3 = abs(df['Low'] - df['Close'].shift())
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    df['ATR'] = tr.rolling(window=14).mean()

    # Support/Resistance
    df['Support'] = df['Low'].rolling(30).min()
    df['Resistance'] = df['High'].rolling(30).max()

    return df


def get_ohlcv(symbol: str):
    """
    Fetch OHLCV data for the given Ticker (symbol).
    """
    df = yf.download(symbol, period='6mo', interval='1d')
    df.index.name = 'date'
    df.columns = df.columns.droplevel(1)
    df = compute_indicators(df)

    filename = f"/tmp/{symbol.replace('.', '_')}.csv"
    df.reset_index().to_csv(filename, index=False)

    return filename, symbol



def generate_statistical_insights(filepath: str):
    '''
    Returns Dictionary containing insights taken from the OHLCV dataframe.
    '''
    df = pd.read_csv(filepath)
    df.set_index("date", inplace=True)

    insights = {}
    # Rolling slope (trend strength) using polyfit
    def slope(series, window=30):
        y = series.tail(window)
        x = np.arange(len(y))
        if y.isnull().any():
            return None
        return round(np.polyfit(x, y, 1)[0], 4)

    # Trend Indicators
    insights["ma20_trend_slope"] = slope(df['MA20'])
    insights["ma50_trend_slope"] = slope(df['MA50'])
    insights["ma200_trend_slope"] = slope(df['MA200'])

    # Momentum Indicators
    insights["rsi_mean"] = round(df['RSI'].mean(), 2)
    insights["rsi_min"] = round(df['RSI'].min(), 2)
    insights["rsi_max"] = round(df['RSI'].max(), 2)
    insights["rsi_overbought_pct"] = round((df['RSI'] > 70).mean() * 100, 2)
    insights["rsi_oversold_pct"] = round((df['RSI'] < 30).mean() * 100, 2)

    insights["macd_mean"] = round(df['MACD'].mean(), 4)
    insights["macd_signal_mean"] = round(df['MACD_signal'].mean(), 4)
    insights["macd_crossovers_up"], insights["macd_crossovers_down"] = count_macd_crossovers(df['MACD'], df['MACD_signal'])

    # Return Metrics
    insights["avg_daily_return"] = round(df['Daily_Return'].mean() * 100, 2)
    insights["std_daily_return"] = round(df['Daily_Return'].std() * 100, 2)
    insights["cumulative_return"] = round(df['Cumulative_Return'].iloc[-1] * 100, 2)

    # Volatility Metrics
    insights["avg_atr"] = round(df['ATR'].mean(), 2)
    insights["bb_avg_width"] = round((df['BB_upper'] - df['BB_lower']).mean(), 2)

    # OBV (Volume Trend)
    insights["obv_start"] = round(df['OBV'].iloc[0], 0)
    insights["obv_end"] = round(df['OBV'].iloc[-1], 0)
    insights["obv_net_change"] = round(df['OBV'].iloc[-1] - df['OBV'].iloc[0], 0)
    insights["obv_trend"] = "increasing" if df['OBV'].iloc[-1] > df['OBV'].iloc[0] else "decreasing"

    # Support/Resistance Breaks
    insights["support_break_pct"] = round((df['Close'] < df['Support']).mean() * 100, 2)
    insights["resistance_break_pct"] = round((df['Close'] > df['Resistance']).mean() * 100, 2)

    return insights
