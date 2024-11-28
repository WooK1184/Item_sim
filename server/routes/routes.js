import express from 'express';
import { createItem, getItemList, getItemDetails, updateItem, buyItems, sellItems } from '../controllers/item.js';
import { createAccount } from '../controllers/account.js';
import { login } from '../controllers/login.js';
import { createCharacter, getCharacterDetails, deleteCharacter, getCharacterInventory } from '../controllers/character.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// 계정 생성
router.post('/accounts', createAccount);

// 계정 로그인
router.post('/login', login)

// 캐릭터 생성
router.post('/character', authMiddleware, createCharacter);

// 캐릭터 조회
router.get('/character/:id', authMiddleware, getCharacterDetails);

// 캐릭터 삭제
router.delete('/character/:id', authMiddleware, deleteCharacter);

// 캐릭터의 인벤토리 아이템 목록 조회
router.get('/character/:id/inventory', authMiddleware, getCharacterInventory);

// 아이템 생성
router.post('/items', createItem);

//아이템 조회
router.get('/items', getItemList);
router.get('/item/:id', getItemDetails);

// 아이템 수정
router.put('/items/:id', updateItem);

// 아이템 구입, 판매 API
router.post('/character/:id/buy-items', authMiddleware, buyItems);
router.post('/character/:id/sell-items', authMiddleware, sellItems)

export default router;
