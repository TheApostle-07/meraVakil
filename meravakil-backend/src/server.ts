import "dotenv/config";
import express from "express";
import cors from "./middleware/cors";
import rateLimiter from "./middleware/rateLimit";
import chatRoute from "./api/chat";
import storeUser from "./api/webhook";

const app = express();

app.post("/api/webhook", express.raw({ type: "application/json" }), storeUser);

app.use(cors);
app.use(rateLimiter);
app.use(express.json());

app.post("/api/chat", chatRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
