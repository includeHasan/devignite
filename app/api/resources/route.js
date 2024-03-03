import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.connection_string,
  process.env.supabase_key
);

export async function POST(req, res) {
  try {
    const { subject } = await req.json();
    console.log(subject);

    // Fetch resources based on the provided subject
    let resources = await db
      .from("resources")
      .select("*")
      .eq("subject", subject);
    const array = resources.data;

    if (array.length > 0) {
      return Response.json({ success: true, data: resources });
    } else {
      return Response.json({
        success: false,
        message: "no resources are available for the selected subject",
      });
    }
  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
}

//alt+shift+f
