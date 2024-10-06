from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import FastAPI, UploadFile, File
import pandas as pd
import io
import json
from services.LLM.agent import FinancialCrew

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-portfolio")
async def analyze_portfolio(
    file: UploadFile = File(...),
    securityMode: bool = Form(...),
    investmentStrategy: str = Form(...),
    referenceInvestor: str = Form(...)
):
    contents = await file.read()
    df_input = pd.read_csv(io.StringIO(contents.decode('utf-8')))

    if not referenceInvestor:
        referenceInvestor = "Portfolio Manager"
    
    crew = FinancialCrew(securityMode=securityMode, investmentStrategy=investmentStrategy,referenceInvestor=referenceInvestor,df_input=df_input)
    crew_output = crew.run()
    
    parsed_output = json.loads(crew_output)
    return JSONResponse(content=parsed_output)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
