from config import HALLUMINATE_API_KEY, HALLUMINATE_UUID
from halluminate import Halluminate
from langchain.tools import tool

class ReviewTools():
    @tool("Review Portfolio Suggestion")
    def review_suggestion(portfolio_suggestion):
        """Useful for reviewing the output of the portfolio suggestion,
        just pass the output of the portfolio suggestion to this function. Please make sure the input is a text."""
        hm = Halluminate(api_token=HALLUMINATE_API_KEY)
        print('portfolio_suggestion:', portfolio_suggestion)
        response = hm.evaluate_basic(
            criteria_uuid=HALLUMINATE_UUID,
            model_output=portfolio_suggestion,
            prompt=None,
            context=None,
            hyperparameters={
                "model": "gpt-4o-mini",
                "temperature": 0
            }
        )
        return response