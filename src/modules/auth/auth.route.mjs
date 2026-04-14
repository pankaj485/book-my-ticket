import { Router } from "express";
import { signin, signup } from "./auth.controller.mjs";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);

export { router as authRouter };
