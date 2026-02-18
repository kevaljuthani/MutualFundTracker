import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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

    final summary = data?['summary'];
    final holdings = data?['holdings'] as List<dynamic>? ?? [];
    final topHoldings = holdings.take(3).toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${_getGreeting()}, $userName',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            Text(
              'Your portfolio at a glance',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => context.read<PortfolioProvider>().fetchPortfolio(),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
          children: [
            _buildSummaryCard(context, summary),
            const SizedBox(height: 16),
            _buildQuickActions(context),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Top Holdings',
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
                if (holdings.length > 3)
                  TextButton(
                    onPressed: () => _openHoldingsSheet(context, holdings),
                    child: const Text('View all'),
                  )
              ],
            ),
            const SizedBox(height: 8),
            if (holdings.isEmpty)
              _buildEmptyState(context)
            else
              ...topHoldings
                  .map((holding) => _buildHoldingItem(context, holding)),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(
      BuildContext context, Map<String, dynamic>? summary) {
    final curVal = summary?['currentValue'] ?? 0;
    final invested = summary?['totalInvested'] ?? 0;
    final xirr = summary?['xirr'] ?? 0;
    final absReturn = summary?['absoluteReturn'] ?? 0;
    final retPercent = summary?['returnPercentage'] ?? 0;
    final isPositive = absReturn >= 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Theme.of(context).colorScheme.primary.withValues(alpha: 0.92),
            Theme.of(context).colorScheme.secondary.withValues(alpha: 0.88),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color:
                Theme.of(context).colorScheme.primary.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Portfolio Value',
            style: Theme.of(context)
                .textTheme
                .labelLarge
                ?.copyWith(color: Colors.white.withValues(alpha: 0.8)),
          ),
          const SizedBox(height: 8),
          Text(
            '₹${NumberFormat("#,##,##0.00").format(curVal)}',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
          ),
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _buildMetricChip(
                context,
                'Invested',
                '₹${NumberFormat.compact().format(invested)}',
              ),
              _buildMetricChip(
                context,
                'Abs Return',
                _showAbsReturnPercentage
                    ? '${isPositive ? '+' : ''}${retPercent.toStringAsFixed(2)}%'
                    : '${isPositive ? '+' : ''}₹${NumberFormat.compact().format(absReturn)}',
                color: isPositive ? Colors.green.shade100 : Colors.red.shade100,
                onTap: () {
                  setState(() {
                    _showAbsReturnPercentage = !_showAbsReturnPercentage;
                  });
                },
              ),
              _buildMetricChip(context, 'XIRR', '${xirr.toStringAsFixed(2)}%'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricChip(
    BuildContext context,
    String label,
    String value, {
    Color? color,
    VoidCallback? onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          color: color ?? Colors.white.withValues(alpha: 0.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: Theme.of(context)
                  .textTheme
                  .labelSmall
                  ?.copyWith(color: Colors.white.withValues(alpha: 0.85)),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionCard(
            label: 'Invest More',
            icon: Icons.addchart_rounded,
            subtitle: 'Explore funds',
            onTap: () => context.push('/search'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ActionCard(
            label: 'Discover',
            icon: Icons.auto_graph_rounded,
            subtitle: 'Market ideas',
            onTap: () => context.go('/discover'),
          ),
        ),
      ],
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
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color:
                Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Theme.of(context)
                        .colorScheme
                        .primary
                        .withValues(alpha: 0.14),
                    Theme.of(context)
                        .colorScheme
                        .secondary
                        .withValues(alpha: 0.14),
                  ],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  name[0],
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  Text(
                    '${units.toStringAsFixed(2)} units',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '₹${NumberFormat.compact().format(current)}',
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
                Text(
                  '${isPos ? '+' : ''}${ret.toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isPos ? Colors.green : Colors.red,
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Theme.of(context).cardTheme.color,
        ),
        child: Column(
          children: [
            Icon(Icons.pie_chart_outline, size: 56, color: Colors.grey[400]),
            const SizedBox(height: 12),
            Text('No holdings yet', style: TextStyle(color: Colors.grey[600])),
            TextButton(
              onPressed: () => context.push('/search'),
              child: const Text('Start Investing'),
            )
          ],
        ),
      ),
    );
  }

  void _openHoldingsSheet(BuildContext context, List<dynamic> holdings) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: holdings.length,
            itemBuilder: (context, index) {
              return _buildHoldingItem(context, holdings[index]);
            },
          ),
        );
      },
    );
  }
}

class _ActionCard extends StatelessWidget {
  final String label;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _ActionCard({
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Ink(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Theme.of(context).cardTheme.color,
          border: Border.all(
            color:
                Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 10),
            Text(
              label,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 2),
            Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
