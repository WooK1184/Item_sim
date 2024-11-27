import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


//캐릭터 생성 API
export const createCharacter = async (req, res) => {
    const { name, job, health, power } = req.body;

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
                health: health || 500,
                power: power || 100,
                inventory: {
                    create: {}
                },
                account: {
                    connect: { id: user.id } // JWT에서 인증된 사용자 ID 사용
                },
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

//캐릭터 상세 조회 API

export const getCharacterDetails = async (req, res) => {
    const { id } = req.params;
    const user = req.locals?.user;

    try {
        // 캐릭터 조회
        const character = await prisma.character.findUnique({
            where: { id: parseInt(id) },
            include: { inventory: true }, // 필요시 관계 데이터도 로드
        });

        if (!character) {
            return res.status(404).json({ error: "Character not found" });
        }

        // 기본 정보 반환
        const response = {
            name: character.name,
            health: character.health, // 캐릭터 HP
            power: character.power, // 캐릭터 힘 스탯
        };

        // 본인의 캐릭터일 경우 추가 정보 반환
        if (user?.id === character.accountId) {
            response.gameMoney = character.gameMoney; // 게임 머니
        }

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};