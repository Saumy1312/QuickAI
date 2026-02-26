import express from "express";
import { auth } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";
import {
  generateArticle, generateBlogTitle, generateImage,
  removeImageBackground, removeImageObject, resumeReview,
  generateCode, aiChat, resumeJobMatcher, screenshotToBugReport,
  getChatSessions, getChatMessages, deleteChatSession, renameChatSession,
  deleteCreation, uploadChatImage, uploadChatFile,
  // New Clipdrop features
  clipdropCleanup, clipdropRemoveText, clipdropReplaceBackground,
  clipdropUncrop, clipdropUpscale
} from "../controllers/aiController.js";

const aiRouter = express.Router();

// ── Existing routes ──────────────────────────────────────
aiRouter.post('/generate-article',        auth, generateArticle)
aiRouter.post('/generate-blog-title',     auth, generateBlogTitle)
aiRouter.post('/generate-image',          auth, generateImage)
aiRouter.post('/remove-image-background', upload.single('image'), auth, removeImageBackground)
aiRouter.post('/remove-image-object',     upload.single('image'), auth, removeImageObject)
aiRouter.post('/resume-review',           upload.single('resume'), auth, resumeReview)
aiRouter.post('/generate-code',           auth, generateCode)
aiRouter.post('/ai-chat',                 auth, aiChat)
aiRouter.post('/resume-job-match',        upload.single('resume'), auth, resumeJobMatcher)
aiRouter.post('/screenshot-bug-report',   upload.single('image'), auth, screenshotToBugReport)
aiRouter.post('/upload-chat-image',       upload.single('image'), auth, uploadChatImage)
aiRouter.post('/upload-chat-file',        upload.single('file'),  auth, uploadChatFile)
aiRouter.delete('/delete-creation/:id',   auth, deleteCreation)

aiRouter.get('/chat-sessions',                    auth, getChatSessions)
aiRouter.get('/chat-messages/:sessionId',          auth, getChatMessages)
aiRouter.delete('/chat-sessions/:sessionId',       auth, deleteChatSession)
aiRouter.patch('/chat-sessions/:sessionId',        auth, renameChatSession)

// ── New Clipdrop routes ──────────────────────────────────
// Cleanup needs TWO files: image_file + mask_file
aiRouter.post('/clipdrop-cleanup',            upload.fields([{ name: 'image_file', maxCount: 1 }, { name: 'mask_file', maxCount: 1 }]), auth, clipdropCleanup)
aiRouter.post('/clipdrop-remove-text',        upload.single('image_file'), auth, clipdropRemoveText)
aiRouter.post('/clipdrop-replace-background', upload.single('image_file'), auth, clipdropReplaceBackground)
aiRouter.post('/clipdrop-uncrop',             upload.single('image_file'), auth, clipdropUncrop)
aiRouter.post('/clipdrop-upscale',            upload.single('image_file'), auth, clipdropUpscale)

export default aiRouter