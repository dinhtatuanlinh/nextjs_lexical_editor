"use client";
import LexicalEditor from "@/components/editor/lexicalEditor";
import { ImageResponse, ImageType } from "@/components/models/imagesModel";
import axios, { AxiosError } from "axios";
import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");

  const handleGetImages = async (pageNumber: number) => {
    try {
      const { data } = await axios.get<ImageResponse>(
        "http://localhost:3010/images",
        {
          headers: {
            "Content-Type": "application/json",
            "x-request-id": "123",
          },
          params: {
            pageNumber,
            pageSize: 50,
          },
        }
      );
      return data;
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        console.error("Error status:", err.response.status);
        console.error("Response data:", err.response.data);
        return { images: [], totalPages: 0 };
      } else {
        console.error("Network error:", err.message);
        return { images: [], totalPages: 0 };
      }
    }
  };
  const handleUploadImage = async (file: File, fileName: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);
      formData.append("type", "image");
      await axios.post(
        "http://localhost:3010/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        console.error("Error status:", err.response.status);
        console.error("Response data:", err.response.data);
      } else {
        console.error("Network error:", err.message);
      }
    }
  };
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Lexical Editor in Next.js</h1>
      <div className="bg-slate-100 py-10">
        <LexicalEditor<ImageType, ImageResponse>
          apiHost={"http://localhost:3010"}
          onChange={setContent}
          handleGetImages={handleGetImages}
          handleUploadImage={handleUploadImage}
        />
      </div>
      <div>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </main>
  );
}
