import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.connection_string,
  process.env.supabase_key
);

export async function GET()
{
    const { data, error } = await db.from("quiz_score").select("*");
    
    if (error) throw new Error(`Failed to fetch quizzes: ${error}`);
  
    return Response.json({data:data, error: error})
}
export async function POST(req, res) {
    const info = await req.json();
  
    try {
      
  
      const { data, error } = await db.from("quiz_score").insert(info).select();
  
      if (error) {
        console.error(error);
        return Response.json({
          success: false,
          message: "submission failed",
          error: error,
        });
      }
  
      return Response.json({
        message: "Successfully submitted",
        success: true,
        data: data,
      });
    } catch (error) {
      console.error(error);
     
      return Response.json({ success: false, message: "Internal Server Error", error: error});
    }
  }
  