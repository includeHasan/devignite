import { createClient } from "@supabase/supabase-js";

const db = createClient(
    process.env.connection_string,
    process.env.supabase_key
);

function getRandomQuestions(data) {
    const subjects = {};

  
    data.forEach(item => {
        if (!subjects[item.subject]) {
            subjects[item.subject] = [];
        }
        subjects[item.subject].push(item.question);
    });

    const result = {};

    for (const subject in subjects) {
        result[subject] = [];
        const questions = subjects[subject];
        const shuffled = questions.sort(() => 0.5 - Math.random());
        result[subject] = shuffled.slice(0, 5);
    }

    return result;
}

export async function POST(req, res) {
    const params = await req.json();

    try {
        let { data: quiz_list, error } = await db
            .from('quiz')
            .select("*")
            .eq("isAdult", params.isAdult)

        // Get random questions
        const randomQuestions = getRandomQuestions(quiz_list);
        console.log(randomQuestions);

        return Response.json({ success: true, random_quiz_questions: randomQuestions });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: 'Internal Server Error' });
    }
}

export async function GET(req, res) {
    let { data: quiz_list, error } = await db
    .from('quiz')
    .select("*")
    .eq("isAdult", params.isAdult)
}