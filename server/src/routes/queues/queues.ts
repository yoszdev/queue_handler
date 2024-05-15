import express from "express";
import {
  initQueueMessage,
  mongoConnect,
  retrieveQueueMessage,
} from "../../services/mongodb.service";
import { MongoClient } from "mongodb";
import { IGenericQueueRecord, QueueRecord } from "../../consts/types";
import { isEmpty, isJsonSizeUnder256KB } from "./queueValidation.util";
export const queueRouter = express.Router();

queueRouter.post("/:queue_name", async (req, res) => {
  const { queue_name } = req.params;
  const messageContent = req.body;
  try {
    if (
      isEmpty(messageContent) &&
      QueueRecord.validate(queue_name) &&
      isJsonSizeUnder256KB(messageContent)
    ) {
      res.status(400).json({
        status: "failed",
        message: "Message not valid",
      });
    }
    const queueMessage: IGenericQueueRecord = {
      queue_name,
      messageContent,
    };
    const connection: MongoClient = await mongoConnect();
    const queueResponse = await initQueueMessage(connection, queueMessage);
    res.status(201).json({
      status: "success",
      message: "Message added successfully",
      data: queueResponse,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
queueRouter.get("/:queue_name", async (req, res) => {
  const { queue_name } = req.params;
  const timeoutParam = req.query.timeout as string | undefined;
  const timeout = timeoutParam ? parseInt(timeoutParam, 10) : 10000;
  try {
    const connection: MongoClient = await mongoConnect();
    const message = await retrieveQueueMessage(connection, queue_name, timeout);
    if (message) {
      res.json(message);
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
