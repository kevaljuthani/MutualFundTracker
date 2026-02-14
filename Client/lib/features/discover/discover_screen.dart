import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/glass_container.dart';
import '../../core/api_client.dart';

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key});

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  final ApiClient _apiClient = ApiClient();
  late Future<Map<String, List<dynamic>>> _dataFuture;

  @override
  void initState() {
    super.initState();
    _dataFuture = _fetchData();
  }

  Future<Map<String, List<dynamic>>> _fetchData() async {
    try {
      final featuredRes = await _apiClient.client.get('/funds/featured');
      final allRes = await _apiClient.client.get('/funds/all');
      return {
        'featured': featuredRes.data['data'] as List<dynamic>,
        'all': allRes.data['data'] as List<dynamic>,
      };
    } catch (e) {
      // Handle error cleanly
      return {'featured': [], 'all': []};
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Discover'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              context.push('/search');
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          FutureBuilder<Map<String, List<dynamic>>>(
            future: _dataFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              final featured = snapshot.data?['featured'] ?? [];
              final all = snapshot.data?['all'] ?? [];

              return SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 120, 16, 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSearchBar(context),
                    const SizedBox(height: 24),
                    _buildSectionTitle(context, 'Morningstar 5-Star Funds'),
                    const SizedBox(height: 16),
                    _buildHorizontalFundList(context, featured),
                    const SizedBox(height: 24),
                    _buildSectionTitle(context, 'All Funds'),
                    const SizedBox(height: 16),
                    _buildVerticalFundList(context, all),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/search'),
      child: GlassContainer(
        height: 50,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            const Icon(Icons.search, color: Colors.grey),
            const SizedBox(width: 12),
            Text(
              'Search funds, ETFs...',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
    );
  }

  Widget _buildHorizontalFundList(BuildContext context, List<dynamic> funds) {
    if (funds.isEmpty) {
        return const Center(child: Text("No featured funds available"));
    }
    return SizedBox(
      height: 180,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: funds.length,
        separatorBuilder: (_, __) => const SizedBox(width: 16),
        itemBuilder: (context, index) {
          final fund = funds[index];
          return GestureDetector(
            onTap: () => context.push('/funds/${fund['schemeCode']}'),
            child: GlassContainer(
              width: 160,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.amber.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.amber),
                    ),
                    child: const Text(
                      '★★★★★',
                      style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    fund['schemeName'] ?? 'Unknown Fund',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  // Placeholder return, real app needs calculation
                  Text(
                    'Growth',
                    style: TextStyle(color: Theme.of(context).colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildVerticalFundList(BuildContext context, List<dynamic> funds) {
    if (funds.isEmpty) {
        return const Center(child: Text("No funds available"));
    }
    return ListView.separated(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: funds.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final fund = funds[index];
        return GestureDetector(
          onTap: () => context.push('/funds/${fund['schemeCode']}'),
          child: GlassContainer(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.show_chart, color: Theme.of(context).colorScheme.primary),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fund['schemeName'] ?? 'Unknown Fund',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        fund['category'] ?? 'Mutual Fund',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                // Placeholder NAV
                const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
              ],
            ),
          ),
        );
      },
    );
  }
}
