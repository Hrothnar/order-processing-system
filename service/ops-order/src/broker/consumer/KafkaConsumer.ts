import { EachMessagePayload } from "kafkajs";

export class KafkaConsumer {

    handleMessage = async (message: EachMessagePayload): Promise<void> => {
        console.log("A message received");
        console.dir(message.message.value.toString());
    }

}

export const kafkaConsumer = new KafkaConsumer();