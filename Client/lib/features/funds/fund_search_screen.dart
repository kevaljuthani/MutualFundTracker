import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/api_client.dart';

class FundSearchScreen extends StatefulWidget {
  const FundSearchScreen({super.key});

  @override
  State<FundSearchScreen> createState() => _FundSearchScreenState();
}

class _FundSearchScreenState extends State<FundSearchScreen> {
  final _searchController = TextEditingController();
  final ApiClient _apiClient = ApiClient();
  Timer? _debounce;
  
  List<dynamic> _results = [];
  bool _isLoading = false;

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      _search(query);
    });
  }

  Future<void> _search(String query) async {
    if (query.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      final res = await _apiClient.client.get('/funds', queryParameters: {'q': query});
      setState(() => _results = res.data['data']);
    } catch (e) {
      if(mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Search failed')));
    } finally {
      if(mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search Funds (e.g. Parag Parikh)',
            border: InputBorder.none,
          ),
          onChanged: _onSearchChanged,
        ),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () => _search(_searchController.text)),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _results.length,
              itemBuilder: (context, index) {
                final fund = _results[index];
                return ListTile(
                  title: Text(fund['schemeName']),
                  subtitle: Text(fund['fundHouse'] ?? ''),
                  onTap: () {
                    context.push('/funds/${fund['schemeCode']}');
                  },
                );
              },
            ),
    );
  }
}
