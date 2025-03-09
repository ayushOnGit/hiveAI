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

        // ✅ Use the latest "gemini-1.5-flash" model
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

// Start server
app.listen(8000, () => console.log("Server running on port 8000"));
