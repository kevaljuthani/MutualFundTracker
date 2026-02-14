import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ChartWidget extends StatelessWidget {
  final List<dynamic> history;
  final bool isPositive;

  const ChartWidget({super.key, required this.history, this.isPositive = true});

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) return const SizedBox.shrink();

    final spots = history.map((e) {
      final date = DateTime.parse(e['date']).millisecondsSinceEpoch.toDouble();
      final nav = (e['nav'] as num).toDouble();
      return FlSpot(date, nav);
    }).toList().cast<FlSpot>();

    final minY = spots.map((e) => e.y).reduce((a, b) => a < b ? a : b);
    final maxY = spots.map((e) => e.y).reduce((a, b) => a > b ? a : b);

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (value) => FlLine(
            color: Colors.grey.withOpacity(0.1),
            strokeWidth: 1,
            dashArray: [5, 5],
          ),
        ),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true, 
              reservedSize: 48,
              getTitlesWidget: (value, meta) {
                // Prevent overlap at top/bottom details
                if (value <= minY || value >= maxY) return const SizedBox.shrink();
                return Text(
                  '₹${value.toStringAsFixed(0)}', 
                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                );
              },
            ),
          ),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              interval: (spots.last.x - spots.first.x) / 5, // Show ~5 labels
              getTitlesWidget: (value, meta) {
                final date = DateTime.fromMillisecondsSinceEpoch(value.toInt());
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    DateFormat('MMM yy').format(date),
                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                );
              },
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        minY: minY * 0.99,
        maxY: maxY * 1.01,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: isPositive ? Colors.green : Colors.red,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  (isPositive ? Colors.green : Colors.red).withOpacity(0.2),
                  (isPositive ? Colors.green : Colors.red).withOpacity(0.0),
                ],
              ),
            ),
          ),
        ],
        lineTouchData: LineTouchData(
           touchTooltipData: LineTouchTooltipData(
             getTooltipItems: (touchedSpots) {
               return touchedSpots.map((LineBarSpot touchedSpot) {
                 final date = DateTime.fromMillisecondsSinceEpoch(touchedSpot.x.toInt());
                 final dateStr = DateFormat('dd MMM yyyy').format(date);
                 return LineTooltipItem(
                   '$dateStr\n₹${touchedSpot.y.toStringAsFixed(2)}',
                   const TextStyle(color: Colors.white),
                 );
               }).toList();
             },
           )
        )
      ),
    );
  }
}
