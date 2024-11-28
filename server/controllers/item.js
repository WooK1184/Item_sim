import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 아이템 생성 API
export const createItem = async (req, res) => {
    const { name, stat, description, rarity, price } = req.body;

    try {
        const item = await prisma.item.create({
            data: {
                name,
                stat,
                description,
                rarity,
                price: price,
            },
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//아이템 수정 API
export const updateItem = async (req, res) => {
    const { id: itemId } = req.params;
    const { name, stat, description, rarity } = req.body;

    try {
        const item = await prisma.item.update({
            where: { id: Number(itemId) },
            data: {
                name,
                stat,
                description,
                rarity,
            },
        });

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//아이템 목록 조회 API

export const getItemList = async (req, res) => {
    try {
        // 아이템 데이터 가져오기
        const items = await prisma.item.findMany({
            select: {
                id : true, //아이템 코드
                name: true, // 아이템 이름
                price: true, // 아이템 가격
            },
        });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//아이템 상세 조회 API

export const getItemDetails = async (req, res) => {
    const { id } = req.params;

    try {
        // 아이템 조회
        const item = await prisma.item.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true, //아이템 코드
                name: true, // 아이템 이름
                stat: true, // 아이템 스탯
                description: true, // 아이템 설명
                rarity: true, // 아이템 희귀도
                price: true, // 아이템 가격
            },
        });

        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const buyItems = async (req, res) => {
    const characterId = parseInt(req.params.id);  // URI로부터 캐릭터 ID 가져오기
    const itemsToBuy = req.body;  // 구입할 아이템들의 정보 (id, count)

    const user = req.locals?.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    try {
        // 캐릭터 조회
        const character = await prisma.character.findUnique({
            where: { id: characterId },
            select: { gameMoney: true, inventoryId: true },
        });

        if (!character) {
            return res.status(404).json({ error: "Character not found" });
        }

        let totalPrice = 0;  // 총 금액
        const inventoryItems = [];  // 구입한 아이템들을 저장할 배열

        // 아이템 가격 계산 및 유효성 검사
        for (const { itemId, count } of itemsToBuy) {
            // 아이템 정보 조회
            const item = await prisma.item.findUnique({
                where: { id: itemId },
                select: { price: true, id: true, name: true },
            });

            if (!item) {
                return res.status(400).json({ error: `Item with id ${itemId} not found` });
            }

            // 아이템 가격 * 개수 계산
            totalPrice += item.price * count;

            // 구입할 아이템들을 인벤토리에 추가할 데이터로 준비
            inventoryItems.push({
                itemId: item.id,
                quantity: count,
            });
        }

        // 게임 머니가 충분한지 체크
        if (character.gameMoney < totalPrice) {
            return res.status(400).json({ error: "Not enough game money" });
        }

        // 트랜잭션을 사용하여 여러 작업을 원자적으로 처리
        await prisma.$transaction(async (prisma) => {
            // 게임 머니 차감
            await prisma.character.update({
                where: { id: characterId },
                data: { gameMoney: character.gameMoney - totalPrice },
            });

            // 아이템을 인벤토리에 추가
            for (const inventoryItem of inventoryItems) {
                const existingItem = await prisma.inventoryItem.findUnique({
                    where: {
                        inventoryId_itemId: {
                            inventoryId: character.inventoryId,
                            itemId: inventoryItem.itemId,
                        },
                    },
                });

                if (existingItem) {
                    // 이미 존재하는 아이템은 수량만 업데이트
                    await prisma.inventoryItem.update({
                        where: { id: existingItem.id },
                        data: {
                            quantity: existingItem.quantity + inventoryItem.quantity,
                        },
                    });
                } else {
                    // 존재하지 않으면 새로운 아이템 추가
                    await prisma.inventoryItem.create({
                        data: {
                            inventoryId: character.inventoryId,
                            itemId: inventoryItem.itemId,
                            quantity: inventoryItem.quantity,
                        },
                    });
                }
            }
        });

        // 구입 후 변경된 게임 머니 잔액 반환
        const updatedCharacter = await prisma.character.findUnique({
            where: { id: characterId },
            select: { gameMoney: true },
        });

        res.status(200).json({
            message: "Items purchased successfully",
            remainingGameMoney: updatedCharacter.gameMoney,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export const sellItems = async (req, res) => {
    const characterId = parseInt(req.params.id);  // URI로부터 캐릭터 ID 가져오기
    const itemsToSell = req.body;  // 판매할 아이템들의 정보 (id, count)

    const user = req.locals?.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    try {
        // 캐릭터 조회
        const character = await prisma.character.findUnique({
            where: { id: characterId },
            select: { gameMoney: true, inventoryId: true },
        });

        if (!character) {
            return res.status(404).json({ error: "Character not found" });
        }

        let totalEarnings = 0; // 총 수익

        for (const { itemId, count } of itemsToSell) {
            // 판매할 아이템이 인벤토리에 있는지 확인 (장착 중인 아이템은 판매 불가)
            const inventoryItem = await prisma.inventoryItem.findFirst({
                where: {
                    inventoryId: character.inventoryId,
                    itemId,
                },
                select: { quantity: true },
            });

            if (!inventoryItem || inventoryItem.quantity < count) {
                return res.status(400).json({
                    error: `Item with id ${itemId} is not available in sufficient quantity or is equipped.`
                });
            }

            // 해당 아이템이 장착 중인 경우 판매 불가
            const equippedItem = await prisma.equippedItem.findFirst({
                where: { characterId, itemId },
            });

            if (equippedItem) {
                return res.status(400).json({
                    error: `Item with id ${itemId} is currently equipped and cannot be sold.`
                });
            }

            // 판매할 아이템 정보 가져오기
            const item = await prisma.item.findUnique({
                where: { id: itemId },
                select: { price: true },
            });

            if (!item) {
                return res.status(400).json({ error: `Item with id ${itemId} not found.` });
            }

            // 원가의 60%로 정산
            const earnings = Math.floor(item.price * count * 0.6);
            totalEarnings += earnings;

            // 인벤토리에서 아이템 수량 감소
            const updatedQuantity = inventoryItem.quantity - count;

            if (updatedQuantity === 0) {
                // 수량이 0이면 삭제
                await prisma.inventoryItem.delete({
                    where: {
                        inventoryId_itemId: {
                            inventoryId: character.inventoryId,
                            itemId,
                        },
                    },
                });
            } else {
                // 수량 업데이트
                await prisma.inventoryItem.update({
                    where: {
                        inventoryId_itemId: {
                            inventoryId: character.inventoryId,
                            itemId,
                        },
                    },
                    data: { quantity: updatedQuantity },
                });
            }
        }

        // 캐릭터의 게임 머니 업데이트 (남은 게임 머니가 0 미만으로 떨어지지 않도록 방지)
        const newGameMoney = character.gameMoney + totalEarnings;

        const updatedCharacter = await prisma.character.update({
            where: { id: characterId },
            data: { gameMoney: newGameMoney >= 0 ? newGameMoney : 0 }, // 게임 머니가 음수가 되는 것을 방지
            select: { gameMoney: true }, // 업데이트 후 남은 게임 머니 반환
        });

        // 성공 응답
        res.status(200).json({
            message: "Items sold successfully",
            totalEarnings,
            remainingGameMoney: updatedCharacter.gameMoney,
        });
    } catch (error) {
        // 서버 에러 처리
        res.status(500).json({ error: error.message });
    }
};
