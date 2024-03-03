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





export async function GET(req, res) {
  try {
   
    // Fetch all resources
    const allResources = await db.from('resources').select('*');

    // Process the data to get the desired format
    const result = processResources(allResources.data);

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
}

// Function to process the resources
function processResources(resources) {
  const result = {};

  // Group resources by subject
  const groupedBySubject = resources.reduce((acc, resource) => {
    const subject = resource.subject;
    acc[subject] = acc[subject] || [];
    acc[subject].push(resource);
    return acc;
  }, {});

  // Iterate through each subject and include all columns for each title
  for (const subject in groupedBySubject) {
    const titles = groupedBySubject[subject].map((resource) => ({
      title: resource.title,
      type: resource.type,
      description: resource.description,
      content: resource.content,
      // Include other columns as needed
    }));
    result[subject] = titles;
  }

  return result;
}
