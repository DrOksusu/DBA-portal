import { Router } from 'express';
import * as oauthController from '../controllers/oauth.controller';

const router = Router();

// OAuth 2.0 endpoints
router.get('/authorize', oauthController.authorize);
router.post('/token', oauthController.token);
router.get('/userinfo', oauthController.userinfo);
router.post('/revoke', oauthController.revoke);

export default router;
