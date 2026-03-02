const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./src/config/db');
connectDB();

const { startReminderCron } = require('./src/services/reminderService');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://mini-crm-frontend.vercel.app', // replace with your actual vercel URL
  ],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/customers', require('./src/routes/customers'));

// Test email endpoint — remove before production
app.get('/api/test-reminders', async (req, res) => {
  const { checkAndSendReminders } = require('./src/services/reminderService');
  await checkAndSendReminders();
  res.json({ msg: 'Reminder check triggered!' });
});

app.get('/', (req, res) => res.json({ ok: true, msg: 'Mini CRM API' }));

startReminderCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port', PORT));