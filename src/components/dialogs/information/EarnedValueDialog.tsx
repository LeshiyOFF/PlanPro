import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface EVMetrics {
  plannedValue: number;      // PV
  earnedValue: number;       // EV
  actualCost: number;        // AC
  budgetAtCompletion: number; // BAC
  
  // Variances
  scheduleVariance: number;  // SV = EV - PV
  costVariance: number;      // CV = EV - AC
  
  // Indices
  schedulePerformanceIndex: number;  // SPI = EV / PV
  costPerformanceIndex: number;     // CPI = EV / AC
  
  // Forecasts
  estimateAtCompletion: number;      // EAC = BAC / CPI
  estimateToComplete: number;        // ETC = EAC - AC
  varianceAtCompletion: number;      // VAC = BAC - EAC
  
  // Percentages
  schedulePercentComplete: number;    // EV / BAC
  costPercentComplete: number;       // AC / EAC
}

export interface EVChartPoint {
  period: string;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
}

export interface EarnedValueDialogProps extends Omit<BaseDialogProps, 'children'> {
  currentMetrics?: EVMetrics;
  chartData?: EVChartPoint[];
  reportDate?: string;
  analysisPeriod?: 'weekly' | 'monthly' | 'quarterly';
  onExport?: (format: 'pdf' | 'excel') => void;
}

export const EarnedValueDialog: React.FC<EarnedValueDialogProps> = ({
  currentMetrics,
  chartData = [],
  reportDate = new Date().toISOString().split('T')[0],
  analysisPeriod = 'monthly',
  onExport,
  onClose,
  ...props
}) => {
  const [selectedPeriod, setSelectedPeriod] = React.useState(analysisPeriod);
  const [showTrends, setShowTrends] = React.useState(false);

  const getStatusColor = (value: number, target: number = 1) => {
    if (value >= target * 0.95) return 'text-green-600';
    if (value >= target * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLevel = (index: number) => {
    if (index >= 0.95) return 'Excellent';
    if (index >= 0.85) return 'Good';
    if (index >= 0.7) return 'Fair';
    return 'Poor';
  };

  const { open: _open, onOpenChange: _onOpenChange, title: _title, ...dialogProps } = props;

  if (!currentMetrics) {
    return (
      <BaseDialog
        title="Earned Value Analysis"
        size="large"
        open={props.open}
        onOpenChange={props.onOpenChange}
        {...dialogProps}
        onClose={onClose}
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        }
      >
        <div className="text-center py-8">
          <div className="text-lg font-medium text-muted-foreground">
            No earned value data available
          </div>
        </div>
      </BaseDialog>
    );
  }

  return (
    <BaseDialog
      title="Earned Value Analysis"
      size="large"
      open={props.open}
      onOpenChange={props.onOpenChange}
      {...dialogProps}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="period">Analysis Period:</Label>
              <Select
                value={selectedPeriod}
                onValueChange={(value: string) => setSelectedPeriod(value as 'weekly' | 'monthly' | 'quarterly')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showTrends"
                checked={showTrends}
                onChange={(e) => setShowTrends(e.target.checked)}
              />
              <Label htmlFor="showTrends">Show Trends</Label>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onExport?.('pdf')}>
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => onExport?.('excel')}>
              Export Excel
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Key Metrics Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Schedule Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.schedulePerformanceIndex)}`}>
                {currentMetrics.schedulePerformanceIndex.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {getPerformanceLevel(currentMetrics.schedulePerformanceIndex)}
              </div>
              <div className="text-sm mt-1">
                SV: ${currentMetrics.scheduleVariance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cost Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.costPerformanceIndex)}`}>
                {currentMetrics.costPerformanceIndex.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {getPerformanceLevel(currentMetrics.costPerformanceIndex)}
              </div>
              <div className="text-sm mt-1">
                CV: ${currentMetrics.costVariance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cost Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(currentMetrics.estimateAtCompletion / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-muted-foreground">
                EAC (Forecast)
              </div>
              <div className="text-sm mt-1">
                VAC: ${currentMetrics.varianceAtCompletion.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMetrics.schedulePercentComplete.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Schedule Complete
              </div>
              <div className="text-sm mt-1">
                Cost: {currentMetrics.costPercentComplete.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Planned Value (PV):</span>
                  <span className="font-medium">${currentMetrics.plannedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Earned Value (EV):</span>
                  <span className="font-medium">${currentMetrics.earnedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Actual Cost (AC):</span>
                  <span className="font-medium">${currentMetrics.actualCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Budget at Completion (BAC):</span>
                  <span className="font-medium">${currentMetrics.budgetAtCompletion.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Schedule Variance (SV):</span>
                  <span className={`font-medium ${getStatusColor(currentMetrics.scheduleVariance, 0)}`}>
                    ${currentMetrics.scheduleVariance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cost Variance (CV):</span>
                  <span className={`font-medium ${getStatusColor(currentMetrics.costVariance, 0)}`}>
                    ${currentMetrics.costVariance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Schedule Performance Index (SPI):</span>
                  <span className={`font-medium ${getStatusColor(currentMetrics.schedulePerformanceIndex)}`}>
                    {currentMetrics.schedulePerformanceIndex.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cost Performance Index (CPI):</span>
                  <span className={`font-medium ${getStatusColor(currentMetrics.costPerformanceIndex)}`}>
                    {currentMetrics.costPerformanceIndex.toFixed(3)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forecasts */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Forecasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Estimate at Completion (EAC)</Label>
                <div className="text-2xl font-bold mt-1">
                  ${(currentMetrics.estimateAtCompletion / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on current CPI
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Estimate to Complete (ETC)</Label>
                <div className="text-2xl font-bold mt-1">
                  ${(currentMetrics.estimateToComplete / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-muted-foreground">
                  Remaining work cost
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Variance at Completion (VAC)</Label>
                <div className={`text-2xl font-bold mt-1 ${getStatusColor(currentMetrics.varianceAtCompletion, 0)}`}>
                  ${(Math.abs(currentMetrics.varianceAtCompletion) / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentMetrics.varianceAtCompletion > 0 ? 'Under Budget' : 'Over Budget'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Schedule Progress</span>
                  <span>{currentMetrics.schedulePercentComplete.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={currentMetrics.schedulePercentComplete} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cost Progress</span>
                  <span>{currentMetrics.costPercentComplete.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={currentMetrics.costPercentComplete} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Schedule Performance Index</span>
                  <span>{currentMetrics.schedulePerformanceIndex.toFixed(2)}</span>
                </div>
                <Progress 
                  value={Math.min(currentMetrics.schedulePerformanceIndex * 100, 100)} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cost Performance Index</span>
                  <span>{currentMetrics.costPerformanceIndex.toFixed(2)}</span>
                </div>
                <Progress 
                  value={Math.min(currentMetrics.costPerformanceIndex * 100, 100)} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical Data */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Earned Value Trend ({selectedPeriod})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Planned Value</TableHead>
                      <TableHead>Earned Value</TableHead>
                      <TableHead>Actual Cost</TableHead>
                      <TableHead>SPI</TableHead>
                      <TableHead>CPI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.slice(-6).map((point, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{point.period}</TableCell>
                        <TableCell>${point.plannedValue.toLocaleString()}</TableCell>
                        <TableCell>${point.earnedValue.toLocaleString()}</TableCell>
                        <TableCell>${point.actualCost.toLocaleString()}</TableCell>
                        <TableCell className={getStatusColor(point.earnedValue / point.plannedValue)}>
                          {(point.earnedValue / point.plannedValue).toFixed(2)}
                        </TableCell>
                        <TableCell className={getStatusColor(point.earnedValue / point.actualCost)}>
                          {(point.earnedValue / point.actualCost).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Information */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          Report Date: {reportDate} • Analysis Period: {selectedPeriod} • 
          Performance Level: {getPerformanceLevel(Math.min(
            currentMetrics.schedulePerformanceIndex,
            currentMetrics.costPerformanceIndex
          ))}
        </div>
      </div>
    </BaseDialog>
  );
};

