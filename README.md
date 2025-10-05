# ExoFinder - Multi-Mission Exoplanet Classification Web Application

ExoFinder is an advanced web application that classifies exoplanet candidates from **Kepler**, **K2**, and **TESS** missions as **CONFIRMED**, **CANDIDATE**, or **FALSE POSITIVE** using pre-trained machine learning models.

## 🚀 Features

### Core Functionality
- **Multi-Mission Support**: Kepler, K2, and TESS data compatibility
- **CSV Upload**: Batch process multiple exoplanet candidates from CSV files
- **Manual Input**: Single prediction with manual feature input
- **Real-time Predictions**: Instant classification with confidence scores
- **Results Download**: Export predictions as CSV files
- **ExoAI Chat**: AI-powered assistant for exoplanet research questions
- **Modern UI**: Beautiful space-themed interface with particle effects

### Model Integration
- **Kepler**: RandomForest classifier from GitHub
- **K2**: Stacked ensemble model (local)
- **TESS**: Neural network with label encoding (local)
- Handles missing data gracefully
- Provides confidence scores and probability breakdowns

## 📋 Required Features by Mission

### Kepler Mission
| Feature | Description | Unit |
|---------|-------------|------|
| `koi_period` | Orbital Period | days |
| `koi_duration` | Transit Duration | hours |
| `koi_depth` | Transit Depth | ppm |
| `koi_prad` | Planet Radius | Earth radii |
| `koi_teq` | Equilibrium Temperature | Kelvin |
| `koi_srho` | Stellar Density | g/cm³ |
| `koi_sma` | Semi-major Axis | AU |
| `koi_incl` | Inclination | degrees |
| `koi_insol` | Insolation Flux | Earth flux |

### K2 Mission
Similar to Kepler with additional preprocessing for K2-specific data format.

### TESS Mission
Optimized for TESS data format with neural network classification.

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip package manager

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jcarljuson/ExoFinder-by-Aethereologists.git
   cd ExoFinder-by-Aethereologists
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
3. **Run the application:**
   ```bash
   python app.py
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

## 📖 Usage Guide

### Mission Selection
1. Select your mission (Kepler, K2, or TESS) from the dropdown
2. The interface will adapt to show mission-specific features

### CSV Upload Method
1. Click on the **CSV Upload** tab
2. Select your mission from the dropdown
3. Drag and drop your CSV file or click to browse
4. Ensure your CSV contains the required columns for the selected mission
5. View results in the interactive table
6. Download predictions using the **Download Results** button

### Manual Input Method
1. Click on the **Manual Input** tab
2. Select your mission from the dropdown
3. Fill in the feature values in the mission-specific form
4. Click **Predict Classification**
5. View the prediction result with confidence score

### ExoAI Chat
1. Click on the **ExoAI** tab
2. Ask questions about exoplanets, missions, or your data
3. Get AI-powered responses with proper formatting

### Sample Data
Sample CSV files are included for each mission:
- `sample_kepler_data.csv` - Kepler mission format
- `sample_k2_data.csv` - K2 mission format  
- `sample_tess_data.csv` - TESS mission format

## 🔧 Technical Details

### Architecture
- **Backend**: Flask web framework with rate limiting
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Bootstrap 5
- **ML Models**: Multiple models for different missions
- **Data Processing**: pandas, numpy, scikit-learn, tensorflow
- **UI**: Space-themed design with particle animations

### File Structure
```
ExoFinder/
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── sample_*_data.csv        # Sample test data for each mission
├── *_model.pkl              # Pre-trained ML models
├── *_scaler.pkl             # Feature scalers
├── templates/
│   └── index.html           # Main web interface
├── static/
│   ├── app.js              # Frontend JavaScript
│   └── space-theme.css     # Space-themed styling
└── README.md               # This file
```

### API Endpoints
- `GET /` - Main application interface
- `POST /predict_csv` - CSV file upload and batch prediction
- `POST /predict_manual` - Single prediction from manual input
- `POST /download_results` - Download results as CSV
- `POST /api/chat` - ExoAI chat functionality

## 🚀 Deployment

### Render Deployment
This application is configured for easy deployment on Render:

1. **Push to GitHub** (already done)
2. **Create Render Web Service**:
   - Connect your GitHub repository
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
   - Environment: Python 3

### Environment Variables
- `PORT`: Automatically set by Render
- `FLASK_ENV`: Set to `production` for deployment

## ⚠️ Important Notes

### Model Information
- **Kepler**: Production RandomForest model from GitHub
- **K2**: Stacked ensemble model trained on K2 data
- **TESS**: Neural network with label encoding
- **Purpose**: Research and demonstration purposes
- **Accuracy**: Models trained on real mission data

### Data Preprocessing
- Mission-specific preprocessing pipelines
- Automatic feature scaling and encoding
- Handles missing values appropriately for each mission
- Input validation and error handling

### Limitations
- Maximum file size: 16MB
- Supported format: CSV only
- Rate limiting: 100 requests per hour per IP

## 🔮 Future Enhancements

- [ ] Add visualization charts for results
- [ ] Support for additional file formats
- [ ] Model performance metrics display
- [ ] User authentication and session management
- [ ] Advanced filtering and search capabilities
- [ ] Integration with astronomical databases

## 📄 License

This project is for educational and research purposes. Please ensure compliance with relevant data usage policies when working with astronomical datasets.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues, please create an issue in the project repository or use the ExoAI chat feature for assistance.

---

**Disclaimer**: This application uses models trained on real mission data from Kepler, K2, and TESS. Results should be validated against official astronomical databases for scientific use.
