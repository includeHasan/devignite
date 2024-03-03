import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.connection_string,
  process.env.supabase_key
);

// console.log(db)
export async function GET(req, res) {
  const { data, error } = await db.from("admin").select("*")

  return Response.json({ data: data });
}

export async function POST(req, res) {
  const info = await req.json();

  try {
    const existingUser = await db
      .from("admin")
      .select("id")
      .eq("email", info.email)
      .limit(1);
    console.log(existingUser);
    if (existingUser.data.length > 0) {
      return Response.json({
        success: false,
        message: "admin already registered with this email",
      });
    }

    const { data, error } = await db.from("admin").insert(info).select();

    if (error) {
      console.error(error);
      return Response.json({
        success: false,
        message: "Registration failed",
        error: error,
      });
    }

    return Response.json({
      message: "Successfully registered!",
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error(error);
   
    return Response.json({ success: false, message: "Internal Server Error", error: error});
  }
}
