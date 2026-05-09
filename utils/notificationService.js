const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;
const isTwilioEnabled = process.env.TWILIO_ENABLED === 'true';

let client;
if (isTwilioEnabled && accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    client = twilio(accountSid, authToken);
    console.log('📱 Twilio Notification Service initialized in LIVE MODE');
  } catch (e) {
    console.warn('⚠️ Twilio Initialization failed:', e.message);
  }
} else {
  console.log('🧪 Twilio Notification Service is in MOCK MODE (Credentials missing or invalid)');
}

/**
 * Sends a standard SMS to the user
 */
exports.sendBookingSms = async (user, booking, slot) => {
  const message = `Hello ${user.name}, Your booking for Slot ${slot.slotId} at Garuda Mall Parking is confirmed (Ref: ${booking.bookingNumber}). Visit our dashboard for details.`;

  if (!client) {
    console.log(`[DEV MODE - SMS] To: ${user.phone} | Msg: ${message}`);
    return { success: true, mode: 'development' };
  }

  try {
    const to = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`;
    const res = await client.messages.create({
      body: message,
      from: fromPhone,
      to: to
    });
    return { success: true, sid: res.sid };
  } catch (err) {
    console.error('[Twilio SMS Error]:', err.message);
    return { success: false, error: err.message };
  }
};



/**
 * Sends payment received receipt
 */
exports.sendPaymentReceipt = async (user, amount, booking) => {
  const message = `Hello ${user.name}, Payment of ₹${amount} received for Garuda Mall Parking. Your slot has been released. Thank you!`;

  if (!client) {
    console.log(`[DEV MODE - Payment Receipt] To: ${user.phone} | Msg: ${message}`);
    return { success: true, mode: 'development' };
  }

  try {
    const to = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`;
    await client.messages.create({
      body: message,
      from: fromPhone,
      to: to
    });
    return { success: true };
  } catch (err) {
    console.error('[Twilio Receipt Error]:', err.message);
    return { success: false };
  }
};
