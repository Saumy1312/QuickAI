import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth;
        const creations = await sql`
            SELECT * FROM creations 
            WHERE user_id = ${userId} 
            ORDER BY created_at DESC
        `;
        res.json({ success: true, creations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserPublishedCreations = async (req, res) => {
    try {
        const creations = await sql`
            SELECT * FROM creations 
            WHERE publish = true 
            ORDER BY created_at DESC
        `;

        const uniqueUserIds = [...new Set(creations.map(c => c.user_id))];
        const userMap = {};

        await Promise.all(uniqueUserIds.map(async (uid) => {
            try {
                const user = await clerkClient.users.getUser(uid);
                userMap[uid] = {
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
                    avatar: user.imageUrl || null,
                };
            } catch {
                userMap[uid] = { name: 'Anonymous', avatar: null };
            }
        }));

        const enriched = creations.map(c => ({
            ...c,
            creator_name: userMap[c.user_id]?.name || 'Anonymous',
            creator_avatar: userMap[c.user_id]?.avatar || null,
        }));

        res.json({ success: true, creations: enriched });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const toggleLikeCreations = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.body;

        const [creation] = await sql`
            SELECT * FROM creations WHERE id = ${id}
        `;

        if (!creation) {
            return res.json({ success: false, message: "Creation not found" });
        }

        const currentLikes = Array.isArray(creation.likes) ? creation.likes : [];
        const userIdStr = String(userId);
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter(user => user !== userIdStr);
            message = "Creation Unliked";
        } else {
            updatedLikes = [...currentLikes, userIdStr];
            message = "Creation Liked";
        }

        await sql`
            UPDATE creations 
            SET likes = ${`{${updatedLikes.join(',')}}`}::text[] 
            WHERE id = ${id}
        `;

        res.json({ success: true, message });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await clerkClient.users.getUser(userId);

        const creations = await sql`
            SELECT * FROM creations
            WHERE user_id = ${userId} AND publish = true
            ORDER BY created_at DESC
        `;

        const totalLikes = creations.reduce((sum, c) => {
            const likes = Array.isArray(c.likes) ? c.likes : [];
            return sum + likes.length;
        }, 0);

        res.json({
            success: true,
            profile: {
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
                avatar: user.imageUrl || null,
                joinedAt: user.createdAt,
                publicCreations: creations.length,
                totalLikes,
                creations,
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};