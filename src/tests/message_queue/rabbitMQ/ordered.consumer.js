"use strict";
const amqp = require("amqplib");

async function consumerOrderMessage() {
  const connection = await amqp.connect("amqp://guest:12345@localhost:5672");
  const channel = await connection.createChannel();

  const queueName = "ordered-queue-message";

  await channel.assertQueue(queueName, { durable: true });

  // set prefetch to 1 ensure only one ack at a time
  channel.prefetch(1);

  channel.consume(queueName, (msg) => {
    const message = msg.content.toString();

    setTimeout(() => {
      console.log(`[x] Received ${message}`);
      channel.ack(msg);
    }, Math.random() * 1000); // Simulate processing time with random delay between 1 and 2 seconds.
  });
}

consumerOrderMessage().catch((err) => console.error(err));
