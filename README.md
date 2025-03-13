# human-ai-art-collab

1. Open Two Terminal Windows
You'll need to start Node.js and FastAPI separately in two different terminal windows.

2. Start FastAPI (Python)
Step 1: Navigate to the Python API Folder
bash
Copy code
cd python_api
Step 2: Install Dependencies
bash
Copy code
pip install -r requirements.txt
Step 3: Run FastAPI
bash
Copy code
uvicorn blip_service:app --host 0.0.0.0 --port 5000 --reload
🔹 FastAPI will now run on:
📌 http://localhost:5000/docs (Swagger UI)

3. Start Node.js (Express)
Step 1: Open a New Terminal & Navigate to Node.js API
bash
Copy code
cd node_api
Step 2: Install Dependencies
bash
Copy code
npm install
Step 3: Run Node.js Server
bash
Copy code
npm start
🔹 Node.js will now run on:
📌 http://localhost:8000