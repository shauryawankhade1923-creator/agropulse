import 'dart:convert';
import 'package:http/http.dart' as http;

class AgroPulseApiService {
  static const String baseUrl = 'http://10.0.2.2:8000/api/v1'; // Android emulator localhost

  // AI Price Recommendation
  static Future<Map<String, dynamic>> getPriceRecommendation({
    required String cropName,
    required String variety,
    required double quantityKg,
    required String qualityGrade,
    required String location,
    double moistureContent = 12.0,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/ai/price-recommendation'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'crop_name': cropName,
        'variety': variety,
        'quantity_kg': quantityKg,
        'quality_grade': qualityGrade,
        'location': location,
        'moisture_content': moistureContent,
        'season': 'Kharif',
      }),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get price prediction: ${response.body}');
    }
  }

  // Get Farmer Tokens
  static Future<List<dynamic>> getFarmerTokens(int farmerId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/procurement/tokens/farmer/$farmerId'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load tokens');
    }
  }

  // Get Live Queue Board
  static Future<Map<String, dynamic>> getLiveQueue(int centerId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/queue/center/$centerId/live-board'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load live queue');
    }
  }
}
