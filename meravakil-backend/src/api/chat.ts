import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { answerQuery } from "../lib/ai";

const schema = z.object({ query: z.string().min(4) });

const chatHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad query" });
    return;
  }

  try {
    const { answer, grounded } = await answerQuery(parsed.data.query);
    res.json({ answer, grounded });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "LLM error" });
  }
};

export default chatHandler;