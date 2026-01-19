import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
  coachId: string;
  coachName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  sessionType: string;
  price: number;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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
    const bookingData: BookingRequest = await req.json();

    // Validate required fields
    if (!bookingData.coachId || !bookingData.sessionDate || !bookingData.startTime || !bookingData.price) {
      throw new Error("Missing required booking data");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if a Stripe customer exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create booking record with pending payment status
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        coach_id: bookingData.coachId,
        athlete_id: user.id,
        session_date: bookingData.sessionDate,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        duration_minutes: bookingData.duration,
        session_type: bookingData.sessionType,
        price: bookingData.price,
        notes: bookingData.notes || null,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    // Create Stripe Checkout session
    const priceInCents = Math.round(bookingData.price * 100);
    const origin = req.headers.get("origin") || "https://bellairebats.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${bookingData.duration}-minute ${bookingData.sessionType === "one_on_one" ? "1-on-1" : "Group"} Training Session`,
              description: `Training session with ${bookingData.coachName} on ${bookingData.sessionDate} at ${bookingData.startTime}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${origin}/booking-canceled?booking_id=${booking.id}`,
      metadata: {
        booking_id: booking.id,
        coach_id: bookingData.coachId,
        athlete_id: user.id,
      },
    });

    // Update booking with stripe session id
    await supabaseClient
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        bookingId: booking.id,
        sessionId: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-booking-checkout:", error);
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
