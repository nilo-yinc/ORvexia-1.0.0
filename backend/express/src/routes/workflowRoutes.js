const express = require("express");
const router = express.Router();
const {
  createWorkflow,
  getworkflows,
  getWorkflowById,
  executeWorkflow,
  getWorkflowExecutions,
  getGlobalExecutions,
  deleteWorkflow,
  toggleWorkflow,
  getDashboardStats
} = require("../controllers/workflowController");
const isLoggedIn = require("../middlewares/isLoggedIn.middleware");

router.post("/", isLoggedIn, createWorkflow);
router.get("/", isLoggedIn, getworkflows);
router.get("/stats", isLoggedIn, getDashboardStats);
router.get("/executions", isLoggedIn, getGlobalExecutions);
router.get("/:id", isLoggedIn, getWorkflowById);
router.post("/:id/execute", isLoggedIn, executeWorkflow);
router.get("/:id/executions", isLoggedIn, getWorkflowExecutions);
router.patch("/:id/toggle", isLoggedIn, toggleWorkflow);
router.patch("/:id/toggle-template", isLoggedIn, require("../controllers/workflowController").toggleTemplate);
router.delete("/:id", isLoggedIn, deleteWorkflow);


module.exports = router;
