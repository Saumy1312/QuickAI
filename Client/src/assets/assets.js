import logo from "./logo.svg";
import gradientBackground from "./gradientBackground.png";
import user_group from "./user_group.png";
import star_icon from "./star_icon.svg";
import star_dull_icon from "./star_dull_icon.svg";
import profile_img_1 from "./profile_img_1.png";
import arrow_icon from "./arrow_icon.svg";
import { SquarePen, Image, FileText, Bug, MessageCircle, Layers } from 'lucide-react'
import ai_gen_img_1 from "./ai_gen_img_1.png";
import ai_gen_img_2 from "./ai_gen_img_2.png";
import ai_gen_img_3 from "./ai_gen_img_3.png";

export const assets = {
    logo,
    gradientBackground,
    user_group,
    star_icon,
    star_dull_icon,
    profile_img_1,
    arrow_icon,
};

export const AiToolsData = [
    {
        title: 'AI Chatbot',
        description: 'Engage in natural, human-like conversations. Upload images, PDFs, and documents — ask anything about them.',
        Icon: MessageCircle,
        bg: { from: '#FF7B54', to: '#FFB26B' },
        path: '/ai/ai-chat'
    },
    {
        title: 'AI Article Writer',
        description: 'Generate high-quality articles, get blog title ideas, and analyse SEO — all in one place.',
        Icon: SquarePen,
        bg: { from: '#3588F2', to: '#0BB0D7' },
        path: '/ai/write-article'
    },
    {
        title: 'Image Tools',
        description: 'Generate images, remove backgrounds, remove objects, remove text, uncrop, upscale and more.',
        Icon: Image,
        bg: { from: '#20C363', to: '#11B97E' },
        path: '/ai/image-tools'
    },
    {
        title: 'Resume Reviewer',
        description: 'Get your resume reviewed by AI, check ATS compatibility, and match it against job descriptions.',
        Icon: FileText,
        bg: { from: '#12B7AC', to: '#08B6CE' },
        path: '/ai/review-resume'
    },
    {
        title: 'Screenshot Bug Report',
        description: 'Upload any UI screenshot and instantly get a professional bug report with severity, steps to reproduce, and fix suggestions.',
        Icon: Bug,
        bg: { from: '#DC2626', to: '#F97316' },
        path: '/ai/screenshot-bug-report'
    },
    {
        title: 'Community',
        description: 'Explore AI-generated creations from the community, share your work, and get inspired.',
        Icon: Layers,
        bg: { from: '#7C3AED', to: '#A855F7' },
        path: '/ai/community'
    },
]

export const dummyTestimonialData = [
    {
        image: assets.profile_img_1,
        name: 'John Doe',
        title: 'Marketing Director, TechCorp',
        content: 'ContentAI has revolutionized our content workflow. The quality of the articles is outstanding, and it saves us hours of work every week.',
        rating: 4,
    },
    {
        image: assets.profile_img_1,
        name: 'Jane Smith',
        title: 'Content Creator, TechCorp',
        content: 'ContentAI has made our content creation process effortless. The AI tools have helped us produce high-quality content faster than ever before.',
        rating: 5,
    },
    {
        image: assets.profile_img_1,
        name: 'David Lee',
        title: 'Content Writer, TechCorp',
        content: 'ContentAI has transformed our content creation process. The AI tools have helped us produce high-quality content faster than ever before.',
        rating: 4,
    },
]

export const dummyCreationData = [
    {
        "id": 9,
        "user_id": "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        "prompt": "Generate a blog title for the keyword blog in the category Technology.",
        "content": "Here are a few blog title options for a technology blog, playing with different angles:\n\n**General & Broad:**\n\n*   The Tech Blog: News, Reviews, and Insights\n*   Technology Today: Your Daily Dose of Tech\n*   The Future is Now: Exploring the World of Technology\n*   Tech Talk: Unpacking the Latest Innovations\n\n**More Specific & Intriguing:**\n\n*   Decoding Tech: Making Sense of the Digital World\n*   Beyond the Gadgets: The",
        "type": "blog-title",
        "publish": false,
        "likes": [],
        "created_at": "2025-07-01T11:09:50.492Z",
        "updated_at": "2025-07-01T11:09:50.492Z"
    },
    {
        "id": 7,
        "user_id": "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        "prompt": "Write an article about AI With Coding in Short (500-800 word).",
        "content": "## AI and Coding: A Symbiotic Partnership Reshaping the Future\n\nArtificial intelligence (AI) and coding, once distinct disciplines, are now deeply intertwined.",
        "type": "article",
        "publish": false,
        "likes": [],
        "created_at": "2025-07-01T11:07:51.312Z",
        "updated_at": "2025-07-01T11:07:51.312Z"
    }
]

export const dummyPublishedCreationData = [
    {
        "id": 1,
        "user_id": "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        "prompt": "Generate an image of A Boy is on Boat , and fishing in the style Anime style.",
        "content": ai_gen_img_1,
        "type": "image",
        "publish": true,
        "likes": ["user_2yMX02PRbyMtQK6PebpjnxvRNIA", "user_2yaW5EHzeDfQbXdAJWYFnZo2bje"],
        "created_at": "2025-06-19T09:02:25.035Z",
        "updated_at": "2025-06-19T09:58:37.552Z",
    },
    {
        "id": 2,
        "user_id": "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        "prompt": "Generate an image of A Boy Riding a bicycle on road and bicycle is from year 2201 in the style Anime style.",
        "content": ai_gen_img_2,
        "type": "image",
        "publish": true,
        "likes": ["user_2yMX02PRbyMtQK6PebpjnxvRNIA", "user_2yaW5EHzeDfQbXdAJWYFnZo2bje"],
        "created_at": "2025-06-19T08:16:54.614Z",
        "updated_at": "2025-06-19T09:58:40.072Z",
    },
    {
        "id": 3,
        "user_id": "user_2yaW5EHzeDfQbXdAJWYFnZo2bje",
        "prompt": "Generate an image of a boy riding a car on sky in the style Realistic.",
        "content": ai_gen_img_3,
        "type": "image",
        "publish": true,
        "likes": ["user_2yaW5EHzeDfQbXdAJWYFnZo2bje"],
        "created_at": "2025-06-23T11:29:23.371Z",
        "updated_at": "2025-06-23T11:29:44.432Z",
    },
]