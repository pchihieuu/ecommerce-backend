const amqp = require("amqplib");

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost:5672");
    const channel = await connection.createChannel();

    const notificationExchange = "notificationExchange";
    const notificationQueue = "notificationQueueProcess";
    const notificationExchangeDLX = "notificationExchangeDLX";
    const notificationRoutingKeyDLX = "notificationRoutingKeyDLX";

    // 1. create exchange
    await channel.assertExchange(notificationExchange, "direct", {
      durable: true,
    });

    // 2. create queue with consistent parameters
    const queueResult = await channel.assertQueue(notificationQueue, {
      exclusive: false,
      durable: true,
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
      arguments: {
        "x-message-ttl": 10000, // Set TTL at queue level for consistency
      },
    });

    // 3. binding exchange with a routing key
    await channel.bindQueue(
      queueResult.queue,
      notificationExchange,
      "" // Use an empty string as default routing key
    );

    // 4. Send message (without setting expiration at message level)
    const msg = "A new product was created";
    await channel.sendToQueue(queueResult.queue, Buffer.from(msg));
    console.log(`A message was sent::${msg}`);

    setTimeout(() => {
      connection.close();
      console.log("Connection closed");
    }, 1000);
  } catch (error) {
    console.log("Error rabbitmq: ", error);
  }
};

runProducer().catch((err) => console.log(err));
