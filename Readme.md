# 🎥 Semantic Video Search with FastAPI, Whisper and FAISS

This project is a full-stack backend for semantic video search. It allows users to upload video files, transcribe them using OpenAI's Whisper model, extract semantic features and entities, index them using FAISS for fast vector search, and store everything securely using Azure Blob Storage.

## 🚀 Features
- 🎹 Automatic Speech Transcription using Whisper
- 🧠 Semantic Embedding via Sentence Transformers
- 🧵 Clustering using pre-trained scikit-learn models
- ⚡ FAISS Indexing for fast vector search
- 🔍 Search API for querying semantically similar content
- 🔄 Background Processing with FastAPI BackgroundTasks

# 📁 Project Structure
```
├── main.ipynb                 # FastAPI app and endpoints
├── app/
│   └── utility
|       └── utils.py     # Helpers: transcription, normalization, FAISS, Azure
|   └── models/
|        ├── index_metadata.pkl 
|        ├── index_cluster_*.faiss  
|        └── Clustering.pkl 
|   └── videos      # uploaded videos
├── data/
│   └── database.json       # Optional additional storage
├── Front-Search            # Frontend
├── videos/                 # Local temp video files
├── .env                    # Azure credentials and secrets
├── .gitignore
└── README.md
```

# 🛠 Setup Instructions
1. Clone the repository
```
git clone https://github.com/prayag-piya/semantic-video-search.git
cd semantic-video-search
```

2. Install Dependencies
```
pip install -r requirements.txt
python -m spacy download en_core_web_lg
```

3. Run the app
```
uvicorn main:app --reload
```


# 📡 API Endpoints

```POST /upload```

Upload a video (MP4). Triggers background transcription and FAISS indexing.

- Body: multipart/form-data
- Field: video_file (type: video)

```GET /query```

- Get all indexed video transcripts and metadata.

```GET /search/{query}```

- Return top 5 semantically relevant results using cosine similarity over FAISS.
