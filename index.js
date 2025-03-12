const express = require("express");
const multer = require("multer");
const axios = require("axios");
require("dotenv").config();

const app = express();
const upload = multer();

// Hello World endpoint
app.get("/hello", (req, res) => {
    res.send("Hello, World!");
});

// Image analysis endpoint
app.post("/analyze-image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const imageBuffer = req.file.buffer;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Missing GEMINI_API_KEY in .env file" });
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [
                    {
                        parts: [
                            { text: "Describe this image" },
                            { inline_data: { mime_type: req.file.mimetype, data: imageBuffer.toString("base64") } }
                        ]
                    }
                ]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        res.json({ description: response.data });

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.message, details: error.response?.data || "Unknown error" });
    }
});

// Azure Speech-to-Text endpoint
app.post("/speech-to-text", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file uploaded" });
        }

        const audioBuffer = req.file.buffer;
        const azureApiKey = process.env.AZURE_SPEECH_KEY;
        const azureRegion = process.env.AZURE_SPEECH_REGION;

        if (!azureApiKey || !azureRegion) {
            return res.status(500).json({ error: "Missing Azure Speech API credentials in .env file" });
        }

        const response = await axios.post(
            `https://${azureRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`,
            audioBuffer,
            {
                headers: {
                    "Ocp-Apim-Subscription-Key": azureApiKey,
                    "Content-Type": "audio/wav"
                }
            }
        );

        res.json({ transcription: response.data });
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.message, details: error.response?.data || "Unknown error" });
    }
});


app.listen(8000, () => console.log("Server running on port 8000"));
