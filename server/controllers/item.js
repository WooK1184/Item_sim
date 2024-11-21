import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 아이템 생성 API
export const createItem = async (req, res) => {
    const { name, description, rarity } = req.body;

    try {
        const item = await prisma.item.create({
            data: {
                name,
                description,
                rarity,
            },
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
