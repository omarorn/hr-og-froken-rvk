const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/incoming', (req, res) => {
    console.log("Incoming call from Twilio");
    // Placeholder TwiML response
    const twiml = `
        <Response>
            <Say language="is-IS">Halló, þetta er gervigreindarþjónn. Hvað get ég gert fyrir þig?</Say>
            <Pause length="5"/>
            <Say>Ég heyrði ekki neitt. Bless!</Say>
        </Response>`;
    res.type('text/xml');
    res.send(twiml);
});

app.listen(3000, () => {
    console.log("AI Phone Agent running on port 3000");
});
