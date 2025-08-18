
'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { fetchTransactionsForReport } from '@/services/transaction-service';
import type { TransactionData } from '@/lib/db/queries';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

async function generatePdf(data: TransactionData[], dateRange: DateRange) {
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

export function FinancialReportExporter() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const { firebaseUser } = useAuth();
    const { toast } = useToast();

    const handleExport = async () => {
        if (!dateRange?.from || !dateRange?.to || !firebaseUser) {
            toast({
                title: 'Missing Information',
                description: 'Please select a start and end date for the report.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            const token = await firebaseUser.getIdToken();
            const transactions = await fetchTransactionsForReport({
                startDate: dateRange.from.toISOString(),
                endDate: dateRange.to.toISOString(),
                token,
            });

            if (transactions.length === 0) {
                 toast({
                    title: 'No Data',
                    description: 'There are no transactions in the selected date range.',
                });
                return;
            }

            await generatePdf(transactions, dateRange);

        } catch (error: any) {
            toast({
                title: 'Export Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Export Financial Report</CardTitle>
                <CardDescription>Select a date range to generate a PDF report of all transactions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant="outline"
                            className={cn(
                                "w-full sm:w-[300px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="me-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                <Button onClick={handleExport} disabled={isLoading}>
                    {isLoading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
                    Export as PDF
                </Button>
            </CardContent>
        </Card>
    );
}
