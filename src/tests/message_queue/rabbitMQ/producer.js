const amqp = require("amqplib");
const message = "Hello, RabbitMQ for NODEJS";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost:5672");
    const channel = await connection.createChannel();
    const queueName = "test-topic";

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(` message Sent ${message}`);
  } catch (error) {
    console.error(error);
  }
};

runProducer().catch((err) => console.log(err));

