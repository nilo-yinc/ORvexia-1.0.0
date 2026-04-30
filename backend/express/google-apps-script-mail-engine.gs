/**
 * ORVEXIA MASTER MAIL ENGINE (v3.2)
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
const ACCENT_COLOR = "#ff5f1f";

function doGet() {
  return jsonResponse({
    status: "success",
    service: "orvexia-mail-engine",
    version: "3.2",
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
        subject: escapeText(payload.otp) + " is your ORVEXIA verification code",
        body: generateTemplate(
          "VERIFICATION_REQUIRED",
          "Verify your ORVEXIA request",
          "<p style='margin:0 0 16px;color:#a1a1aa;'>Use this one-time code to continue. It expires in " + escapeText(payload.expiresIn || "10 minutes") + ".</p>" +
          "<div style='font-size:48px; letter-spacing:10px; color:" + ACCENT_COLOR + "; font-weight:900; margin:10px 0 22px;'>" + escapeText(payload.otp) + "</div>" +
          detailTable([
            ["Request", payload.method || "Verification"],
            ["IP address", payload.ip || "Unknown"],
            ["Location", payload.location || "Approximate location unavailable"],
            ["Device", payload.device || "Unknown device"],
            ["Time", payload.time || new Date().toISOString()]
          ]) +
          "<p style='margin:18px 0 0;color:#a1a1aa;'>If you did not request this code, you can ignore this email or update your password.</p>"
        ),
      };

    case "welcome":
      return {
        subject: "Initialization Complete - Welcome to " + PLATFORM,
        body: generateTemplate(
          "WELCOME_TO_ORVEXIA",
          "Your automation workspace is ready",
          "<p>Hello " + escapeText(name) + ", welcome to ORVEXIA.</p>" +
          "<p>You can now connect Gmail, Slack, Notion, Google Calendar, Drive, Docs, Meet, GitHub, WhatsApp-ready webhooks, and more to build agentic workflows.</p>" +
          "<p style='margin-top:22px;'><a href='" + escapeAttribute(payload.appUrl || "") + "' style='background:" + ACCENT_COLOR + ";color:#fff;text-decoration:none;padding:12px 18px;font-weight:800;'>Open ORVEXIA</a></p>"
        ),
      };

    case "security":
      return {
        subject: "ORVEXIA security alert: new authorization",
        body: generateTemplate(
          "SECURITY_ALERT",
          "A new authorization was detected",
          "<p style='margin:0 0 16px;color:#a1a1aa;'>We noticed a sign-in or account security action on your ORVEXIA account.</p>" +
          detailTable([
            ["Method", payload.method || "Password"],
            ["IP address", payload.ip || "Unknown"],
            ["Location", payload.location || "Approximate location unavailable"],
            ["Device", payload.device || "Unknown device"],
            ["Time", payload.time || new Date().toISOString()]
          ]) +
          "<p style='margin:18px 0 0;color:#a1a1aa;'>If this was you, no action is needed. If this was not you, reset your password immediately.</p>"
        ),
      };

    case "automation_success":
      return {
        subject: "WORKFLOW_SUCCESS: " + escapeText(payload.workflowName || "Task Completed"),
        body: generateTemplate(
          "AUTOMATION_RESOLVED",
          "Your workflow executed successfully",
          detailTable([
            ["Workflow", payload.workflowName || "Task Completed"],
            ["Status", "Successful"],
            ["Time", payload.time || new Date().toISOString()]
          ])
        ),
      };

    case "automation_fail":
      return {
        subject: "WORKFLOW_CRITICAL: " + escapeText(payload.workflowName || "Task Failed"),
        body: generateTemplate(
          "AUTOMATION_FAULT",
          "A workflow needs your attention",
          detailTable([
            ["Workflow", payload.workflowName || "Task Failed"],
            ["Status", "Failed"],
            ["Error", payload.error || "Unknown Error"],
            ["Time", payload.time || new Date().toISOString()]
          ])
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
  return "<div style='margin:0;padding:36px;background:#030303;color:#ffffff;font-family:Arial,sans-serif;'>" +
    "<div style='max-width:680px;margin:0 auto;background:#111113;border:1px solid #27272a;'>" +
    "<div style='padding:28px 32px;border-bottom:1px solid #27272a;'>" +
    "<div style='font-size:24px;font-weight:900;letter-spacing:.5px;'>ORV<span style='color:" + ACCENT_COLOR + ";'>EXIA</span></div>" +
    "<div style='margin-top:8px;color:#a1a1aa;font-size:13px;'>Agentic workflow automation platform</div>" +
    "</div>" +
    "<div style='padding:32px;'>" +
    "<h3 style='color:" + ACCENT_COLOR + "; margin:0; letter-spacing:2px; font-size:12px;'>" + escapeText(header) + "</h3>" +
    "<h1 style='margin:10px 0 22px; font-size:30px; line-height:1.18;'>" + escapeText(subheader) + "</h1>" +
    "<div style='font-size:15px;line-height:1.65;color:#f4f4f5;'>" + content + "</div>" +
    "</div>" +
    "<div style='padding:18px 32px;color:#71717a;font-size:12px;border-top:1px solid #27272a;'>Sent by ORVEXIA. Operational, security, and workflow notifications for your account.</div>" +
    "</div></div>";
}

function detailTable(rows) {
  var html = "<table style='width:100%;border-collapse:collapse;background:#18181b;border:1px solid #27272a;'>";
  rows.forEach(function(row) {
    html += "<tr><td style='width:36%;padding:12px;border-bottom:1px solid #27272a;color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;'>" + escapeText(row[0]) + "</td>" +
      "<td style='padding:12px;border-bottom:1px solid #27272a;color:#ffffff;word-break:break-word;'>" + escapeText(row[1]) + "</td></tr>";
  });
  return html + "</table>";
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

function escapeAttribute(value) {
  return escapeText(value).replace(/`/g, "&#96;");
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
