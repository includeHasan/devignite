import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { createClient } from "@supabase/supabase-js";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

import {
    RunnableSequence,
    RunnablePassthrough,
} from "@langchain/core/runnables";
import {
    BytesOutputParser,
    StringOutputParser,
} from "@langchain/core/output_parsers";
import { OpenAIEmbeddings } from "@langchain/openai";

export const runtime = "edge";

const combineDocumentsFn = (docs) => {
    const serializedDocs = docs.map((doc) => doc.content);
    return serializedDocs.join("\n\n");
};

const formatVercelMessages = (chatHistory) => {
    const formattedDialogueTurns = chatHistory.map((message) => {
        if (message.role === "user") {
            return `Human: ${message.content}`;
        } else if (message.role === "assistant") {
            return `LawGPT: ${message.content}`;
        } else {
            return `${message.role}: ${message.content}`;
        }
    });
    return formattedDialogueTurns.join("\n");
};

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question. 
The prompt must be in English. Translate to english if needed.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;

const condenseQuestionPrompt = PromptTemplate.fromTemplate(
    CONDENSE_QUESTION_TEMPLATE,
);

// TODO: Pass original question as input to answer prompt instead of standalone question
const ANSWER_TEMPLATE = `You are a helpful and enthusiastic chat bot named InclusiGPT.
You are chatting with a specially abled user who is asking you questions about a academic topic or trying to navigate to a specific route in the app.


You have to figure out if the user is asking to navigate to a specific route in the app. Retrun ONLY a single word response representing the route if the user is asking to navigate to a specific route in the app.
The possible routes are: 
- /quiz
- /Mathematics
- /Science
- /Art
- /History
- /Philosophy
- /Economics

If the user is asking a question about the academic topic, you have to answer the question based on the context and chat history.
This is what you are supposed to do:
1. You must answer all questions as if you were chatting to a friend.
2. Answer the question in its original language. Translate if needed. 
3. Refuse to answer any other questions that are not directly related to the academic topic.
4. Reject all NSFW requests.
5. The answer should be based only on the following context and chat history:

<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
`;

const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

/**
 * This handler initializes and calls a retrieval chain. It composes the chain using
 * LangChain Expression Language. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#conversational-retrieval-chain
 */
export async function POST(req) {
    try {
        const body = await req.json();
        console.log(body)
        const messages = body.messages ?? [];
        const previousMessages = messages.slice(0, -1);
        const currentMessageContent = messages[messages.length - 1]; // current message sent by user

        const model = new ChatOpenAI({
            modelName: "gpt-3.5-turbo",
            temperature: 0.6,
        });

        const client = createClient(
            process.env.connection_string,
            process.env.supabase_key,
        );

        const vectorstore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
            client,
            tableName: "resources",
            queryName: "match_resource",
        });

        /**
         * We use LangChain Expression Language to compose two chains.
         * To learn more, see the guide here:
         *
         * https://js.langchain.com/docs/guides/expression_language/cookbook
         */
        const standaloneQuestionChain = RunnableSequence.from([
            condenseQuestionPrompt,
            model,
            new StringOutputParser(),
        ]);

        let resolveWithDocuments;
        const documentPromise = new Promise((resolve) => {
            resolveWithDocuments = resolve;
        });

        const retriever = vectorstore.asRetriever({
            callbacks: [
                {
                    handleRetrieverEnd(documents) {
                        resolveWithDocuments(documents);
                    },
                },
            ],
        });

        const retrievalChain = retriever.pipe(combineDocumentsFn);

        const answerChain = RunnableSequence.from([
            {
                context: RunnableSequence.from([
                    (input) => input.question,
                    retrievalChain,
                ]),
                chat_history: (input) => input.original_args.chat_history,
                question: (input) => input.original_args.question
            },
            answerPrompt,
            model,
        ]);

        const conversationalRetrievalQAChain = RunnableSequence.from([
            {
                question: standaloneQuestionChain,
                original_args: new RunnablePassthrough(),
            },
            answerChain,
            // new BytesOutputParser(),
            new StringOutputParser(),
        ]);

        const stream = await conversationalRetrievalQAChain.stream({
            question: currentMessageContent,
            chat_history: formatVercelMessages(previousMessages),
        });

        let allText = '';
        for await (const chunk of stream) {
            allText += chunk;
        }

        console.log("all the text::: ", allText);

        const documents = await documentPromise;
        const serializedSources = Buffer.from(
            JSON.stringify(
                documents.map((doc) => {
                    return {
                        pageContent: doc.content.slice(0, 50) + "...",
                        metadata: doc.metadata,
                    };
                }),
            ),
        ).toString("base64");

        return NextResponse.json({
            text: allText,
            headers: {
                "x-message-index": (previousMessages.length + 1).toString(),
                "x-sources": serializedSources,
            },
        });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}