import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const AgroPulseApp());
}

class AgroPulseApp extends StatelessWidget {
  const AgroPulseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AgroPulse',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF020617),
        primaryColor: const Color(0xFF16A34A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF16A34A),
          secondary: Color(0xFFF59E0B),
          surface: Color(0xFF0F172A),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          ThemeData.dark().textTheme,
        ),
      ),
      home: const FarmerDashboardScreen(),
    );
  }
}

class FarmerDashboardScreen extends StatefulWidget {
  const FarmerDashboardScreen({super.key});

  @override
  State<FarmerDashboardScreen> createState() => _FarmerDashboardScreenState();
}

class _FarmerDashboardScreenState extends State<FarmerDashboardScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    ProduceListScreen(),
    BuyerMatchScreen(),
    TokenPassScreen(),
    PaymentHistoryScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF16A34A).withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.eco, color: Color(0xFF4ADE80), size: 20),
            ),
            const SizedBox(width: 10),
            const Text(
              'AgroPulse',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF16A34A).withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF16A34A).withOpacity(0.4)),
              ),
              child: const Text(
                'SIH',
                style: TextStyle(color: Color(0xFF4ADE80), fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        backgroundColor: const Color(0xFF0F172A),
        selectedItemColor: const Color(0xFF4ADE80),
        unselectedItemColor: const Color(0xFF64748B),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.agriculture), label: 'My Produce'),
          BottomNavigationBarItem(icon: Icon(Icons.handshake), label: 'Buyers'),
          BottomNavigationBarItem(icon: Icon(Icons.qr_code), label: 'Token Pass'),
          BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet), label: 'Payments'),
        ],
      ),
    );
  }
}

class ProduceListScreen extends StatelessWidget {
  const ProduceListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('Onion (Garva Red)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  Text('Grade A', style: TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 8),
              const Text('Weight: 2,500 kg  •  Asking: ₹23.5/kg', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF16A34A).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text('🧠 AI Suggested Price: ₹21.8 – ₹24.5/kg', style: TextStyle(color: Color(0xFF4ADE80), fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class BuyerMatchScreen extends StatelessWidget {
  const BuyerMatchScreen({super.key});
  @override
  Widget build(BuildContext context) => const Center(child: Text('Ranked Buyer Matches Available'));
}

class TokenPassScreen extends StatelessWidget {
  const TokenPassScreen({super.key});
  @override
  Widget build(BuildContext context) => const Center(child: Text('Digital Token: AP-2026-0247 (Gate Pass)'));
}

class PaymentHistoryScreen extends StatelessWidget {
  const PaymentHistoryScreen({super.key});
  @override
  Widget build(BuildContext context) => const Center(child: Text('Direct Bank DBT: ₹1,72,497 Settled'));
}
