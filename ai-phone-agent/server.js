
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up logging
const logFile = path.join(__dirname, 'logs.nd');
const statusFile = path.join(__dirname, 'status.nd');

// Simple logging function with error tracking
const logActivity = (message, isError = false) => {
    const timestamp = new Date().toISOString();
    let logEntry = `${timestamp} - ${message}\n`;
    
    // Make errors more visible in logs
    if (isError) {
        logEntry = `${timestamp} - ERROR: ${message}\n`;
    }
    
    // Append to logs file
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
    
    console.log(logEntry);
};

// Update status file
const updateStatus = (status) => {
    const timestamp = new Date().toISOString();
    const statusContent = `# Live Agent Status\n- Updated: ${timestamp}\n- Last call: ${status.lastCall || 'none'}\n- Last message: ${status.lastMessage || 'none'}\n- Status: ${status.status || 'ready'}\n- Connection issues: ${status.connectionIssues ? 'Yes (' + status.connectionIssues + ')' : 'None'}\n`;
    
    fs.writeFile(statusFile, statusContent, (err) => {
        if (err) console.error('Error writing to status file:', err);
    });
};

// Capture connection issues
let connectionIssues = [];

// Initialize log files if they don't exist
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '# Debug Logs\n- System initialized\n- Awaiting Twilio webhook\n');
}

if (!fs.existsSync(statusFile)) {
    updateStatus({
        lastCall: 'pending',
        lastMessage: 'none',
        status: 'initializing',
        connectionIssues: null
    });
}

// POST endpoint for client error logging
app.post('/logs.nd', (req, res) => {
    try {
        const { error, operation, timestamp } = req.body;
        
        if (error && operation) {
            const errorMessage = `Client error in ${operation}: ${error}`;
            logActivity(errorMessage, true);
            
            // Track connection issues
            if (!connectionIssues.includes(operation)) {
                connectionIssues.push(operation);
                updateStatus({
                    status: 'degraded',
                    connectionIssues: connectionIssues.join(', ')
                });
            }
        }
        
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error handling client log:', err);
        res.status(500).json({ error: 'Failed to log client error' });
    }
});

app.post('/incoming', (req, res) => {
    logActivity("Incoming call from Twilio");
    
    // Update status
    updateStatus({
        lastCall: 'active',
        lastMessage: 'Greeting',
        status: 'serving',
        connectionIssues: connectionIssues.length ? connectionIssues.join(', ') : null
    });
    
    // Placeholder TwiML response
    const twiml = `
        <Response>
            <Say language="is-IS">Halló, þetta er gervigreindarþjónn. Hvað get ég gert fyrir þig?</Say>
            <Pause length="5"/>
            <Say>Ég heyrði ekki neitt. Bless!</Say>
        </Response>`;
    
    logActivity("Sending TwiML response");
    res.type('text/xml');
    res.send(twiml);
    
    // Update status after call completes
    setTimeout(() => {
        updateStatus({
            lastCall: 'completed',
            lastMessage: 'Call ended',
            status: 'ready',
            connectionIssues: connectionIssues.length ? connectionIssues.join(', ') : null
        });
    }, 10000);
});

// Health check endpoint
app.get('/health-check', (req, res) => {
    res.status(200).send('OK');
    logActivity("Health check request");
});

// Add a status endpoint
app.get('/status', (req, res) => {
    res.json({
        status: connectionIssues.length ? 'degraded' : 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        connectionIssues: connectionIssues.length ? connectionIssues : null
    });
    logActivity("Status check");
});

// Reset connection issues endpoint
app.post('/reset-connection-issues', (req, res) => {
    connectionIssues = [];
    logActivity("Connection issues reset");
    updateStatus({
        status: 'ready',
        connectionIssues: null
    });
    res.status(200).json({ success: true });
});

// Serve log files
app.get('/logs', (req, res) => {
    try {
        const logs = fs.readFileSync(logFile, 'utf8');
        res.type('text/plain').send(logs);
    } catch (err) {
        res.status(500).send('Error reading logs');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logActivity(`AI Phone Agent running on port ${PORT}`);
    updateStatus({
        lastCall: 'none',
        lastMessage: 'none',
        status: 'ready',
        connectionIssues: null
    });
});
