import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 캐릭터 생성 API
export const createCharacter = async (req, res) => {
    const { accountId, name } = req.body;

    try {
        const character = await prisma.character.create({
            data: {
                name,
                accountId,
            },
        });
        res.status(201).json(character);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
