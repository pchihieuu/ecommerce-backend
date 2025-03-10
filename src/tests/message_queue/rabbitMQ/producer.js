const amqp = require("amqplib");
const message = "New product created successfully";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost:5672");
    const channel = await connection.createChannel();
    const queueName = "test-topic";

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(` message Sent ${message}`);

    setTimeout(() => {
      connection.close();
      console.log("Connection closed");
    }, 500);
  } catch (error) {
    console.error(error);
  }
};

runProducer().catch((err) => console.log(err));
