from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import logging
import io

from services.bulk_operations import bulk_operations_service
from models import User
from auth import get_current_user
from database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/bulk", tags=["Bulk Operations"])

# Response Models
class BulkImportResponse(BaseModel):
    success: bool
    message: str
    imported_count: Optional[int] = None
    error: Optional[str] = None

class SummaryReportResponse(BaseModel):
    success: bool
    report: Dict[str, Any]

# BULK IMPORT ENDPOINTS
@router.post("/import/leads", response_model=BulkImportResponse)
async def bulk_import_leads(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Bulk import leads from CSV file"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        result = await bulk_operations_service.import_leads_csv(file, current_user.id)
        
        if not result['success']:
            return BulkImportResponse(
                success=False,
                message=result['error'],
                error=result['error']
            )
        
        # Save leads to database
        leads_data = result['data']
        for lead in leads_data:
            lead_doc = lead.copy()
            lead_doc['created_at'] = lead_doc['created_at'].isoformat()
            lead_doc['updated_at'] = lead_doc['updated_at'].isoformat()
            await db.leads.insert_one(lead_doc)
        
        return BulkImportResponse(
            success=True,
            message=result['message'],
            imported_count=result['leads_imported']
        )
        
    except Exception as e:
        logger.error(f"Bulk import leads error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to import leads")

@router.post("/import/deals", response_model=BulkImportResponse)
async def bulk_import_deals(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Bulk import deals from CSV file"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        result = await bulk_operations_service.import_deals_csv(file, current_user.id)
        
        if not result['success']:
            return BulkImportResponse(
                success=False,
                message=result['error'],
                error=result['error']
            )
        
        # Save deals to database
        deals_data = result['data']
        for deal in deals_data:
            deal_doc = deal.copy()
            deal_doc['created_at'] = deal_doc['created_at'].isoformat()
            deal_doc['updated_at'] = deal_doc['updated_at'].isoformat()
            await db.deals.insert_one(deal_doc)
        
        return BulkImportResponse(
            success=True,
            message=result['message'],
            imported_count=result['deals_imported']
        )
        
    except Exception as e:
        logger.error(f"Bulk import deals error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to import deals")

@router.post("/import/transactions", response_model=BulkImportResponse)
async def bulk_import_transactions(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Bulk import transactions from CSV file"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        result = await bulk_operations_service.import_transactions_csv(file, current_user.id)
        
        if not result['success']:
            return BulkImportResponse(
                success=False,
                message=result['error'],
                error=result['error']
            )
        
        # Save transactions to database
        transactions_data = result['data']
        for transaction in transactions_data:
            transaction_doc = transaction.copy()
            transaction_doc['created_at'] = transaction_doc['created_at'].isoformat()
            transaction_doc['updated_at'] = transaction_doc['updated_at'].isoformat()
            await db.transactions.insert_one(transaction_doc)
        
        return BulkImportResponse(
            success=True,
            message=result['message'],
            imported_count=result['transactions_imported']
        )
        
    except Exception as e:
        logger.error(f"Bulk import transactions error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to import transactions")

# BULK EXPORT ENDPOINTS
@router.get("/export/leads")
async def bulk_export_leads(current_user: User = Depends(get_current_user)):
    """Export all leads to CSV file"""
    try:
        # Get leads from database
        query = {} if current_user.role == "admin" else {"user_id": current_user.id}
        leads = await db.leads.find(query, {"_id": 0}).to_list(1000)
        
        # Generate CSV content
        csv_content = bulk_operations_service.export_leads_csv(leads)
        
        if not csv_content:
            raise HTTPException(status_code=500, detail="Failed to generate CSV export")
        
        # Return CSV file
        headers = {
            'Content-Disposition': f'attachment; filename="leads_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        }
        
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Bulk export leads error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export leads")

@router.get("/export/deals")
async def bulk_export_deals(current_user: User = Depends(get_current_user)):
    """Export all deals to CSV file"""
    try:
        # Get deals from database
        query = {} if current_user.role == "admin" else {"user_id": current_user.id}
        deals = await db.deals.find(query, {"_id": 0}).to_list(1000)
        
        # Generate CSV content
        csv_content = bulk_operations_service.export_deals_csv(deals)
        
        if not csv_content:
            raise HTTPException(status_code=500, detail="Failed to generate CSV export")
        
        # Return CSV file
        headers = {
            'Content-Disposition': f'attachment; filename="deals_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        }
        
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Bulk export deals error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export deals")

@router.get("/export/transactions")
async def bulk_export_transactions(current_user: User = Depends(get_current_user)):
    """Export all transactions to CSV file"""
    try:
        # Get transactions from database
        query = {} if current_user.role == "admin" else {"user_id": current_user.id}
        transactions = await db.transactions.find(query, {"_id": 0}).to_list(1000)
        
        # Generate CSV content
        csv_content = bulk_operations_service.export_transactions_csv(transactions)
        
        if not csv_content:
            raise HTTPException(status_code=500, detail="Failed to generate CSV export")
        
        # Return CSV file
        headers = {
            'Content-Disposition': f'attachment; filename="transactions_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        }
        
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Bulk export transactions error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export transactions")

# SUMMARY REPORTS
@router.get("/reports/leads", response_model=SummaryReportResponse)
async def get_leads_summary(current_user: User = Depends(get_current_user)):
    """Get leads summary report"""
    try:
        query = {} if current_user.role == "admin" else {"user_id": current_user.id}
        leads = await db.leads.find(query, {"_id": 0}).to_list(1000)
        
        report = bulk_operations_service.generate_summary_report('leads', leads)
        
        return SummaryReportResponse(
            success=True,
            report=report
        )
        
    except Exception as e:
        logger.error(f"Leads summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate leads summary")

@router.get("/reports/deals", response_model=SummaryReportResponse)
async def get_deals_summary(current_user: User = Depends(get_current_user)):
    """Get deals summary report"""
    try:
        query = {} if current_user.role == "admin" else {"user_id": current_user.id}
        deals = await db.deals.find(query, {"_id": 0}).to_list(1000)
        
        report = bulk_operations_service.generate_summary_report('deals', deals)
        
        return SummaryReportResponse(
            success=True,
            report=report
        )
        
    except Exception as e:
        logger.error(f"Deals summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate deals summary")

@router.get("/reports/transactions", response_model=SummaryReportResponse)
async def get_transactions_summary(current_user: User = Depends(get_current_user)):
    """Get transactions summary report"""
    try:
        query = {} if current_user.role == "admin" else {"user_id": current_user.id}
        transactions = await db.transactions.find(query, {"_id": 0}).to_list(1000)
        
        report = bulk_operations_service.generate_summary_report('transactions', transactions)
        
        return SummaryReportResponse(
            success=True,
            report=report
        )
        
    except Exception as e:
        logger.error(f"Transactions summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate transactions summary")

# TEMPLATE DOWNLOADS
@router.get("/templates/leads")
async def download_leads_template():
    """Download CSV template for leads import"""
    try:
        template_content = "name,email,company,phone,source,status\nJohn Doe,john@example.com,Example Corp,555-1234,Website,New\nJane Smith,jane@company.com,Tech Solutions,555-5678,Referral,Qualified"
        
        headers = {
            'Content-Disposition': 'attachment; filename="leads_import_template.csv"'
        }
        
        return StreamingResponse(
            io.StringIO(template_content),
            media_type="text/csv",
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Template download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download template")

@router.get("/templates/deals")
async def download_deals_template():
    """Download CSV template for deals import"""
    try:
        template_content = "name,company,value,status,source,probability,assigned_to\nEnterprise License,Tech Corp,50000,Negotiation,Website,80,Sales Rep\nSaaS Subscription,Digital Inc,25000,Prospecting,Referral,60,Account Manager"
        
        headers = {
            'Content-Disposition': 'attachment; filename="deals_import_template.csv"'
        }
        
        return StreamingResponse(
            io.StringIO(template_content),
            media_type="text/csv",
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Template download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download template")

@router.get("/templates/transactions")
async def download_transactions_template():
    """Download CSV template for transactions import"""
    try:
        template_content = "description,amount,type,status,customer,method\nMonthly Subscription,99.99,Payment,Completed,John Doe,Credit Card\nRefund Request,29.99,Refund,Processed,Jane Smith,PayPal"
        
        headers = {
            'Content-Disposition': 'attachment; filename="transactions_import_template.csv"'
        }
        
        return StreamingResponse(
            io.StringIO(template_content),
            media_type="text/csv",
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Template download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download template")