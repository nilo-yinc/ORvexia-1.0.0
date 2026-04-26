const express = require("express");
const router = express.Router();
const {createWorkflow, getworkflows, getWorkflowById, executeWorkflow} = require("../controllers/workflowController");
const isLoggedIn = require("../middlewares/isLoggedIn.middleware");

router.post("/", isLoggedIn, createWorkflow);
router.get("/", isLoggedIn, getworkflows);
router.get("/:id", isLoggedIn, getWorkflowById);
router.post("/:id/execute", isLoggedIn, executeWorkflow);


module.exports = router;
