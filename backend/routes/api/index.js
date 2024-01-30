const router = require('express').Router();
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const groupsRouter = require("./groups.js");
const venuesRouter = require("./venues.js");
const eventsRouter = require("./events.js")
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { User } = require("../../db/models");
router.use(restoreUser);

router.use("/session", sessionRouter);
router.use("/users", usersRouter);
router.use("/groups", groupsRouter);
router.use("/venues", venuesRouter);
router.use("/events", eventsRouter);

router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
});

// test user auth middlewares
router.get("/set-token-cookie", async (_req, res) => {
  const user = await User.findOne({
    where: { username: "Demo-lition"}
  });
  setTokenCookie(res, user);
  return res.json({ user: user});
});

// GET /api/restore-user
router.get("/restore-user", (req, res) => {
  return res.json(req.user);
});

// GET /api/require-auth
router.get("/require-auth", requireAuth, (req, res) => {
  return res.json(req.user)
})

module.exports = router;

/*
fetch('/api/test', {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `cqtqqO9t-7b3gsByW-mELAYfwPhqLNwHK0Xw`
  },
  body: JSON.stringify({ hello: 'world' })
}).then(res => res.json()).then(data => console.log(data));
*/
