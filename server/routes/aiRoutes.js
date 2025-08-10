import express from "express";
import { auth } from "../middlewares/auth.js";
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from "../controllers/aiController.js";
import { upload } from "../configs/multer.js";
import { generateCode } from '../controllers/aiController.js'; 
import { aiChat } from '../controllers/aiController.js';

const aiRouter = express.Router();
aiRouter.post('/generate-article', auth, generateArticle)
aiRouter.post('/generate-blog-title', auth, generateBlogTitle)
aiRouter.post('/generate-image', auth, generateImage)
aiRouter.post('/remove-image-background', upload.single('image'), auth, removeImageBackground)
aiRouter.post('/remove-image-object', upload.single('image'), auth, removeImageObject)
aiRouter.post('/resume-review', upload.single('resume'), auth, resumeReview)
aiRouter.post('/generate-code', auth, generateCode);
aiRouter.post('/ai-chat', auth, aiChat);
export default aiRouter