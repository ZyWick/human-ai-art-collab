from fastapi import FastAPI, File, Form, UploadFile
from transformers import AutoProcessor, AutoModelForVisualQuestionAnswering
from PIL import Image
import torch
import io

app = FastAPI()

# Load BLIP-2 model
processor = AutoProcessor.from_pretrained("Salesforce/blip2-opt-2.7b")
model = AutoModelForVisualQuestionAnswering.from_pretrained("Salesforce/blip2-opt-2.7b")

@app.post("/vqa/")
async def visual_question_answering(image: UploadFile = File(...), question: str = Form(...)):
    image_data = await image.read()
    img = Image.open(io.BytesIO(image_data))

    inputs = processor(images=img, text=question, return_tensors="pt")
    with torch.no_grad():
        outputs = model.generate(**inputs)

    answer = processor.batch_decode(outputs, skip_special_tokens=True)[0]
    return {"answer": answer}
