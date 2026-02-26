import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from 'axios';
import {v2 as cloudinary} from 'cloudinary'
import FormData from "form-data";
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

const AI = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const TEXT_MODEL = "llama-3.3-70b-versatile";

export const generateArticle = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {prompt, length, imageUrl} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const messages = imageUrl
            ? [{ role: "user", content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageUrl } }
            ]}]
            : [{ role: "user", content: prompt }];

        const response = await AI.chat.completions.create({
            model: imageUrl ? VISION_MODEL : TEXT_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            })
        }

        res.json({success: 'true', content})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {prompt} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const response = await AI.chat.completions.create({
            model: TEXT_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 500,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            })
        }

        res.json({success: 'true', content})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const generateImage = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {prompt, publish} = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({success: false, message: "This feature is only available for premium subscription "})
        }

        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...formData.getHeaders(),
            },
            responseType: "arraybuffer",
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
        const {secure_url} = await cloudinary.uploader.upload(base64Image)

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
        VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({success: 'true', content: secure_url})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const removeImageBackground = async (req, res) => {
    try {
        const {userId} = req.auth();
        const image = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({success: false, message: "This feature is only available for premium subscription "})
        }

        const {secure_url} = await cloudinary.uploader.upload(image.path, {
            transformation: [{ effect: 'background_removal', background_removal: 'remove_the_background' }]
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

        res.json({success: 'true', content: secure_url})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const removeImageObject = async (req, res) => {
    try {
        const {userId} = req.auth();
        const { object } = req.body;
        const image = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({success: false, message: "This feature is only available for premium subscription "})
        }

        const {public_id} = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{effect: `gen_remove:${object}`}],
            resource_type: 'image'
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

        res.json({success: 'true', content: imageUrl})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const { analysisType } = req.body;

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)." })
        }

        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)

        let prompt;
        let dbType;

        if (analysisType === 'ats') {
            prompt = `Analyze this resume for ATS compatibility and provide a detailed assessment with score, formatting issues, keyword optimization, structure analysis, and recommendations.\n\nResume:\n${pdfData.text}`;
            dbType = 'ats-check';
        } else {
            prompt = `Review the following resume and provide constructive feedback on strengths, weaknesses, and improvements.\n\nResume:\n${pdfData.text}`;
            dbType = 'resume-review';
        }

        const response = await AI.chat.completions.create({
            model: TEXT_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${analysisType === 'ats' ? 'ATS compatibility check for uploaded resume' : 'Review the uploaded resume'}, ${content}, ${dbType})`;

        res.json({ success: 'true', content })

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const generateCode = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;

        const response = await AI.chat.completions.create({
            model: TEXT_MODEL,
            messages: [{ role: "user", content: `Generate code based on this request: ${prompt}. Only return the code with minimal explanation.` }],
            temperature: 0.3,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${prompt}, ${content}, 'code-generation')`;

        res.json({ success: 'true', content })

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

// Upload image for chat (returns Cloudinary URL)
export const uploadChatImage = async (req, res) => {
    try {
        const image = req.file;
        if (!image) return res.json({ success: false, message: 'No image provided' });
        const { secure_url } = await cloudinary.uploader.upload(image.path);
        res.json({ success: true, url: secure_url });
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message });
    }
}

// Upload file for chat — extracts text from PDF, Word, TXT, CSV
export const uploadChatFile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.json({ success: false, message: 'No file provided' });

        let text = '';
        const mime = file.mimetype;

        if (mime === 'application/pdf') {
            const dataBuffer = fs.readFileSync(file.path);
            const pdfData = await pdf(dataBuffer);
            text = pdfData.text;

        } else if (mime === 'application/msword' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: file.path });
            text = result.value;

        } else if (mime === 'text/plain' || mime === 'text/csv') {
            text = fs.readFileSync(file.path, 'utf-8');

        } else if (mime === 'application/vnd.ms-excel' || mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            // For Excel, read as text (basic support)
            text = fs.readFileSync(file.path, 'utf-8');

        } else {
            return res.json({ success: false, message: 'Unsupported file type' });
        }

        // Truncate if too long (keep first ~8000 chars to stay within token limits)
        if (text.length > 8000) {
            text = text.slice(0, 8000) + '\n\n[Document truncated due to length...]';
        }

        if (!text.trim()) {
            return res.json({ success: false, message: 'Could not extract text from this file' });
        }

        res.json({ success: true, text, fileName: file.originalname });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message });
    }
}

export const aiChat = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, sessionId, messages = [], imageUrl, fileText, fileName } = req.body;

        const conversationHistory = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant. When the user shares a file or document, answer their questions about it directly and naturally — never start with phrases like "Based on the content provided" or "The document appears to be". Just answer directly as if you already know the content.'
            },
            ...messages.map(m => {
            if (m.imageUrl) {
                return {
                    role: m.role,
                    content: [
                        { type: "text", text: m.content || '' },
                        { type: "image_url", image_url: { url: m.imageUrl } }
                    ]
                }
            }
            return { role: m.role, content: m.content }
        })]

        // Build current user message — always push it
        if (imageUrl) {
            conversationHistory.push({
                role: 'user',
                content: [
                    { type: "text", text: prompt || 'What is in this image?' },
                    { type: "image_url", image_url: { url: imageUrl } }
                ]
            })
        } else if (fileText) {
            const filePrompt = `File: "${fileName || 'document'}"\n\n${fileText}\n\n---\n${prompt || 'Please analyze this document.'}`
            conversationHistory.push({ role: 'user', content: filePrompt })
        } else {
            conversationHistory.push({ role: 'user', content: prompt })
        }

        const hasImage = imageUrl || messages.some(m => m.imageUrl)

        const response = await AI.chat.completions.create({
            model: hasImage ? VISION_MODEL : TEXT_MODEL,
            messages: conversationHistory,
            temperature: 0.7,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content

        let activeSessionId = sessionId
        if (!activeSessionId) {
            const title = prompt || fileName || 'Document analysis'
            const newSession = await sql`
                INSERT INTO chat_sessions (user_id, title) 
                VALUES (${userId}, ${title.slice(0, 50)})
                RETURNING id
            `
            activeSessionId = newSession[0].id
        }

        const userPromptForDb = prompt || (fileName ? `Uploaded: ${fileName}` : 'Image analysis')
        await sql`INSERT INTO chat_messages (session_id, role, content) VALUES (${activeSessionId}, 'user', ${userPromptForDb})`
        await sql`INSERT INTO chat_messages (session_id, role, content) VALUES (${activeSessionId}, 'assistant', ${content})`
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${userPromptForDb}, ${content}, 'ai-chat')`;

        res.json({ success: true, content, sessionId: activeSessionId })

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const resumeJobMatcher = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { jobDescription } = req.body;
        const resume = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds 5MB." })
        }

        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)

        const prompt = `You are an expert ATS and career coach. Analyze this resume against the job description.\n\nResume:\n${pdfData.text}\n\nJob Description:\n${jobDescription}\n\nProvide: Match Score, Strong Matches, Missing Keywords, Partially Matched, Tailored Cover Letter, Quick Wins.`

        const response = await AI.chat.completions.create({
            model: TEXT_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${'Resume vs Job Description match analysis'}, ${content}, 'resume-match')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            })
        }

        res.json({ success: true, content })

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const screenshotToBugReport = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { appContext } = req.body;
        const image = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const { secure_url } = await cloudinary.uploader.upload(image.path)

        const prompt = `You are a senior QA engineer. Analyze this UI screenshot and generate a professional bug report.
${appContext ? `App Context: ${appContext}` : ''}
Format: Bug Title, Severity, Description, Steps to Reproduce, Expected Behavior, Actual Behavior, Environment, Suggested Fix, Additional Notes.`

        const response = await AI.chat.completions.create({
            model: VISION_MODEL,
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: secure_url } }
                ]
            }],
            temperature: 0.3,
            max_tokens: 2000,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${'Screenshot to bug report'}, ${content}, 'bug-report')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            })
        }

        res.json({ success: true, content })

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const getChatSessions = async (req, res) => {
    try {
        const { userId } = req.auth();
        const sessions = await sql`SELECT * FROM chat_sessions WHERE user_id = ${userId} ORDER BY created_at DESC`;
        res.json({ success: true, sessions })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { sessionId } = req.params;
        const session = await sql`SELECT * FROM chat_sessions WHERE id = ${sessionId} AND user_id = ${userId}`
        if (session.length === 0) return res.json({ success: false, message: 'Session not found' })
        const messages = await sql`SELECT role, content FROM chat_messages WHERE session_id = ${sessionId} ORDER BY created_at ASC`
        res.json({ success: true, messages })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const deleteChatSession = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { sessionId } = req.params;
        await sql`DELETE FROM chat_messages WHERE session_id = ${sessionId}`
        await sql`DELETE FROM chat_sessions WHERE id = ${sessionId} AND user_id = ${userId}`
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const renameChatSession = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { sessionId } = req.params;
        const { title } = req.body;
        await sql`UPDATE chat_sessions SET title = ${title} WHERE id = ${sessionId} AND user_id = ${userId}`
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const deleteCreation = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;
        const result = await sql`DELETE FROM creations WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
        if (result.length === 0) return res.json({ success: false, message: "Creation not found or unauthorized" });
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}