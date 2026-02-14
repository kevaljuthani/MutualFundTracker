import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme_provider.dart';
import 'portfolio_provider.dart';
import '../auth/auth_provider.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _showAbsReturnPercentage = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PortfolioProvider>().fetchPortfolio();
    });
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PortfolioProvider>();
    final authProvider = context.watch<AuthProvider>();
    final data = provider.portfolioData;
    final userName = authProvider.currentUser ?? 'Investor';

    if (provider.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // Handle empty state properly: if data is null, or summary is empty
    final summary = data?['summary'];
    final holdings = data?['holdings'] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_getGreeting(), style: Theme.of(context).textTheme.bodySmall),
            Text(userName, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: const [],
      ),
      body: RefreshIndicator(
        onRefresh: () => context.read<PortfolioProvider>().fetchPortfolio(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSummaryCard(context, summary),
              const SizedBox(height: 24),
              Text('Your Holdings', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              if (holdings.isEmpty)
                _buildEmptyState(context)
              else
                ...holdings.map((h) => _buildHoldingItem(context, h)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCard(BuildContext context, Map<String, dynamic>? summary) {
    final curVal = summary?['currentValue'] ?? 0;
    final invested = summary?['totalInvested'] ?? 0;
    final xirr = summary?['xirr'] ?? 0;
    final absReturn = summary?['absoluteReturn'] ?? 0;
    final retPercent = summary?['returnPercentage'] ?? 0;

    final isPositive = absReturn >= 0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Text('Current Value', style: Theme.of(context).textTheme.labelMedium),
                     const SizedBox(height: 4),
                     Text('₹${NumberFormat("#,##,##0.00").format(curVal)}', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
                   ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isPositive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${isPositive ? '+' : ''}${retPercent.toStringAsFixed(2)}%',
                     style: TextStyle(color: isPositive ? Colors.green[700] : Colors.red[700], fontWeight: FontWeight.bold),
                  ),
                )
              ],
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSummaryItem(context, 'Invested', '₹${NumberFormat.compact().format(invested)}'),
                _buildSummaryItem(
                  context, 
                  'Abs Return', 
                  _showAbsReturnPercentage 
                      ? '${isPositive ? '+' : ''}${retPercent.toStringAsFixed(2)}%'
                      : '${isPositive ? '+' : ''}₹${NumberFormat.compact().format(absReturn)}', 
                  color: isPositive ? Colors.green : Colors.red,
                  onTap: () => setState(() => _showAbsReturnPercentage = !_showAbsReturnPercentage),
                  showIcon: true
                ),
                _buildSummaryItem(context, 'XIRR', '${xirr.toStringAsFixed(2)}%'),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(BuildContext context, String label, String value, {Color? color, VoidCallback? onTap, bool showIcon = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey)),
              if (showIcon)
                Padding(
                  padding: const EdgeInsets.only(left: 4.0),
                  child: Icon(Icons.swap_horiz, size: 14, color: Colors.grey.withOpacity(0.6)),
                )
            ],
          ),
          const SizedBox(height: 4),
          Text(value, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }

  Widget _buildHoldingItem(BuildContext context, Map<String, dynamic> holding) {
     final name = holding['schemeName'] ?? 'Unknown Fund';
     final current = holding['currentValue'] ?? 0;
     final units = holding['units'] ?? 0;
     final ret = holding['returnPercentage'] ?? 0;
     final isPos = ret >= 0;

     return GestureDetector(
       onTap: () => context.push('/funds/${holding['schemeCode']}'),
       child: Container(
         margin: const EdgeInsets.only(bottom: 12),
         padding: const EdgeInsets.all(16),
         decoration: BoxDecoration(
           color: Theme.of(context).cardTheme.color,
           borderRadius: BorderRadius.circular(16),
           border: Border.all(color: Colors.grey.withOpacity(0.1)),
         ),
         child: Row(
           children: [
             Container(
               width: 40, height: 40,
               decoration: BoxDecoration(color: Theme.of(context).colorScheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
               child: Center(child: Text(name[0], style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold))),
             ),
             const SizedBox(width: 12),
             Expanded(
               child: Column(
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                   Text('${units.toStringAsFixed(2)} units', style: Theme.of(context).textTheme.bodySmall),
                 ],
               ),
             ),
             Column(
               crossAxisAlignment: CrossAxisAlignment.end,
               children: [
                 Text('₹${NumberFormat.compact().format(current)}', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold)),
                 Text('${isPos ? '+' : ''}${ret.toStringAsFixed(1)}%', style: TextStyle(fontSize: 12, color: isPos ? Colors.green : Colors.red)),
               ],
             )
           ],
         ),
       ),
     );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.pie_chart_outline, size: 64, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text('No holdings yet', style: TextStyle(color: Colors.grey[500])),
          TextButton(
            onPressed: () => context.push('/search'),
            child: const Text('Start Investing'),
          )
        ],
      ),
    );
  }
}
