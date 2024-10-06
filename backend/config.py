import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

COHERE_API_KEY = os.getenv("COHERE_API_KEY")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

AGENTOPS_API_KEY = os.getenv("AGENTOPS_API_KEY")
HALLUMINATE_API_KEY = os.getenv("HALLUMINATE_API_KEY")
HALLUMINATE_UUID= os.getenv("HALLUMINATE_UUID")

MODEL_OPTIONS = [
    "octo-llama-8b",
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo-preview",
    "cohere-command-nightly",
    "cohere-command-light-nightly",
    "cohere-command-r",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-2.1",
]
