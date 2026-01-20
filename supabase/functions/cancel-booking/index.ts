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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
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

    // Fetch the booking
    const { data: booking, error: fetchError } = await supabaseClient
      .from("bookings")
      .select("*")
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
        // The booking will be marked as cancelled but payment_status stays as-is
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
