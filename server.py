from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import json


app = FastAPI()

client = openai.OpenAI(api_key="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")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    model: str
    messages: list

@app.post("/v1/chat/completions")
async def chat(req: ChatRequest):
    try:
        print("Запрос от клиента:", req.messages)
        response = client.chat.completions.create(
            model=req.model,
            messages=req.messages,
        )
        print("Ответ от OpenAI:", json.dumps(response.model_dump(), indent=2, ensure_ascii=False))

        message = response.choices[0].message
        return {
            "choices": [
                {
                    "message": {
                        "role": message.role,
                        "content": message.content
                    }
                }
            ]
        }
    except Exception as e:
        print("Ошибка на сервере:", str(e))
        return {"error": {"message": str(e)}}

@app.get("/")
def root():
    return {"message": "Сервер работает. Используйте POST /v1/chat/completions"}
