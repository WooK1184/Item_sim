import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';

// 계정 생성 API
export const createAccount = async (req, res) => {
    const { username, password } = req.body;

    try {
        const saltRounds = 10; // bcrypt saltRounds (추천: 10)
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const account = await prisma.account.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        res.status(201).json({username: account.username});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
