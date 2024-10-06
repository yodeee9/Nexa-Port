import io
import json
import pandas as pd
import numpy as np
from datetime import datetime
from langchain.tools import tool

def calculate_portfolio(df: pd.DataFrame):
    df['Return'] = (df['Current Price'] / df['Purchase Price'] - 1) * 100
    total_value = (df['Quantity'] * df['Current Price']).sum()
    total_cost = df['Total Cost'].sum()
    total_return = (total_value - total_cost) / total_cost * 100
        
    best_performer = df.loc[df['Return'].idxmax()]
    worst_performer = df.loc[df['Return'].idxmin()]
    
    current_date = pd.Timestamp.now().floor('D')  
    df['Years'] = (current_date - pd.to_datetime(df['Purchase Date'])).dt.days / 365
    weighted_cagr = np.sum(
        ((df['Current Price'] / df['Purchase Price']) ** (1 / df['Years']) - 1) * 
        (df['Total Cost'] / total_cost)
    )
    portfolio_cagr = weighted_cagr * 100  
        
    analysis = {
        "total_value": float(round(total_value, 2)),  
        "total_cost": float(round(total_cost, 2)),    
        "total_return": float(round(total_return, 1)),
        "portfolio_cagr": float(round(portfolio_cagr, 2)),  
        "best_performer": {
            "Ticker": str(best_performer['Ticker']),  
            "Asset Name": str(best_performer['Asset Name'])  
        },
        "worst_performer": {
            "Ticker": str(worst_performer['Ticker']),  
            "Asset Name": str(worst_performer['Asset Name'])  
        }
    }
    return json.dumps(analysis)