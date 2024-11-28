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
            job: character.job,
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

//캐릭터 인벤토리 아이템 목록 조회 API

export const getCharacterInventory = async (req, res) => {
    const { id: characterId } = req.params;  // URI에서 캐릭터 ID를 받음
    const user = req.locals?.user;  // JWT에서 인증된 사용자 가져오기

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    try {
        // 캐릭터 조회
        const character = await prisma.character.findUnique({
            where: { id: Number(characterId) },
            include: {
                inventory: {
                    include: {
                        inventoryItems: {
                            include: {
                                item: true,  // 아이템 정보 포함
                            }
                        }
                    }
                }
            },
        });

        // 캐릭터가 없거나, 해당 캐릭터가 사용자와 연결되지 않은 경우
        if (!character || character.accountId !== user.id) {
            return res.status(403).json({ error: 'Forbidden: Character does not belong to user' });
        }

        // 인벤토리 내 아이템 목록 구성
        const inventoryItems = character.inventory.inventoryItems.map(inventoryItem => ({
            itemId: inventoryItem.item.id,
            itemName: inventoryItem.item.name,
            itemDescription: inventoryItem.item.description,
            quantity: inventoryItem.quantity,
            itemPrice: inventoryItem.item.price,
            rarity: inventoryItem.item.rarity,
        }));

        // 결과 반환
        res.status(200).json({
            characterId: character.id,
            inventoryItems
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 장착한 아이템 목록 조회 API
export const getEquippedItems = async (req, res) => {
    const { id: characterId } = req.params;  // URI에서 캐릭터 ID를 받음

    try {
        // 캐릭터 조회 및 장착된 아이템들 조회
        const character = await prisma.character.findUnique({
            where: { id: Number(characterId) },
            include: {
                equippedItems: {
                    include: {
                        item: true,  // 아이템 정보 포함
                    },
                },
            },
        });

        // 캐릭터가 존재하지 않는 경우
        if (!character) {
            return res.status(404).json({ error: "Character not found" });
        }

        // 장착된 아이템 목록이 비어있는 경우 빈 배열 반환
        const equippedItems = character.equippedItems.map((equippedItem) => ({
            itemId: equippedItem.item.id,
            itemName: equippedItem.item.name,
            itemDescription: equippedItem.item.description,
            slot: equippedItem.slot,  // 장착된 슬롯 정보 (예: "weapon", "armor")
        }));

        // 결과 반환
        res.status(200).json({
            characterId: character.id,
            equippedItems,  // 장착된 아이템 목록
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

