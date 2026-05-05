import { Router } from 'express';
import healthCheck from './health-check.js';
import kbzPayRouter from './kbz-pay.js';
import chaptersRouter from './chapters.js';
import usersRouter from './users.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/kbz-pay', kbzPayRouter);
    router.use('/chapters', chaptersRouter);
    router.use('/users', usersRouter);

    return router;
};