const express = require("express");
const nhanvien = require("../controllers/nhanvien.controller");

const router = express.Router();

router.post("/login", nhanvien.login);

router.route("/")
    .get(nhanvien.findAll)
    .post(nhanvien.create);

router.route("/:id")
    .get(nhanvien.findOne)
    .put(nhanvien.update)
    .delete(nhanvien.delete);

module.exports = router;
