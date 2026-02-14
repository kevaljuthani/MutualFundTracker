import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'portfolio_provider.dart';

class TransactionsScreen extends StatefulWidget {
  final String schemeCode;
  final String schemeName;

  const TransactionsScreen({super.key, required this.schemeCode, required this.schemeName});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  List<dynamic> _transactions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final txs = await context.read<PortfolioProvider>().fetchTransactions(widget.schemeCode);
    if (mounted) {
      setState(() {
        _transactions = txs;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Transactions - ${widget.schemeName}')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _transactions.isEmpty 
          ? const Center(child: Text('No transactions found'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _transactions.length,
              itemBuilder: (context, index) {
                final tx = _transactions[index];
                final isBuy = tx['type'] == 'BUY';
                final date = DateTime.parse(tx['date']);
                
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isBuy ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                      child: Icon(
                        isBuy ? Icons.arrow_downward : Icons.arrow_upward,
                        color: isBuy ? Colors.green : Colors.red,
                        size: 20,
                      ),
                    ),
                    title: Text(isBuy ? 'Invested' : 'Redeemed', style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(DateFormat('dd MMM yyyy, hh:mm a').format(date)),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '${isBuy ? '+' : '-'}${double.parse(tx['units'].toString()).toStringAsFixed(3)} units',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '₹${double.parse(tx['pricePerUnit'].toString()).toStringAsFixed(2)} / unit',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
