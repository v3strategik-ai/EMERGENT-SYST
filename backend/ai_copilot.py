from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
from typing import Optional
import uuid

class AICopilot:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.system_message = """You are SystemIX AI Copilot, an advanced business intelligence assistant. 
You help users with:
- Data analysis and insights
- Report generation
- Business intelligence queries
- CRM operations
- Financial analysis
- Document management
- Sales forecasting
- Automation recommendations

Be concise, professional, and actionable in your responses."""

    async def process_query(self, query: str, session_id: Optional[str] = None) -> str:
        """Process a user query and return AI response"""
        if not session_id:
            session_id = str(uuid.uuid4())
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=self.system_message
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(text=query)
            response = await chat.send_message(user_message)
            
            return response
        except Exception as e:
            return f"Error processing query: {str(e)}"
    
    async def analyze_data(self, data: dict, question: str) -> str:
        """Analyze business data and answer questions"""
        context = f"Business Data: {data}\n\nQuestion: {question}"
        return await self.process_query(context)
    
    async def generate_report(self, report_type: str, data: dict) -> str:
        """Generate business reports"""
        prompt = f"Generate a {report_type} report based on this data: {data}"
        return await self.process_query(prompt)
