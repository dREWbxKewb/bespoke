import express, { Router } from 'express';
import axios from 'axios';
import { PrismaClient, User, DirectMessages } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();
const dmRouter: Router = express.Router();

dmRouter.get(`/findUsers`, async (req: Request, res: Response) => {
  // console.log(req.body);
  try {
    // const { id } = (req.user as User) || {};
    const allUsers = await prisma.user.findMany();
    // console.log(allUsers)
    res.status(200).send(allUsers);
  } catch (err) {
    console.log('Failed to get weight', err);
    res.sendStatus(500);
  }
});

dmRouter.get('/retrieveMessages', async (req: Request, res: Response) => {
  console.log(req);
  try {
    const { receiverId } = req.query;
    const { id } = req.user as { id: number };

    const conversation = await prisma.directMessages.findMany({
      where: {
        OR: [
          { receiverId: Number(receiverId), senderId: id },
          { receiverId: id, senderId: Number(receiverId) }
        ]
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
    res.status(200).send(conversation);
  } catch (err) {
    console.log(err);
  }
});

dmRouter.post('/message', async (req: Request, res: Response) => {
  // console.log(req);
  try {
    const { receiverId, text, fromMe } = req.body.message;

    const { id } = req.user as User;

    const newMessage = await prisma.directMessages.create({
      data: {
        senderId: id,
        receiverId: receiverId,
        text: text,
        fromMe: fromMe,
      },
    });
    res.status(201).send(newMessage);
  } catch {
    res.sendStatus(500);
  }
});

export default dmRouter;
