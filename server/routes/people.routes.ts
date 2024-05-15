import express, { Router } from "express";
import { getOnline, getOffline, getBlocked, unblock, getRequests, acceptRequest, ignoreRequest } from "../controllers/people.controller";

const router: Router = express.Router();

router.get('/v1/people/online/:id', getOnline);
router.get('/v1/people/offline/:id', getOffline);

router.get('/v1/people/blocked/:id', getBlocked);
router.delete('/v1/people/blocked', unblock);

router.get('/v1/people/requests/:id', getRequests);
router.put('/v1/people/request', acceptRequest);
router.delete('/v1/people/request', ignoreRequest);

export default router;