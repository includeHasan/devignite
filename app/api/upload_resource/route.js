import { createClient } from "@supabase/supabase-js";

const db = createClient(
    process.env.connection_string,
    process.env.supabase_key
);

export async function POST(req, res) {

    // const {subject, type, title, description, content} = await req.json();
    const params = await req.json();

    try {

        const { data, error } = await db
            .from('resources')
            .insert([
                params
            ])
            .select()

        return Response.json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: 'Internal Server Error', error: error.message });
    }
}