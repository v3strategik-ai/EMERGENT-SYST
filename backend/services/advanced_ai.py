import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone, timedelta
import asyncio
from dotenv import load_dotenv

from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AdvancedAIService:
    """Comprehensive AI Service for Business Intelligence Platform"""
    
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
        
        # Initialize different AI models for different purposes
        self.gpt5_chat = None
        self.claude_chat = None
        self.gemini_chat = None
        
    async def _get_gpt5_chat(self) -> LlmChat:
        """Get GPT-5 chat instance for advanced analytics"""
        if not self.gpt5_chat:
            self.gpt5_chat = LlmChat(
                api_key=self.api_key,
                session_id="gpt5-analytics",
                system_message="You are an expert business intelligence analyst with deep expertise in data analysis, predictive modeling, and business insights. Provide clear, actionable insights based on data patterns."
            ).with_model("openai", "gpt-5")
        return self.gpt5_chat
    
    async def _get_claude_chat(self) -> LlmChat:
        """Get Claude chat instance for report generation"""
        if not self.claude_chat:
            self.claude_chat = LlmChat(
                api_key=self.api_key,
                session_id="claude-reports",
                system_message="You are a professional business report writer. Create comprehensive, well-structured reports with executive summaries, key insights, and actionable recommendations. Use clear business language and include relevant metrics."
            ).with_model("anthropic", "claude-4-sonnet-20250514")
        return self.claude_chat
    
    async def _get_gemini_chat(self) -> LlmChat:
        """Get Gemini chat instance for conversational AI"""
        if not self.gemini_chat:
            self.gemini_chat = LlmChat(
                api_key=self.api_key,
                session_id="gemini-copilot",
                system_message="You are an intelligent business assistant for Agentik Solutions. Help users navigate their business intelligence platform, answer questions about data, provide insights, and assist with business operations. Be concise, helpful, and professional."
            ).with_model("gemini", "gemini-2.5-pro")
        return self.gemini_chat

    # 1. ADVANCED PREDICTIVE ANALYTICS
    async def sales_forecasting(self, sales_data: List[Dict[str, Any]], forecast_period: int = 90) -> Dict[str, Any]:
        """Advanced sales forecasting using AI"""
        try:
            chat = await self._get_gpt5_chat()
            
            # Prepare data for analysis
            data_summary = {
                "total_deals": len(sales_data),
                "total_value": sum(deal.get('value', 0) for deal in sales_data),
                "avg_deal_value": sum(deal.get('value', 0) for deal in sales_data) / len(sales_data) if sales_data else 0,
                "deal_statuses": {},
                "monthly_trends": {},
                "forecast_period_days": forecast_period
            }
            
            # Calculate status distribution
            for deal in sales_data:
                status = deal.get('status', 'Unknown')
                data_summary["deal_statuses"][status] = data_summary["deal_statuses"].get(status, 0) + 1
            
            prompt = f"""
            Analyze the following sales data and provide a comprehensive forecast for the next {forecast_period} days:
            
            Data Summary:
            {json.dumps(data_summary, indent=2)}
            
            Please provide:
            1. Revenue forecast for next {forecast_period} days
            2. Expected number of deals to close
            3. Key trends and patterns identified
            4. Risk factors and opportunities
            5. Confidence level and reasoning
            6. Actionable recommendations
            
            Format as JSON with clear structure and metrics.
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            return {
                "success": True,
                "forecast": response,
                "analysis_date": datetime.now(timezone.utc).isoformat(),
                "data_points_analyzed": len(sales_data),
                "forecast_period_days": forecast_period
            }
            
        except Exception as e:
            logger.error(f"Sales forecasting error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def customer_churn_prediction(self, customer_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict customer churn using AI analysis"""
        try:
            chat = await self._get_gpt5_chat()
            
            # Analyze customer engagement patterns
            engagement_summary = {
                "total_customers": len(customer_data),
                "activity_patterns": {},
                "value_segments": {},
                "recent_interactions": 0
            }
            
            # Calculate engagement metrics
            for customer in customer_data:
                last_activity = customer.get('last_activity_date')
                customer_value = customer.get('total_value', 0)
                
                if last_activity:
                    try:
                        last_date = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
                        days_since = (datetime.now(timezone.utc) - last_date).days
                        
                        if days_since <= 7:
                            engagement_summary["recent_interactions"] += 1
                            
                        activity_bucket = "active" if days_since <= 30 else "at_risk" if days_since <= 90 else "inactive"
                        engagement_summary["activity_patterns"][activity_bucket] = engagement_summary["activity_patterns"].get(activity_bucket, 0) + 1
                    except:
                        pass
                
                value_segment = "high_value" if customer_value > 10000 else "medium_value" if customer_value > 1000 else "low_value"
                engagement_summary["value_segments"][value_segment] = engagement_summary["value_segments"].get(value_segment, 0) + 1
            
            prompt = f"""
            Analyze customer engagement data and predict churn risk:
            
            Customer Engagement Summary:
            {json.dumps(engagement_summary, indent=2)}
            
            Provide:
            1. Overall churn risk assessment (low/medium/high)
            2. High-risk customer segments identification
            3. Key churn indicators identified
            4. Retention strategies recommended
            5. Predicted churn rate for next 90 days
            6. Early warning signs to monitor
            
            Format as actionable business insights with specific metrics.
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            return {
                "success": True,
                "churn_analysis": response,
                "customers_analyzed": len(customer_data),
                "risk_segments": engagement_summary["activity_patterns"],
                "analysis_date": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Churn prediction error: {str(e)}")
            return {"success": False, "error": str(e)}

    # 2. ENHANCED AI COPILOT WITH VOICE COMMANDS
    async def process_natural_language_query(self, query: str, context_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Process natural language business queries"""
        try:
            chat = await self._get_gemini_chat()
            
            # Prepare context if provided
            context_prompt = ""
            if context_data:
                context_prompt = f"\nCurrent Platform Context:\n{json.dumps(context_data, indent=2)}"
            
            prompt = f"""
            User Query: "{query}"
            {context_prompt}
            
            As an AI business assistant for Agentik Solutions, provide a helpful response to this query. 
            If the query asks for data or insights:
            1. Acknowledge what data would be needed
            2. Provide relevant analysis if context data is available
            3. Suggest specific actions or next steps
            4. Format response in a clear, business-friendly manner
            
            If the query is about navigation or platform features:
            1. Provide clear instructions
            2. Mention relevant suite or feature
            3. Offer additional helpful tips
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            return {
                "success": True,
                "response": response,
                "query": query,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "intent": self._detect_query_intent(query)
            }
            
        except Exception as e:
            logger.error(f"Natural language query error: {str(e)}")
            return {"success": False, "error": str(e), "response": "I apologize, but I'm having trouble processing your request right now. Please try again."}
    
    def _detect_query_intent(self, query: str) -> str:
        """Detect the intent of user query"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['sales', 'revenue', 'deals', 'forecast']):
            return 'sales_analysis'
        elif any(word in query_lower for word in ['customer', 'churn', 'retention']):
            return 'customer_analysis'
        elif any(word in query_lower for word in ['report', 'summary', 'dashboard']):
            return 'reporting'
        elif any(word in query_lower for word in ['navigate', 'how to', 'where is']):
            return 'navigation'
        elif any(word in query_lower for word in ['integration', 'connect', 'sync']):
            return 'integrations'
        else:
            return 'general_inquiry'

    # 3. AUTOMATED REPORT GENERATION
    async def generate_executive_summary(self, platform_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered executive summary"""
        try:
            chat = await self._get_claude_chat()
            
            # Prepare comprehensive data summary
            summary_data = {
                "reporting_period": "Last 30 days",
                "crm_metrics": platform_data.get('crm', {}),
                "sales_metrics": platform_data.get('sales', {}),
                "finance_metrics": platform_data.get('finance', {}),
                "analytics_metrics": platform_data.get('analytics', {}),
                "integration_status": platform_data.get('integrations', {}),
                "user_activity": platform_data.get('user_activity', {})
            }
            
            prompt = f"""
            Generate a comprehensive executive summary report based on the following business intelligence data:
            
            Platform Data Summary:
            {json.dumps(summary_data, indent=2)}
            
            Create a professional executive summary report including:
            
            1. EXECUTIVE OVERVIEW
               - Key performance highlights
               - Critical insights and trends
               - Overall business health assessment
            
            2. KEY METRICS DASHBOARD
               - Sales performance summary
               - CRM effectiveness metrics
               - Financial performance indicators
               - User engagement statistics
            
            3. STRATEGIC INSIGHTS
               - Market opportunities identified
               - Performance trends analysis
               - Risk factors and mitigation
            
            4. ACTIONABLE RECOMMENDATIONS
               - Priority actions for next 30 days
               - Strategic initiatives to consider
               - Resource allocation suggestions
            
            5. APPENDIX
               - Detailed metrics breakdown
               - Data sources and methodology
            
            Format as a professional business report with clear sections, bullet points, and specific numbers where available.
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            return {
                "success": True,
                "report": response,
                "report_type": "executive_summary",
                "generated_date": datetime.now(timezone.utc).isoformat(),
                "data_sources": list(platform_data.keys()),
                "report_id": f"EXEC_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            }
            
        except Exception as e:
            logger.error(f"Executive summary generation error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_weekly_report(self, weekly_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate automated weekly business report"""
        try:
            chat = await self._get_claude_chat()
            
            prompt = f"""
            Generate a comprehensive weekly business report based on this data:
            
            Weekly Performance Data:
            {json.dumps(weekly_data, indent=2)}
            
            Create a structured weekly report including:
            
            1. WEEK IN REVIEW
               - Key achievements and milestones
               - Performance vs. targets
               - Notable events and changes
            
            2. DEPARTMENTAL PERFORMANCE
               - Sales team performance
               - Marketing metrics and campaigns
               - Customer service indicators
               - Operations efficiency
            
            3. FINANCIAL SUMMARY
               - Revenue performance
               - Cost analysis
               - Profit margins and trends
               - Budget vs. actual spending
            
            4. CUSTOMER INSIGHTS
               - New customer acquisition
               - Customer satisfaction trends
               - Support ticket analysis
               - Retention metrics
            
            5. NEXT WEEK FOCUS
               - Priority objectives
               - Resource requirements
               - Anticipated challenges
               - Success metrics to track
            
            Format as a professional weekly report with clear metrics and actionable insights.
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            return {
                "success": True,
                "report": response,
                "report_type": "weekly_summary",
                "week_ending": datetime.now(timezone.utc).isoformat(),
                "report_id": f"WEEK_{datetime.now().strftime('%Y%m%d')}"
            }
            
        except Exception as e:
            logger.error(f"Weekly report generation error: {str(e)}")
            return {"success": False, "error": str(e)}

    # 4. SMART ANOMALY DETECTION
    async def detect_anomalies(self, data: Dict[str, Any], baseline_data: Dict[str, Any]) -> Dict[str, Any]:
        """AI-powered anomaly detection"""
        try:
            chat = await self._get_gpt5_chat()
            
            prompt = f"""
            Analyze the following data for anomalies and unusual patterns:
            
            Current Data:
            {json.dumps(data, indent=2)}
            
            Baseline/Historical Data:
            {json.dumps(baseline_data, indent=2)}
            
            Identify:
            1. Significant deviations from baseline
            2. Unusual patterns or trends
            3. Potential causes for anomalies
            4. Risk assessment (low/medium/high)
            5. Recommended actions
            6. Monitoring suggestions
            
            Focus on business-critical metrics and provide specific, actionable insights.
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            return {
                "success": True,
                "anomaly_analysis": response,
                "detection_date": datetime.now(timezone.utc).isoformat(),
                "data_points_analyzed": len(data),
                "alert_level": self._calculate_alert_level(data, baseline_data)
            }
            
        except Exception as e:
            logger.error(f"Anomaly detection error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _calculate_alert_level(self, current_data: Dict, baseline_data: Dict) -> str:
        """Calculate alert level based on data comparison"""
        # Simplified alert level calculation
        # In production, this would use more sophisticated statistical analysis
        try:
            current_total = sum(v for v in current_data.values() if isinstance(v, (int, float)))
            baseline_total = sum(v for v in baseline_data.values() if isinstance(v, (int, float)))
            
            if baseline_total == 0:
                return "medium"
            
            deviation = abs(current_total - baseline_total) / baseline_total
            
            if deviation > 0.5:  # 50% deviation
                return "high"
            elif deviation > 0.2:  # 20% deviation
                return "medium"
            else:
                return "low"
        except:
            return "medium"

    # 5. CUSTOM AI MODEL TRAINING
    async def train_custom_insights(self, business_domain: str, training_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Train custom AI model for specific business insights"""
        try:
            chat = await self._get_gpt5_chat()
            
            # Prepare training data summary
            training_summary = {
                "domain": business_domain,
                "data_points": len(training_data),
                "data_types": {},
                "key_patterns": [],
                "business_context": {}
            }
            
            # Analyze training data
            for item in training_data:
                for key, value in item.items():
                    value_type = type(value).__name__
                    training_summary["data_types"][key] = training_summary["data_types"].get(key, {})
                    training_summary["data_types"][key][value_type] = training_summary["data_types"][key].get(value_type, 0) + 1
            
            prompt = f"""
            Analyze this business data to create custom insights for the {business_domain} domain:
            
            Training Data Summary:
            {json.dumps(training_summary, indent=2)}
            
            Sample Data Points:
            {json.dumps(training_data[:5], indent=2)}
            
            Create a custom AI insight model that:
            1. Identifies key patterns specific to {business_domain}
            2. Defines relevant KPIs and metrics
            3. Creates predictive indicators
            4. Suggests optimization strategies
            5. Develops industry-specific recommendations
            6. Creates automated monitoring rules
            
            Provide a comprehensive analysis framework tailored to this business domain.
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            return {
                "success": True,
                "custom_model": response,
                "domain": business_domain,
                "training_data_size": len(training_data),
                "model_id": f"CUSTOM_{business_domain}_{datetime.now().strftime('%Y%m%d')}",
                "created_date": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Custom model training error: {str(e)}")
            return {"success": False, "error": str(e)}

    # 6. INTELLIGENT RECOMMENDATIONS
    async def generate_recommendations(self, context: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate intelligent business recommendations"""
        try:
            chat = await self._get_gpt5_chat()
            
            prompt = f"""
            Context: {context}
            
            Business Data:
            {json.dumps(data, indent=2)}
            
            Provide intelligent, actionable recommendations including:
            
            1. IMMEDIATE ACTIONS (Next 7 days)
               - Quick wins and opportunities
               - Critical issues to address
               - Resource reallocation suggestions
            
            2. SHORT-TERM STRATEGIES (Next 30 days)
               - Process improvements
               - Team optimization
               - Technology enhancements
            
            3. LONG-TERM PLANNING (Next 90 days)
               - Strategic initiatives
               - Investment recommendations
               - Growth opportunities
            
            4. RISK MITIGATION
               - Identified risks and threats
               - Preventive measures
               - Contingency planning
            
            5. SUCCESS METRICS
               - KPIs to track progress
               - Benchmarks and targets
               - Review milestones
            
            Prioritize recommendations by impact and feasibility. Include specific metrics and timelines.
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            return {
                "success": True,
                "recommendations": response,
                "context": context,
                "generated_date": datetime.now(timezone.utc).isoformat(),
                "recommendation_id": f"REC_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            }
            
        except Exception as e:
            logger.error(f"Recommendations generation error: {str(e)}")
            return {"success": False, "error": str(e)}

    # 7. VOICE COMMAND PROCESSING
    async def process_voice_command(self, command_text: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Process voice commands with intelligent interpretation"""
        try:
            chat = await self._get_gemini_chat()
            
            prompt = f"""
            Voice Command: "{command_text}"
            
            User Context:
            {json.dumps(user_context, indent=2)}
            
            Interpret this voice command and provide:
            
            1. COMMAND INTERPRETATION
               - What the user wants to do
               - Which platform feature/suite to use
               - Required parameters or data
            
            2. EXECUTION PLAN
               - Step-by-step instructions
               - Navigation path in the platform
               - Expected results
            
            3. INTELLIGENT RESPONSE
               - Natural language confirmation
               - Helpful context and tips
               - Alternative suggestions if applicable
            
            Format as a conversational response that can be used for both text and voice interaction.
            """
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            return {
                "success": True,
                "interpretation": response,
                "original_command": command_text,
                "intent": self._detect_voice_intent(command_text),
                "confidence": "high",  # Would be calculated in production
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Voice command processing error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _detect_voice_intent(self, command: str) -> str:
        """Detect intent from voice command"""
        command_lower = command.lower()
        
        if any(word in command_lower for word in ['show', 'display', 'view', 'see']):
            return 'view_data'
        elif any(word in command_lower for word in ['create', 'add', 'new', 'make']):
            return 'create_item'
        elif any(word in command_lower for word in ['update', 'edit', 'change', 'modify']):
            return 'update_item'
        elif any(word in command_lower for word in ['delete', 'remove', 'cancel']):
            return 'delete_item'
        elif any(word in command_lower for word in ['navigate', 'go to', 'open']):
            return 'navigation'
        elif any(word in command_lower for word in ['analyze', 'report', 'insights']):
            return 'analysis'
        else:
            return 'general_query'


# Global AI service instance
advanced_ai_service = AdvancedAIService()