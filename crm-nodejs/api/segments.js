const express = require("express");
const router = express.Router();
const axios = require("axios");

const SEGMENTS_API = "http://localhost:5000/api";

// Прокси для получения сегментов
router.get("/segments", async (req, res) => {
    try {
        const response = await axios.get(`${SEGMENTS_API}/segments`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: "Не удалось получить сегменты",
            details: error.message 
        });
    }
});

// Прокси для получения статистики
router.get("/stats", async (req, res) => {
    try {
        const response = await axios.get(`${SEGMENTS_API}/stats`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: "Не удалось получить статистику",
            details: error.message 
        });
    }
});

// Прокси для создания сегмента
router.post("/segments", async (req, res) => {
    try {
        const response = await axios.post(`${SEGMENTS_API}/create-segment`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ 
            error: "Не удалось создать сегмент",
            details: error.message 
        });
    }
});

module.exports = router;
