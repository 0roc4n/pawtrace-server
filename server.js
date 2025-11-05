import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// --- Supabase Config ---
const SUPABASE_URL = "https://kmfpanzbakilqmrrqtjm.supabase.co/rest/v1/pet_gps";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZnBhbnpiYWtpbHFtcnJxdGptIiwicm9sIjoiYW5vbiIsImlhdCI6MTc1MDIwMDkyMCwiZXhwIjoyMDY1Nzc2OTIwfQ.JTPFmFV3IZfFCTEUHvTPClzwo8aGMt66nNRnRCl1AJw";


// --- Allow CORS (so IoT devices and browsers can send data freely) ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// --- Root Endpoint ---
app.get("/", (req, res) => {
  res.send("✅ Supabase IoT Proxy is running. try it on postman or insomnia: api key is hardcoded: " + SUPABASE_KEY);
  console.log("api key is hardcoded");
  console.log(SUPABASE_KEY);
});

// --- IoT Data Forwarding Endpoint ---
app.post("/api/update", async (req, res) => {
  const { device_id, is_leash, lat, lng } = req.body;

  if (!device_id) {
    return res.status(400).json({ error: "device_id required" });
  }

  try {
    console.log(`📡 Forwarding device ${device_id} to Supabase...`);
    console.log(req.body);

    const response = await fetch(`${SUPABASE_URL}?device_id=eq.${device_id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        is_leash,
        latitude: lat,
        longitude: lng,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Supabase response:", text);
      return res.status(response.status).send(text);
    }

    res.json({ success: true, message: "✅ Data forwarded to Supabase" });
  } catch (err) {
    console.error("💥 Proxy error:", err);
    res.status(500).json({ error: "Failed to send to Supabase" });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 IoT Proxy running on port ${PORT}`));
