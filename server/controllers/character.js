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

// 아이템 장착 API

export const equipItem = async (req, res) => {
    const characterId = parseInt(req.params.id, 10);  // URI에서 캐릭터 ID를 받음, 숫자로 변환
    const { itemId } = req.body;  // 장착할 아이템 ID를 body로 받음
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
                            where: { itemId: itemId },
                        },
                    },
                },
                equippedItems: {
                    where: { itemId: itemId },
                },
            },
        });

        // 캐릭터가 없거나 해당 캐릭터가 사용자가 소유하지 않은 경우
        if (!character || character.accountId !== user.id) {
            return res.status(403).json({ error: 'Forbidden: Character does not belong to user' });
        }

        // 인벤토리에 아이템이 있는지 확인
        const inventoryItem = character.inventory.inventoryItems[0];  // 첫 번째 아이템 (1개만 있음)
        if (!inventoryItem) {
            return res.status(400).json({ error: 'Item not found in inventory' });
        }

        // 이미 장착된 아이템인지 확인
        if (character.equippedItems.length > 0) {
            return res.status(400).json({ error: 'Item already equipped' });
        }

        // 아이템 장착에 따른 캐릭터 스탯 변경 (아이템의 스탯을 기반으로)
        const item = await prisma.item.findUnique({
            where: { id: itemId },
            select: { stat: true },
        });

        if (!item) {
            return res.status(400).json({ error: 'Item not found' });
        }

        // 캐릭터 스탯 업데이트
        const updatedStats = {
            health: character.health + (item.stat.health || 0),
            power: character.power + (item.stat.power || 0),
        };

        // 캐릭터 스탯 업데이트
        await prisma.character.update({
            where: { id: characterId },
            data: {
                health: updatedStats.health,
                power: updatedStats.power,
            },
        });

        // 아이템 장착
        await prisma.equippedItem.create({
            data: {
                characterId: characterId,
                itemId: itemId,
                slot: 'armor',  // 예시로 'armor' 슬롯에 장착 (슬롯은 필요에 따라 변경 가능)
            },
        });

        // 인벤토리에서 해당 아이템 제거 또는 개수 조정
        if (inventoryItem.quantity === 1) {
            // 인벤토리에서 아이템을 삭제
            await prisma.inventoryItem.delete({
                where: { id: inventoryItem.id },
            });
        } else {
            // 인벤토리 아이템 개수 감소
            await prisma.inventoryItem.update({
                where: { id: inventoryItem.id },
                data: { quantity: inventoryItem.quantity - 1 },
            });
        }

        // 결과 반환
        res.status(200).json({
            message: 'Item equipped successfully',
            updatedStats,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 아이템 탈착 API

export const unequipItem = async (req, res) => {
    const characterId = parseInt(req.params.id, 10); // URI의 캐릭터 ID, 숫자로 변환
    const { itemId } = req.body; // 탈착할 아이템 ID
    const user = req.locals?.user; // JWT에서 인증된 사용자 가져오기

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    try {
        // 캐릭터와 장착 아이템 조회
        const character = await prisma.character.findUnique({
            where: { id: characterId },
            include: {
                equippedItems: {
                    where: { itemId: itemId },
                    include: {
                        item: true, // 아이템 정보를 포함
                    },
                },
                inventory: {
                    include: {
                        inventoryItems: {
                            where: { itemId: itemId },
                        },
                    },
                },
            },
        });

        // 캐릭터가 없거나 인증된 사용자의 캐릭터가 아닌 경우
        if (!character || character.accountId !== user.id) {
            return res.status(403).json({ error: 'Forbidden: Character does not belong to user' });
        }

        // 아이템이 장착되지 않은 경우
        if (character.equippedItems.length === 0) {
            return res.status(400).json({ error: 'Item is not equipped' });
        }

        const equippedItem = character.equippedItems[0]; // 장착된 아이템 정보
        const itemStats = equippedItem.item.stat; // 아이템 스탯 (JSON)

        // 캐릭터 스탯 업데이트 (아이템 스탯만큼 감소)
        const updatedCharacter = await prisma.character.update({
            where: { id: characterId },
            data: {
                health: character.health - (itemStats.health || 0),
                power: character.power - (itemStats.power || 0),
            },
        });

        // 장착된 아이템 삭제
        await prisma.equippedItem.delete({
            where: { id: equippedItem.id },
        });

        // 인벤토리에 아이템 추가 또는 업데이트
        if (character.inventory.inventoryItems.length > 0) {
            // 인벤토리에 아이템이 이미 있는 경우, 개수 증가
            await prisma.inventoryItem.update({
                where: { id: character.inventory.inventoryItems[0].id },
                data: { quantity: character.inventory.inventoryItems[0].quantity + 1 },
            });
        } else {
            // 인벤토리에 아이템이 없는 경우, 새로 추가
            await prisma.inventoryItem.create({
                data: {
                    inventoryId: character.inventory.id,
                    itemId: itemId,
                    quantity: 1,
                },
            });
        }

        // 응답
        res.status(200).json({
            message: 'Item unequipped successfully',
            updatedStats: {
                health: updatedCharacter.health,
                power: updatedCharacter.power,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 캐릭터 게임 머니 벌기 API
export const earnGameMoney = async (req, res) => {
    const characterId = parseInt(req.params.id); // URI에서 캐릭터 ID 가져오기
    const user = req.locals?.user; // JWT 인증된 사용자 정보 가져오기

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    try {
        // 캐릭터 조회
        const character = await prisma.character.findUnique({
            where: { id: characterId },
            select: { id: true, accountId: true, gameMoney: true },
        });

        // 캐릭터가 존재하지 않거나, 소유자가 다른 경우
        if (!character || character.accountId !== user.id) {
            return res.status(403).json({ error: 'Forbidden: Character does not belong to user' });
        }

        // 게임 머니 100원 추가
        const updatedCharacter = await prisma.character.update({
            where: { id: characterId },
            data: { gameMoney: character.gameMoney + 100 },
            select: { gameMoney: true }, // 변경된 잔액만 반환
        });

        // 성공 응답
        res.status(200).json({
            message: 'Game money earned successfully',
            updatedGameMoney: updatedCharacter.gameMoney,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
