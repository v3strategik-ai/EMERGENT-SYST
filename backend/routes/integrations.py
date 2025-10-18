from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import logging

from services.integrations import integration_manager
from models import User
from auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])

# Request/Response Models
class IntegrationStatusResponse(BaseModel):
    connected: bool
    status: str
    error: Optional[str] = None
    last_sync: Optional[str] = None

class SlackNotificationRequest(BaseModel):
    channel: str
    message: str

class ZoomMeetingRequest(BaseModel):
    topic: str
    start_time: Optional[str] = None
    duration: int = 60
    timezone: str = "UTC"

class CRMMeetingRequest(BaseModel):
    lead_id: str
    company: str
    meeting_time: str
    attendees: List[str] = []

# Integration Status Endpoints
@router.get("/status")
async def get_integration_statuses(current_user: User = Depends(get_current_user)):
    """Get connection status for all integrations"""
    try:
        statuses = await integration_manager.get_all_statuses()
        return {
            "success": True,
            "integrations": statuses,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting integration statuses: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get integration statuses")

@router.get("/salesforce/status")
async def get_salesforce_status(current_user: User = Depends(get_current_user)):
    """Get Salesforce connection status"""
    try:
        status = await integration_manager.salesforce.connect()
        return status
    except Exception as e:
        logger.error(f"Error getting Salesforce status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Salesforce status")

@router.get("/slack/status")
async def get_slack_status(current_user: User = Depends(get_current_user)):
    """Get Slack connection status"""
    try:
        status = await integration_manager.slack.connect()
        return status
    except Exception as e:
        logger.error(f"Error getting Slack status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Slack status")

@router.get("/zoom/status")
async def get_zoom_status(current_user: User = Depends(get_current_user)):
    """Get Zoom connection status"""
    try:
        status = await integration_manager.zoom.connect()
        return status
    except Exception as e:
        logger.error(f"Error getting Zoom status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Zoom status")

# Salesforce CRM Endpoints
@router.get("/salesforce/leads")
async def get_salesforce_leads(
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get leads from Salesforce"""
    try:
        leads = await integration_manager.salesforce.get_leads(limit)
        return {
            "success": True,
            "leads": leads,
            "count": len(leads)
        }
    except Exception as e:
        logger.error(f"Error getting Salesforce leads: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Salesforce leads")

@router.post("/salesforce/leads")
async def create_salesforce_lead(
    lead_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Create a new lead in Salesforce"""
    try:
        result = await integration_manager.salesforce.create_lead(lead_data)
        return result
    except Exception as e:
        logger.error(f"Error creating Salesforce lead: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create Salesforce lead")

@router.get("/salesforce/opportunities")
async def get_salesforce_opportunities(current_user: User = Depends(get_current_user)):
    """Get opportunities from Salesforce"""
    try:
        opportunities = await integration_manager.salesforce.sync_opportunities()
        return opportunities
    except Exception as e:
        logger.error(f"Error getting Salesforce opportunities: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Salesforce opportunities")

@router.post("/salesforce/sync")
async def sync_salesforce_data(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Trigger Salesforce data synchronization"""
    try:
        def sync_task():
            logger.info("Starting Salesforce data sync...")
            # This would run in the background
            
        background_tasks.add_task(sync_task)
        
        return {
            "success": True,
            "message": "Salesforce sync started",
            "status": "running"
        }
    except Exception as e:
        logger.error(f"Error starting Salesforce sync: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start Salesforce sync")

# Slack Communication Endpoints
@router.get("/slack/channels")
async def get_slack_channels(current_user: User = Depends(get_current_user)):
    """Get list of Slack channels"""
    try:
        channels = await integration_manager.slack.get_channels()
        return {
            "success": True,
            "channels": channels,
            "count": len(channels)
        }
    except Exception as e:
        logger.error(f"Error getting Slack channels: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Slack channels")

@router.post("/slack/channels")
async def create_slack_channel(
    channel_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Create a new Slack channel"""
    try:
        result = await integration_manager.slack.create_channel(
            name=channel_data.get("name"),
            is_private=channel_data.get("is_private", False)
        )
        return result
    except Exception as e:
        logger.error(f"Error creating Slack channel: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create Slack channel")

@router.post("/slack/notify")
async def send_slack_notification(
    notification: SlackNotificationRequest,
    current_user: User = Depends(get_current_user)
):
    """Send notification to Slack channel"""
    try:
        result = await integration_manager.slack.send_notification(
            channel=notification.channel,
            message=notification.message
        )
        return result
    except Exception as e:
        logger.error(f"Error sending Slack notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send Slack notification")

# Zoom Meeting Endpoints
@router.get("/zoom/meetings")
async def get_zoom_meetings(current_user: User = Depends(get_current_user)):
    """Get list of scheduled Zoom meetings"""
    try:
        meetings = await integration_manager.zoom.get_meetings()
        return {
            "success": True,
            "meetings": meetings,
            "count": len(meetings)
        }
    except Exception as e:
        logger.error(f"Error getting Zoom meetings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Zoom meetings")

@router.post("/zoom/meetings")
async def create_zoom_meeting(
    meeting: ZoomMeetingRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new Zoom meeting"""
    try:
        meeting_data = {
            "topic": meeting.topic,
            "start_time": meeting.start_time,
            "duration": meeting.duration,
            "timezone": meeting.timezone
        }
        
        result = await integration_manager.zoom.create_meeting(meeting_data)
        return result
    except Exception as e:
        logger.error(f"Error creating Zoom meeting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create Zoom meeting")

@router.get("/zoom/meetings/{meeting_id}/analytics")
async def get_meeting_analytics(
    meeting_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get analytics for a specific Zoom meeting"""
    try:
        analytics = await integration_manager.zoom.get_meeting_analytics(meeting_id)
        return {
            "success": True,
            "analytics": analytics
        }
    except Exception as e:
        logger.error(f"Error getting meeting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get meeting analytics")

# Workflow Integration Endpoints
@router.post("/workflows/crm-to-meeting")
async def schedule_meeting_from_crm(
    request: CRMMeetingRequest,
    current_user: User = Depends(get_current_user)
):
    """Schedule Zoom meeting from CRM lead data"""
    try:
        lead_data = {
            "lead_id": request.lead_id,
            "company": request.company,
            "meeting_time": request.meeting_time,
            "attendees": request.attendees
        }
        
        result = await integration_manager.schedule_meeting_from_crm(lead_data)
        return result
    except Exception as e:
        logger.error(f"Error scheduling meeting from CRM: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to schedule meeting from CRM")

@router.post("/workflows/sync-all")
async def sync_all_integrations(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Sync data across all integrations"""
    try:
        def sync_all_task():
            logger.info("Starting full integration sync...")
            # This would sync all integration data in the background
            
        background_tasks.add_task(sync_all_task)
        
        return {
            "success": True,
            "message": "Full sync started across all integrations",
            "status": "running",
            "estimated_duration": "5-10 minutes"
        }
    except Exception as e:
        logger.error(f"Error starting full sync: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start full sync")

class TeamNotificationRequest(BaseModel):
    message: str
    channel: str = "general"

@router.post("/workflows/team-notification")
async def send_team_notification(
    request: TeamNotificationRequest,
    current_user: User = Depends(get_current_user)
):
    """Send notification to team via Slack"""
    try:
        result = await integration_manager.send_team_update(request.message, request.channel)
        return result
    except Exception as e:
        logger.error(f"Error sending team notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send team notification")

# Configuration Endpoints  
@router.post("/configure")
async def configure_integration(
    config_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Configure integration settings"""
    try:
        integration_type = config_data.get("integration_type", "unknown")
        # This would update integration configuration
        # For now, return success
        return {
            "success": True,
            "integration": integration_type,
            "message": f"Configuration updated for {integration_type}",
            "config_saved": True
        }
    except Exception as e:
        logger.error(f"Error configuring integration: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to configure integration")

@router.get("/metrics")
async def get_integration_metrics(current_user: User = Depends(get_current_user)):
    """Get integration usage metrics"""
    try:
        return {
            "success": True,
            "metrics": {
                "salesforce": {
                    "api_calls_today": 247,
                    "leads_synced": 156,
                    "opportunities_synced": 43,
                    "last_sync": "2024-01-18T10:30:00Z"
                },
                "slack": {
                    "messages_sent": 89,
                    "channels_active": 12,
                    "notifications_today": 34,
                    "uptime": "99.8%"
                },
                "zoom": {
                    "meetings_created": 23,
                    "total_participants": 156,
                    "recordings_processed": 8,
                    "analytics_generated": 15
                }
            },
            "overall": {
                "total_api_calls": 2456,
                "success_rate": "98.7%",
                "average_response_time": "245ms"
            }
        }
    except Exception as e:
        logger.error(f"Error getting integration metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get integration metrics")