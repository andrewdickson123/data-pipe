const express = require('express');
const fs = require('fs');
const axios = require('axios');
const config = require('./config'); 
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Data pipe is running');
});

app.post('/destination', (req, res) => {
  console.log('Destination received:', JSON.stringify(req.body, null, 2));
  res.status(200).send({ received: true });
});

app.post('/event', async (req, res) => {
  const event = req.body;

  const enrichedEvent = {
    receivedAt: new Date().toISOString(),
    source: 'api',
    ...event
  };
  const eventType = event.event;
  console.log('Event received:', JSON.stringify(enrichedEvent, null, 2));
  fs.appendFileSync('events.log', JSON.stringify(enrichedEvent) + '\n');
  //Only forward purchase event
  const shouldForward = config.includes(eventType);
  
  if(shouldForward) {

    console.log(event, 'event is purchase....forward');
  
  try {
    const forwardResponse = await axios.post(
      'http://localhost:3000/destination',
      enrichedEvent
    );

    console.log('Forwarded successfully:', forwardResponse.data);

    res.status(200).send({
      status: 'ok',
      forwarded: true
    });
  } catch (error) {
    console.error('Forwarding failed:', error.message);

    res.status(500).send({
      status: 'error',
      forwarded: false
    });
  }
} else {
  res.status(200).send({
    status: 'ok',
    forwarded: false
  });
}
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});