const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Generic action email ───────────────────────────────────────────
const sendActionEmail = async (to, userName, subject, actionTitle, actionDetail, color = '#1a4a3a') => {
  try {
    await transporter.sendMail({
      from: `"MiniCRM" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#fffdf7;border:1px solid #e8e0d0;border-radius:16px;overflow:hidden;">
          <div style="background:#1a4a3a;padding:28px 36px;display:flex;align-items:center;gap:12px;">
            <span style="font-size:22px;">🏢</span>
            <span style="color:#f5f0e8;font-size:20px;font-weight:700;">MiniCRM</span>
          </div>
          <div style="padding:36px;">
            <p style="color:#7a7060;font-size:14px;margin:0 0 6px;">Hey ${userName},</p>
            <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 20px;">${actionTitle}</h2>
            <div style="background:#f5f0e8;border-left:4px solid ${color};border-radius:8px;padding:16px 20px;margin:0 0 20px;">
              <p style="margin:0;color:#1a1a1a;font-size:15px;line-height:1.6;">${actionDetail}</p>
            </div>
            <p style="color:#7a7060;font-size:13px;margin:0 0 24px;">
              This is an automated notification from your MiniCRM account.
            </p>
            <a href="https://mini-crm-phi-gray.vercel.app"
              style="display:inline-block;background:#1a4a3a;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;">
              Open MiniCRM →
            </a>
          </div>
          <div style="padding:20px 36px;border-top:1px solid #e8e0d0;text-align:center;">
            <p style="color:#b0a898;font-size:12px;margin:0;">MiniCRM • Built for modern sales teams</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error('[Email] Failed to send:', err.message);
  }
};

// ─── Specific action helpers ────────────────────────────────────────

const notifyLeadAdded = async (userId, customerName, leadTitle, leadValue, leadStatus) => {
  const user = await User.findById(userId);
  if (!user?.email) return;
  await sendActionEmail(
    user.email,
    user.name,
    `✨ New lead added — ${leadTitle}`,
    'A new lead has been added',
    `<strong>${leadTitle}</strong> was added to <strong>${customerName}</strong><br/>
     Status: ${leadStatus} &nbsp;|&nbsp; Value: $${Number(leadValue).toLocaleString()}`,
    '#1a4a3a'
  );
};

const notifyLeadStatusChanged = async (userId, customerName, leadTitle, oldStatus, newStatus) => {
  const user = await User.findById(userId);
  if (!user?.email) return;
  const colorMap = { Converted: '#065f46', Lost: '#991b1b', Contacted: '#b45309', New: '#1d4ed8' };
  await sendActionEmail(
    user.email,
    user.name,
    `🔄 Lead status updated — ${leadTitle}`,
    'A lead status has changed',
    `<strong>${leadTitle}</strong> (${customerName})<br/>
     <strong>${oldStatus}</strong> → <strong>${newStatus}</strong>`,
    colorMap[newStatus] || '#1a4a3a'
  );
};

const notifyLeadDeleted = async (userId, customerName, leadTitle) => {
  const user = await User.findById(userId);
  if (!user?.email) return;
  await sendActionEmail(
    user.email,
    user.name,
    `🗑️ Lead deleted — ${leadTitle}`,
    'A lead has been removed',
    `<strong>${leadTitle}</strong> was deleted from <strong>${customerName}</strong>`,
    '#991b1b'
  );
};

const notifyCustomerCreated = async (userId, customerName) => {
  const user = await User.findById(userId);
  if (!user?.email) return;
  await sendActionEmail(
    user.email,
    user.name,
    `👤 New customer added — ${customerName}`,
    'A new customer has been added',
    `<strong>${customerName}</strong> was added to your CRM`,
    '#1a4a3a'
  );
};

// ─── Follow-up reminder cron ────────────────────────────────────────

const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const leads = await Lead.find({
      followUpDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $nin: ['Converted', 'Lost'] },
    });

    console.log(`[Reminders] ${leads.length} follow-ups due today`);

    for (const lead of leads) {
      const customer = await Customer.findById(lead.customerId);
      if (!customer) continue;
      const user = await User.findById(customer.ownerId);
      if (!user?.email) continue;
      await sendActionEmail(
        user.email,
        user.name,
        `⏰ Follow-up reminder — ${lead.title}`,
        'You have a follow-up due today!',
        `<strong>${lead.title}</strong> (${customer.name})<br/>
         Don't forget to follow up with this lead today.`,
        '#b45309'
      );
    }
  } catch (err) {
    console.error('[Reminders] Error:', err.message);
  }
};

const startReminderCron = () => {
  cron.schedule('0 8 * * *', () => {
    console.log('[Reminders] Running daily follow-up check...');
    checkAndSendReminders();
  });
  console.log('[Reminders] Cron job scheduled — runs daily at 8:00 AM');
};

module.exports = {
  startReminderCron,
  checkAndSendReminders,
  notifyLeadAdded,
  notifyLeadStatusChanged,
  notifyLeadDeleted,
  notifyCustomerCreated,
};