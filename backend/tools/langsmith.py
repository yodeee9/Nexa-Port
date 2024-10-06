from langsmith.wrappers import wrap_openai
from langsmith import traceable
from langsmith.evaluation import evaluate, LangChainStringEvaluator
import openai

@traceable
def label_text(text):
    messages = [
        {
            "role": "system",
            "content": "Please review the user query below and determine if it contains any form of toxic behavior, such as insults, threats, or highly negative comments. Respond with 'Toxic' if it does, and 'Not toxic' if it doesn't.",
        },
        {"role": "user", "content": text},
    ]
    result = openai.chat.completions.create(
        messages=messages, model="gpt-3.5-turbo", temperature=0
    )
    return result.choices[0].message.content

def langsmith_evaluator(outputs):
    data = "ds-test"
    experiment_prefix = "ds-test"

    evaluators = [
        # LangChainStringEvaluator("cot_qa"),
        LangChainStringEvaluator("labeled_criteria", config={"criteria": "conciseness"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "relevance"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "coherence"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "harmfulness"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "maliciousness"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "helpfulness"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "misogyny"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "controversiality"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "criminality"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "insensitivity"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "depth"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "creativity"}),
        # LangChainStringEvaluator("labeled_criteria", config={"criteria": "detail"})
    ]

    # Evaluate the target task
    results = evaluate(
        lambda inputs: label_text(outputs),  # ラムダ関数でlabel_textを呼び出す
        data=data,
        evaluators=evaluators,
        experiment_prefix=experiment_prefix,
    )
    return results