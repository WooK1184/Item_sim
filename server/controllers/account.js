import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import joi from 'joi'

// joi 스키마 정의

const accountSchema = Joi.object({
    username: joi.string()
        .pattern(/^[a-z0-9]+$/)
        .min(2) // 최소 3자
        .max(10) // 최대 10자
        .required(), // 필수 필드
    password: joi.string()
        .pattern(/^[a-z0-9]+$/)
        .min(6) // 최소 6자 (보안 강화)
        .max(128) // 최대 128자
        .required(), // 필수 필드
    confirmpassword: joi.string()
        .valid(joi.ref('password')) // 비밀번호와 일치해야 함
        .required() // 필수 필드
        .messages({ 'any.only': 'Passwords do not match' }), // 에러 메시지
});

// 계정 생성 API
export const createAccount = async (req, res) => {
    const { username, password, confirmPassword } = req.body;

//joi 유효성 검사
    const { error } = accountSchema.validate({ username, password, confirmPassword });

    if (error) {
        return res.status(400).json({ error: error.details[0].message }); // 에러 메시지 반환
    }

    try {
        // 사용자명 중복 확인
        const existingUser = await prisma.account.findUnique({
            where: { username },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // 비밀번호 해시값으로 변경
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
