const amqp = require("amqplib");

const log = console.log;
console.log = function () {
  log.apply(console, [new Date()].concat(arguments));
};
const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost:5672");
    const channel = await connection.createChannel();

    const notificationExchange = "notificationExchange";
    const notificationQueue = "notificationQueueProcess";
    const notificationExchangeDLX = "notificationExchangeDLX";
    const notificationRoutingKeyDLX = "notificationRoutingKeyDLX";

    // Delete the existing queue to avoid conflicts with changed parameters
    try {
      await channel.deleteQueue(notificationQueue);
      console.log(`Deleted existing queue: ${notificationQueue}`);
    } catch (err) {
      console.log(
        `Queue ${notificationQueue} might not exist yet, continuing...`
      );
    }

    // create Exchange
    await channel.assertExchange(notificationExchange, "direct", {
      durable: true,
    });

    // create Exchange for DLX
    await channel.assertExchange(notificationExchangeDLX, "direct", {
      durable: true,
    });

    // create Queue with TTL and a maximum message limit
    const queueResult = await channel.assertQueue(notificationQueue, {
      exclusive: false, // cho phep cac ket noi truy cap vao cung mot luc hang doi
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
      arguments: {
        "x-message-ttl": 10000, // 10 seconds TTL for the entire queue
        "x-max-length": 10, // Max number of messages in queue
        "x-overflow": "reject-publish", // Reject messages when queue is full
      },
    });

    // create binding
    await channel.bindQueue(queueResult.queue, notificationExchange, "");

    // send message - with delivery mode 2 (persistent)
    const message = "A new product was created!";
    await channel.sendToQueue(queueResult.queue, Buffer.from(message), {
      persistent: true, // Messages survive broker restart
      timestamp: Date.now(), // Add timestamp for tracking
    });
    console.log(`Message sent: ${message}`);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.log("Error rabbitmq:", error);
  }
};

runProducer().catch((err) => console.log(err));
