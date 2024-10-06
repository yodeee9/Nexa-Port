export interface AnalysisResult {
  overall_score: number;
  overall_analysis: string;
  total_return: number;
  benchmark_outperformance: number;
  top_performer: {
    ticker: string;
    name: string;
  };
  underperformer: {
    ticker: string;
    name: string;
  };
  volatility: string;
  volatility_explanation: string;
  portfolio_beta: number;
  anomaly: string;
  anomaly_explanation: string;
  portfolio_suggestion: string;
  potential_improvement_score: number;
  sharp_ratio: number;
  sharp_ratio_explanation: string;
  sortino_ratio: number;
  sortino_ratio_explanation: string;
  max_drawdown: number;
  max_drawdown_explanation: string;
  performance_overview: string
  portfolio_cagr: number;
  portfolio_cagr_explanation: string;
}

export interface PortfolioItem {
  Ticker: string;
  'Asset Name': string;
  Quantity: string;
  'Purchase Price': string;
  'Current Price': string;
  'Purchase Date': string;
  Sector: string;
  Currency: string;
  'Dividend Yield': string;
  'Total Cost': string;
}