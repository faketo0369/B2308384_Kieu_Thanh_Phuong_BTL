const express = require("express");
const dashboard = require("../controllers/dashboard.controller");

const router = express.Router();

router.route("/summary").get(dashboard.getSummary);
router.route("/top-books").get(dashboard.getTopBooks);
router.route("/low-stock").get(dashboard.getLowStock);
router.route("/overdue-readers").get(dashboard.getOverdueReaders);

module.exports = router;
