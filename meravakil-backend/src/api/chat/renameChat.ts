import { z } from "zod";
import { Request, Response } from "express";
import prisma from "../../lib/prisma";

const renameChatSchema = z.object({
  chatId: z.string().uuid("chatId must be a valid UUID"),
  title: z.string().min(1).max(100),
});

const renameChat = async (req: Request, res: Response) => {
  const parseResult = renameChatSchema.safeParse(req.body);
  if (!parseResult.success) {
    const { path, message } = parseResult.error.errors[0];
    return res
      .status(400)
      .json({ error: `Invalid ${path.join(".")}: ${message}` });
  }

  // @ts-ignore
  const userId = req.userId;
  const { chatId, title } = parseResult.data;

  try {
    // Verify ownership
    const existing = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { userId: true },
    });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Perform update
    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { title },
      select: { id: true, title: true },
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error renaming chat:", err);
    return res.status(500).json({ error: "Could not rename chat" });
  }
};

export default renameChat;
