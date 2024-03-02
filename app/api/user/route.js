import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.connection_string,
  process.env.supabase_key
);

// console.log(db)
export async function GET(req, res) {
  const { data, error } = await db.from("users").select("*");

  return Response.json({ data: data });
}

export async function POST(req, res) {
    const info = await req.json();

  
    try {
      // Check if a user with the same email already exists
      const existingUser = await db.from("users").select('id').eq('email', info.email).limit(1);
      console.log(existingUser);
      if (existingUser.data.length > 0) {
        // User with the same email already exists
        return Response.json({ success: false, message: 'User already registered with this email' });
      }
  
      // If user doesn't exist, proceed with registration
      const { data, error } = await db.from("users").insert(info).select();
      
      if (error) {
        console.error(error);
        return Response.json({ success: false, message: 'Registration failed' });
      }
  
      // Registration successful
      return Response.json({ message: 'Successfully registered!', success: true });
    } catch (error) {
      console.error(error);
      return Response.json({ success: false, message: 'Internal Server Error' });
    }
  }