/**
 * store.js  — shared in-memory singleton
 *
 * When MongoDB is unavailable, sessionController.js checks
 * `store.isActive()` and falls through to these helpers instead
 * of calling Mongoose.
 */

let _active  = false;
let _store   = null;   // reference to the array in server.js
let _uuidv4  = null;

exports.activate = function (storeArr, uuidFn) {
  _active  = true;
  _store   = storeArr;
  _uuidv4  = uuidFn;
  console.log("🗄   In-memory store activated.");
};

exports.isActive = () => _active;

/* ── CRUD helpers ── */
exports.create = function (doc) {
  const session = { _id: _uuidv4(), ...doc, createdAt: new Date().toISOString() };
  _store.push(session);
  return session;
};

exports.findByStudentId = function (studentId) {
  return _store
    .filter((s) => String(s.studentId) === String(studentId))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
};

exports.findByMentorId = function (mentorId) {
  return _store
    .filter((s) => String(s.mentorId) === String(mentorId))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
};

exports.deleteById = function (id) {
  const idx = _store.findIndex((s) => s._id === id);
  if (idx === -1) return null;
  const [deleted] = _store.splice(idx, 1);
  return deleted;
};
