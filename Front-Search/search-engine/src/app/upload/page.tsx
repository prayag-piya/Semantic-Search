"use client";
import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video_file", file); // 'video_file' matches the FastAPI param name

    try {
      const response = await fetch("http://192.168.250.53:8000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.detail || "Upload failed");

      setMessage(result.message);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="w-full p-6">
      <div className="flex flex-col items-center gap-4">
        <input
          hidden
          id="upload-file"
          type="file"
          accept="video/*"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) setFile(selected);
          }}
        />
        <label
          className="bg-green-800 text-white cursor-pointer w-fit p-6 h-10 flex items-center justify-center rounded-sm"
          htmlFor="upload-file"
        >
          {file ? file.name : "Choose File"}
        </label>

        <button
          onClick={handleUpload}
          className="bg-blue-700 text-white px-4 py-2 rounded-sm"
        >
          Upload
        </button>

        {message && <p className="text-center text-sm text-white">{message}</p>}
      </div>
    </div>
  );
}
