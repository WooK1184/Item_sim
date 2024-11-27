import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.locals = { user }; // 사용자 정보 저장
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
};

export default authMiddleware;
