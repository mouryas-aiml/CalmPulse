import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a PDF report of user progress data
 * @param {Object} userData - User profile data
 * @param {Object} progressData - User progress metrics
 * @param {Array} activities - Recent user activities
 * @returns {jsPDF} - The generated PDF document
 */
export const generateProgressPDF = (userData, progressData, activities) => {
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add header with logo and title
  doc.setFillColor(79, 179, 191); // #4fb3bf color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('CalmPulse Progress Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Add user information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('User Information', 20, 60);
  
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(`Name: ${userData.name || 'Not provided'}`, 20, 70);
  doc.text(`Email: ${userData.email || 'Not provided'}`, 20, 80);
  doc.text(`Member since: ${userData.joinDate || 'Not available'}`, 20, 90);
  
  // Add progress metrics
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Progress Overview', 20, 110);
  
  // Create a table for progress metrics
  const progressMetrics = [
    ['Metric', 'Value'],
    ['Insights Read', progressData.insightsRead || 0],
    ['Tools Used', progressData.toolsUsed || 0],
    ['Routines Completed', progressData.routinesCompleted || 0],
    ['Mindmitra Chats', progressData.mindmitraChats || 0],
    ['Average Wellness Score', progressData.averageMoodLastWeek ? `${progressData.averageMoodLastWeek}/10` : 'N/A'],
    ['Wellness Trend', progressData.moodTrend || 'N/A']
  ];
  
  // Use autoTable as a function directly
  autoTable(doc, {
    startY: 120,
    head: [progressMetrics[0]],
    body: progressMetrics.slice(1),
    theme: 'striped',
    headStyles: {
      fillColor: [79, 179, 191],
      textColor: [255, 255, 255]
    },
    styles: {
      cellPadding: 5
    }
  });
  
  // Add recent activities
  const currentY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Recent Activities', 20, currentY);
  
  if (activities && activities.length > 0) {
    const activityData = activities.map(activity => [
      activity.type ? activity.type.charAt(0).toUpperCase() + activity.type.slice(1) : 'Other',
      activity.title || 'Activity',
      activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'N/A'
    ]);
    
    autoTable(doc, {
      startY: currentY + 10,
      head: [['Type', 'Activity', 'Date']],
      body: activityData,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 179, 191],
        textColor: [255, 255, 255]
      },
      styles: {
        cellPadding: 5
      }
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('No recent activities found.', 20, currentY + 20);
  }
  
  // Add mood history chart if available
  if (progressData.moodHistory && progressData.moodHistory.length > 0) {
    const chartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : currentY + 50;
    
    // Check if we need a new page for the chart
    if (chartY > 230) {
      doc.addPage();
      doc.setFillColor(79, 179, 191);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('CalmPulse Progress Report - Continued', pageWidth / 2, 15, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('Wellness Trend (Last 7 Days)', 20, 40);
      
      drawMoodChart(doc, progressData.moodHistory, 20, 50);
    } else {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('Wellness Trend (Last 7 Days)', 20, chartY);
      
      drawMoodChart(doc, progressData.moodHistory, 20, chartY + 10);
    }
  }
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'This report is confidential and contains personal health information. For your eyes only.',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }
  
  return doc;
};

/**
 * Draws a simple bar chart for mood history
 * @param {jsPDF} doc - The PDF document
 * @param {Array} moodData - Array of mood values
 * @param {number} x - X position
 * @param {number} y - Y position
 */
const drawMoodChart = (doc, moodData, x, y) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const barWidth = 20;
  const barSpacing = 10;
  const maxHeight = 100;
  const maxValue = 10; // Assuming mood scale is 0-10
  
  // Draw chart background
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(x, y, x, y + maxHeight);
  doc.line(x, y + maxHeight, x + (barWidth + barSpacing) * moodData.length, y + maxHeight);
  
  // Draw horizontal grid lines
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.2);
  for (let i = 0; i < 5; i++) {
    const lineY = y + maxHeight - (maxHeight / 5) * i;
    doc.line(x, lineY, x + (barWidth + barSpacing) * moodData.length, lineY);
    
    // Add scale labels
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`${i * 2}`, x - 5, lineY, { align: 'right' });
  }
  
  // Draw bars
  moodData.forEach((value, index) => {
    const barHeight = (value / maxValue) * maxHeight;
    const barX = x + (barWidth + barSpacing) * index;
    const barY = y + maxHeight - barHeight;
    
    // Draw bar
    doc.setFillColor(79, 179, 191);
    doc.rect(barX, barY, barWidth, barHeight, 'F');
    
    // Add value on top of bar
    doc.setFontSize(8);
    doc.setTextColor(79, 179, 191);
    doc.text(value.toString(), barX + barWidth / 2, barY - 5, { align: 'center' });
    
    // Add day label
    doc.setTextColor(100, 100, 100);
    doc.text(days[index], barX + barWidth / 2, y + maxHeight + 10, { align: 'center' });
  });
};

/**
 * Generates and downloads a PDF report of user progress
 * @param {Object} userData - User profile data
 * @param {Object} progressData - User progress metrics
 * @param {Array} activities - Recent user activities
 */
export const downloadProgressPDF = (userData, progressData, activities) => {
  const doc = generateProgressPDF(userData, progressData, activities);
  doc.save(`CalmPulse_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export default downloadProgressPDF; 