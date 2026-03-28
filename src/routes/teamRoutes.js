const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.getStaff);
router.post('/', teamController.addStaff);
router.delete('/:id', teamController.removeStaff);
router.put('/:id', teamController.updateStaff);

module.exports = router;
