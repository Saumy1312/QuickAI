import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from 'axios';
import {v2 as cloudinary} from 'cloudinary'
import FormData from "form-data";
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';



const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});
export const generateArticle = async (req, res)=>{
    try {
        const {userId} = req.auth();
        const {prompt, length} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const response = await AI.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [{
            role: "user",
            content: prompt,
        },

    ],
    temperature: 0.7,
    max_tokens: length,
});

const content = response.choices[0].message.content

await sql`INSERT INTO creations (user_id, prompt, content, type)
VALUES (${userId}, ${prompt}, ${content}, 'article')`;

if(plan !== 'premium') {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
            free_usage: free_usage+1 
        }

    })
}

res.json({success: 'true', content})





    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const generateBlogTitle = async (req, res)=>{
    try {
        const {userId} = req.auth();
        const {prompt} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const response = await AI.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [{
            role: "user",
            content: prompt,} ],
    temperature: 0.7,
    max_tokens: 500,
});

const content = response.choices[0].message.content

await sql`INSERT INTO creations (user_id, prompt, content, type)
VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

if(plan !== 'premium') {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
            free_usage: free_usage+1 
        }

    })
}

res.json({success: 'true', content})





    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

export const generateImage = async (req, res)=>{
    try {
        const {userId} = req.auth();
        const {prompt, publish} = req.body;
        const plan = req.plan;

        if(plan !== 'premium') {
            return res.json({success: false, message: "This feature is only available for premium subscription "})
        }

        const formData = new FormData()
formData.append('prompt', prompt)
       const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {'x-api-key': process.env.CLIPDROP_API_KEY,
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

export const removeImageBackground = async (req, res)=>{
    try {
        const {userId} = req.auth();
        const image = req.file;
        const plan = req.plan;

        if(plan !== 'premium') {
            return res.json({success: false, message: "This feature is only available for premium subscription "})
        }


        const {secure_url} = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'

                }
            ]
        })

await sql`INSERT INTO creations (user_id, prompt, content, type)
VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

res.json({success: 'true', content: secure_url})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}
export const removeImageObject = async (req, res)=>{
    try {
        const {userId} = req.auth();
        const { object } = req.body;
        const image = req.file;
        const plan = req.plan;


        if(plan !== 'premium') {
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
        const plan = req.plan;
        const { analysisType } = req.body; // Add this to distinguish between review and ATS check



        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)." })
        }

        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)

        // Different prompts based on analysis type
        let prompt;
        let dbType;
        
        if (analysisType === 'ats') {
            prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility and provide a detailed assessment:

1. **ATS Score**: Give an overall ATS compatibility score (0-100)
2. **Formatting Issues**: Identify any formatting problems that might cause ATS parsing errors
3. **Keyword Optimization**: Assess keyword usage and suggest improvements
4. **Structure Analysis**: Evaluate section organization and heading clarity
5. **File Format Compatibility**: Comment on PDF structure and readability
6. **Recommendations**: Provide specific actionable steps to improve ATS compatibility

Resume Content: \n\n${pdfData.text}`;
            dbType = 'ats-check';
        } else {
            prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement.Resume Content: \n\n${pdfData.text}`;
            dbType = 'resume-review';
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            }],
            temperature: 0.7,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${analysisType === 'ats' ? 'ATS compatibility check for uploaded resume' : 'Review the uploaded resume'}, ${content}, ${dbType})`;

        res.json({ success: 'true', content: content })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}
export const generateCode = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;

        const codePrompt = `Generate code based on this request: ${prompt}. Only return the code with minimal explanation.`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: codePrompt,
            }],
            temperature: 0.3,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'code-generation')`;

        res.json({ success: 'true', content })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}
export const aiChat = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            }],
            temperature: 0.7,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'ai-chat')`;

        res.json({ success: 'true', content })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}