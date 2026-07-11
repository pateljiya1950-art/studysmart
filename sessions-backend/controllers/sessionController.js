const mem = require("../store");

/* ─────────────────────────────────────────────────────────────
   Helper: get Mongoose Session model (only when MongoDB active)
───────────────────────────────────────────────────────────── */
function getModel() {
  if (mem.isActive()) return null;
  return require("../models/Session");
}

/* ─────────────────────────────────────────────────────────────
   POST /api/sessions/create
───────────────────────────────────────────────────────────── */
exports.createSession = async (req, res) => {
  console.log("[POST /create] body:", JSON.stringify(req.body));
  try {
    const {
      title, date, startTime, endTime, meetingLink,
      mentorId, mentorName, studentId, studentName,
    } = req.body;

    /* ── Validate ── */
    const missing = [];
    if (!title)       missing.push("title");
    if (!date)        missing.push("date");
    if (!startTime)   missing.push("startTime");
    if (!endTime)     missing.push("endTime");
    if (!meetingLink) missing.push("meetingLink");
    if (!mentorId)    missing.push("mentorId");
    if (!studentId)   missing.push("studentId");

    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing: ${missing.join(", ")}` });
    }

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      return res.status(400).json({ success: false, message: "End time must be after start time" });
    }

    try { new URL(meetingLink); }
    catch {
      return res.status(400).json({ success: false, message: "meetingLink must be a valid URL (include https://)" });
    }

    const doc = {
      title,
      date,
      startTime,
      endTime,
      meetingLink,
      mentorId:    String(mentorId),
      mentorName:  mentorName  || "Mentor",
      studentId:   String(studentId),
      studentName: studentName || "Student",
    };

    let session;
    if (mem.isActive()) {
      session = mem.create(doc);
    } else {
      const Session = getModel();
      session = await Session.create(doc);
    }

    console.log("[POST /create] created _id:", session._id);
    return res.status(201).json({ success: true, message: "Session created successfully", data: session });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: msgs.join("; ") });
    }
    console.error("[POST /create] error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/sessions/student/:studentId
───────────────────────────────────────────────────────────── */
exports.getSessionsByStudent = async (req, res) => {
  const { studentId } = req.params;
  console.log(`[GET /student/${studentId}]`);

  if (!studentId || studentId === "undefined" || studentId === "null") {
    return res.status(400).json({ success: false, message: "Valid studentId is required" });
  }

  try {
    let sessions;
    if (mem.isActive()) {
      sessions = mem.findByStudentId(studentId);
    } else {
      const Session = getModel();
      sessions = await Session.find({ studentId: String(studentId) })
        .sort({ date: 1, startTime: 1 })
        .lean();
    }

    console.log(`[GET /student/${studentId}] → ${sessions.length} session(s)`);
    return res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    console.error(`[GET /student/${studentId}] error:`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/sessions/mentor/:mentorId
───────────────────────────────────────────────────────────── */
exports.getSessionsByMentor = async (req, res) => {
  const { mentorId } = req.params;
  console.log(`[GET /mentor/${mentorId}]`);

  if (!mentorId || mentorId === "undefined" || mentorId === "null") {
    return res.status(400).json({ success: false, message: "Valid mentorId is required" });
  }

  try {
    let sessions;
    if (mem.isActive()) {
      sessions = mem.findByMentorId(mentorId);
    } else {
      const Session = getModel();
      sessions = await Session.find({ mentorId: String(mentorId) })
        .sort({ date: 1, startTime: 1 })
        .lean();
    }

    console.log(`[GET /mentor/${mentorId}] → ${sessions.length} session(s)`);
    return res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    console.error(`[GET /mentor/${mentorId}] error:`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE /api/sessions/:id
───────────────────────────────────────────────────────────── */
exports.deleteSession = async (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE /${id}]`);
  try {
    let deleted;
    if (mem.isActive()) {
      deleted = mem.deleteById(id);
    } else {
      const Session = getModel();
      deleted = await Session.findByIdAndDelete(id);
    }

    if (!deleted) return res.status(404).json({ success: false, message: "Session not found" });
    return res.status(200).json({ success: true, message: "Session deleted" });
  } catch (err) {
    console.error(`[DELETE /${id}] error:`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
