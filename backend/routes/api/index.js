const router = require('express').Router();

router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
});

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
