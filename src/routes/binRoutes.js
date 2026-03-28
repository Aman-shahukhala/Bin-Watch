const express = require("express");
const router = express.Router();
const binController = require("../controllers/binController");

router.post("/update", binController.updateBin);
router.get("/data", binController.getBins);
router.post("/rename", binController.renameBin);
router.delete("/bin/:id", binController.deleteBin);
router.post("/reset-history/:id", binController.resetHistory);
router.post("/test-alert", binController.testAlert);

module.exports = router;
