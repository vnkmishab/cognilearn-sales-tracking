import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'site_punch.dart';
import 'expenses.dart';
import 'package:go_router/go_router.dart';

void main() {
  runApp(
    const ProviderScope(
      child: FieldOpsApp(),
    ),
  );
}

final _router = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/employee-dashboard',
      builder: (context, state) => const EmployeeDashboard(),
    ),
    GoRoute(
      path: '/site-punch',
      builder: (context, state) => const SitePunchScreen(),
    ),
    GoRoute(
      path: '/expenses',
      builder: (context, state) => const AddExpenseScreen(),
    ),
  ],
);

class FieldOpsApp extends StatelessWidget {
  const FieldOpsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'FieldOps',
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.blue,
      ),
      routerConfig: _router,
    );
  }
}

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('FieldOps Login', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 32),
              TextField(decoration: const InputDecoration(labelText: 'Employee ID / Email', border: OutlineInputBorder())),
              const SizedBox(height: 16),
              TextField(decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()), obscureText: true),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  context.go('/employee-dashboard');
                },
                child: const Text('Login'),
              )
            ],
          ),
        ),
      ),
    );
  }
}

class EmployeeDashboard extends StatelessWidget {
  const EmployeeDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Welcome, Employee', style: TextStyle(fontSize: 20)),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: () {}, child: const Text('Attendance')),
            ElevatedButton(
              onPressed: () => context.push('/site-punch'), 
              child: const Text('Site Punch')
            ),
            ElevatedButton(
              onPressed: () => context.push('/expenses'), 
              child: const Text('Expenses')
            ),
          ],
        ),
      ),
    );
  }
}
