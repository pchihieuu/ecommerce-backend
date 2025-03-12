"use strict";
const amqp = require("amqplib");

async function producerOrderMessage() {
  const connection = await amqp.connect("amqp://guest:12345@localhost:5672");
  const channel = await connection.createChannel();

  const queueName = "ordered-queue-message";

  await channel.assertQueue(queueName, { durable: true });

  for (let index = 0; index < 10; index++) {
    const message = `Ordered queue message ${index}`;
    console.log(message);
    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    });
  }

  setTimeout(() => {
    connection.close();
  }, 1000);
}

producerOrderMessage().catch((err) => console.error(err));
