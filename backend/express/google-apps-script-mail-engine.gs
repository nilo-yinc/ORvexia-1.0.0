/**
 * ORVEXIA MASTER MAIL ENGINE (v3.1)
 *
 * Deploy in Google Apps Script:
 * 1. Deploy -> New deployment -> Web app
 * 2. Execute as: Me
 * 3. Who has access: Anyone
 * 4. Copy the Web app /exec URL into APPS_SCRIPT_WEBHOOK_URL
 *
 * Optional security:
 * Add Script Property MAIL_WEBHOOK_SECRET and set the same value in backend .env.
 */
const PLATFORM = "ORVEXIA";
const ACCENT_COLOR = "#7c3aed";

function doGet() {
  return jsonResponse({
    status: "success",
    service: "orvexia-mail-engine",
    version: "3.1",
  });
}

function doPost(e) {
  try {
    var data = parseRequest(e);
    var configuredSecret = PropertiesService.getScriptProperties().getProperty("MAIL_WEBHOOK_SECRET");

    if (configuredSecret && data.secret !== configuredSecret) {
      return jsonResponse({ status: "error", message: "Unauthorized mail request" });
    }

    var email = String(data.email || "").trim();
    var name = String(data.name || "Operator").trim();
    var type = String(data.type || "system").trim();
    var payload = data.payload || {};

    if (!isValidEmail(email)) {
      return jsonResponse({ status: "error", message: "A valid recipient email is required" });
    }

    var message = buildMessage(type, payload, name);

    MailApp.sendEmail({
      to: email,
      subject: message.subject,
      htmlBody: message.body,
      name: PLATFORM + " SYSTEM",
    });

    return jsonResponse({ status: "success", type: type, email: email });
  } catch (error) {
    return jsonResponse({ status: "error", message: String(error && error.message ? error.message : error) });
  }
}

function parseRequest(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing request body");
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error("Request body must be valid JSON");
  }
}

function buildMessage(type, payload, name) {
  switch (type) {
    case "otp":
      return {
        subject: escapeText(payload.otp) + " is your Verification Code",
        body: generateTemplate(
          "VERIFICATION_REQUIRED",
          "Your security code is below. Do not share it.",
          "<h1 style='font-size:48px; letter-spacing:10px; color:" + ACCENT_COLOR + "; margin:0;'>" + escapeText(payload.otp) + "</h1>"
        ),
      };

    case "welcome":
      return {
        subject: "Initialization Complete - Welcome to " + PLATFORM,
        body: generateTemplate(
          "WELCOME_OPERATOR",
          "Your neural link to ORvexia has been established.",
          "<p>Hello " + escapeText(name) + ", you now have access to advanced agentic automation protocols.</p>"
        ),
      };

    case "security":
      return {
        subject: "SECURITY_ALERT: New Authorization Detected",
        body: generateTemplate(
          "SECURITY_ALERT",
          "A new login was detected on your account.",
          "<div style='background:#f1f1f1; padding:15px; color:#333; font-family:monospace;'>IP: " + escapeText(payload.ip || "Unknown") + "<br>METHOD: " + escapeText(payload.method || "Password") + "</div>"
        ),
      };

    case "automation_success":
      return {
        subject: "WORKFLOW_SUCCESS: " + escapeText(payload.workflowName || "Task Completed"),
        body: generateTemplate(
          "AUTOMATION_RESOLVED",
          "Your workflow has executed successfully.",
          "<p style='color:#22c55e;'>Status: SUCCESSFUL</p>"
        ),
      };

    case "automation_fail":
      return {
        subject: "WORKFLOW_CRITICAL: " + escapeText(payload.workflowName || "Task Failed"),
        body: generateTemplate(
          "AUTOMATION_FAULT",
          "A workflow has encountered a critical error.",
          "<p style='color:#ef4444;'>Status: FAILED</p><p>Error: " + escapeText(payload.error || "Unknown Error") + "</p>"
        ),
      };

    case "custom":
      return {
        subject: escapeText(payload.subject || "ORVEXIA Notification"),
        body: generateTemplate(
          "AUTOMATION_EMAIL",
          payload.subject || "Workflow notification",
          "<p>" + escapeText(payload.message || payload.body || "") + "</p>"
        ),
      };

    default:
      return {
        subject: "SYSTEM_NOTIFICATION: " + PLATFORM,
        body: generateTemplate(
          "SYSTEM_UPDATE",
          "Important update regarding your account.",
          "<p>" + escapeText(payload.message || "Please check your dashboard for details.") + "</p>"
        ),
      };
  }
}

function generateTemplate(header, subheader, content) {
  return "<div style='background:#050505; color:#ffffff; padding:40px; font-family:Arial,sans-serif; border:1px solid #1a1a1a;'>" +
    "<h3 style='color:" + ACCENT_COLOR + "; margin:0; letter-spacing:2px; font-size:12px;'>" + escapeText(header) + "</h3>" +
    "<h1 style='margin:10px 0; font-size:24px; line-height:1.25;'>" + escapeText(subheader) + "</h1>" +
    "<div style='margin:30px 0; padding:20px; border-left:4px solid " + ACCENT_COLOR + "; background:#0a0a0a;'>" + content + "</div>" +
    "<p style='color:#777; font-size:10px; margin-top:50px;'>&copy; 2026 ORVEXIA // INTELLECTUAL AUTONOMY</p></div>";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeText(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
