<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://satjawat.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

$path = parse_url($request_uri, PHP_URL_PATH);

if ($path === '/health' && $method === 'GET') {
    handleHealth();
} elseif ($path === '/api/ocr' && $method === 'POST') {
    handleOCR();
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Endpoint not found'
    ]);
}

function loadEnv() {
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                $value = trim($value, '"\'');
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

function getApiKey() {
    loadEnv();
    
    $apiKey = '';
    
    if (isset($_ENV['GEMINI_API_KEY'])) {
        $apiKey = $_ENV['GEMINI_API_KEY'];
    } elseif (getenv('GEMINI_API_KEY')) {
        $apiKey = getenv('GEMINI_API_KEY');
    } elseif (isset($_SERVER['GEMINI_API_KEY'])) {
        $apiKey = $_SERVER['GEMINI_API_KEY'];
    }
    
    return $apiKey;
}

function handleHealth() {
    $apiKey = getApiKey();
    $hasApiKey = !empty($apiKey);
    
    echo json_encode([
        'status' => 'OK',
        'message' => 'CheckBill API Server is running',
        'hasApiKey' => $hasApiKey,
        'api_key_length' => $hasApiKey ? strlen($apiKey) : 0,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

function handleOCR() {
    try {
        $apiKey = getApiKey();
        
        if (!$apiKey) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Gemini API key is not configured'
            ]);
            return;
        }

        if (!isset($_FILES['image'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'No image file provided'
            ]);
            return;
        }

        $file = $_FILES['image'];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'File upload error'
            ]);
            return;
        }

        if ($file['size'] > 10 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'File too large. Maximum size is 10MB.'
            ]);
            return;
        }

        if (strpos($file['type'], 'image/') !== 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Only image files are allowed'
            ]);
            return;
        }

        $imageData = file_get_contents($file['tmp_name']);
        $base64Data = base64_encode($imageData);

        $prompt = 'Extract all distinct items from this receipt image. For each item, provide its description and amount.
      Respond in JSON format with a single key "items" which is an array of objects.
      Each object in the array should have "description" (string) and "amount" (number) keys.
      If a clear itemization is not available, try to identify the store name as a description and the total amount.
      Example: { "items": [ { "description": "Milk 1L", "amount": 2.50 }, { "description": "Bread", "amount": 1.75 } ] }
      If only a total is found, use that: { "items": [ { "description": "Total Purchase at Store XYZ", "amount": 4.25 } ] }
      If no items can be extracted, return an empty array: { "items": [] }';

        $data = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ],
                        [
                            'inline_data' => [
                                'mime_type' => $file['type'],
                                'data' => $base64Data
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_error($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to connect to Gemini API: ' . $error
            ]);
            return;
        }
        
        curl_close($ch);

        if ($httpCode !== 200) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Gemini API request failed with code: ' . $httpCode,
                'response' => $response
            ]);
            return;
        }

        $apiResponse = json_decode($response, true);
        
        if (!$apiResponse || !isset($apiResponse['candidates'][0]['content']['parts'][0]['text'])) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid response from Gemini API',
                'response' => $apiResponse
            ]);
            return;
        }

        $text = $apiResponse['candidates'][0]['content']['parts'][0]['text'];
        
        $jsonString = preg_replace('/```json\n?|\n?```/', '', $text);
        $jsonString = trim($jsonString);
        
        $parsedResult = json_decode($jsonString, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to parse OCR response',
                'raw_text' => $text
            ]);
            return;
        }

        if (isset($parsedResult['items']) && is_array($parsedResult['items'])) {
            $processedItems = [];
            
            foreach ($parsedResult['items'] as $item) {
                $cleanItem = [
                    'description' => trim(strval($item['description'] ?? 'รายการไม่ระบุ')),
                    'amount' => floatval($item['amount'] ?? 0),
                    'selected' => true
                ];

                if (empty($cleanItem['description']) || $cleanItem['description'] === 'รายการไม่ระบุ') {
                    $cleanItem['description'] = 'รายการ ' . time();
                }

                if ($cleanItem['amount'] <= 0) {
                    $cleanItem['amount'] = 0;
                    $cleanItem['selected'] = false;
                }

                if (!empty($cleanItem['description']) && $cleanItem['amount'] >= 0) {
                    $processedItems[] = $cleanItem;
                }
            }

            echo json_encode([
                'success' => true,
                'items' => $processedItems
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid response format from OCR service'
            ]);
        }

    } catch (Exception $e) {
        error_log('Error processing OCR request: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Internal server error during OCR processing'
        ]);
    }
}
?>