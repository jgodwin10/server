// this is the auth route and provides the auth controllers
import express from "express";
const router = express.Router();

import protect from "@/middleware/authMiddleWare";
import { login, logOut, resetPassword, signup } from "@/Controllers/authController";

/**
 * @openapi
 * '/register':
 *  post:
 *     tags:
 *     - Auth
 *     summary: Create a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - username
 *              - email
 *              - password
 *            properties:
 *              username:
 *                type: string
 *                default: johndoe
 *              email:
 *                type: string
 *                default: johndoe@mail.com
 *              password:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.post("/register", signup as any);

/**
 * @openapi
 * /login:
 *   post:
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successful login
 */
router.post("/login", login as any);

/**
 * @openapi
 * /logout:
 *   post:
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successful logout
 */
router.post("/logout", logOut);

/**
 * @openapi
 * /reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successful
 */
router.put("/reset-password", protect, resetPassword as any);

export default router;
