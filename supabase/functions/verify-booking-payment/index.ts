import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { sessionId, bookingId } = await req.json();

    if (!sessionId || !bookingId) {
      throw new Error("Missing sessionId or bookingId");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Update booking to confirmed and payment_status to paid
      const { error: updateError } = await supabaseClient
        .from("bookings")
        .update({
          status: "confirmed",
          payment_status: "paid",
        })
        .eq("id", bookingId)
        .eq("stripe_session_id", sessionId);

      if (updateError) {
        console.error("Error updating booking:", updateError);
        throw new Error("Failed to update booking status");
      }

      // Fetch the updated booking with coach info
      const { data: booking, error: fetchError } = await supabaseClient
        .from("bookings")
        .select(`
          *,
          coaches:coach_id (display_name, specialty)
        `)
        .eq("id", bookingId)
        .single();

      if (fetchError) {
        console.error("Error fetching booking:", fetchError);
      }

      // Get athlete info for email
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", booking.athlete_id)
        .single();

      // Get athlete email from auth
      const { data: { user } } = await supabaseClient.auth.admin.getUserById(booking.athlete_id);

      // Send confirmation email
      if (user?.email && booking) {
        await sendBookingEmail(supabaseUrl, {
          type: "payment_confirmed",
          recipientEmail: user.email,
          recipientName: profile?.first_name || "Athlete",
          coachName: booking.coaches?.display_name || "Your Coach",
          sessionDate: booking.session_date,
          startTime: booking.start_time,
          duration: booking.duration_minutes,
          sessionType: booking.session_type,
          price: booking.price,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentStatus: "paid",
          booking,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          paymentStatus: session.payment_status,
          message: "Payment not completed",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error in verify-booking-payment:", error);
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
