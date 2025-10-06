import os
import requests
import time
from datetime import datetime, timedelta
from collections import defaultdict
from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import numpy as np
import joblib
import tempfile
import io
from werkzeug.utils import secure_filename
from sklearn.preprocessing import StandardScaler, LabelEncoder

app = Flask(__name__)

# Rate limiting for ExoAI chat
chat_requests = defaultdict(list)
CHAT_RATE_LIMIT = 15  # requests per minute
CHAT_TIME_WINDOW = 60  # seconds

# Secure API key from environment variable
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise EnvironmentError("GEMINI_API_KEY is not set. Please configure it as an environment variable.")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Global variable to store the loaded model
model = None

# Mission-specific configurations
MISSION_CONFIGS = {
    'kepler': {
        'model_path': 'kepler_rf_model.pkl',
        'required_features': [
            'koi_period', 'koi_duration', 'koi_depth', 'koi_prad', 
            'koi_teq', 'koi_srho', 'koi_sma', 'koi_incl', 'koi_insol',
            'koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co', 'koi_fpflag_ec',
            'koi_model_snr', 'koi_max_sngle_ev', 'koi_max_mult_ev'
        ],
        'identifier_columns': ['kepoi_name', 'kepler_name']
    },
    'k2': {
        'model_path': 'k2_stacked_model.pkl',
        'scaler_path': 'k2_scaler.pkl',
        'required_features': [
            'pl_orbper', 'pl_orbsmax', 'pl_rade', 'pl_radj', 'pl_masse', 'pl_massj',
            'pl_trandep', 'pl_trandur', 'pl_ratdor', 'pl_ratror', 'pl_occdep',
            'tran_flag', 'ptv_flag', 'ast_flag', 'etv_flag',
            'st_teff', 'st_rad', 'st_mass', 'st_logg', 'st_met', 'st_lum',
            'sy_dist', 'sy_pm', 'sy_bmag', 'sy_vmag', 'sy_jmag', 'sy_hmag', 'sy_kmag',
            'k2_campaigns_num', 'pl_orbeccen', 'pl_insol'
        ],
        'identifier_columns': ['pl_name']
    },
    'tess': {
        'model_path': 'tess_model.pkl',
        'scaler_path': 'tess_scaler.pkl',
        'label_encoder_path': 'tess_label_encoder.pkl',
        'required_features': [
            'pl_orbper', 'pl_trandurh', 'pl_trandep', 'pl_rade', 'pl_insol', 
            'pl_eqt', 'st_teff', 'st_logg', 'st_rad', 'st_tmag', 'st_dist'
        ],
        'identifier_columns': ['toi']
    }
}

# Global variables to store the loaded models, scalers, and label encoders
models = {}
scalers = {}
label_encoders = {}

# Legacy support - keep for backward compatibility
model = None
REQUIRED_FEATURES = MISSION_CONFIGS['kepler']['required_features']

def load_model(mission='kepler'):
    """Load model and scaler for the specified mission."""
    global models, scalers, label_encoders, model

    if mission in models and models[mission] is not None:
        return True

    config = MISSION_CONFIGS[mission]

    try:
        if mission == 'kepler':
            # Load Kepler model from local file
            model_path = config['model_path']
            print(f"Loading {mission} model from {model_path}...")
            models[mission] = joblib.load(model_path)
            
            # Set legacy model variable for backward compatibility
            model = models[mission]

        elif mission == 'k2':
            # Load K2 model and scaler from local files
            model_path = config['model_path']
            scaler_path = config['scaler_path']
            
            print(f"Loading {mission} model from {model_path}...")
            models[mission] = joblib.load(model_path)
            
            print(f"Loading {mission} scaler from {scaler_path}...")
            scalers[mission] = joblib.load(scaler_path)

        elif mission == 'tess':
            # Load TESS model, scaler, and label encoder from local files
            model_path = config['model_path']
            scaler_path = config['scaler_path']
            label_encoder_path = config['label_encoder_path']
            
            print(f"Loading {mission} model from {model_path}...")
            models[mission] = joblib.load(model_path)
            
            print(f"Loading {mission} scaler from {scaler_path}...")
            scalers[mission] = joblib.load(scaler_path)
            
            print(f"Loading {mission} label encoder from {label_encoder_path}...")
            label_encoders[mission] = joblib.load(label_encoder_path)

        print(f"{mission.capitalize()} model loaded successfully!")
        return True

    except Exception as e:
        print(f"Error loading {mission} model: {str(e)}")
        models[mission] = None
        if mission in scalers:
            scalers[mission] = None
        if mission in label_encoders:
            label_encoders[mission] = None
        return False

def preprocess_data(df, mission='kepler', selected_features=None):
    """Preprocess input data for the specified mission model prediction."""
    config = MISSION_CONFIGS[mission]
    required_features = config['required_features']
    
    # IMPORTANT: Always use ALL required features for model compatibility
    # selected_features is only for UI display purposes, not for model input
    
    # Keep only required features that exist in the dataframe
    available_features = [col for col in required_features if col in df.columns]
    
    if len(available_features) == 0:
        raise ValueError("No required features found in the data")
    
    # Select only available features
    processed_df = df[available_features].copy()
    
    # Convert scientific notation to decimal format
    for col in processed_df.columns:
        if processed_df[col].dtype == 'object':
            # Convert string columns that might contain scientific notation
            processed_df[col] = processed_df[col].astype(str).apply(convert_scientific_notation)
        processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce')
    
    # Handle missing features intelligently to preserve accuracy
    missing_features = []
    all_required_features = config['required_features']  # Keep original list for model compatibility
    
    for feature in all_required_features:
        if feature not in processed_df.columns:
            missing_features.append(feature)
            # For truly missing features (not in original data), use defaults
            if feature == 'pl_orbeccen':  # Orbital eccentricity
                processed_df[feature] = 0.1  # Typical low eccentricity for planets
            elif feature == 'pl_insol':  # Insolation flux
                processed_df[feature] = 1.0  # Earth-like insolation as default
            else:
                # For any other missing features, use median of existing data
                processed_df[feature] = 0
    
    # IMPORTANT: Do NOT modify values for unselected features
    # The model needs original values to make accurate predictions
    # Feature selection is only for UI display purposes
    
    # Log missing features for debugging
    if missing_features:
        print(f"Warning: Missing features filled with defaults: {missing_features}")
    
    # Reorder columns to match model expectations (use all required features)
    processed_df = processed_df[all_required_features]

    # Handle missing values by filling with median
    processed_df = processed_df.fillna(processed_df.median())
    
    # Apply scaling for K2 and TESS missions
    if mission in ['k2', 'tess'] and mission in scalers and scalers[mission] is not None:
        print(f"Applying StandardScaler for {mission} mission...")
        processed_df_scaled = scalers[mission].transform(processed_df)
        processed_df = pd.DataFrame(processed_df_scaled, columns=processed_df.columns, index=processed_df.index)
    
    return processed_df

def convert_scientific_notation(value):
    """Convert scientific notation strings to decimal format"""
    try:
        # Handle string values that might be in scientific notation
        if isinstance(value, str):
            value = value.strip()
            # Check if it contains 'E' or 'e' (scientific notation)
            if 'E' in value.upper():
                # Convert to float first, then back to string to get decimal format
                float_val = float(value)
                # Format with enough precision to avoid losing data
                return f"{float_val:.10f}".rstrip('0').rstrip('.')
        return value
    except (ValueError, TypeError):
        return value

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    """Handle CSV file upload and prediction"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'Please upload a CSV file'}), 400
        
        # Get selected mission (default to kepler for backward compatibility)
        mission = request.form.get('mission', 'kepler')
        
        # Get selected features if provided
        selected_features = None
        if 'selected_features' in request.form:
            selected_features_str = request.form.get('selected_features')
            if selected_features_str:
                try:
                    import json
                    selected_features = json.loads(selected_features_str)
                except json.JSONDecodeError:
                    pass  # Use all features if parsing fails
        
        # Check if mission is supported
        if mission not in MISSION_CONFIGS:
            return jsonify({'error': f'Unsupported mission: {mission}'}), 400
        
        # Load model for the selected mission
        if not load_model(mission):
            return jsonify({'error': f'{mission.capitalize()} model loading failed'}), 500
        
        # Check if model was actually loaded
        if models[mission] is None:
            return jsonify({'error': f'{mission.capitalize()} model is not available'}), 500
        
        # Read CSV file (ignore comment lines starting with #)
        df = pd.read_csv(file, comment='#')
        
        if df.empty:
            return jsonify({'error': 'CSV file is empty'}), 400
        
        # Get mission configuration
        config = MISSION_CONFIGS[mission]
        
        # Preserve identifier columns if they exist
        identifier_columns = {}
        for id_col in config['identifier_columns']:
            if id_col in df.columns:
                # Replace NaN values with empty strings for JSON compatibility
                identifier_columns[id_col] = df[id_col].fillna('').tolist()
        
        # Preprocess data for the selected mission
        processed_df = preprocess_data(df, mission, selected_features)
        
        # Make predictions using the mission-specific model
        try:
            predictions = models[mission].predict(processed_df)
            probabilities = models[mission].predict_proba(processed_df)
        except ValueError as e:
            return jsonify({'error': f'Prediction error: {str(e)}'}), 500
        
        # Calculate confidence scores and map predictions based on mission
        if mission == 'k2':
            # For K2: class 0=FALSE POSITIVE, class 1=CANDIDATE, class 2=CONFIRMED
            confidence_scores = []
            for i, pred in enumerate(predictions):
                if pred == 0:
                    confidence_scores.append(probabilities[i][0])  # Probability of class 0 (FALSE POSITIVE)
                elif pred == 1:
                    confidence_scores.append(probabilities[i][1])  # Probability of class 1 (CANDIDATE)
                elif pred == 2:
                    confidence_scores.append(probabilities[i][2])  # Probability of class 2 (CONFIRMED)
                else:
                    confidence_scores.append(np.max(probabilities[i]))  # Fallback
            confidence_scores = np.array(confidence_scores)
            
            # K2 model uses classes 0, 1, and 2: 0=FALSE POSITIVE, 1=CANDIDATE, 2=CONFIRMED
            class_mapping = {0: 'FALSE POSITIVE', 1: 'CANDIDATE', 2: 'CONFIRMED'}
            display_predictions = [class_mapping.get(pred, f'UNKNOWN_CLASS_{pred}') for pred in predictions]
        elif mission == 'tess':
            # For TESS: use label encoder to decode predictions
            confidence_scores = np.max(probabilities, axis=1)
            if mission in label_encoders and label_encoders[mission] is not None:
                # Decode predictions using label encoder and expand abbreviations
                raw_predictions = label_encoders[mission].inverse_transform(predictions).tolist()
                # Map TESS abbreviations to full names
                tess_class_mapping = {
                    'APC': 'Astrophysical False Positive - Centroid',
                    'CP': 'Confirmed Planet',
                    'FA': 'False Alarm',
                    'FP': 'False Positive',
                    'KP': 'Known Planet',
                    'PC': 'Planet Candidate'
                }
                display_predictions = [tess_class_mapping.get(pred, pred) for pred in raw_predictions]
            else:
                # Fallback if label encoder is not available
                display_predictions = [f'CLASS_{pred}' for pred in predictions]
        else:
            # For other missions, use max probability
            confidence_scores = np.max(probabilities, axis=1)
            # Kepler model already returns proper labels
            display_predictions = predictions
        
        # Create results dataframe
        results_data = {
            'RowID': range(1, len(predictions) + 1),
            'Predicted_Class': display_predictions,
            'Confidence': confidence_scores.round(4)
        }
        
        # Add identifier columns to results if they exist
        for id_col, values in identifier_columns.items():
            results_data[id_col] = values
        
        results_df = pd.DataFrame(results_data)
        
        # Convert to JSON for frontend
        results = results_df.to_dict('records')
        
        return jsonify({
            'success': True,
            'results': results,
            'total_rows': len(results),
            'mission': mission
        })
        
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@app.route('/predict_manual', methods=['POST'])
def predict_manual():
    """Handle manual input prediction"""
    try:
        data = request.json
        
        # Get selected mission from request
        mission = data.get('mission', 'kepler')
        
        # Get selected features if provided
        selected_features = data.get('selected_features', None)
        
        # Check if mission is supported
        if mission not in MISSION_CONFIGS:
            return jsonify({'error': f'Unsupported mission: {mission}'}), 400
        
        # Load model for the selected mission
        if not load_model(mission):
            return jsonify({'error': f'{mission.capitalize()} model loading failed'}), 500
        
        # Check if model was actually loaded
        if models[mission] is None:
            return jsonify({'error': f'{mission.capitalize()} model is not available'}), 500

        # Get mission configuration
        config = MISSION_CONFIGS[mission]
        all_required_features = config['required_features']
        
        # If selected features are provided, validate them
        if selected_features:
            valid_selected = [f for f in selected_features if f in all_required_features]
            if not valid_selected:
                return jsonify({'error': 'No valid features selected'}), 400
        
        # Create input array for all required features
        input_data = []
        for feature in all_required_features:
            # Always use provided value - feature selection is for UI display only
            value = data.get(feature, 0)
            try:
                input_data.append(float(value))
            except (ValueError, TypeError):
                return jsonify({'error': f'Invalid value for {feature}'}), 400
        
        # Make prediction using the mission-specific model
        input_array = np.array([input_data])
        prediction = models[mission].predict(input_array)[0]
        probabilities = models[mission].predict_proba(input_array)[0]
        confidence = np.max(probabilities)
        
        # Convert numpy types to Python native types for JSON serialization
        prediction = int(prediction) if hasattr(prediction, 'dtype') else prediction
        confidence = float(confidence) if hasattr(confidence, 'dtype') else confidence
        probabilities = [float(prob) if hasattr(prob, 'dtype') else prob for prob in probabilities]
        
        # Map prediction to display label based on mission
        if mission == 'k2':
            # K2 model uses classes 0, 1, and 2: 0=FALSE POSITIVE, 1=CANDIDATE, 2=CONFIRMED
            class_mapping = {0: 'FALSE POSITIVE', 1: 'CANDIDATE', 2: 'CONFIRMED'}
            display_prediction = class_mapping.get(prediction, f'UNKNOWN_CLASS_{prediction}')
            # Map class names for probability breakdown
            class_names = ['FALSE POSITIVE', 'CANDIDATE', 'CONFIRMED']
        elif mission == 'tess':
            # For TESS: use label encoder to decode predictions
            if mission in label_encoders and label_encoders[mission] is not None:
                # Decode prediction using label encoder and expand abbreviation
                raw_prediction = label_encoders[mission].inverse_transform([prediction])[0]
                # Map TESS abbreviations to full names
                tess_class_mapping = {
                    'APC': 'Astrophysical False Positive - Centroid',
                    'CP': 'Confirmed Planet',
                    'FA': 'False Alarm',
                    'FP': 'False Positive',
                    'KP': 'Known Planet',
                    'PC': 'Planet Candidate'
                }
                display_prediction = tess_class_mapping.get(raw_prediction, raw_prediction)
                class_names = [tess_class_mapping.get(cls, cls) for cls in label_encoders[mission].classes_]
            else:
                # Fallback if label encoder is not available
                display_prediction = f'CLASS_{prediction}'
                class_names = [f'CLASS_{i}' for i in range(len(probabilities))]
        else:
            # Kepler model already returns proper labels
            display_prediction = prediction
            class_names = models[mission].classes_
        
        return jsonify({
            'success': True,
            'prediction': display_prediction,
            'confidence': round(float(confidence), 4),
            'probabilities': {
                class_name: round(float(prob), 4) 
                for class_name, prob in zip(class_names, probabilities)
            },
            'mission': mission
        })
        
    except Exception as e:
        return jsonify({'error': f'Error making prediction: {str(e)}'}), 500

def is_rate_limited(client_ip):
    """Check if client is rate limited for chat requests"""
    now = time.time()
    # Clean old requests
    chat_requests[client_ip] = [req_time for req_time in chat_requests[client_ip] 
                               if now - req_time < CHAT_TIME_WINDOW]
    
    # Check if rate limit exceeded
    if len(chat_requests[client_ip]) >= CHAT_RATE_LIMIT:
        return True
    
    # Add current request
    chat_requests[client_ip].append(now)
    return False

@app.route('/api/chat', methods=['POST'])
def chat_with_exoai():
    """ExoAI Assistant chat endpoint with Gemini API integration"""
    try:
        # Rate limiting
        client_ip = request.remote_addr
        if is_rate_limited(client_ip):
            return jsonify({
                'error': 'Rate limit exceeded. Please wait before sending another message.',
                'retry_after': 60
            }), 429
        
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message'].strip()
        if not user_message or len(user_message) > 500:
            return jsonify({'error': 'Message must be between 1 and 500 characters'}), 400
        
        # Prepare Gemini API request
        headers = {
            'Content-Type': 'application/json',
        }
        
        # Space-themed system prompt
        system_prompt = """You are ExoAI, assistant for ExoFinder - an exoplanet discovery platform by the Aethereologists team.

        You specialize in:
        - ExoFinder platform features
        - Exoplanet discovery using Kepler, K2, and TESS data
        - Machine learning in astronomy
        - Space missions and research
        - General space science and physics questions
        - Astrophysics, cosmology, and planetary science
        
        FORMATTING INSTRUCTIONS:
        - Use clear headings with ## for main topics
        - Use bullet points with - for lists
        - Add proper line breaks between sections
        - Use **bold** for emphasis on key terms
        - Format equations with proper spacing
        - Structure responses with clear paragraphs
        - Use numbered lists for step-by-step explanations
        
        Keep responses engaging, well-formatted, and scientifically accurate. Use emojis occasionally. Always maintain enthusiasm for space exploration!"""
        
        payload = {
            'contents': [
                {
                    'parts': [
                        {'text': f"{system_prompt}\n\nUser: {user_message}"}
                    ]
                }
            ],
            'generationConfig': {
                'temperature': 0.7,
                'topK': 40,
                'topP': 0.95,
                'maxOutputTokens': 1000,
            }
        }
        
        # Make request to Gemini API
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                candidate = result['candidates'][0]
                
                # Handle different response structures
                if 'content' in candidate:
                    content = candidate['content']
                    
                    # Check if content has 'parts' field (normal response)
                    if 'parts' in content and len(content['parts']) > 0:
                        ai_response = content['parts'][0]['text']
                        return jsonify({
                            'response': ai_response,
                            'status': 'success'
                        })
                    # Check if content has 'text' field directly (alternative format)
                    elif 'text' in content:
                        ai_response = content['text']
                        return jsonify({
                            'response': ai_response,
                            'status': 'success'
                        })
                    # Handle case where content only has role (incomplete response)
                    elif 'role' in content and candidate.get('finishReason') == 'MAX_TOKENS':
                        return jsonify({
                            'error': 'Response was truncated due to length limits. Please try a shorter message.',
                            'status': 'error'
                        }), 400
                    else:
                        print(f"ExoAI Chat - Unknown content structure: {content}")
                        return jsonify({'error': 'Invalid response format from AI service'}), 500
                else:
                    print(f"ExoAI Chat - No content in candidate: {candidate}")
                    return jsonify({'error': 'Empty response from AI service'}), 500
            else:
                print(f"ExoAI Chat - No candidates in response: {result}")
                return jsonify({'error': 'No response generated'}), 500
        else:
            error_msg = f"API Error: {response.status_code}"
            if response.status_code == 429:
                error_msg = "API rate limit exceeded. Please try again later."
            elif response.status_code == 400:
                error_msg = "Invalid request. Please try a different message."
            
            return jsonify({'error': error_msg}), 500
            
    except requests.exceptions.Timeout:
        print(f"ExoAI Chat - Timeout error")
        return jsonify({'error': 'Request timeout. Please try again.'}), 500
    except requests.exceptions.RequestException as e:
        print(f"ExoAI Chat - Network error: {str(e)}")
        return jsonify({'error': 'Network error. Please check your connection.'}), 500
    except Exception as e:
        print(f"ExoAI Chat - Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred.'}), 500

@app.route('/download_results', methods=['POST'])
def download_results():
    """Download results as CSV"""
    try:
        data = request.json
        results = data.get('results', [])
        
        if not results:
            return jsonify({'error': 'No results to download'}), 400
        
        # Create DataFrame from results
        df = pd.DataFrame(results)
        
        # Create temporary file
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        # Create response
        return app.response_class(
            output.getvalue(),
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=exoplanet_predictions.csv'}
        )
        
    except Exception as e:
        return jsonify({'error': f'Error downloading results: {str(e)}'}), 500

@app.route('/sample_kepler_data.csv')
def download_sample_kepler():
    return send_file('sample_kepler_data.csv', as_attachment=True)

    # Removed TESS and K2 sample routes in rollback

if __name__ == '__main__':
    print("Starting ExoFinder Multi-Mission Application...")
    # Load models for all missions on startup
    print("Loading Kepler model...")
    load_model('kepler')
    print("Loading K2 model...")
    load_model('k2')
    print("Loading TESS model...")
    load_model('tess')
    print("All models loaded. Starting Flask server...")
    
    # Production configuration for Render
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)