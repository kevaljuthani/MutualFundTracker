import 'package:flutter/material.dart';
import '../../core/api_client.dart';

class PortfolioProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  
  Map<String, dynamic>? _portfolioData; // Stores the entire summary response
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get portfolioData => _portfolioData;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Map<String, dynamic>? getHolding(String schemeCode) {
    if (_portfolioData == null || _portfolioData!['holdings'] == null) return null;
    final holdings = _portfolioData!['holdings'] as List;
    try {
      return holdings.firstWhere((h) => h['schemeCode'] == schemeCode);
    } catch (e) {
      return null;
    }
  }

  Future<void> fetchPortfolio() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _apiClient.client.get('/portfolios');
      _portfolioData = res.data;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<String?> addTransaction(
    String schemeCode, 
    double units, 
    double price, 
    String type,
    {DateTime? date}
  ) async {
    try {
      await _apiClient.client.post('/portfolios/transactions', data: {
        'schemeCode': schemeCode,
        'units': units,
        'pricePerUnit': price,
        'type': type,
        'date': (date ?? DateTime.now()).toIso8601String(),
      });
      await fetchPortfolio(); // Refresh data
      return null;
    } catch (e) {
       return 'Failed to add transaction';
    }
  }

  Future<List<dynamic>> fetchTransactions(String schemeCode) async {
    try {
      final res = await _apiClient.client.get('/portfolios/transactions/$schemeCode');
      return res.data;
    } catch (e) {
      return [];
    }
  }
}
