import express from "express";
import multer from "multer";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";

dotenv.config();
const app = express();
const port = 3001;

app.use(cors());

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Initialize Google AI services
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Route to handle image upload and blog generation
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    console.log("File uploaded:", filePath);

    // Upload the file to Gemini
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: req.file.originalname,
    });

    console.log(
      `File uploaded to Gemini: ${uploadResult.file.displayName} as ${uploadResult.file.uri}`
    );

    // Generate blog content using the uploaded file
    const result = await model.generateContent([
      "Write a detailed and engaging blog post based on this image.",
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType,
        },
      },
    ]);

    console.log("Gemini API Response:", result.response.text());

    // Remove the uploaded file from local storage
    fs.unlinkSync(filePath);

    // Send the generated content back to the frontend
    res.json({
      blog: result.response.text(),
      prompt: "Write a detailed and engaging blog post based on this image.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to generate blog content.",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
