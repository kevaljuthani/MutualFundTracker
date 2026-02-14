import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/api_client.dart';
import 'chart_widget.dart';
import '../dashboard/portfolio_provider.dart';
import '../dashboard/transactions_screen.dart';

class FundDetailScreen extends StatefulWidget {
  final String schemeCode;
  const FundDetailScreen({super.key, required this.schemeCode});

  @override
  State<FundDetailScreen> createState() => _FundDetailScreenState();
}

class _FundDetailScreenState extends State<FundDetailScreen> {
  final ApiClient _apiClient = ApiClient();
  
  Map<String, dynamic>? _fund;
  List<dynamic> _history = [];
  bool _isLoading = true;
  String _selectedPeriod = '1Y';

  @override
  void initState() {
    super.initState();
    _fetchDetails();
    _fetchHistory();
    // Ensure portfolio data is loaded to check holdings
    WidgetsBinding.instance.addPostFrameCallback((_) {
        context.read<PortfolioProvider>().fetchPortfolio();
    });
  }

  Future<void> _fetchDetails() async {
    try {
      final res = await _apiClient.client.get('/funds/${widget.schemeCode}');
      setState(() => _fund = res.data['data']);
    } catch (e) {
      // Handle error
    }
  }

  Future<void> _fetchHistory() async {
    try {
      final res = await _apiClient.client.get('/funds/${widget.schemeCode}/history', queryParameters: {'period': _selectedPeriod});
      setState(() {
        _history = res.data['data'];
        _isLoading = false;
      });
    } catch (e) {
       setState(() => _isLoading = false);
    }
  }

  void _onPeriodChanged(String period) {
    setState(() {
      _selectedPeriod = period;
      _isLoading = true;
    });
    _fetchHistory();
  }

  @override
  Widget build(BuildContext context) {
    if (_fund == null && _isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_fund == null) return const Scaffold(body: Center(child: Text('Failed to load')));

    final holding = context.watch<PortfolioProvider>().getHolding(widget.schemeCode);
    final isHolding = holding != null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fund Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Transaction History',
            onPressed: () {
               if (_fund != null) {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => 
                     TransactionsScreen(schemeCode: widget.schemeCode, schemeName: _fund!['schemeName'])
                  ));
               }
            },
          )
        ],
      ),
      body: SingleChildScrollView(
// ... (rest of body remains same until bottomNavigationBar)
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_fund!['schemeName'], style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(_fund!['fundHouse'] ?? 'Unknown Fund House', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 16),
             Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Current NAV', style: Theme.of(context).textTheme.labelMedium),
                    Text(
                      _fund!['latestNav'] != null ? '₹${_fund!['latestNav']}' : 'N/A', 
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Theme.of(context).colorScheme.primary)
                    ),
                  ],
                ),
                if (isHolding)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Your Holding', style: Theme.of(context).textTheme.labelMedium),
                      Text('${holding['units'].toStringAsFixed(2)} Units', style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
                    ],
                  )
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 300,
              child: _isLoading 
                ? const Center(child: CircularProgressIndicator()) 
                : ChartWidget(history: _history),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: ['1M', '6M', '1Y', '3Y', '5Y', 'ALL'].map((p) {
                return ChoiceChip(
                  label: Text(p),
                  selected: _selectedPeriod == p,
                  onSelected: (b) { if(b) _onPeriodChanged(p); },
                );
              }).toList(),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              if (isHolding) ...[
                 Expanded(
                  child: OutlinedButton(
                     onPressed: () => _showTransactionDialog(context, 'SELL'),
                     style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.red), foregroundColor: Colors.red),
                     child: const Text('REDEEM'),
                  ),
                ),
                const SizedBox(width: 16),
              ],
              Expanded(
                child: FilledButton(
                   onPressed: () => _showTransactionDialog(context, 'BUY'),
                   child: Text(isHolding ? 'INVEST MORE' : 'ADD TO PORTFOLIO'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

   void _showTransactionDialog(BuildContext context, String type) {
     final unitsController = TextEditingController();
     final priceController = TextEditingController();
     DateTime selectedDate = DateTime.now();
     final isSell = type == 'SELL';

     showDialog(
       context: context,
       builder: (ctx) => StatefulBuilder(
         builder: (context, setState) => AlertDialog(
           title: Text(isSell ? 'Redeem Units' : 'Invest More'),
           content: Column(
             mainAxisSize: MainAxisSize.min,
             children: [
               TextField(
                 controller: unitsController,
                 decoration: const InputDecoration(labelText: 'Units'),
                 keyboardType: TextInputType.number,
               ),
               TextField(
                 controller: priceController,
                 decoration: const InputDecoration(
                     labelText: 'Price Per Unit', 
                     hintText: 'Leave empty to use NAV'
                 ),
                 keyboardType: TextInputType.number,
               ),
               const SizedBox(height: 16),
               Row(
                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                 children: [
                   Text('Date: ${DateFormat('dd MMM yyyy').format(selectedDate)}'),
                   TextButton(
                     onPressed: () async {
                       final picked = await showDatePicker(
                         context: context,
                         initialDate: selectedDate,
                         firstDate: DateTime(2000),
                         lastDate: DateTime.now(),
                       );
                       if (picked != null) {
                         setState(() => selectedDate = picked);
                       }
                     },
                     child: const Text('Change'),
                   ),
                 ],
               )
             ],
           ),
           actions: [
             TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
             TextButton(
               onPressed: () async {
                 if (unitsController.text.isNotEmpty) {
                    final units = double.parse(unitsController.text);
                    final price = priceController.text.isNotEmpty 
                        ? double.parse(priceController.text) 
                        : (_fund != null && _fund!['latestNav'] != null 
                            ? double.parse(_fund!['latestNav'].toString()) 
                            : 0.0);

                    final error = await context.read<PortfolioProvider>()
                        .addTransaction(widget.schemeCode, units, price, type, date: selectedDate);
                    
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
                          content: Text(error ?? (isSell ? 'Redemption Successful' : 'Investment Successful'))
                      ));
                    }
                 }
               },
               child: Text(isSell ? 'REDEEM' : 'INVEST', style: TextStyle(color: isSell ? Colors.red : null)),
             ),
           ],
         ),
       ),
     );
  }
}
