import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta

def calculate_portfolio_ratios(df, risk_free_rate=0.02):
    def get_yahoo_data(ticker, start_date):
        end_date = datetime.now().date()
        return yf.Ticker(ticker).history(start=start_date, end=end_date)
    
    # Calculate the total portfolio value
    total_portfolio_value = df['Total Cost'].sum()
    
    weighted_daily_returns = []
    weighted_downside_returns = []
    weighted_drawdowns = []
    
    for _, row in df.iterrows():
        # Set the start date to either the purchase date or one year ago, whichever is more recent
        start_date = max(datetime.strptime(row['Purchase Date'], '%Y-%m-%d').date(), datetime.now().date() - timedelta(days=365))
        data = get_yahoo_data(row['Ticker'], start_date)
        
        daily_returns = data['Close'].pct_change().dropna()
        weight = row['Total Cost'] / total_portfolio_value
        
        # Weighted returns
        weighted_daily_returns.append(daily_returns * weight)
        
        # Calculate downside returns (returns lower than the risk-free rate)
        downside_returns = daily_returns[daily_returns < risk_free_rate / 252]
        weighted_downside_returns.append(downside_returns * weight)
        
        # Calculate drawdowns
        cumulative_returns = (1 + daily_returns).cumprod()
        rolling_max = cumulative_returns.cummax()
        drawdowns = (cumulative_returns - rolling_max) / rolling_max
        weighted_drawdowns.append(drawdowns * weight)

    # Sum the weighted returns, downside risk, and drawdowns for the entire portfolio
    portfolio_returns = pd.concat(weighted_daily_returns, axis=1).sum(axis=1)
    downside_risk = np.sqrt(np.mean(pd.concat(weighted_downside_returns, axis=1).sum(axis=1)**2) * 252)
    cumulative_returns = (1 + portfolio_returns).cumprod()
    rolling_max = cumulative_returns.cummax()
    drawdowns = (cumulative_returns - rolling_max) / rolling_max
    max_drawdown = drawdowns.min()
    
    # Standard deviation (volatility)
    std_dev = portfolio_returns.std() * np.sqrt(252)
    
    # Annualized return
    total_return = (1 + portfolio_returns).prod() - 1
    annualized_return = (1 + total_return) ** (1/1) - 1  # Period is 1 year
    
    # Calculate Sharpe ratio and Sortino ratio
    sharpe_ratio = (annualized_return - risk_free_rate) / std_dev
    sortino_ratio = (annualized_return - risk_free_rate) / downside_risk
    
    # Return the result
    return {
        'Sharpe Ratio': float(round(sharpe_ratio, 2)),
        'Sortino Ratio': float(round(sortino_ratio, 2)),
        'Max Drawdown': float(round(max_drawdown, 2))
    }