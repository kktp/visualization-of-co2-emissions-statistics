const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const rmqProducer = require('./rmqProducer.js');
const commonConstants = require('../common/commonConstants.js');


const main = async () => {
  const websockets = [];

  const sendMsgToWorker = await rmqProducer.prepareMessageChannels((msgFromWorker) => {
    // This is executed if we get a message from the workers
    for (let ws of websockets) {
      if (ws.readyState === 1) {
        //websocket is connected
        ws.send(msgFromWorker);
        console.info("[SENT WEBSOCKET MSG]", msgFromWorker);
      }
    }
  });
  app.use((request, _, next) => {
    console.info(`[INCOMING REQUEST] - PATH: ${request.originalUrl} - USER-AGENT: ${request.headers['user-agent']}`);
    next();
  });
  app.ws("/echo", (ws, request) => {
    websockets.push(ws);

    ws.on('message', (msg) => {
      console.info('[RECEIVED WEBSOCKET MSG]', msg);
      sendMsgToWorker(msg);
    });

    ws.on('close', () => {
      for (let i = 0; i < websockets.length; i++) {
        if (websockets[i] === ws) {
          websockets.splice(i, 1);
        }
      }
    });
  });

  app.use(express.static("frontend"));
};


main();
app.listen(3000);
