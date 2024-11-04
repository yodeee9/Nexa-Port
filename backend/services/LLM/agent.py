import pandas as pd
# import agentops
from typing import Dict, Optional
from pydantic import BaseModel, Field
from tools.halluminate import ReviewTools
from tools.calculate_ratio import calculate_portfolio_ratios
from tools.caluculate_beta import calculate_portfolio_beta
from tools.calculate_portfolio_tools import calculate_portfolio
from config import OPENAI_API_KEY, GROQ_API_KEY, AGENTOPS_API_KEY
from crewai import Crew, Agent, Task, LLM
from textwrap import dedent
from langchain_groq import ChatGroq
from crewai_tools import (
    SerperDevTool,
    WebsiteSearchTool,
)
from crewai.process import Process
# agentops.init(api_key=AGENTOPS_API_KEY)

# Tools
search_tool = SerperDevTool(n_results=3)
web_rag_tool = WebsiteSearchTool(website='https://www.investopedia.com/articles/financial-theory/11/trading-with-market-anomalies.asp')

class PortfolioStrategyAnalysis(BaseModel):
    """Portfolio analysis model"""
    overall_score: int = Field(..., description="Overall score of the portfolio")
    overall_analysis: str = Field(..., description="General analysis of the portfolio")
    total_return: float = Field(..., description="Total return in percentage")
    benchmark_outperformance: Optional[float] = Field(None, description="Benchmark outperformance in percentage")
    top_performer: Dict[str, str] = Field(..., description="Top performer in the portfolio")
    underperformer: Dict[str, str] = Field(..., description="Underperformer in the portfolio")
    volatility: str = Field(..., description="Volatility description")
    volatility_explanation: str = Field(..., description="Explanation of volatility")
    portfolio_beta: float = Field(..., description="Portfolio beta value")
    anomaly: str = Field(..., description="Any anomalies observed in the portfolio")
    anomaly_explanation: str = Field(..., description="Explanation of anomalies")
    portfolio_suggestion: str = Field(..., description="Suggested portfolio strategy")
    potential_improvement_score: int = Field(..., description="Potential improvement score")
    sharp_ratio: float = Field(..., description="Sharp ratio value")
    sharp_ratio_explanation: str = Field(..., description="Explanation of sharp ratio")
    sortino_ratio: float = Field(..., description="Sortino ratio value")
    sortino_ratio_explanation: str = Field(..., description="Explanation of sortino ratio")
    max_drawdown: float = Field(..., description="Maximum drawdown value")
    max_drawdown_explanation: str = Field(..., description="Maximum drawdown value")
    performance_overview: str = Field(..., description="Performance overview")
    portfolio_cagr: float = Field(..., description="Portfolio CAGR value")
    portfolio_cagr_explanation: str = Field(..., description="Explanation of portfolio CAGR")

    
class FinancialCrew:
    def __init__(self, securityMode, investmentStrategy, referenceInvestor, df_input):
        self.securityMode = securityMode
        self.investmentStrategy = investmentStrategy
        self.referenceInvestor = referenceInvestor
        self.df_input = df_input

    def run(self):
        agents = FinancialAnalysisAgents(self.securityMode, self.investmentStrategy)
        tasks = FinancialAnalysisTasks(self.df_input, self.referenceInvestor)

        performance_analyst = agents.performance_analyst()
        risk_analyst = agents.risk_analyst()
        portfolio_advisor = agents.portfolio_advisor()
        advise_reviewer = agents.advise_reviewer()
        manager = agents.manager()

        performance_task = tasks.performance_analysis(performance_analyst)
        risk_task = tasks.risk_analysis(risk_analyst)
        investment_suggestion_task = tasks.create_portfolio_suggestion(portfolio_advisor)
        review_suggestion = tasks.review_suggestion(advise_reviewer)
        manager_task = tasks.manager_summary(manager)

        crew = Crew(
            agents=[
                performance_analyst,
                risk_analyst,
                portfolio_advisor,
                # advise_reviewer,
                manager
            ],
            tasks=[
                performance_task,
                risk_task,
                investment_suggestion_task,
                # review_suggestion,
                manager_task
            ],
            verbose=True,
            process=Process.sequential
        )

        result = crew.kickoff()
        return result.json

class FinancialAnalysisAgents:
    def __init__(self, securityMode, investmentStrategy):
        self.investmentStrategy = investmentStrategy
        if securityMode == True:
            self.llm = LLM(
                model="ollama/llama3.2",
                base_url="http://localhost:11434",
            )
        else:
            # self.llm = LLM(
            #     model="gpt-4o-mini",
            #     temperature=0,
            #     api_key=OPENAI_API_KEY,
            # )
            self.llm=ChatGroq(
                temperature=0,
                model="groq/llama-3.2-90b-text-preview",
                groq_api_key=GROQ_API_KEY,
                verbose=True
            )

    def performance_analyst(self):
        return Agent(
            role='Performance Analyst',
            goal="Analyze portfolio performance based on provided CSV data.",
            backstory=f"""
            You are a meticulous Performance Analyst with expertise in evaluating investment portfolios.
            Your role is to assess the performance metrics and identify top and underperforming assets.
            Your Investment Analysis Strategy Type : {self.investmentStrategy}
            """,
            verbose=True,
            llm	= self.llm 
        )

    def risk_analyst(self):
        return Agent(
            role='Risk Analyst',
            goal="Assess the portfolio's risk factors using volatility and anomaly data.",
            backstory=f"""
            You are a skilled Risk Analyst specialized in identifying and evaluating the risk components
            of investment portfolios. You utilize various data sources and analytical methods to provide insights.
            Your Investment Analysis Strategy Type : {self.investmentStrategy}
            """,
            verbose=True,
            tools=[
                search_tool
            ],
            llm	= self.llm 
        )

    def portfolio_advisor(self):
        return Agent(
            role='Portfolio Advisor',
            goal="Create a comprehensive portfolio suggestion based on analysis results and market insights.",
            backstory="""
            You are a seasoned Portfolio Advisor with a wealth of experience in portfolio management and market analysis.
            Your expertise lies in synthesizing complex financial data, market trends, and investor preferences to create
            tailored investment strategies. Your recommendations are known for their clarity, actionability, and alignment
            with both market conditions and individual investor goals.
            """,
            verbose=True,
            tools=[
                search_tool
                ],
            llm=self.llm 
    )

    def advise_reviewer(self):
        return Agent(
            role='Portfolio Advise Reviewer',
            goal="Review the portfolio suggestion and brush up the suggestion.",
            backstory="""
            You are a Portfolio Advise Reviewer with a keen eye for detail and a knack for enhancing investment strategies.
            Your role is to review the portfolio suggestion provided by the Portfolio Advisor and refine it to ensure.
            """,
            verbose=True,
            tools=[
                ReviewTools.review_suggestion
                ],
            llm=self.llm 
    )

    def manager(self):
        return Agent(
            role='Manager',
            goal="Compile and summarize the analyses from Performance and Risk Analysts into a cohesive report.",
            backstory=f"""
            You are the Manager overseeing the analysis process. Your responsibility is to integrate the findings
            from various analysts and present a comprehensive overview and suggestion to the stakeholders.
            Your Investment Analysis Strategy Type : {self.investmentStrategy}
            """,
            verbose=True,
            llm	= self.llm 
        )

class FinancialAnalysisTasks:
    def __init__(self, df_input, referenceInvestor):
        self.df_input = df_input
        self.referenceInvestor = referenceInvestor

    def performance_analysis(self, agent):
        callucate_result = calculate_portfolio(self.df_input)
        return Task(
            description=dedent(f"""
                Analyze the provided CSV data to evaluate the portfolio's performance.
                Perform the following calculations:
                - Total Value: Sum of (Quantity * Current Price) for all assets.
                - Total Cost: Sum of Total Cost for all assets.
                - Total Return: ((Total Value - Total Cost) / Total Cost) * 100
                - Best Performer: Asset with the highest return.
                - Worst Performer: Asset with the lowest return.
                - Create a portfolio suggestion based on the analysis.
                - Creta a performance overview based on the analysis.
                
                After calculations, evaluate the results and provide insights.
                               
                calculate_result: {callucate_result}
            """),
            agent=agent,
            expected_output="""
                Your final output should be a JSON object with the following structure:
                {
                    "analysis_result": str, 
                    "total_value": float,
                    "total_cost": float,
                    "total_return": float,
                    "best_performer": {"Ticker": str, "Asset Name": str},
                    "underperformer": {"Ticker": str, "Asset Name": str},
                    "portfolio_suggestion": str,
                    "performance_overview": str,
                    "portfolio_cagr": float,
                    "portfolio_cagr_explanation": str
                }
            """
        )


    def risk_analysis(self, agent):
        portfolio_beta, each_stock_result = calculate_portfolio_beta(self.df_input)
        portfolio_ratio_result = calculate_portfolio_ratios(self.df_input)
        return Task(
            description=dedent(f"""
                Assess the volatility and risk based on the provided reuslts and search data.
                               
                Perform the following:
                - Assess portfolio volatility (High,Moderate,Low) based on portfolio_beta results.
                - Search for any market anomalies related to the portfolio using search tool. Example Keywords: U.S. Election Uncertainty, Geopolitical Tensions and Market Reactions, Halloween effect etc.
                - Determine anomaly level (High,Moderate,Low) based on the search results.
                - Create the volatility and anomaly explanations based on the calculated data with a detailed analysis.
                  Make sure volatility explanation is between 50 to 100 words, and anomaly explanation is between 100 to 150. Please include the news of the anomaly in the anomaly explanation.
                - Create the sharp ratio, sortino ratio, max drawdown explanations and portfolio_cagr_explanation based on the calculated data, each explanation should be less than 20 words.

                Results of the calculations:             
                - portfolio_beta: {portfolio_beta}
                - each_stock_result: {each_stock_result}
                - portfolio_ratio_result: {portfolio_ratio_result}

                Note: Please remain the result of performance_analysis task in output.
            """),
            agent=agent,
            expected_output="""
                After analysis, provide a JSON object with the following structure:
                {
                    "analysis_result": str, 
                    "total_value": float,
                    "total_cost": float,
                    "total_return": float,
                    "best_performer": {"Ticker": str, "Asset Name": str},
                    "underperformer": {"Ticker": str, "Asset Name": str},
                    "volatility": str,
                    "volatility_explanation": str,
                    "portfolio_beta": float,
                    "portfolio_cagr": float,
                    "portfolio_cagr_explanation": str,
                    "anomaly": str,
                    "anomaly_explanation": str,
                    "portfolio_suggestion": str,
                    "sharp_ratio": float,
                    "sharp_ratio_explanation": str,
                    "sortino_ratio": float,
                    "sortino_ratio_explanation": str,
                    "max_drawdown": float,
                    "max_drawdown_explanation": str,
                    "performance_overview": str
                }
            """
        )
    

    def create_portfolio_suggestion(self, agent):
        return Task(
            description=dedent(f"""
                !!! note: please remain the result of performance_analysis and risk_analysis tasks in output.
                !!! please make sure the output is in json format, must not include comments.
                !!! please do not mention the name of the referenceInvestor in the portfolio_suggestion.
                If '{self.referenceInvestor}' is 'Portfolio Manager', Please do not use the SerperDevTool.

                Create an investment suggestion(portfolio_suggestion) that aligns with the style and philosophy of {self.referenceInvestor}, based on the performance and risk analysis results.
                Follow these steps:
                1. Thoroughly review the performance analysis and risk analysis results of the current portfolio.
                2. Use the SerperDevTool to research recent investment strategies, market views, and notable quotes associated with {self.referenceInvestor}.
                3. Analyze how {self.referenceInvestor}'s recent investment approaches compare with the current portfolio's performance and risk profile.
                4. Develop a detailed investment suggestion that:
                - Addresses the portfolio's strengths and weaknesses from {self.referenceInvestor}'s perspective
                - Incorporates {self.referenceInvestor}'s known investment philosophy and recent market views
                - Provides specific, actionable recommendations (e.g., rebalancing, new positions, exits) that {self.referenceInvestor} might suggest
                - Considers current market conditions and trends, filtered through {self.referenceInvestor}'s typical analytical approach
                5. Write the suggestion in a style that closely mimics {self.referenceInvestor}'s communication style, using similar phraseology and focusing on their known areas of expertise.
            
                Ensure the suggestion is comprehensive, actionable, and aligns with both the overall investment strategy identified in the previous analyses and {self.referenceInvestor}'s investment approach.
            
                The final output should be presented as if it were personally analyzed and crafted by {self.referenceInvestor}, though their name is not explicitly mentioned.
            """),
            agent=agent,
            expected_output="""
                {
                    "analysis_result": str, 
                    "total_value": float,
                    "total_cost": float,
                    "total_return": float,
                    "best_performer": {"Ticker": str, "Asset Name": str},
                    "underperformer": {"Ticker": str, "Asset Name": str},
                    "volatility": str,
                    "volatility_explanation": str,
                    "portfolio_beta": float,
                    "portfolio_cagr": float,
                    "portfolio_cagr_explanation": str,
                    "anomaly": str,
                    "anomaly_explanation": str,
                    "portfolio_suggestion": str,
                    "sharp_ratio": float,
                    "sharp_ratio_explanation": str,
                    "sortino_ratio": float,
                    "sortino_ratio_explanation": str,
                    "max_drawdown": float,
                    "max_drawdown_explanation": str,
                    "performance_overview": str
                }
            """
        )

    def review_suggestion(self, agent):
        return Task(
            description=dedent(f"""
            Reveiew the portfolio suggestion and provide feedback.
            Follow these steps:
                1. Create a detailed review of the investment suggestion provided by the Portfolio Advisor using the ReviewTools.review_suggestion.
                    Please make sure the input is the output of the create_portfolio_suggestion task (portfolio_suggestion), which is text format.
                2. Base on the review, brush up the suggestion.
                            
            !!!! If you call the ReviewTools.review_suggestion function, Tool Input should be the output of the create_portfolio_suggestion task as string format.
                 example: "I recommend reallocating some funds from underperforming assets like Apple Inc. to enhance overall portfolio performance...."
            """),
            agent=agent,
            expected_output="""
                {
                    "analysis_result": str, 
                    "total_value": float,
                    "total_cost": float,
                    "total_return": float,
                    "best_performer": {"Ticker": str, "Asset Name": str},
                    "underperformer": {"Ticker": str, "Asset Name": str},
                    "volatility": str,
                    "volatility_explanation": str,
                    "portfolio_beta": float,
                    "portfolio_cagr": float,
                    "portfolio_cagr_explanation": str,
                    "anomaly": str,
                    "anomaly_explanation": str,
                    "portfolio_suggestion": str,
                    "sharp_ratio": float,
                    "sharp_ratio_explanation": str,
                    "sortino_ratio": float,
                    "sortino_ratio_explanation": str,
                    "max_drawdown": float,
                    "max_drawdown_explanation": str,
                    "performance_overview": str
                }
            """
        )
    def manager_summary(self, agent):
        return Task(
            description=dedent(f"""
                !!! note: please remain the result of performance_analysis and risk_analysis tasks in output.
                !!! please make sure the output is in json format, must not include comments.
                Compile the analysis results from the Performance Analyst and Risk Analyst.
                Create a comprehensive summary that includes:
                - Overall Score (based on results of both analysts. Scale 0-100)
                - Overall Analysis (a narrative combining performance and risk insights)
                - Include all fields from the Performance Analyst and Risk Analyst JSON outputs.
                - Potential Improvement Score: based on the overall_score and portfolio_suggestion, provide a score that indicates the potential improvement of the portfolio.
                  (Please make sure the sum of overall_score and potential_improvement_score is less than 100 and potential_improvement_score must be caluculated strictly based on the portfolio_suggestion.)
            """),
            agent=agent,
            # context=[ 
            #     self.performance_analysis(agent),
            #     self.risk_analysis(agent)
            # ],
            expected_output="""
                {
                    "overall_score": int,
                    "overall_analysis": str,
                    "total_return": float,
                    "benchmark_outperformance": float,
                    "top_performer": {
                        "ticker": str,
                        "name": str
                    },
                    "underperformer": {
                        "ticker": str,
                        "name": str
                    },
                    "volatility": str,
                    "volatility_explanation": str,
                    "portfolio_beta": float,
                    "anomaly": str,
                    "anomaly_explanation": str,
                    "portfolio_cagr": float,
                    "portfolio_cagr_explanation": str,
                    "portfolio_suggestion": str,
                    "potential_improvement_score": int,
                    "sharp_ratio": float,
                    "sharp_ratio_explanation": str,
                    "sortino_ratio": float,
                    "sortino_ratio_explanation": str,
                    "max_drawdown": float,
                    "max_drawdown_explanation": str,
                    "performance_overview": str
                }
            """,
            output_json=PortfolioStrategyAnalysis 
        ) 