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