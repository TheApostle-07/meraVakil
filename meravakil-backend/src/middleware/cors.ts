// src/middleware/cors.ts
import cors from "cors";
export default cors({
  origin: "https://meravakil.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});
