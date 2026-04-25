const express = require("express");
const router = express.Router();
const {createWorkflow, getworkflows, getWorkflowById} = require("../controllers/workflowController");
const isLoggedIn = require("../middlewares/isLoggedIn.middleware");

router.post("/", isLoggedIn, createWorkflow);
router.get("/", isLoggedIn, getworkflows);
router.get("/:id", isLoggedIn, getWorkflowById);


module.exports = router;
