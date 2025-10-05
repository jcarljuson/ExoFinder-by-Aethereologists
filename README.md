# ExoFinder - Exoplanet Classification Web Application

ExoFinder is a web application that classifies exoplanet candidates as **CONFIRMED**, **CANDIDATE**, or **FALSE POSITIVE** using a pre-trained RandomForest machine learning model.

## 🚀 Features

### Core Functionality
- **CSV Upload**: Batch process multiple exoplanet candidates from CSV files
- **Manual Input**: Single prediction with manual feature input
- **Real-time Predictions**: Instant classification with confidence scores
- **Results Download**: Export predictions as CSV files
- **Modern UI**: Beautiful, responsive interface with Bootstrap

### Model Integration
- Pre-trained RandomForest classifier
- Handles missing data gracefully
- Provides confidence scores and probability breakdowns
- Trained on Kepler mission data format

## 📋 Required Features

The application expects CSV files or manual inputs with the following Kepler-compatible columns:

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

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip package manager

### Installation Steps

1. **Clone or download the project files**
2. **Install dependencies:**
   ```bash
   pip install Flask pandas numpy scikit-learn joblib requests
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

### CSV Upload Method
1. Click on the **CSV Upload** tab
2. Drag and drop your CSV file or click to browse
3. Ensure your CSV contains the required columns
4. View results in the interactive table
5. Download predictions using the **Download Results** button

### Manual Input Method
1. Click on the **Manual Input** tab
2. Fill in the feature values in the form
3. Click **Predict Classification**
4. View the prediction result with confidence score

### Sample Data
A sample CSV file (`sample_data.csv`) is included for testing:
```csv
koi_period,koi_duration,koi_depth,koi_prad,koi_teq,koi_srho,koi_sma,koi_incl,koi_insol
365.25,6.5,1000,1.2,288,1.4,1.0,90,1.0
10.5,3.2,500,0.8,800,2.1,0.1,85,25.0
...
```

## 🔧 Technical Details

### Architecture
- **Backend**: Flask web framework
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **ML Model**: RandomForest classifier (scikit-learn)
- **Data Processing**: pandas, numpy

### File Structure
```
ExoFinder/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── sample_data.csv       # Sample test data
├── templates/
│   └── index.html        # Main web interface
├── static/
│   └── app.js           # Frontend JavaScript
└── README.md            # This file
```

### API Endpoints
- `GET /` - Main application interface
- `POST /predict_csv` - CSV file upload and batch prediction
- `POST /predict_manual` - Single prediction from manual input
- `POST /download_results` - Download results as CSV

## ⚠️ Important Notes

### Model Information
- **Demo Model**: The current implementation uses a demonstration model for testing
- **Training Data**: Model is designed for Kepler mission data format
- **Purpose**: Intended for research and demonstration purposes
- **Accuracy**: Demo model accuracy may vary from production models

### Data Preprocessing
- Missing values are filled with median values
- Missing columns are filled with zeros (not ideal for production)
- Input features are automatically reordered to match model expectations

### Limitations
- Maximum file size: 16MB
- Supported format: CSV only
- Model URL in code is placeholder (replace with actual model URL)

## 🔮 Future Enhancements

- [ ] Load actual pre-trained model from URL
- [ ] Add data validation and error handling
- [ ] Implement proper feature scaling
- [ ] Add visualization charts for results
- [ ] Support for additional file formats
- [ ] Model performance metrics display
- [ ] User authentication and session management

## 📄 License

This project is for educational and research purposes. Please ensure compliance with relevant data usage policies when working with astronomical datasets.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues, please refer to the documentation or create an issue in the project repository.

---

**Disclaimer**: This application is trained on Kepler mission data and is intended for demonstration and research purposes only. Results should be validated against official astronomical databases for scientific use.