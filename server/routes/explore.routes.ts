import express, { Router } from "express";
import { getUsers, sendRequest, getRequests, cancelRequest } from '../controllers/explore.controller';

const router: Router = express.Router();

router.post('/v1/explore/users', getUsers);

router.put('/v1/explore/request', sendRequest);

router.delete('/v1/explore/request', cancelRequest);

router.get('/v1/explore/requests/:id', getRequests);

export default router;