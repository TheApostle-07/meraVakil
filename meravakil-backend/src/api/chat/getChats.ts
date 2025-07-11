import { Request, Response } from "express";
import prisma from "../../lib/prisma";

const getUserChats = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
      },
    });
    return res.status(200).json(chats);
  } catch (err) {
    console.error("DB error fetching chats:", err);
    return res.status(500).json({ error: "Could not fetch chats" });
  }
};

export default getUserChats;
