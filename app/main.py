from fastapi import FastAPI, HTTPException, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle
import random
import os

from utility.utils import normalize_text, faiss_index, process_uploads
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("all-MiniLM-L6-v2")
cluster_algo = pickle.load(open("models/Clustering.pkl", "rb"))

faiss_data_store = faiss_index()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search/{search_query}")
def search(search_query: str):
    normalized_query = normalize_text(search_query)
    query_vector = model.encode(normalized_query, convert_to_numpy=True)
    predicted_cluster = int(cluster_algo.predict(query_vector.reshape(1, -1))[0])

    D, I = faiss_data_store[predicted_cluster]['index'].search(np.array([query_vector]), 5)

    results = []
    for idx in I[0]:
        if 0 <= idx < len(faiss_data_store[predicted_cluster]["data"]):
            item = faiss_data_store[predicted_cluster]["data"][idx]

            # Safe copy with JSON-compatible types
            result = {
                "text": item.get("text", ""),
                "file": item.get("file", ""),
                "cluster": int(item.get("cluster", predicted_cluster)),
                "keywords": item.get("keywords", []),
                "segments": item.get("segments", []),
                "similarity": round(
                    float(cosine_similarity(query_vector.reshape(1, -1),
                                            np.array(item["vector"]).reshape(1, -1))[0][0]),
                    4
                )
            }
            results.append(result)

    return JSONResponse(content=results)

@app.post("/upload")
def Upload(video_file: UploadFile, background_tasks: BackgroundTasks):
    if video_file.content_type.split("/")[0] != "video":
        raise HTTPException(status_code=422, detail="Unsupported file type")

    filename = f"{os.path.splitext(video_file.filename)[0]}_{random.randint(0, 1000)}"
    filepath = f"videos/{filename}.mp4"

    with open(filepath, "wb") as file:
        file.write(video_file.read())

    background_tasks.add_task(process_uploads, filename, model, cluster_algo, faiss_data_store)

    return {"message": "Video upload started and processing in background."}


@app.get("/query")
def get_query():
    results = []
    for key, value in faiss_data_store.items():
        for i in faiss_data_store[key]["data"]:
            results.append(i)
    return JSONResponse(content=results)