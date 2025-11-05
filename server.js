import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Environment variables (or replace directly for testing)
const SUPABASE_URL = "https://kmfpanzbakilqmrrqtjm.supabase.co/rest/v1/pet_gps";
const SUPABASE_KEY = process.env.SUPABASE_KEY;

app.post("/api/update", async (req, res) => {
  const { device_id, is_leash, lat, lng } = req.body;

  if (!device_id) {
    return res.status(400).json({ error: "device_id required" });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}?device_id=eq.${device_id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_leash, lat, lng }),
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to send to Supabase" });
  }
});

app.get("/", (req, res) => {
  res.send("Supabase IoT Proxy is running.");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
