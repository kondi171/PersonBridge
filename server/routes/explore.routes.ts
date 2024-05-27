import express, { Router } from "express";
import { findUsers, sendRequest, getRequests, cancelRequest, getSentRequests } from '../controllers/explore.controller';

const router: Router = express.Router();

router.post('/v1/explore/find', findUsers);

router.put('/v1/explore/request', sendRequest);

router.delete('/v1/explore/request', cancelRequest);

router.get('/v1/explore/requests/:id', getRequests);

router.get('/v1/explore/requests/sent/:id', getSentRequests);

export default router;