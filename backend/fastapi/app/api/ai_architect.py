from fastapi import HTTPException, APIRouter
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage # <--- USING RAW MESSAGES

from app.core.config import settings
from app.schemas.ai_schemas import ChatRequest, WorkflowDefinition
from app.templates.prompt import WORKFLOW_SYSTEM_PROMPT, get_tools_string

router = APIRouter()

@router.post("/generate")
async def generate_workflow_structure(request: ChatRequest):
    try:
        if not settings.GROQ_API_KEY:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is missing")
        
        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model="openai/gpt-oss-120b",
            temperature=0
        )
        
        structured_llm = llm.with_structured_output(WorkflowDefinition)
        
        # 1. MANUAL REPLACEMENT (The Safe Way)
        tools_str = get_tools_string()
        # We assume the prompt uses [[TOOLS_LIST]] as a placeholder
        final_system_text = WORKFLOW_SYSTEM_PROMPT.replace("[[TOOLS_LIST]]", tools_str)

        # 2. Build the History Context
        context_block = ""
        if request.history:
            context_block += "=== CONVERSATION HISTORY START ===\n"
            for item in request.history:
                context_block += f"{item.role.upper()}: {item.content}\n"
            context_block += "=== CONVERSATION HISTORY END ===\n\n"
            context_block += "Based on the history above and the new request below, output the COMPLETE updated workflow JSON.\n"
            context_block += "CURRENT REQUEST: "

        final_user_input = context_block + request.message

        # 3. Pass as RAW MESSAGES (Bypasses LangChain Formatting)
        messages = [
            SystemMessage(content=final_system_text),
            HumanMessage(content=final_user_input)
        ]

        result = await structured_llm.ainvoke(messages)

        return result.dict()

    except Exception as e:
        print(f"ERROR: {str(e)}")
        # Print full error to your terminal for debugging
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))