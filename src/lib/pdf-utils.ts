
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { DateRange } from 'react-day-picker';
// import type { TransactionData } from '@/lib/types';

export async function generateFinancialReportPdf(data: any[], dateRange: DateRange) {
    const doc = new jsPDF();
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1000px';
    container.style.padding = '20px';
    container.style.fontFamily = 'Helvetica, Arial, sans-serif';

    const startDate = dateRange.from ? format(dateRange.from, 'LLL dd, y') : 'N/A';
    const endDate = dateRange.to ? format(dateRange.to, 'LLL dd, y') : 'N/A';

    const verifiedTransactions = data.filter(t => t.status === 'verified');
    const totalRevenue = verifiedTransactions.reduce((sum, t) => sum + t.price, 0);

    let html = `
        <style>
            body { font-family: sans-serif; font-size: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1, h2 { color: #333; }
        </style>
        <h1>Financial Report</h1>
        <p><strong>Date Range:</strong> ${startDate} - ${endDate}</p>
        <h2>Summary</h2>
        <p><strong>Total Transactions:</strong> ${data.length}</p>
        <p><strong>Verified Transactions:</strong> ${verifiedTransactions.length}</p>
        <p><strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}</p>
        <h2>All Transactions</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(t => `
                    <tr>
                        <td>${format(new Date(t.createdAt), 'yyyy-MM-dd')}</td>
                        <td>${t.userEmail}</td>
                        <td>${t.planName}</td>
                        <td>$${t.price.toFixed(2)}</td>
                        <td>${t.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
    document.body.appendChild(container);

    const canvas = await html2canvas(container);
    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    document.body.removeChild(container);
    doc.save(`financial_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
