const express = require('express');
const router = express.Router();
const blueprintController = require('../controllers/blueprintController');

router.get('/', blueprintController.listBlueprints);
router.get('/:id', blueprintController.getBlueprint);
router.post('/share', blueprintController.shareBlueprint);

module.exports = router;
