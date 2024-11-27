import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


//캐릭터 생성 API
export const createCharacter = async (req, res) => {
    const { name, job } = req.body;

    // JWT를 통해 인증된 사용자 가져오기
    const user = req.locals?.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    try {
        const character = await prisma.character.create({
            data: {
                name,
                job: job || "adventurer",
                accountId: user.id, // JWT에서 인증된 사용자 ID 사용
            },
        });

        res.status(201).json(character);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//캐릭터 삭제 API
export const deleteCharacter = async (req, res) => {
    const { id: characterId } = req.params;
    const user = req.locals?.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    try {
        const character = await prisma.character.findUnique({
            where: { id: Number(characterId) },
        });

        if (!character || character.accountId !== user.id) {
            return res.status(403).json({ error: 'Forbidden: Character does not belong to user' });
        }

        await prisma.character.delete({ where: { id: Number(characterId) } });
        res.status(200).json({ message: 'Character deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
