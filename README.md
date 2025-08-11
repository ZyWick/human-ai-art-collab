# CollabConnect

CollabConnect is a collaborative ideation platform designed to integrate AI-assisted reference recombination into collaborative design. Its main purpose is to help design teams synthesize diverse ideas more effectively during the convergent phase of design, where multiple perspectives must be refined into shared concepts. CollabConnect is designed for commissioned artists working in digital design.

---

## 1. Prerequisites

Before setting up the project, make sure you have:

- **Node.js ≥ 22.x**
- **npm** (comes with Node.js) or **yarn**
- **Git**
- **MongoDB Atlas account** (or access to an existing cluster)
- **AWS account** (for S3 storage)
- **API keys** for:
  - OpenAI
  - Google Gemini
  - RunPod.io

---

## 2. Clone the Repository

```bash
git clone https://github.com/ZyWick/human-ai-art-collab
cd human-ai-art-collab
````

---

## 3. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file inside the `backend` folder with the following:

```env
MONGO_URI="your-mongodb-connection-string"
CLIENT_URL="http://localhost:3000"
OPENAI_API_KEY="your-openai-api-key"
GEMINI_GEN_CAP_API_KEY="your-gemini-api-key"
RUNPOD_BASE_URL_INSTDIFF="https://api.runpod.ai/v2/<instance-diff-id>"
RUNPOD_BASE_URL_SAM2="https://api.runpod.ai/v2/<sam2-id>"
RUN_POD_API_KEY="your-runpod-api-key"
NODE_ENV="dev"
GEMINI_GEN_CAP_MODEL="gemini-2.0-flash"
```

---

## 5. Run the Application

**Start Backend Server:**

```bash
cd backend
npm run dev
```

**Start Frontend Server:**

```bash
cd frontend
npm start
```

---

## 6. Access the Application

Open your browser and visit:

```
http://localhost:3000
```

You should now have the application running locally with full functionality.
