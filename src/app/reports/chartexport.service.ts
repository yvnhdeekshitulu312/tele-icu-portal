import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartExportService {

  constructor() { }

  exportToCSV(data: any[], filename: string) {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  formatPieChartData(data: any[], labelKey: string, valueKey: string, percentageKey?: string) {
    return data.map(item => ({
      Type: item[labelKey],
      NetRevenue: item[valueKey],
      Percentage: percentageKey ? item[percentageKey] : this.calculatePercentage(item[valueKey], data, valueKey)
    }));
  }

  formatLineChartData(data: any[], xAxisKey: string, yAxisKey: string) {
    return data.map(item => ({
      Month: this.getMonthName(item[xAxisKey]),
      Net: item[yAxisKey]
    }));
  }

  private calculatePercentage(value: number, data: any[], valueKey: string): string {
    const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
    return total > 0 ? ((value / total) * 100).toFixed(2) + '%' : '0%';
  }

   getMonthName(monthId: number): string {
    if (monthId < 1 || monthId > 12) return 'Invalid Month';
    const date = new Date(2000, monthId - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  }
}