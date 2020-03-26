const amqp = require('amqplib/callback_api');
const commonConstants = require('../common/commonConstants.js');


module.exports = {

  prepareMessageChannels: (onMessageFromWorker) => {
    return new Promise((resolve, reject) => {

      amqp.connect('amqp://localhost', (error0, connection) => {
        if (error0) {
          reject(error0);
        }
        connection.createChannel((error1, webappToWorkerChannel) => {
          if (error1) {
            reject(error1);
          }
          connection.createChannel((error2, workerToWebappChannel) => {
            if (error2) {
              reject(error2);
            }

            const webappToWorkerQueue = commonConstants.rmqChannelNames.webappToWorker;
            const workerToWebappQueue = commonConstants.rmqChannelNames.workerToWebapp;

            webappToWorkerChannel.assertQueue(webappToWorkerQueue, {durable: false});
            workerToWebappChannel.assertQueue(workerToWebappQueue, {durable: false});

            const sendToWorker = (msg) => { // msg must be a string
              webappToWorkerChannel.sendToQueue(webappToWorkerQueue, Buffer.from(msg));
              console.info("[RMQ] Sent %s", msg);
            };

            resolve(sendToWorker);

            workerToWebappChannel.consume(workerToWebappQueue, (msg) => {
              const messageString = msg.content.toString();
              console.info("[RMQ] Received %s", messageString);
              onMessageFromWorker(messageString);
            }, {noAck: true});

          });
        });
      });
    });

  }

};

