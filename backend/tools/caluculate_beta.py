import pandas as pd
import yfinance as yf

def calculate_portfolio_beta(df: pd.DataFrame):
    betas = []
    for ticker in df['Ticker']:
        stock = yf.Ticker(ticker)
        beta = stock.info.get('beta')
        if beta is None:
            beta = 1.0 
        betas.append(beta)
    
    df['Beta'] = betas
    
    df['Market Value'] = df['Current Price'] * df['Quantity']
    
    total_market_value = df['Market Value'].sum()
    
    df['Weight'] = df['Market Value'] / total_market_value
    
    portfolio_beta = (df['Beta'] * df['Weight']).sum()
    
    return portfolio_beta, df[['Ticker', 'Beta', 'Weight', 'Market Value']]
