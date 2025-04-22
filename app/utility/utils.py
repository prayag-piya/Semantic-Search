import re
import unicodedata
import whisper
import faiss
import pickle
import json
import spacy
from io import BytesIO
import librosa

nlp = spacy.load("en_core_web_lg")
audio_model = whisper.load_model("tiny")


def normalize_text(text: str) -> str:
    text = text.lower()
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def transcribe_audio(file_path: str) -> dict:
    return audio_model.transcribe(file_path, fp16=False)


def faiss_index():
    with open("models/index_metadata.pkl", "rb") as f:
        loaded_metadata = pickle.load(f)

    for cluster_id in loaded_metadata:
        index = faiss.read_index(f"models/index_cluster_{cluster_id}.faiss")
        loaded_metadata[cluster_id]['index'] = index

    return loaded_metadata


def read_database(file_path: str = "data/database.json") -> json:
    with open(file_path, "r") as file:
        return json.load(file)


def process_uploads(file_path: str, vector_model, cluster_algo, faiss_data_store) -> None:
    result = transcribe_audio(f"videos/{file_path}.mp4")
    text = result["text"]
    normalized = normalize_text(text)
    vectorized = vector_model.encode(normalized)

    cluster_id = int(cluster_algo.predict(vectorized.reshape(1, -1))[0])

    # Extract named entities as keywords
    keywords = []
    for segment in result["segments"]:
        doc = nlp(segment["text"])
        keywords.extend([ent.text for ent in doc.ents])

    faiss_entry = {
        "text": text,
        "vector": vectorized.tolist(),
        "cluster": cluster_id,
        "file": file_path,
        "keywords": keywords,
        "segments": result["segments"]
    }

    faiss_data_store[cluster_id]["index"].add(vectorized.reshape(1, -1))
    if "data" not in faiss_data_store[cluster_id]:
        faiss_data_store[cluster_id]["data"] = []
    faiss_data_store[cluster_id]["data"].append(faiss_entry)

    # Save FAISS index
    faiss.write_index(faiss_data_store[cluster_id]["index"], f"models/index_cluster_{cluster_id}.faiss")

    # Strip FAISS index from metadata before pickling
    serializable_metadata = {
        cid: {k: v for k, v in cluster.items() if k != "index"}
        for cid, cluster in faiss_data_store.items()
    }

    with open("models/index_metadata.pkl", "wb") as f:
        pickle.dump(serializable_metadata, f)

    print(f"Updated FAISS index and metadata for cluster {cluster_id}")
