const amqp = require('amqplib/callback_api');
const commonConstants = require('../common/commonConstants.js');
const co2StatsWorker = require('./co2StatsWorker.js');
const currentCO2StatsWorker = require('./currentCO2StatsWorker.js');

amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
        throw error0;
    }
    connection.createChannel((error1, webappToWorkerChannel) => {
        if (error1) {
            throw error1;
        }

        connection.createChannel((error2, workerToWebappChannel) => {
            if (error2) {
                throw error2;
            }

            const webappToWorkerQueue = commonConstants.rmqChannelNames.webappToWorker;
            const workerToWebappQueue = commonConstants.rmqChannelNames.workerToWebapp;

            webappToWorkerChannel.assertQueue(webappToWorkerQueue, {durable: false});
            workerToWebappChannel.assertQueue(workerToWebappQueue, {durable: false});
            console.info("[RMQ] Waiting for messages in %s. To exit press CTRL+C", webappToWorkerQueue);

            webappToWorkerChannel.consume(webappToWorkerQueue, async (msg) => {
                const messageString = msg.content.toString();
                console.info("[RMQ] Received %s", messageString);
                let resultData;
                if (messageString === commonConstants.messageNames.calcCO2Stats) {
                    resultData = await co2StatsWorker.calculate();
                } else if (messageString === commonConstants.messageNames.currentCO2Stats) {
                    resultData = await currentCO2StatsWorker.calculate();
                }

                const responseMsg = JSON.stringify({name: messageString, data: resultData});

                workerToWebappChannel.sendToQueue(workerToWebappQueue, Buffer.from(responseMsg));
                console.info("[RMQ] Sent %s", resultData);

            }, {noAck: true});
        });
    });
});