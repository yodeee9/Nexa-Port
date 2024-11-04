import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
AGENTOPS_API_KEY = os.getenv("AGENTOPS_API_KEY")
HALLUMINATE_API_KEY = os.getenv("HALLUMINATE_API_KEY")
HALLUMINATE_UUID= os.getenv("HALLUMINATE_UUID")