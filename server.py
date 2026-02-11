
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
import base64
import time
import logging
import io
from vinted_bot import VintedBot, ImageProcessor

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("vintend_server")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExecutionRequest(BaseModel):
    account_id: str
    username: str
    password: str
    title: str = None
    description: str = None
    price: float = None
    image_base64: str = None
    mode: str = "publish"
    item_id: str = None
    category: str = None
    brand: str = None
    size: str = None
    condition: str = None
    material: str = None
    color: str = None
    shoulder_width: float = None
    height: float = None

class OptimizeRequest(BaseModel):
    image_base64: str

bot_logs = []

@app.get("/health")
async def health():
    return {"status": "online", "engine": "ready", "bridge_version": "2.4.1"}

@app.get("/logs")
async def get_logs():
    global bot_logs
    logs = list(bot_logs)
    bot_logs = [] 
    return logs

@app.post("/optimize")
async def optimize(req: OptimizeRequest):
    try:
        header, encoded = req.image_base64.split(",", 1) if "," in req.image_base64 else (None, req.image_base64)
        image_data = base64.b64decode(encoded)
        
        temp_input = f"temp_input_{int(time.time())}.jpg"
        temp_output = f"temp_output_{int(time.time())}.jpg"
        
        with open(temp_input, "wb") as f:
            f.write(image_data)
            
        optimized_path = ImageProcessor.optimize_for_vinted(temp_input, temp_output)
        
        with open(optimized_path, "rb") as f:
            optimized_b64 = base64.b64encode(f.read()).decode("utf-8")
            
        if os.path.exists(temp_input): os.remove(temp_input)
        if os.path.exists(temp_output): os.remove(temp_output)
        
        return {"optimized_base64": optimized_b64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/execute")
async def execute(req: ExecutionRequest):
    bot = VintedBot(req.account_id, req.username, req.password)
    
    timestamp = time.strftime("%H:%M:%S")
    bot_logs.append({"timestamp": timestamp, "level": "info", "message": f"Bridge: Command '{req.mode}' dispatched to Agent @{req.username}"})
    
    image_path = None
    if req.image_base64:
        image_path = f"temp_img_{int(time.time())}.jpg"
        with open(image_path, "wb") as f:
            f.write(base64.b64decode(req.image_base64))

    try:
        is_headless = (req.mode != "login")
        success = await bot.run(
            mode=req.mode,
            title=req.title,
            description=req.description,
            price=req.price,
            image=image_path,
            item_id=req.item_id,
            headless=is_headless,
            category=req.category,
            brand=req.brand,
            size=req.size,
            condition=req.condition,
            material=req.material,
            color=req.color,
            shoulder_width=req.shoulder_width,
            height=req.height
        )
        
        status = "success" if success else "error"
        res_msg = f"Bridge: Command execution {'completed' if success else 'failed'}."
        bot_logs.append({"timestamp": time.strftime("%H:%M:%S"), "level": status, "message": res_msg})
        
        return {"success": success}
    except Exception as e:
        err_msg = f"Bridge Fault: {str(e)}"
        bot_logs.append({"timestamp": time.strftime("%H:%M:%S"), "level": "error", "message": err_msg})
        raise HTTPException(status_code=500, detail=err_msg)
    finally:
        if image_path and os.path.exists(image_path):
            try: os.remove(image_path)
            except: pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
