import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelRequest {
  bookingId: string;
}

const sendBookingEmail = async (supabaseUrl: string, emailData: Record<string, unknown>) => {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      console.error("Failed to send email:", await response.text());
    } else {
      console.log("Email sent successfully");
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseClient = createClient(
    supabaseUrl,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const { bookingId }: CancelRequest = await req.json();

    if (!bookingId) {
      throw new Error("Missing booking ID");
    }

    // Fetch the booking with coach info
    const { data: booking, error: fetchError } = await supabaseClient
      .from("bookings")
      .select(`
        *,
        coaches:coach_id (display_name, user_id)
      `)
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      throw new Error("Booking not found");
    }

    // Verify the user owns this booking (athlete) or is the coach
    const { data: coach } = await supabaseClient
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", booking.coach_id)
      .single();

    const isAthlete = booking.athlete_id === user.id;
    const isCoach = !!coach;

    if (!isAthlete && !isCoach) {
      throw new Error("Unauthorized to cancel this booking");
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    if (booking.status === "completed") {
      throw new Error("Cannot cancel a completed booking");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let refundResult = null;

    // If payment was completed, process refund
    if (booking.payment_status === "paid" && booking.stripe_session_id) {
      try {
        // Get the checkout session to find the payment intent
        const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
        
        if (session.payment_intent) {
          const paymentIntentId = typeof session.payment_intent === 'string' 
            ? session.payment_intent 
            : session.payment_intent.id;

          // Create refund
          const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            reason: "requested_by_customer",
          });

          refundResult = {
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
          };

          console.log("Refund created:", refundResult);
        }
      } catch (refundError) {
        console.error("Refund error:", refundError);
        // Continue with cancellation even if refund fails
      }
    }

    // Update booking status
    const updateData: Record<string, string> = {
      status: "cancelled",
    };

    if (refundResult) {
      updateData.payment_status = "refunded";
    }

    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId);

    if (updateError) {
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    // Get athlete info for email
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", booking.athlete_id)
      .single();

    // Get athlete email from auth
    const { data: { user: athleteUser } } = await supabaseClient.auth.admin.getUserById(booking.athlete_id);

    const athleteName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Athlete";

    // Send cancellation email to athlete
    if (athleteUser?.email) {
      await sendBookingEmail(supabaseUrl, {
        type: refundResult ? "refund_processed" : "booking_cancelled",
        recipientEmail: athleteUser.email,
        recipientName: profile?.first_name || "Athlete",
        coachName: booking.coaches?.display_name || "Your Coach",
        sessionDate: booking.session_date,
        startTime: booking.start_time,
        duration: booking.duration_minutes,
        sessionType: booking.session_type,
        price: booking.price,
        refundAmount: refundResult?.amount,
      });
    }

    // Send cancellation notification to coach
    if (booking?.coaches?.user_id) {
      const { data: { user: coachUser } } = await supabaseClient.auth.admin.getUserById(booking.coaches.user_id);
      
      if (coachUser?.email) {
        await sendBookingEmail(supabaseUrl, {
          type: "coach_booking_cancelled",
          recipientEmail: coachUser.email,
          recipientName: booking.coaches.display_name || "Coach",
          coachName: booking.coaches.display_name || "Coach",
          athleteName: athleteName,
          sessionDate: booking.session_date,
          startTime: booking.start_time,
          duration: booking.duration_minutes,
          sessionType: booking.session_type,
          price: booking.price,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: refundResult 
          ? `Booking cancelled and $${refundResult.amount.toFixed(2)} refunded` 
          : "Booking cancelled successfully",
        refund: refundResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in cancel-booking:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
