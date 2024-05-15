import { Record, Static, String } from "runtypes";

export const DB_SCHEMA = "queues";

export interface IGenericQueueRecord extends IQueueRecord {
  messageContent: any;
}

export const QueueRecord = Record({
  queue_name: String,
});

export type IQueueRecord = Static<typeof QueueRecord>;
