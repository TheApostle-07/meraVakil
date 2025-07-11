import { z } from "zod";
import { Request, Response } from "express";
import prisma from "../../lib/prisma";

const getChatMessagesSchema = z.object({
  chatId: z.string().uuid("chatId must be a valid UUID"),
});

const getChatMessages = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const validationResult = getChatMessagesSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { chatId } = validationResult.data;

  try {
    // Ensure the chat belongs to this user
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { userId: true },
    });
    if (!chat || chat.userId !== userId) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { chatId },
      select: {
        from: true,
        content: true,
      },
    });

    return res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ error: "Could not fetch messages" });
  }
};

export default getChatMessages;
