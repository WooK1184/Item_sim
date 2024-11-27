import express from 'express';
import { createItem } from '../controllers/item.js';
import { createAccount } from '../controllers/account.js';
import { createCharacter } from '../controllers/character.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// 아이템 생성 엔드포인트
router.post('/items', createItem);

// 계정 생성 엔드포인트
router.post('/accounts', createAccount);

// 캐릭터 생성 엔드포인트
router.post('/character', authMiddleware, createCharacter);

export default router;
