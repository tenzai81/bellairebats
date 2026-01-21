import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  type: "payment_confirmed" | "booking_confirmed" | "booking_cancelled" | "refund_processed" | "coach_new_booking" | "coach_booking_cancelled";
  recipientEmail: string;
  recipientName: string;
  coachName: string;
  athleteName?: string;
  sessionDate: string;
  startTime: string;
  duration: number;
  sessionType: string;
  price: number;
  refundAmount?: number;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getEmailContent = (data: BookingEmailRequest) => {
  const sessionInfo = `
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Coach:</strong> ${data.coachName}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${formatDate(data.sessionDate)}</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> ${formatTime(data.startTime)}</p>
      <p style="margin: 5px 0;"><strong>Duration:</strong> ${data.duration} minutes</p>
      <p style="margin: 5px 0;"><strong>Session Type:</strong> ${data.sessionType === "one_on_one" ? "1-on-1" : "Group"}</p>
      <p style="margin: 5px 0;"><strong>Price:</strong> $${data.price.toFixed(2)}</p>
    </div>
  `;

  switch (data.type) {
    case "payment_confirmed":
      return {
        subject: "Payment Confirmed - Your Training Session is Booked!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Payment Confirmed! ✅</h1>
            <p>Hi ${data.recipientName},</p>
            <p>Great news! Your payment has been received and your training session is now confirmed.</p>
            ${sessionInfo}
            <p>We're excited to see you at your session! If you need to make any changes, please contact us as soon as possible.</p>
            <p style="color: #666; font-size: 14px;">Thank you for choosing Bellaire Bats!</p>
          </div>
        `,
      };

    case "booking_confirmed":
      return {
        subject: "Your Training Session is Confirmed!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Session Confirmed! 🎉</h1>
            <p>Hi ${data.recipientName},</p>
            <p>Your coach has confirmed your upcoming training session.</p>
            ${sessionInfo}
            <p>Get ready for an amazing session! If you have any questions, don't hesitate to reach out.</p>
            <p style="color: #666; font-size: 14px;">See you on the field!</p>
          </div>
        `,
      };

    case "booking_cancelled":
      return {
        subject: "Training Session Cancelled",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Session Cancelled</h1>
            <p>Hi ${data.recipientName},</p>
            <p>Your training session has been cancelled.</p>
            ${sessionInfo}
            <p>We're sorry this session couldn't take place. Please book another session when you're ready.</p>
            <p style="color: #666; font-size: 14px;">We hope to see you soon!</p>
          </div>
        `,
      };

    case "refund_processed":
      return {
        subject: "Refund Processed - Training Session Cancelled",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Refund Processed 💰</h1>
            <p>Hi ${data.recipientName},</p>
            <p>Your training session has been cancelled and a refund of <strong>$${(data.refundAmount || data.price).toFixed(2)}</strong> has been processed.</p>
            ${sessionInfo}
            <p>The refund should appear in your account within 5-10 business days, depending on your bank.</p>
            <p>We're sorry this session couldn't take place. Please book another session when you're ready.</p>
            <p style="color: #666; font-size: 14px;">Thank you for your patience!</p>
          </div>
        `,
      };

    case "coach_new_booking":
      return {
        subject: "New Training Session Booked! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">New Booking Received! 🎉</h1>
            <p>Hi ${data.recipientName},</p>
            <p>Great news! <strong>${data.athleteName || "An athlete"}</strong> has booked a training session with you.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Athlete:</strong> ${data.athleteName || "Not provided"}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${formatDate(data.sessionDate)}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${formatTime(data.startTime)}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${data.duration} minutes</p>
              <p style="margin: 5px 0;"><strong>Session Type:</strong> ${data.sessionType === "one_on_one" ? "1-on-1" : "Group"}</p>
              <p style="margin: 5px 0;"><strong>Earnings:</strong> $${data.price.toFixed(2)}</p>
            </div>
            <p>Log in to your dashboard to view the booking details and manage your schedule.</p>
            <p style="color: #666; font-size: 14px;">Thank you for being part of Bellaire Bats!</p>
          </div>
        `,
      };

    case "coach_booking_cancelled":
      return {
        subject: "Training Session Cancelled",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Session Cancelled</h1>
            <p>Hi ${data.recipientName},</p>
            <p>A training session with <strong>${data.athleteName || "an athlete"}</strong> has been cancelled.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Athlete:</strong> ${data.athleteName || "Not provided"}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${formatDate(data.sessionDate)}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${formatTime(data.startTime)}</p>
              <p style="margin: 5px 0;"><strong>Duration:</strong> ${data.duration} minutes</p>
              <p style="margin: 5px 0;"><strong>Session Type:</strong> ${data.sessionType === "one_on_one" ? "1-on-1" : "Group"}</p>
            </div>
            <p>This time slot is now available for other bookings.</p>
            <p style="color: #666; font-size: 14px;">Thank you for your understanding!</p>
          </div>
        `,
      };

    default:
      throw new Error("Invalid email type");
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BookingEmailRequest = await req.json();

    const { subject, html } = getEmailContent(data);

    const emailResponse = await resend.emails.send({
      from: "Bellaire Bats <onboarding@resend.dev>",
      to: [data.recipientEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    const message = error instanceof Error ? error.message : "Failed to send email";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
