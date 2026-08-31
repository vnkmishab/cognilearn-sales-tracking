import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'api_client.dart';

class AddExpenseScreen extends StatefulWidget {
  const AddExpenseScreen({super.key});

  @override
  State<AddExpenseScreen> createState() => _AddExpenseScreenState();
}

class _AddExpenseScreenState extends State<AddExpenseScreen> {
  String? _billImagePath;
  String? _paymentProofPath;
  
  final _amountController = TextEditingController();
  final _vendorController = TextEditingController();

  final ImagePicker _picker = ImagePicker();

  Future<void> _mockScanBill() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.camera);
      if (image == null) return;
      
      setState(() {
        _billImagePath = image.path;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Scanning receipt...')),
      );

      final inputImage = InputImage.fromFilePath(image.path);
      final textRecognizer = TextRecognizer(script: TextRecognitionScript.latin);
      final RecognizedText recognizedText = await textRecognizer.processImage(inputImage);
      await textRecognizer.close();

      // Basic Heuristic Extraction (Finding highest number as total, and first line as vendor)
      String extractedText = recognizedText.text;
      List<String> lines = extractedText.split('\n');
      
      String possibleVendor = lines.isNotEmpty ? lines.first : '';
      double highestAmount = 0.0;
      
      // Regex to find currency or numbers
      final numberRegex = RegExp(r'\d+(\.\d{1,2})?');
      for (final line in lines) {
        final matches = numberRegex.allMatches(line);
        for (final match in matches) {
          final val = double.tryParse(match.group(0) ?? '0');
          if (val != null && val > highestAmount) {
            highestAmount = val;
          }
        }
      }

      setState(() {
        if (possibleVendor.isNotEmpty) _vendorController.text = possibleVendor;
        if (highestAmount > 0) _amountController.text = highestAmount.toStringAsFixed(2);
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Receipt data extracted successfully!'), backgroundColor: Colors.green),
      );

    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error processing receipt: $e')),
      );
    }
  }

  Future<void> _mockUploadPayment() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image == null) return;

    setState(() {
      _paymentProofPath = image.path;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Payment proof attached.')),
    );
  }

  Future<void> _submitExpense() async {
    if (_billImagePath == null || _paymentProofPath == null) return;

    final amount = double.tryParse(_amountController.text) ?? 0.0;
    
    // UI Loading state could be added here
    final client = ApiClient();
    final success = await client.submitExpense(
      vendor: _vendorController.text, 
      amount: amount, 
      billImagePath: _billImagePath!, 
      paymentProofPath: _paymentProofPath!
    );

    if (success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Expense submitted successfully!'), backgroundColor: Colors.green),
        );
        Navigator.of(context).pop();
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Submission failed. Try again.'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Expense')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Evidence Section (Receipt First approach)
            const Text('1. Provide Evidence', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: _mockScanBill,
                    child: Container(
                      height: 120,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.blue),
                        borderRadius: BorderRadius.circular(8),
                        color: _billImagePath == null ? Colors.blue.withOpacity(0.05) : Colors.green.withOpacity(0.1),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(_billImagePath == null ? Icons.camera_alt : Icons.check_circle, 
                               color: _billImagePath == null ? Colors.blue : Colors.green, size: 32),
                          const SizedBox(height: 8),
                          Text(_billImagePath == null ? 'Scan Bill' : 'Bill Attached', 
                               style: TextStyle(color: _billImagePath == null ? Colors.blue : Colors.green)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: InkWell(
                    onTap: _mockUploadPayment,
                    child: Container(
                      height: 120,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.purple),
                        borderRadius: BorderRadius.circular(8),
                        color: _paymentProofPath == null ? Colors.purple.withOpacity(0.05) : Colors.green.withOpacity(0.1),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(_paymentProofPath == null ? Icons.upload_file : Icons.check_circle, 
                               color: _paymentProofPath == null ? Colors.purple : Colors.green, size: 32),
                          const SizedBox(height: 8),
                          Text(_paymentProofPath == null ? 'Payment Proof' : 'Proof Attached', 
                               style: TextStyle(color: _paymentProofPath == null ? Colors.purple : Colors.green)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 32),
            
            // Extracted/Manual Data Section
            const Text('2. Confirm Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            
            TextField(
              controller: _vendorController,
              decoration: const InputDecoration(
                labelText: 'Vendor Name',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.store),
              ),
            ),
            const SizedBox(height: 16),
            
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Total Amount (₹)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.currency_rupee),
              ),
            ),
            
            const SizedBox(height: 32),
            
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                textStyle: const TextStyle(fontSize: 18),
              ),
              onPressed: (_billImagePath != null && _paymentProofPath != null) ? _submitExpense : null,
              child: const Text('Submit Expense'),
            )
          ],
        ),
      ),
    );
  }
}
