const express = require("express");
const muonsach = require("../controllers/muonsach.controller");

const router = express.Router();

router.route("/")
    .get(muonsach.findAll)
    .post(muonsach.create);

router.route("/:id")
    .get(muonsach.findOne)
    .put(muonsach.update)
    .delete(muonsach.delete);

module.exports = router;
