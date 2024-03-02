import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.connection_string,
  process.env.supabase_key
);

export async function POST(req, res) {
  const { email, password } = await req.json();
  console.log(email)

  try {
    const { data: users, error } = await db.from('users').select('*').eq('email', email).single();

    if (error) {
      console.error(error);
      return Response.json({ success: false, message: 'Internal Server Error' });
    }

    if (!users) {
      return Response.json({ success: false, message: 'Invalid credentials' });
    }

    if (password !== users.password) {
      return Response.json({ success: false, message: 'Invalid credentials' });
    }

    return Response.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: 'Internal Server Error' });
  }
}

