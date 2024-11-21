import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 계정 생성 API
export const createAccount = async (req, res) => {
    const { username, password } = req.body;

    try {
        const account = await prisma.account.create({
            data: {
                username,
                password,
            },
        });
        res.status(201).json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
