import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 토큰이 없을 경우 사용자 정보를 null로 설정
        req.locals = { user: null };
        return next(); // 요청을 계속 진행
    }

    const token = authHeader.split(' ')[1];

    try {
        const user = jwt.verify(token, JWT_SECRET); // 토큰 검증
        req.locals = { user }; // 사용자 정보 저장
    } catch (error) {
        // 토큰 검증 실패 시 사용자 정보를 null로 설정
        req.locals = { user: null };
    }

    next(); // 요청 진행
};

export default authMiddleware;
