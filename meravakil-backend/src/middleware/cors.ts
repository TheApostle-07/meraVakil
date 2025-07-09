// src/middleware/cors.ts
import cors from "cors";
export default cors({ origin: process.env.ALLOWED_ORIGIN ?? "*" });

