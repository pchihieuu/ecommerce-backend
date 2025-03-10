const amqp = require("amqplib");
const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost:5672");
    const channel = await connection.createChannel();

    const notificationExchange = "notificationExchange";
    const notificationQueue = "notificationQueueProcess";
    const notificationExchangeDLX = "notificationExchangeDLX";
    const notificationRoutingKeyDLX = "notificationRoutingKeyDLX";

    // create Exchange
    await channel.assertExchange(notificationExchange, "direct", {
      durable: false,
    });

    // create Queue
    const queueResult = await channel.assertQueue(notificationQueue, {
      exclusive: false, // cho phep casc ket noi truy cap vao cung mot luc hang doi
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    });

    // create binding
    await channel.bindQueue(queueResult.queue, notificationExchange);

    // send message
    const message = "A new product was created!";
    await channel.sendToQueue(queueResult.queue, Buffer.from(message), {
      expiration: "10000",
    });
    console.log(`Message sent: ${message}`);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.log("Error rabbitmq: ", error);
  }
};

runProducer().catch((err) => console.log(err));
