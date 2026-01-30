import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS?.replace(/\s+/g, ''), // Strip spaces from App Password
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  // Debug log
  console.log('Attempting to send email...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not set in .env. Email not sent.');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

export const sendBookingConfirmation = async (booking) => {
  try {
    const isConfirmed = booking.status === 'confirmed';
    const subjectPrefix = isConfirmed ? 'Booking Confirmed' : 'Booking Received';
    const headerColor = isConfirmed ? '#4CAF50' : '#FF9800'; // Green vs Orange
    const headerText = isConfirmed ? 'Booking Confirmed!' : 'Booking Received!';
    const introText = isConfirmed
      ? 'Your booking has been successfully confirmed.'
      : 'We have received your booking request. It is currently pending confirmation/payment.';

    // 1. Send to Client (User)
    if (booking.user && booking.user.email) {
      const userHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${headerColor};">${headerText}</h2>
          <p>Hi ${booking.user.username || 'there'},</p>
          <p>${introText}</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Vehicle:</strong> ${booking.vehicle?.brand} ${booking.vehicle?.model} (${booking.vehicle?.name})</p>
            <p><strong>Dates:</strong> ${new Date(booking.pickupDate).toDateString()} - ${new Date(booking.dropoffDate).toDateString()}</p>
            <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>
            <p><strong>Status:</strong> ${booking.status.toUpperCase()}</p>
          </div>
          
          <p>Thank you for choosing Rent Wheels!</p>
        </div>
      `;

      await sendEmail({
        to: booking.user.email,
        subject: `${subjectPrefix} #${booking.bookingId}`,
        html: userHtml
      });
    }

    // 2. Send to Vehicle Owner (Partner)
    // Ensure vehicle and ownerId are populated
    if (booking.vehicle && booking.vehicle.ownerId && booking.vehicle.ownerId.email) {
      const owner = booking.vehicle.ownerId;
      const ownerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2196F3;">New Booking Alert!</h2>
            <p>Hi ${owner.username || 'Partner'},</p>
            <p>Good news! Your vehicle has been booked.</p>
            
            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Booking Details</h3>
              <p><strong>Vehicle:</strong> ${booking.vehicle.brand} ${booking.vehicle.model}</p>
              <p><strong>Booked By:</strong> ${booking.user?.username || 'Guest'}</p>
              <p><strong>Dates:</strong> ${new Date(booking.pickupDate).toDateString()} - ${new Date(booking.dropoffDate).toDateString()}</p>
              <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
              <p><strong>Earnings:</strong> ₹${booking.totalPrice} (approx)</p>
              <p><strong>Status:</strong> ${booking.status.toUpperCase()}</p>
            </div>
            
            <p>Please ensure the vehicle is ready for pickup once confirmed.</p>
          </div>
        `;

      await sendEmail({
        to: owner.email,
        subject: `New Booking for ${booking.vehicle.name}`,
        html: ownerHtml
      });
    } else {
      console.warn('Vehicle Owner email not found, skipping partner email.');
    }

  } catch (error) {
    console.error('Error in sendBookingConfirmation:', error);
  }
};

export default { sendEmail, sendBookingConfirmation };
