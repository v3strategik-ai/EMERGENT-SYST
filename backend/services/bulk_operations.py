import csv
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import io
import logging
from fastapi import UploadFile

logger = logging.getLogger(__name__)

class BulkOperationsService:
    """Service for handling bulk import/export operations across all suites"""
    
    def __init__(self):
        pass
    
    # BULK IMPORT FUNCTIONALITY
    async def import_leads_csv(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """Import leads from CSV file"""
        try:
            content = await file.read()
            csv_data = content.decode('utf-8')
            
            # Parse CSV
            leads = []
            reader = csv.DictReader(io.StringIO(csv_data))
            
            expected_columns = ['name', 'email', 'company', 'phone', 'source', 'status']
            
            for row_num, row in enumerate(reader, 1):
                # Validate required columns
                if not all(col in row for col in ['name', 'email']):
                    return {
                        'success': False,
                        'error': f'Missing required columns (name, email) in row {row_num}'
                    }
                
                lead = {
                    'id': str(uuid.uuid4()),
                    'name': row.get('name', '').strip(),
                    'email': row.get('email', '').strip(),
                    'company': row.get('company', '').strip(),
                    'phone': row.get('phone', '').strip(),
                    'source': row.get('source', 'Import').strip(),
                    'status': row.get('status', 'New').strip(),
                    'user_id': user_id,
                    'created_at': datetime.now(timezone.utc),
                    'updated_at': datetime.now(timezone.utc)
                }
                
                leads.append(lead)
            
            return {
                'success': True,
                'leads_imported': len(leads),
                'data': leads,
                'message': f'Successfully imported {len(leads)} leads'
            }
            
        except Exception as e:
            logger.error(f'Leads import error: {str(e)}')
            return {
                'success': False,
                'error': f'Failed to import leads: {str(e)}'
            }
    
    async def import_deals_csv(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """Import deals from CSV file"""
        try:
            content = await file.read()
            csv_data = content.decode('utf-8')
            
            deals = []
            reader = csv.DictReader(io.StringIO(csv_data))
            
            for row_num, row in enumerate(reader, 1):
                if not all(col in row for col in ['name', 'company', 'value']):
                    return {
                        'success': False,
                        'error': f'Missing required columns (name, company, value) in row {row_num}'
                    }
                
                deal = {
                    'id': str(uuid.uuid4()),
                    'name': row.get('name', '').strip(),
                    'company': row.get('company', '').strip(),
                    'value': float(row.get('value', 0)),
                    'status': row.get('status', 'Prospecting').strip(),
                    'source': row.get('source', 'Import').strip(),
                    'probability': int(row.get('probability', 50)),
                    'assigned_to': row.get('assigned_to', '').strip(),
                    'user_id': user_id,
                    'created_at': datetime.now(timezone.utc),
                    'updated_at': datetime.now(timezone.utc)
                }
                
                deals.append(deal)
            
            return {
                'success': True,
                'deals_imported': len(deals),
                'data': deals,
                'message': f'Successfully imported {len(deals)} deals'
            }
            
        except Exception as e:
            logger.error(f'Deals import error: {str(e)}')
            return {
                'success': False,
                'error': f'Failed to import deals: {str(e)}'
            }
    
    async def import_transactions_csv(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """Import transactions from CSV file"""
        try:
            content = await file.read()
            csv_data = content.decode('utf-8')
            
            transactions = []
            reader = csv.DictReader(io.StringIO(csv_data))
            
            for row_num, row in enumerate(reader, 1):
                if not all(col in row for col in ['description', 'amount']):
                    return {
                        'success': False,
                        'error': f'Missing required columns (description, amount) in row {row_num}'
                    }
                
                transaction = {
                    'id': str(uuid.uuid4()),
                    'description': row.get('description', '').strip(),
                    'amount': float(row.get('amount', 0)),
                    'type': row.get('type', 'Payment').strip(),
                    'status': row.get('status', 'Completed').strip(),
                    'customer': row.get('customer', '').strip(),
                    'method': row.get('method', 'Credit Card').strip(),
                    'user_id': user_id,
                    'created_at': datetime.now(timezone.utc),
                    'updated_at': datetime.now(timezone.utc)
                }
                
                transactions.append(transaction)
            
            return {
                'success': True,
                'transactions_imported': len(transactions),
                'data': transactions,
                'message': f'Successfully imported {len(transactions)} transactions'
            }
            
        except Exception as e:
            logger.error(f'Transactions import error: {str(e)}')
            return {
                'success': False,
                'error': f'Failed to import transactions: {str(e)}'
            }
    
    # BULK EXPORT FUNCTIONALITY
    def export_leads_csv(self, leads: List[Dict[str, Any]]) -> str:
        """Export leads to CSV format"""
        try:
            output = io.StringIO()
            fieldnames = ['name', 'email', 'company', 'phone', 'source', 'status', 'created_at']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            
            writer.writeheader()
            for lead in leads:
                row = {
                    'name': lead.get('name', ''),
                    'email': lead.get('email', ''),
                    'company': lead.get('company', ''),
                    'phone': lead.get('phone', ''),
                    'source': lead.get('source', ''),
                    'status': lead.get('status', ''),
                    'created_at': lead.get('created_at', '').replace('T', ' ').replace('Z', '') if isinstance(lead.get('created_at'), str) else str(lead.get('created_at', ''))
                }
                writer.writerow(row)
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f'Leads export error: {str(e)}')
            return ""
    
    def export_deals_csv(self, deals: List[Dict[str, Any]]) -> str:
        """Export deals to CSV format"""
        try:
            output = io.StringIO()
            fieldnames = ['name', 'company', 'value', 'status', 'source', 'probability', 'assigned_to', 'created_at']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            
            writer.writeheader()
            for deal in deals:
                row = {
                    'name': deal.get('name', ''),
                    'company': deal.get('company', ''),
                    'value': deal.get('value', 0),
                    'status': deal.get('status', ''),
                    'source': deal.get('source', ''),
                    'probability': deal.get('probability', 0),
                    'assigned_to': deal.get('assigned_to', ''),
                    'created_at': deal.get('created_at', '').replace('T', ' ').replace('Z', '') if isinstance(deal.get('created_at'), str) else str(deal.get('created_at', ''))
                }
                writer.writerow(row)
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f'Deals export error: {str(e)}')
            return ""
    
    def export_transactions_csv(self, transactions: List[Dict[str, Any]]) -> str:
        """Export transactions to CSV format"""
        try:
            output = io.StringIO()
            fieldnames = ['description', 'amount', 'type', 'status', 'customer', 'method', 'created_at']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            
            writer.writeheader()
            for transaction in transactions:
                row = {
                    'description': transaction.get('description', ''),
                    'amount': transaction.get('amount', 0),
                    'type': transaction.get('type', ''),
                    'status': transaction.get('status', ''),
                    'customer': transaction.get('customer', ''),
                    'method': transaction.get('method', ''),
                    'created_at': transaction.get('created_at', '').replace('T', ' ').replace('Z', '') if isinstance(transaction.get('created_at'), str) else str(transaction.get('created_at', ''))
                }
                writer.writerow(row)
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f'Transactions export error: {str(e)}')
            return ""
    
    # ANALYTICS & REPORTING
    def generate_summary_report(self, data_type: str, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary report for any data type"""
        try:
            total_count = len(data)
            
            if data_type == 'leads':
                statuses = {}
                sources = {}
                for item in data:
                    status = item.get('status', 'Unknown')
                    source = item.get('source', 'Unknown')
                    statuses[status] = statuses.get(status, 0) + 1
                    sources[source] = sources.get(source, 0) + 1
                
                return {
                    'total_count': total_count,
                    'status_breakdown': statuses,
                    'source_breakdown': sources,
                    'data_type': data_type
                }
            
            elif data_type == 'deals':
                total_value = sum(item.get('value', 0) for item in data)
                statuses = {}
                for item in data:
                    status = item.get('status', 'Unknown')
                    statuses[status] = statuses.get(status, 0) + 1
                
                return {
                    'total_count': total_count,
                    'total_value': total_value,
                    'average_value': total_value / total_count if total_count > 0 else 0,
                    'status_breakdown': statuses,
                    'data_type': data_type
                }
            
            elif data_type == 'transactions':
                total_amount = sum(item.get('amount', 0) for item in data)
                types = {}
                for item in data:
                    tx_type = item.get('type', 'Unknown')
                    types[tx_type] = types.get(tx_type, 0) + 1
                
                return {
                    'total_count': total_count,
                    'total_amount': total_amount,
                    'average_amount': total_amount / total_count if total_count > 0 else 0,
                    'type_breakdown': types,
                    'data_type': data_type
                }
            
            else:
                return {
                    'total_count': total_count,
                    'data_type': data_type
                }
                
        except Exception as e:
            logger.error(f'Summary report error: {str(e)}')
            return {
                'error': f'Failed to generate summary report: {str(e)}'
            }

# Global bulk operations service instance
bulk_operations_service = BulkOperationsService()