const amqp = require("amqplib");

const runConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost:5672");
    const channel = await connection.createChannel();
    const queueName = "test-topic";

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(
      queueName,
      (message) => {
        console.log(`Rmessage_received:::${message.content.toString()}`);
      },
      {
        noAck: true, // Automatically acknowledges messages once they've been processed
      }
    );
  } catch (error) {
    console.log("Error rabbitmq: ", error);
  }
};

runConsumer().catch((err) => console.log(err));
