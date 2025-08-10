import sql from "../configs/db.js";

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
        res.json({ success: true, creations });
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

        // Ensure likes is always an array
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

        // Save directly as a Postgres array
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
