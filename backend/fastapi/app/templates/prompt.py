WORKFLOW_SYSTEM_PROMPT = """
### ROLE
You are a Senior Workflow Architect (like Zapier Copilot). Your goal is to build the workflow AND guide the user with MULTIPLE strategic options.

### STRICT RULES
1. **Layout:** Start the first node at { "x": 100, "y": 100 }.
2. **Spacing:** Vertical layout (y + 150).
3. **Connections:** Connect every node logically.
4. **Trigger:** Always start with a trigger.
5. **Missing Info:** If a required field is missing, use "USER_MUST_ENTER_THIS".

### SUMMARY & CHAT BEHAVIOR (UPDATED)
In the 'summary' field, you must:
1. **Confirm:** One sentence stating what you built.
2. **Suggest 3 Distinct Next Steps:** Provide a numbered list of 3 different directions the user could take.

*Example Format:*
"I have set up the GitHub repository creation flow. What would you like to do next?
1. Add an Email Notification to alert the admin?
2. Add a Slack message to the #dev-team channel?
3. Create a conditional check to see if the repo name already exists?"

### AVAILABLE TOOLS DATABASE
[[TOOLS_LIST]]

### OUTPUT FORMAT
Return ONLY valid JSON matching the WorkflowDefinition schema.
"""

# 2. THE TOOLS DATABASE
TOOLS_DB = [
    {
        "id": "TRIGGER",
        "description": "Starts the workflow. Use this first.",
        "type": "trigger",
        "url": None
    },
    {
        "id": "GITHUB_CREATOR",
        "description": "Creates a new GitHub repository. Requires 'repo_name'.",
        "type": "service_task",
        "url": "http://localhost:8000/github/create"
    },
    {
        "id": "INVENTORY_CHECK",
        "description": "Checks stock levels. Requires 'item_id'.",
        "type": "service_task",
        "url": "http://localhost:8000/inventory/check"
    },
    {
        "id": "LLM_CONTENT_GENERATOR",
        "description": "Generates Text using AI. Useful for writing professional emails, summarizing data, or fixing codes. Requires 'prompt' (e.g.'Write a proper apology email')",
        "type": "service_task",
        "url": "http://localhost:8000/ai/generate-content"
    },
    {
        "id": "GMAIL_SENDER",
        "description": "Sends an email immediately. Set 'action' to 'send'. Requires 'recipient', 'subject', 'body'.",
        "type": "service_task",
        "url": "http://localhost:8000/gmail/execute"  # <--- SAME URL
    },
    {
        "id": "GMAIL_DRAFT_CREATOR",
        "description": "Creates a draft email. Set 'action' to 'create_draft'. Requires 'recipient', 'subject', 'body'.",
        "type": "service_task",
        "url": "http://localhost:8000/gmail/execute"  
    },
    {
        "id": "GMAIL_FETCHER",
        "description": "Reads the latest email. Set 'action' to 'read_latest'. No other inputs needed.",
        "type": "service_task",
        "url": "http://localhost:8000/gmail/execute"  
    },
    {
        "id": "NOTION_ITEM_CREATOR",
        "description": "Adds a new item/row to a Notion Database. Useful for task tracking or logging. Set 'action' to 'create_item'. Requires 'database_name' (e.g., 'Tasks') and 'content' (the text to add).",
        "type": "service_task",
        "url": "http://localhost:8000/notion/execute"
    },
    {
        "id": "NOTION_PAGE_READER",
        "description": "Reads the content of a Notion page. Useful for summarizing docs. Set 'action' to 'read_page'. Requires 'page_title'.",
        "type": "service_task",
        "url": "http://localhost:8000/notion/execute"
    },
    {
        "id": "SLACK_SENDER",
        "description": "Sends a message to a Slack channel or user. Set 'action' to 'send_message'. Requires 'channel_name' (e.g., '#general') and 'message_text'.",
        "type": "service_task",
        "url": "http://localhost:8000/slack/execute"
    }
]

# 3. HELPER FUNCTION
def get_tools_string():
    formatted_tools = []
    for tool in TOOLS_DB:
        formatted_tools.append(f"- {tool['id']}: {tool['description']} (Type: {tool['type']}, URL: {tool['url']})")
    return "\n".join(formatted_tools)