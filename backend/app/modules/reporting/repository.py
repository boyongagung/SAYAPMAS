from sqlalchemy.orm import Session
from sqlalchemy import text


class ReportingRepository:
    def get_mtd_sales(self, db: Session):
        query = text("""
            SELECT COALESCE(SUM(total_amount), 0) 
            FROM invoices 
            WHERE strftime('%Y-%m', date_created) = strftime('%Y-%m', 'now')
            AND status = 'paid'
        """)
        return db.execute(query).scalar()

    def get_salesman_performance(self, db: Session):
        query = text("""
            SELECT s.name, SUM(i.total_amount) as total
            FROM invoices i
            JOIN sales_orders so ON i.order_id = so.id
            JOIN salesmen s ON so.salesman_id = s.id
            WHERE strftime('%Y-%m', i.date_created) = strftime('%Y-%m', 'now')
            GROUP BY s.id ORDER BY total DESC
        """)
        return db.execute(query).all()
