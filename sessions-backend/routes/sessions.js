const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/sessionController");

/*
 * POST   /api/sessions/create                → createSession
 * GET    /api/sessions/student/:studentId   → getSessionsByStudent
 * GET    /api/sessions/mentor/:mentorId     → getSessionsByMentor
 * DELETE /api/sessions/:id                  → deleteSession
 */

router.post("/create",                    controller.createSession);
router.get("/student/:studentId",         controller.getSessionsByStudent);
router.get("/mentor/:mentorId",           controller.getSessionsByMentor);
router.delete("/:id",                     controller.deleteSession);

module.exports = router;
