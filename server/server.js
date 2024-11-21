import express from 'express';
import apiRoutes from './routes/routes.js';

const app = express();

// 미들웨어 설정
app.use(express.json());

// API 라우팅
app.use('/api', apiRoutes);

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
