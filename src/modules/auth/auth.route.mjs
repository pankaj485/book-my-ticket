import { Router } from "express";
import { signup } from "./auth.controller.mjs";

const router = Router();

router.post("/signup", signup);

export { router as authRouter };
