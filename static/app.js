// Global variables
let currentResults = [];
let selectedMission = 'kepler'; // Default mission
let sortColumn = -1;
let sortDirection = 'asc';
let selectedFeatures = {
    kepler: ['koi_period', 'koi_prad', 'koi_teq', 'koi_insol', 'koi_dor'],
    tess: ['Tmag', 'Teff', 'logg', 'MH', 'rad'],
    k2: ['k2_period', 'k2_prad', 'k2_teq', 'k2_insol', 'k2_dor']
};

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const csvFile = document.getElementById('csvFile');
const csvLoading = document.getElementById('csvLoading');
const csvResults = document.getElementById('csvResults');
const csvError = document.getElementById('csvError');
const resultsTableBody = document.getElementById('resultsTableBody');
const resultsCount = document.getElementById('resultsCount');
const downloadBtn = document.getElementById('downloadBtn');
const manualForm = document.getElementById('manualForm');
const manualLoading = document.getElementById('manualLoading');
const manualResult = document.getElementById('manualResult');
const manualError = document.getElementById('manualError');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeSpaceTheme();
    initializeUploadArea();
    initializeManualForm();
    initializeDownloadButton();
    initializeMissionSelection();
    initializeTableSorting();
    initializeTooltips();
    initializeSpaceNavigation();
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Space Theme Initialization
function initializeSpaceTheme() {
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Initialize particle animation
    initializeParticles();
    
    // Add hover effects to interactive elements
    addHoverEffects();
    
    // Initialize loading overlay
    initializeLoadingOverlay();
}

// Particle Animation System
function initializeParticles() {
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        // Random initial positions and animations
        const delay = Math.random() * 10;
        const duration = 15 + Math.random() * 10;
        const size = 2 + Math.random() * 4;
        
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
    });
}

// Enhanced Hover Effects
function addHoverEffects() {
    // Mission cards
    const missionCards = document.querySelectorAll('.mission-card');
    missionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 123, 255, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.previousElementSibling.checked) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }
        });
    });
    
    // Space buttons
    const spaceButtons = document.querySelectorAll('.space-btn');
    spaceButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Loading Overlay System
function initializeLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        // Hide overlay initially
        overlay.style.display = 'none';
    }
}

function showLoadingOverlay(title = 'Processing...', subtitle = 'Analyzing your data with advanced machine learning') {
    const overlay = document.getElementById('loadingOverlay');
    const titleEl = overlay.querySelector('.loading-title');
    const subtitleEl = overlay.querySelector('.loading-subtitle');
    
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    
    overlay.style.display = 'flex';
    overlay.style.opacity = '0';
    
    // Fade in animation
    requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '1';
    });
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';
    
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

// Space Navigation System
function initializeSpaceNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Smooth transition effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Enhanced Animation System
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe space sections
    const spaceSections = document.querySelectorAll('.space-section');
    spaceSections.forEach(section => {
        observer.observe(section);
    });
}

// Feature Selection Functionality
document.addEventListener('DOMContentLoaded', function() {
    const advancedOptionsBtn = document.getElementById('advancedOptionsBtn');
    const featureSelectionPanel = document.getElementById('featureSelectionPanel');
    const selectAllBtn = document.getElementById('selectAllFeatures');
    const deselectAllBtn = document.getElementById('deselectAllFeatures');
    const selectedFeaturesCount = document.getElementById('selectedFeaturesCount');
    
    // Mission radio buttons
    const keplerRadio = document.getElementById('kepler-mission');
    const tessRadio = document.getElementById('tess-mission');
    const k2Radio = document.getElementById('k2-mission');
    
    // Feature groups
    const keplerFeatures = document.getElementById('kepler-features');
    const tessFeatures = document.getElementById('tess-features');
    const k2Features = document.getElementById('k2-features');
    
    // Toggle advanced options panel with simple CSS-based approach
    if (advancedOptionsBtn && featureSelectionPanel) {
        let isCollapsed = true; // Track collapse state
        
        // Set initial state
        featureSelectionPanel.style.display = 'none';
        
        advancedOptionsBtn.addEventListener('click', function() {
            const chevronIcon = this.querySelector('i');
            
            if (isCollapsed) {
                // Show the panel
                featureSelectionPanel.style.display = 'block';
                featureSelectionPanel.classList.remove('collapse');
                featureSelectionPanel.classList.add('show');
                chevronIcon.classList.remove('fa-chevron-down');
                chevronIcon.classList.add('fa-chevron-up');
                isCollapsed = false;
                
                // Ensure the correct feature group is visible when opening
                handleMissionChange();
            } else {
                // Hide the panel
                featureSelectionPanel.style.display = 'none';
                featureSelectionPanel.classList.add('collapse');
                featureSelectionPanel.classList.remove('show');
                chevronIcon.classList.remove('fa-chevron-up');
                chevronIcon.classList.add('fa-chevron-down');
                isCollapsed = true;
            }
        });
    }
    
    // Mission change handler
    function handleMissionChange() {
        const selectedMission = document.querySelector('input[name="mission"]:checked').value;
        
        // Hide all feature groups
        if (keplerFeatures) keplerFeatures.style.display = 'none';
        if (tessFeatures) tessFeatures.style.display = 'none';
        if (k2Features) k2Features.style.display = 'none';
        
        // Show relevant feature group
        switch(selectedMission) {
            case 'kepler':
                if (keplerFeatures) keplerFeatures.style.display = 'block';
                break;
            case 'tess':
                if (tessFeatures) tessFeatures.style.display = 'block';
                break;
            case 'k2':
                if (k2Features) k2Features.style.display = 'block';
                break;
        }
        
        updateFeatureCount();
    }
    
    // Add event listeners to mission radio buttons
    if (keplerRadio) keplerRadio.addEventListener('change', handleMissionChange);
    if (tessRadio) tessRadio.addEventListener('change', handleMissionChange);
    if (k2Radio) k2Radio.addEventListener('change', handleMissionChange);
    
    // Select/Deselect all features
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            const selectedMission = document.querySelector('input[name="mission"]:checked').value;
            const checkboxes = document.querySelectorAll(`.${selectedMission}-feature`);
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            updateFeatureCount();
        });
    }
    
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', function() {
            const selectedMission = document.querySelector('input[name="mission"]:checked').value;
            const checkboxes = document.querySelectorAll(`.${selectedMission}-feature`);
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            updateFeatureCount();
        });
    }
    
    // Update feature count
    function updateFeatureCount() {
        const selectedMission = document.querySelector('input[name="mission"]:checked').value;
        const checkboxes = document.querySelectorAll(`.${selectedMission}-feature`);
        const checkedBoxes = document.querySelectorAll(`.${selectedMission}-feature:checked`);
        
        if (selectedFeaturesCount) {
            selectedFeaturesCount.textContent = `${checkedBoxes.length} of ${checkboxes.length} features selected`;
        }
    }
    
    // Add event listeners to all feature checkboxes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('kepler-feature') || 
            e.target.classList.contains('tess-feature') || 
            e.target.classList.contains('k2-feature')) {
            updateFeatureCount();
        }
    });
    
    // Initialize on page load
    handleMissionChange();
    
    // Get selected features for form submission
    window.getSelectedFeatures = function() {
        const selectedMission = document.querySelector('input[name="mission"]:checked').value;
        const checkedBoxes = document.querySelectorAll(`.${selectedMission}-feature:checked`);
        return Array.from(checkedBoxes).map(checkbox => checkbox.value);
    };
});



// Upload area functionality
function initializeUploadArea() {
    const uploadZone = document.getElementById('uploadZone');
    const csvFile = document.getElementById('csvFile');
    
    if (!uploadZone || !csvFile) return;
    
    // Flag to prevent click during drag/drop
    let isDragDropInProgress = false;
    
    // Click to upload
    uploadZone.addEventListener('click', (e) => {
        // Don't trigger file input if drag/drop is in progress
        if (isDragDropInProgress) {
            return;
        }
        
        // Only trigger file input if clicking on the upload zone or its children
        if (e.target === uploadZone || uploadZone.contains(e.target)) {
            if (csvFile) {
                csvFile.click();
            }
        }
    });
    
    // Drag and drop functionality
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.add('dragover');
        isDragDropInProgress = true;
    });
    
    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove('dragover');
        // Reset flag after a delay to handle multiple dragleave events
        setTimeout(() => {
            isDragDropInProgress = false;
        }, 100);
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            csvFile.files = files;
            handleFileUpload();
            
            // Auto-trigger prediction after file is processed
            setTimeout(() => {
                handleCsvPrediction();
            }, 200);
            
            // Keep the flag active for a longer period to prevent any delayed click events
            setTimeout(() => {
                isDragDropInProgress = false;
            }, 500);
        } else {
            // Reset immediately if no files
            isDragDropInProgress = false;
        }
    });
    
    // File input change - prevent multiple triggers
    csvFile.addEventListener('change', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileUpload();
    });
    
    // Add event listener for CSV predict button
    const csvPredictBtn = document.getElementById('csvPredictBtn');
    if (csvPredictBtn) {
        csvPredictBtn.addEventListener('click', handleCsvPrediction);
    }
    
    // Add event listener for remove file button
    const removeFileBtn = document.getElementById('removeFile');
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', removeFile);
    }
}

// Mission selection functionality
function initializeMissionSelection() {
    const missionRadios = document.querySelectorAll('input[name="mission"]');
    missionRadios.forEach(radio => {
        radio.addEventListener('change', handleMissionChange);
    });
    
    // Initialize UI for the default mission on page load
    updateUIForMission(selectedMission);
}

function handleMissionChange(e) {
    selectedMission = e.target.value;
    updateUIForMission(selectedMission);
    updateFeatureSelection();
    updateManualFormFields(selectedMission);
}

// Feature selection functionality
function updateFeatureSelection() {
    const featureGroups = document.querySelectorAll('.feature-group-compact');
    
    featureGroups.forEach(group => {
        const mission = group.getAttribute('data-mission');
        if (mission === selectedMission) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });
    
    // Update checkboxes based on selected features
    const checkboxes = document.querySelectorAll(`[data-mission="${selectedMission}"] input[type="checkbox"]`);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const feature = this.value;
            if (this.checked) {
                if (!selectedFeatures[selectedMission].includes(feature)) {
                    selectedFeatures[selectedMission].push(feature);
                }
            } else {
                selectedFeatures[selectedMission] = selectedFeatures[selectedMission].filter(f => f !== feature);
            }
        });
        
        // Set initial state
        checkbox.checked = selectedFeatures[selectedMission].includes(checkbox.value);
    });
}

function updateUIForMission(mission) {
    // Hide all mission-specific column requirements
    document.querySelectorAll('.mission-columns').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show the selected mission's column requirements
    const selectedColumns = document.getElementById(`${mission}-columns`);
    if (selectedColumns) {
        selectedColumns.style.display = 'block';
    }
    
    // Update manual input form fields based on mission
    updateManualFormFields(mission);
    
    // Update table headers based on mission (only if elements exist)
    const identifier1Header = document.getElementById('identifier1Header');
    const identifier2Header = document.getElementById('identifier2Header');
    
    if (identifier1Header && identifier2Header) {
        if (mission === 'kepler') {
            identifier1Header.textContent = 'KepOI Name';
            identifier2Header.textContent = 'Kepler Name';
            identifier1Header.style.display = '';
            identifier2Header.style.display = '';
        } else if (mission === 'k2') {
            // K2 has pl_name identifier column
            identifier1Header.textContent = 'Planet Name';
            identifier2Header.textContent = '';
            identifier1Header.style.display = '';
            identifier2Header.style.display = 'none';
        } else if (mission === 'tess') {
            // TESS has toi identifier column
            identifier1Header.textContent = 'TOI Label';
            identifier2Header.textContent = '';
            identifier1Header.style.display = '';
            identifier2Header.style.display = 'none';
        }
    }
    
    // Update mission requirements identifier text
    const keplerIdentifier1Text = document.getElementById('keplerIdentifier1Text');
    const keplerIdentifier2Text = document.getElementById('keplerIdentifier2Text');
    const tessIdentifier1Text = document.getElementById('tessIdentifier1Text');
    const k2Identifier1Text = document.getElementById('k2Identifier1Text');
    
    if (mission === 'kepler') {
        if (keplerIdentifier1Text) keplerIdentifier1Text.textContent = 'kepoi_name';
        if (keplerIdentifier2Text) keplerIdentifier2Text.textContent = 'kepler_name';
    } else if (mission === 'k2') {
        if (k2Identifier1Text) k2Identifier1Text.textContent = 'pl_name';
    } else if (mission === 'tess') {
        if (tessIdentifier1Text) tessIdentifier1Text.textContent = 'toi';
    }
    
    // Clear existing results when switching missions
    currentResults = [];
    hideResults();
    hideManualResult();
}

function updateManualFormFields(mission) {
    const dynamicFormFields = document.getElementById('manualFormFields');
    if (!dynamicFormFields) return;
    
    // Clear existing fields
    dynamicFormFields.innerHTML = '';
    
    // Define field configurations for each mission
    const fieldConfigs = {
        kepler: [
            { name: 'koi_period', label: 'Orbital Period (days)', placeholder: 'e.g., 365.25', type: 'number', step: 'any' },
            { name: 'koi_duration', label: 'Transit Duration (hours)', placeholder: 'e.g., 6.5', type: 'number', step: 'any' },
            { name: 'koi_depth', label: 'Transit Depth (ppm)', placeholder: 'e.g., 1000', type: 'number', step: 'any' },
            { name: 'koi_prad', label: 'Planet Radius (Earth radii)', placeholder: 'e.g., 1.2', type: 'number', step: 'any' },
            { name: 'koi_teq', label: 'Equilibrium Temperature (K)', placeholder: 'e.g., 288', type: 'number', step: 'any' },
            { name: 'koi_srho', label: 'Stellar Density (g/cm³)', placeholder: 'e.g., 1.4', type: 'number', step: 'any' },
            { name: 'koi_sma', label: 'Semi-major Axis (AU)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' },
            { name: 'koi_incl', label: 'Inclination (degrees)', placeholder: 'e.g., 90', type: 'number', step: 'any' },
            { name: 'koi_insol', label: 'Insolation Flux (Earth flux)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' },
            { name: 'koi_fpflag_nt', label: 'Noise Transit Flag', placeholder: '0 or 1', type: 'number', step: '1', min: '0', max: '1' },
            { name: 'koi_fpflag_ss', label: 'Stellar Variability Flag', placeholder: '0 or 1', type: 'number', step: '1', min: '0', max: '1' },
            { name: 'koi_fpflag_co', label: 'Centroid Offset Flag', placeholder: '0 or 1', type: 'number', step: '1', min: '0', max: '1' },
            { name: 'koi_fpflag_ec', label: 'Eclipsing Binary Flag', placeholder: '0 or 1', type: 'number', step: '1', min: '0', max: '1' },
            { name: 'koi_model_snr', label: 'Signal-to-Noise Ratio', placeholder: 'e.g., 15.2', type: 'number', step: 'any' },
            { name: 'koi_max_sngle_ev', label: 'Max Single Event Statistic', placeholder: 'e.g., 8.5', type: 'number', step: 'any' },
            { name: 'koi_max_mult_ev', label: 'Max Multi Event Statistic', placeholder: 'e.g., 12.3', type: 'number', step: 'any' }
        ],
        k2: [
            { name: 'pl_orbper', label: 'Orbital Period (days)', placeholder: 'e.g., 365.25', type: 'number', step: 'any' },
            { name: 'pl_orbsmax', label: 'Semi-major Axis (AU)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' },
            { name: 'pl_rade', label: 'Planet Radius (Earth radii)', placeholder: 'e.g., 1.2', type: 'number', step: 'any' },
            { name: 'pl_radj', label: 'Planet Radius (Jupiter radii)', placeholder: 'e.g., 0.1', type: 'number', step: 'any' },
            { name: 'pl_masse', label: 'Planet Mass (Earth masses)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' },
            { name: 'pl_massj', label: 'Planet Mass (Jupiter masses)', placeholder: 'e.g., 0.003', type: 'number', step: 'any' },
            { name: 'pl_trandep', label: 'Transit Depth (ppm)', placeholder: 'e.g., 1000', type: 'number', step: 'any' },
            { name: 'pl_trandur', label: 'Transit Duration (hours)', placeholder: 'e.g., 6.5', type: 'number', step: 'any' },
            { name: 'pl_ratdor', label: 'Planet-Star Distance/Stellar Radius', placeholder: 'e.g., 10.5', type: 'number', step: 'any' },
            { name: 'pl_ratror', label: 'Planet-Star Radius Ratio', placeholder: 'e.g., 0.1', type: 'number', step: 'any' },
            { name: 'pl_occdep', label: 'Occultation Depth (ppm)', placeholder: 'e.g., 50', type: 'number', step: 'any' },
            { name: 'tran_flag', label: 'Transit Flag', placeholder: '0 or 1', type: 'number', step: '1', min: '0', max: '1' },
            { name: 'ptv_flag', label: 'Photometric Timing Variations Flag', placeholder: '0 or 1', type: 'number', step: '1', min: '0', max: '1' },
            { name: 'ast_flag', label: 'Astrometry Flag', placeholder: '0 or 1', type: 'number', step: '1', min: '0', max: '1' },
            { name: 'etv_flag', label: 'Eclipse Timing Variations Flag', placeholder: '0 or 1', type: 'number', step: '1', min: '0', max: '1' },
            { name: 'st_teff', label: 'Stellar Effective Temperature (K)', placeholder: 'e.g., 5778', type: 'number', step: 'any' },
            { name: 'st_rad', label: 'Stellar Radius (Solar radii)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' },
            { name: 'st_mass', label: 'Stellar Mass (Solar masses)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' },
            { name: 'st_logg', label: 'Stellar Surface Gravity (log10(cm/s²))', placeholder: 'e.g., 4.44', type: 'number', step: 'any' },
            { name: 'st_met', label: 'Stellar Metallicity [Fe/H]', placeholder: 'e.g., 0.0', type: 'number', step: 'any' },
            { name: 'st_lum', label: 'Stellar Luminosity (Solar luminosities)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' },
            { name: 'sy_dist', label: 'System Distance (pc)', placeholder: 'e.g., 150', type: 'number', step: 'any' },
            { name: 'sy_pm', label: 'System Proper Motion (mas/yr)', placeholder: 'e.g., 28.0', type: 'number', step: 'any' },
            { name: 'sy_bmag', label: 'System B Magnitude', placeholder: 'e.g., 12.5', type: 'number', step: 'any' },
            { name: 'sy_vmag', label: 'System V Magnitude', placeholder: 'e.g., 11.8', type: 'number', step: 'any' },
            { name: 'sy_jmag', label: 'System J Magnitude', placeholder: 'e.g., 10.2', type: 'number', step: 'any' },
            { name: 'sy_hmag', label: 'System H Magnitude', placeholder: 'e.g., 9.8', type: 'number', step: 'any' },
            { name: 'sy_kmag', label: 'System K Magnitude', placeholder: 'e.g., 9.5', type: 'number', step: 'any' },
            { name: 'k2_campaigns_num', label: 'K2 Campaign Number', placeholder: 'e.g., 5', type: 'number', step: '1', min: '0' },
            { name: 'pl_orbeccen', label: 'Orbital Eccentricity', placeholder: 'e.g., 0.1', type: 'number', step: 'any', min: '0', max: '1' },
            { name: 'pl_insol', label: 'Insolation Flux (Earth flux)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' }
        ],
        tess: [
            { name: 'pl_orbper', label: 'Orbital Period (days)', placeholder: 'e.g., 365.25', type: 'number', step: 'any' },
            { name: 'pl_trandurh', label: 'Transit Duration (hours)', placeholder: 'e.g., 6.5', type: 'number', step: 'any' },
            { name: 'pl_trandep', label: 'Transit Depth (ppm)', placeholder: 'e.g., 1000', type: 'number', step: 'any' },
            { name: 'pl_rade', label: 'Planet Radius (Earth radii)', placeholder: 'e.g., 1.2', type: 'number', step: 'any' },
            { name: 'pl_insol', label: 'Insolation Flux (Earth flux)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' },
            { name: 'pl_eqt', label: 'Equilibrium Temperature (K)', placeholder: 'e.g., 288', type: 'number', step: 'any' },
            { name: 'st_teff', label: 'Stellar Effective Temperature (K)', placeholder: 'e.g., 5778', type: 'number', step: 'any' },
            { name: 'st_logg', label: 'Stellar Surface Gravity (log10(cm/s²))', placeholder: 'e.g., 4.44', type: 'number', step: 'any' },
            { name: 'st_rad', label: 'Stellar Radius (Solar radii)', placeholder: 'e.g., 1.0', type: 'number', step: 'any' },
            { name: 'st_tmag', label: 'TESS Magnitude', placeholder: 'e.g., 10.5', type: 'number', step: 'any' },
            { name: 'st_dist', label: 'Stellar Distance (pc)', placeholder: 'e.g., 150', type: 'number', step: 'any' }
        ]
    };
    
    const fields = fieldConfigs[mission] || fieldConfigs.kepler;
    
    // Create two columns for better layout
    const col1 = document.createElement('div');
    col1.className = 'col-md-6';
    const col2 = document.createElement('div');
    col2.className = 'col-md-6';
    
    fields.forEach((field, index) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'feature-input';
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = field.label;
        
        const input = document.createElement('input');
        input.type = field.type;
        input.className = 'form-control';
        input.name = field.name;
        input.placeholder = field.placeholder;
        
        if (field.step) input.step = field.step;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        
        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        
        // Distribute fields evenly between two columns
        if (index < Math.ceil(fields.length / 2)) {
            col1.appendChild(fieldDiv);
        } else {
            col2.appendChild(fieldDiv);
        }
    });
    
    dynamicFormFields.appendChild(col1);
    dynamicFormFields.appendChild(col2);
}

// File upload handling
function handleFileUpload() {
    const file = csvFile.files[0];
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const csvPredictSection = document.getElementById('csvPredictSection');
    
    if (!file) return;
    
    // Prevent multiple calls
    if (handleFileUpload.processing) return;
    handleFileUpload.processing = true;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showError('Please select a CSV file.');
        handleFileUpload.processing = false;
        return;
    }
    
    // Show file info
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
    if (fileInfo) fileInfo.style.display = 'block';
    
    // Show predict button after successful file selection
    if (csvPredictSection) {
        csvPredictSection.style.display = 'block';
    }
    
    hideError();
    hideResults();
    
    // Reset processing flag after a short delay
    setTimeout(() => {
        handleFileUpload.processing = false;
    }, 100);
}

// Remove file functionality
function removeFile() {
    const fileInfo = document.getElementById('fileInfo');
    const csvPredictSection = document.getElementById('csvPredictSection');
    const csvFile = document.getElementById('csvFile');
    
    // Clear the file input
    csvFile.value = '';
    
    // Hide file info
    if (fileInfo) fileInfo.style.display = 'none';
    
    // Hide predict button
    if (csvPredictSection) {
        csvPredictSection.style.display = 'none';
    }
    
    hideError();
    hideResults();
}

// CSV prediction handling (triggered by predict button)
function handleCsvPrediction() {
    const file = csvFile.files[0];
    if (!file) {
        showError('Please select a CSV file first.');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mission', selectedMission);
    formData.append('features', JSON.stringify(selectedFeatures[selectedMission]));
    
    // Add selected features if advanced options are used
    if (typeof window.getSelectedFeatures === 'function') {
        const customFeatures = window.getSelectedFeatures();
        formData.append('selected_features', JSON.stringify(customFeatures));
    }
    
    showLoading(true);
    hideError();
    hideResults();
    
    // Hide predict button during processing
    const csvPredictSection = document.getElementById('csvPredictSection');
    if (csvPredictSection) {
        csvPredictSection.style.display = 'none';
    }
    
    fetch('/predict_csv', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.error) {
            showError(data.error);
            // Show predict button again on error
            if (csvPredictSection) {
                csvPredictSection.style.display = 'block';
            }
        } else {
            displayResults(data.predictions || data.results, data.mission);
        }
    })
    .catch(error => {
        showLoading(false);
        showError('Error uploading file: ' + error.message);
        // Show predict button again on error
        if (csvPredictSection) {
            csvPredictSection.style.display = 'block';
        }
    });
}

// ExoAI Assistant Functionality
class ExoAIAssistant {
    constructor() {
        this.spaceship = document.getElementById('exoai-spaceship');
        this.modal = document.getElementById('exoai-chat-modal');
        this.messagesContainer = document.getElementById('exoai-chat-messages');
        this.chatInput = document.getElementById('exoai-chat-input');
        this.sendBtn = document.getElementById('exoai-send-btn');
        this.closeBtn = document.getElementById('exoai-close');
        this.loadingIndicator = document.getElementById('exoai-loading');
        
        this.isDragging = false;
        this.hasDragged = false;
        this.dragThreshold = 5; // Minimum pixels to consider it a drag
        this.dragOffset = { x: 0, y: 0 };
        this.startX = 0;
        this.startY = 0;
        this.initialX = 0;
        this.initialY = 0;
        
        // Particle system properties
        this.particleContainer = document.getElementById('particle-container');
        this.particles = [];
        this.maxParticles = 15; // Limit particles for performance
        this.particlePool = []; // Reuse particles for better performance
        this.lastParticleTime = 0;
        this.particleInterval = 50; // Minimum ms between particles
        
        this.initializeEventListeners();
        this.makeDraggable();
    }
    
    initializeEventListeners() {
        // Spaceship click to open chat - only if not dragged
        this.spaceship.addEventListener('click', (e) => {
            if (!this.hasDragged) {
                this.openChat();
            }
        });
        
        // Close modal
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeChat();
            }
        });
        
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeChat();
            }
        });
    }
    
    makeDraggable() {
        this.spaceship.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.hasDragged = false;
            
            // Get initial positions
            const rect = this.spaceship.getBoundingClientRect();
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.initialX = rect.left;
            this.initialY = rect.top;
            
            // Add visual feedback
            this.spaceship.style.transition = 'none';
            document.body.style.userSelect = 'none';
            
            document.addEventListener('mousemove', this.handleDrag);
            document.addEventListener('mouseup', this.handleDragEnd);
            
            e.preventDefault();
            e.stopPropagation();
        });
        
        // Add touch support for mobile devices
        this.spaceship.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.hasDragged = false;
            
            const touch = e.touches[0];
            const rect = this.spaceship.getBoundingClientRect();
            this.startX = touch.clientX;
            this.startY = touch.clientY;
            this.initialX = rect.left;
            this.initialY = rect.top;
            
            this.spaceship.style.transition = 'none';
            document.body.style.userSelect = 'none';
            
            document.addEventListener('touchmove', this.handleTouchDrag);
            document.addEventListener('touchend', this.handleDragEnd);
            
            e.preventDefault();
        });
    }
    
    handleDrag = (e) => {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        
        // Check if movement exceeds threshold to consider it a drag
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > this.dragThreshold) {
            this.hasDragged = true;
        }
        
        const x = this.initialX + deltaX;
        const y = this.initialY + deltaY;
        
        // Keep within viewport bounds with padding
        const padding = 10;
        const maxX = window.innerWidth - this.spaceship.offsetWidth - padding;
        const maxY = window.innerHeight - this.spaceship.offsetHeight - padding;
        
        const boundedX = Math.max(padding, Math.min(x, maxX));
        const boundedY = Math.max(padding, Math.min(y, maxY));
        
        this.spaceship.style.left = boundedX + 'px';
        this.spaceship.style.top = boundedY + 'px';
        this.spaceship.style.right = 'auto';
        this.spaceship.style.bottom = 'auto';
        
        // Create fire particles during drag
        if (this.hasDragged) {
            const rect = this.spaceship.getBoundingClientRect();
            this.createParticle(rect.left + rect.width / 2, rect.top + rect.height);
        }
        
        e.preventDefault();
    }
    
    handleTouchDrag = (e) => {
        if (!this.isDragging) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.startX;
        const deltaY = touch.clientY - this.startY;
        
        // Check if movement exceeds threshold to consider it a drag
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > this.dragThreshold) {
            this.hasDragged = true;
        }
        
        const x = this.initialX + deltaX;
        const y = this.initialY + deltaY;
        
        // Keep within viewport bounds with padding
        const padding = 10;
        const maxX = window.innerWidth - this.spaceship.offsetWidth - padding;
        const maxY = window.innerHeight - this.spaceship.offsetHeight - padding;
        
        const boundedX = Math.max(padding, Math.min(x, maxX));
        const boundedY = Math.max(padding, Math.min(y, maxY));
        
        this.spaceship.style.left = boundedX + 'px';
        this.spaceship.style.top = boundedY + 'px';
        this.spaceship.style.right = 'auto';
        this.spaceship.style.bottom = 'auto';
        
        // Create fire particles during drag
        if (this.hasDragged) {
            const rect = this.spaceship.getBoundingClientRect();
            this.createParticle(rect.left + rect.width / 2, rect.top + rect.height);
        }
        
        e.preventDefault();
    }
    
    handleDragEnd = () => {
        this.isDragging = false;
        
        // Restore transitions and user selection
        this.spaceship.style.transition = 'all 0.3s ease';
        document.body.style.userSelect = '';
        
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.handleDragEnd);
        document.removeEventListener('touchmove', this.handleTouchDrag);
        document.removeEventListener('touchend', this.handleDragEnd);
        
        // Clear particles when drag ends
        setTimeout(() => {
            this.clearAllParticles();
        }, 100);
        
        // Reset hasDragged flag after a short delay to allow click event to check it
        setTimeout(() => {
            this.hasDragged = false;
        }, 50);
    }
    
    openChat() {
        this.modal.style.display = 'block';
        this.chatInput.focus();
        this.scrollToBottom();
    }
    
    closeChat() {
        this.modal.style.display = 'none';
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // Disable input while processing
        this.chatInput.disabled = true;
        this.sendBtn.disabled = true;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        
        // Show loading indicator
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                this.addMessage(data.response, 'assistant');
            } else {
                const errorMsg = data.error || 'Sorry, I encountered an error. Please try again.';
                this.addMessage(`❌ ${errorMsg}`, 'assistant');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage('❌ Network error. Please check your connection and try again.', 'assistant');
        } finally {
            // Re-enable input
            this.chatInput.disabled = false;
            this.sendBtn.disabled = false;
            this.showLoading(false);
            this.chatInput.focus();
        }
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `exoai-message exoai-${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'exoai-message-content';
        
        // Convert markdown-like formatting to HTML
        const formattedContent = this.formatMessage(content);
        contentDiv.innerHTML = formattedContent;
        
        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content
            // Headers
            .replace(/^## (.*$)/gm, '<h3 class="message-header">$1</h3>')
            .replace(/^# (.*$)/gm, '<h2 class="message-header">$1</h2>')
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Bullet points
            .replace(/^- (.*$)/gm, '<li class="message-bullet">$1</li>')
            // Line breaks
            .replace(/\n\n/g, '</p><p class="message-paragraph">')
            .replace(/\n/g, '<br>');
        
        // Wrap in paragraph tags and handle lists
        formatted = '<p class="message-paragraph">' + formatted + '</p>';
        
        // Convert bullet points to proper lists
        formatted = formatted.replace(/(<li class="message-bullet">.*?<\/li>)/gs, (match) => {
            const listItems = match.match(/<li class="message-bullet">.*?<\/li>/g);
            return '<ul class="message-list">' + listItems.join('') + '</ul>';
        });
        
        // Clean up empty paragraphs
        formatted = formatted.replace(/<p class="message-paragraph"><\/p>/g, '');
        
        return formatted;
    }
    
    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'flex' : 'none';
        if (show) {
            this.scrollToBottom();
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }
    
    // Particle system methods
    createParticle(x, y) {
        const now = Date.now();
        if (now - this.lastParticleTime < this.particleInterval) {
            return; // Throttle particle creation
        }
        this.lastParticleTime = now;
        
        // Reuse particle from pool or create new one
        let particle = this.particlePool.pop();
        if (!particle) {
            particle = document.createElement('div');
            particle.className = 'fire-particle';
        }
        
        // Randomize particle properties
        const size = Math.random() > 0.7 ? 'large' : (Math.random() > 0.3 ? '' : 'small');
        particle.className = `fire-particle ${size}`;
        
        // Position particle at spaceship location with some randomness
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 10;
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';
        
        this.particleContainer.appendChild(particle);
        this.particles.push(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            this.removeParticle(particle);
        }, 800);
        
        // Limit active particles
        if (this.particles.length > this.maxParticles) {
            this.removeParticle(this.particles[0]);
        }
    }
    
    removeParticle(particle) {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            // Return to pool for reuse
            if (this.particlePool.length < 20) {
                this.particlePool.push(particle);
            }
        }
    }
    
    clearAllParticles() {
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.particles = [];
    }
}

// Initialize ExoAI Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize existing functionality
    initializeMissionSelection();
    initializeUploadArea();
    initializeManualForm();
    
    // Initialize ExoAI Assistant
    window.exoAI = new ExoAIAssistant();
});

// Sample data download functionality
function downloadSampleData(mission) {
    const sampleData = {
        kepler: {
            filename: 'kepler_sample_data.csv',
            content: 'kepoi_name,kepler_name,koi_period,koi_impact,koi_duration,koi_depth,koi_prad,koi_teq,koi_insol,koi_dor,koi_count,koi_num_transits,koi_max_sngle_ev,koi_max_mult_ev,koi_model_snr,koi_tce_plnt_num,koi_steff,koi_srad\nK00001.01,Kepler-1b,4.887,0.5,2.5,0.001,1.2,1200,2000,12.5,1,100,5,3,15.2,1,6000,1.0\nK00002.01,Kepler-2b,2.5,0.3,3.1,0.002,1.5,1100,1800,10.8,1,80,4,2,12.8,1,5800,0.95'
        },
        tess: {
            filename: 'tess_sample_data.csv', 
            content: 'pl_name,pl_orbper,pl_trandur,pl_rade,pl_insol,pl_eqt,st_teff,st_logg,st_rad,st_tmag,sy_dist,pl_tranflag\nTOI-123b,6.3,3.2,2.1,800,950,4500,4.5,0.7,10.2,50,1\nTOI-456c,12.8,4.1,1.8,600,850,4200,4.6,0.65,11.5,60,1'
        },
        k2: {
            filename: 'k2_sample_data.csv',
            content: 'pl_name,pl_orbper,pl_orbsmax,pl_rade,pl_bmasse,pl_orbeccen,pl_insol,pl_eqt,pl_tranflag,pl_rvflag,pl_astflag,pl_cbflag,pl_angsep,pl_orbtper,st_refname,st_spectype,st_teff,st_rad,st_mass,st_met,st_metratio,st_logg,st_age,st_dens,st_lum,st_uj,st_vj,st_bj,st_rc,st_ic,sy_kepmag,sy_kmag\nK2-3b,10.1,0.08,2.2,8.5,0.05,900,920,1,0,0,0,0.02,2450000,"K2-3","K2V",4200,0.7,0.8,-0.1,0.0,4.6,5.0,1.2,0.3,10.5,11.2,12.1,10.8,11.5,12.3,11.8\nK2-18b,33.0,0.15,2.7,8.9,0.03,1100,950,1,0,0,0,0.03,2450000,"K2-18","M2V",3500,0.4,0.4,0.1,0.0,4.8,2.0,3.5,0.1,12.8,13.5,14.2,13.0,13.7,14.5,14.0'
        }
    };

    const data = sampleData[mission];
    if (!data) return;

    // Create a blob and download link
    const blob = new Blob([data.content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Manual form handling
function initializeManualForm() {
    if (!manualForm) return;
    
    // Initialize form fields for default mission
    updateManualFormFields(selectedMission);
    
    manualForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleManualPrediction();
    });
}

function handleManualPrediction() {
    const formData = new FormData(manualForm);
    
    // Convert FormData to JSON object
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Add mission and features to data object
    data.mission = selectedMission;
    data.features = selectedFeatures[selectedMission];
    
    // Add selected features if advanced options are used
    if (typeof window.getSelectedFeatures === 'function') {
        const customFeatures = window.getSelectedFeatures();
        data.selected_features = customFeatures;
    }
    
    showManualLoading(true);
    hideManualError();
    hideManualResult();
    
    fetch('/predict_manual', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        showManualLoading(false);
        if (result.error) {
            showManualError(result.error);
        } else {
            displayManualResult(result);
        }
    })
    .catch(error => {
        showManualLoading(false);
        showManualError('Error making prediction: ' + error.message);
    });
}

// Download functionality
function initializeDownloadButton() {
    if (!downloadBtn) return;
    
    downloadBtn.addEventListener('click', function() {
        if (currentResults.length === 0) {
            alert('No results to download');
            return;
        }
        
        fetch('/download_results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ results: currentResults })
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'exoplanet_predictions.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            alert('Error downloading results: ' + error.message);
        });
    });
}

// Table sorting functionality
function initializeTableSorting() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.sortable')) {
            const th = e.target.closest('.sortable');
            const column = parseInt(th.dataset.column);
            sortTable(column);
        }
    });
}

function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Update sort indicators
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    const currentTh = document.querySelector(`[data-column="${column}"]`);
    if (currentTh) {
        currentTh.classList.add(`sorted-${sortDirection}`);
    }
    
    // Sort the results
    currentResults.sort((a, b) => {
        let aVal, bVal;
        
        switch(column) {
            case 0: // Predicted Class
                aVal = a.Predicted_Class || '';
                bVal = b.Predicted_Class || '';
                break;
            case 1: // Confidence
                aVal = parseFloat(a.Confidence) || 0;
                bVal = parseFloat(b.Confidence) || 0;
                break;
            case 2: // Identifier 1
                aVal = a.kepoi_name || a.pl_name || '';
                bVal = b.kepoi_name || b.pl_name || '';
                break;
            case 3: // Identifier 2
                aVal = a.kepler_name || '';
                bVal = b.kepler_name || '';
                break;
            default:
                return 0;
        }
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
    
    // Re-render the table
    renderTable();
}

// Display functions
function displayResults(results, mission) {
    currentResults = results;
    renderTable();
    
    if (resultsCount) {
        resultsCount.textContent = `${results.length} predictions`;
    }
    
    showResults();
}

// Display batch results for simplified interface
function displayBatchResults(predictions) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsTableBody = document.getElementById('resultsTableBody');
    
    if (!resultsContainer || !resultsTableBody) return;
    
    resultsTableBody.innerHTML = '';
    
    predictions.forEach((prediction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><span class="badge ${prediction.prediction === 'CONFIRMED' ? 'bg-success' : 'bg-danger'}">${prediction.prediction}</span></td>
            <td>${(prediction.confidence * 100).toFixed(1)}%</td>
        `;
        resultsTableBody.appendChild(row);
    });
    
    resultsContainer.style.display = 'block';
}

function renderTable() {
    if (!resultsTableBody) return;
    
    resultsTableBody.innerHTML = '';
    
    currentResults.forEach(result => {
        const row = document.createElement('tr');
        
        // Predicted Class with color coding
        const classCell = document.createElement('td');
        const classBadge = document.createElement('span');
        classBadge.className = `badge ${getPredictionBadgeClass(result.Predicted_Class)}`;
        classBadge.textContent = result.Predicted_Class;
        classCell.appendChild(classBadge);
        row.appendChild(classCell);
        
        // Confidence
        const confidenceCell = document.createElement('td');
        confidenceCell.textContent = (result.Confidence * 100).toFixed(1) + '%';
        row.appendChild(confidenceCell);
        
        // Identifier columns (mission-specific)
        if (selectedMission === 'kepler') {
            // KepOI Name
            const koiCell = document.createElement('td');
            koiCell.textContent = result.kepoi_name || 'N/A';
            row.appendChild(koiCell);
            
            // Kepler Name
            const keplerCell = document.createElement('td');
            keplerCell.textContent = result.kepler_name || 'N/A';
            row.appendChild(keplerCell);
        } else if (selectedMission === 'k2') {
            // Planet Name
            const nameCell = document.createElement('td');
            nameCell.textContent = result.pl_name || 'N/A';
            row.appendChild(nameCell);
            
            // Empty cell for second identifier (K2 only has one identifier)
            const emptyCell = document.createElement('td');
            emptyCell.textContent = '';
            emptyCell.style.display = 'none'; // Hide since K2 only shows one identifier column
            row.appendChild(emptyCell);
        } else if (selectedMission === 'tess') {
            // TESS has toi identifier column
            const nameCell = document.createElement('td');
            nameCell.textContent = result.toi || 'N/A';
            row.appendChild(nameCell);
            
            const emptyCell = document.createElement('td');
            emptyCell.textContent = '';
            emptyCell.style.display = 'none'; // Hide second identifier column for TESS
            row.appendChild(emptyCell);
        }
        
        // Row ID column (always present for all missions)
        const rowIdCell = document.createElement('td');
        rowIdCell.textContent = result.RowID || result.row_id || result.Row_ID || 'N/A';
        row.appendChild(rowIdCell);
        
        resultsTableBody.appendChild(row);
    });
}

function displayManualResult(result) {
    if (!manualResult) return;
    
    // Use the correct elements from the HTML structure
    const predictionClass = document.getElementById('predictionClass');
    const predictionConfidence = document.getElementById('predictionConfidence');
    
    if (predictionClass && predictionConfidence) {
        // Set the prediction class
        predictionClass.textContent = result.prediction;
        predictionClass.className = `result-class ${getResultClass(result.prediction)}`;
        
        // Set the confidence
        predictionConfidence.textContent = `${(result.confidence * 100).toFixed(1)}%`;
        
        // Add probability breakdown if available
        if (result.probabilities) {
            addProbabilityBreakdown(result.probabilities);
        }
    }
    
    showManualResult();
}

function getResultClass(prediction) {
    // Return appropriate CSS class based on prediction
    if (prediction.includes('CONFIRMED') || prediction.includes('Confirmed Planet')) {
        return 'text-success';
    } else if (prediction.includes('CANDIDATE') || prediction.includes('Planet Candidate')) {
        return 'text-warning';
    } else {
        return 'text-danger';
    }
}

function addProbabilityBreakdown(probabilities) {
    // Find or create probability breakdown section
    let breakdownDiv = document.getElementById('probabilityBreakdown');
    if (!breakdownDiv) {
        breakdownDiv = document.createElement('div');
        breakdownDiv.id = 'probabilityBreakdown';
        breakdownDiv.className = 'probability-breakdown';
        
        const resultCard = manualResult.querySelector('.result-card');
        if (resultCard) {
            resultCard.appendChild(breakdownDiv);
        }
    }
    
    // Clear existing content
    breakdownDiv.innerHTML = '<h6 class="breakdown-title">Probability Breakdown:</h6>';
    
    // Add each probability
    Object.entries(probabilities).forEach(([className, probability]) => {
        const probItem = document.createElement('div');
        probItem.className = 'prob-item';
        probItem.innerHTML = `
            <span class="prob-label">${className}:</span>
            <span class="prob-value">${(probability * 100).toFixed(1)}%</span>
            <div class="prob-bar">
                <div class="prob-fill" style="width: ${probability * 100}%"></div>
            </div>
        `;
        breakdownDiv.appendChild(probItem);
    });
}

// Display manual result for simplified interface
function displaySimpleManualResult(data) {
    const resultDiv = document.getElementById('manualResult');
    const predictionClass = document.getElementById('predictionClass');
    const predictionConfidence = document.getElementById('predictionConfidence');
    
    if (resultDiv && predictionClass && predictionConfidence) {
        predictionClass.textContent = data.prediction;
        predictionClass.className = `result-class ${data.prediction === 'CONFIRMED' ? 'text-success' : 'text-danger'}`;
        predictionConfidence.textContent = `${(data.confidence * 100).toFixed(1)}%`;
        
        resultDiv.style.display = 'block';
    }
}

// Utility functions
function getPredictionBadgeClass(prediction) {
    const classMap = {
        'CONFIRMED': 'bg-success',
        'CANDIDATE': 'bg-primary',
        'FALSE POSITIVE': 'bg-danger',
        'FALSE ALARM': 'bg-warning',
        'ASTROPHYSICAL FALSE POSITIVE': 'bg-secondary',
        'UNKNOWN': 'bg-dark',
        // TESS-specific classes
        'Confirmed Planet': 'bg-success',
        'Planet Candidate': 'bg-primary',
        'Known Planet': 'bg-success',
        'CP': 'bg-success',
        'PC': 'bg-primary',
        'KP': 'bg-success',
        'FP': 'bg-danger',
        'AFP': 'bg-secondary',
        // K2-specific classes
        'PLANET/CANDIDATE': 'bg-primary',
        'NOT PLANET': 'bg-danger'
    };
    
    return classMap[prediction] || 'bg-secondary';
}

function getPredictionGradient(prediction) {
    const gradientMap = {
        'CONFIRMED': 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        'CANDIDATE': 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
        'FALSE POSITIVE': 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
        'FALSE ALARM': 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
        'ASTROPHYSICAL FALSE POSITIVE': 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
        'UNKNOWN': 'linear-gradient(135deg, #343a40 0%, #212529 100%)',
        // TESS-specific classes
        'Confirmed Planet': 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        'Planet Candidate': 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
        'Known Planet': 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        'CP': 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        'PC': 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
        'KP': 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        'FP': 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
        'AFP': 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
        // K2-specific classes
        'PLANET/CANDIDATE': 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
        'NOT PLANET': 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)'
    };
    
    return gradientMap[prediction] || 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
}

// Show/hide functions
function showLoading(show) {
    if (csvLoading) {
        csvLoading.style.display = show ? 'block' : 'none';
    }
}

function showManualLoading(show) {
    if (manualLoading) {
        manualLoading.style.display = show ? 'block' : 'none';
    }
}

function showResults() {
    if (csvResults) {
        csvResults.style.display = 'block';
    }
}

function hideResults() {
    if (csvResults) {
        csvResults.style.display = 'none';
    }
}

function showManualResult() {
    if (manualResult) {
        manualResult.style.display = 'block';
    }
}

function hideManualResult() {
    if (manualResult) {
        manualResult.style.display = 'none';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error') || csvError;
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function hideError() {
    if (csvError) {
        csvError.style.display = 'none';
    }
}

function showManualError(message) {
    const errorDiv = document.getElementById('manualError') || manualError;
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function hideManualError() {
    if (manualError) {
        manualError.style.display = 'none';
    }
}

// Tooltip functionality
function initializeTooltips() {
    // Initialize tooltips for column info icons
    const tooltipIcons = document.querySelectorAll('.column-info-icon');
    let activeTooltip = null;
    
    tooltipIcons.forEach(icon => {
        const container = icon.closest('.column-tooltip-container');
        const tooltip = container.querySelector('.column-tooltip');
        
        if (tooltip) {
            // Click handler - toggle tooltip and keep it open
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close any other active tooltip
                if (activeTooltip && activeTooltip !== tooltip) {
                    activeTooltip.classList.remove('show');
                }
                
                // Toggle current tooltip
                if (tooltip.classList.contains('show')) {
                    tooltip.classList.remove('show');
                    activeTooltip = null;
                } else {
                    tooltip.classList.add('show');
                    activeTooltip = tooltip;
                }
            });
            
            // Hover handlers for better UX when not clicked
            icon.addEventListener('mouseenter', () => {
                if (!tooltip.classList.contains('show')) {
                    tooltip.style.visibility = 'visible';
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'translateX(-50%) scale(1)';
                }
            });
            
            icon.addEventListener('mouseleave', () => {
                if (!tooltip.classList.contains('show')) {
                    tooltip.style.visibility = 'hidden';
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateX(-50%) scale(0.95)';
                }
            });
            
            // Keep tooltip open when hovering over it
            tooltip.addEventListener('mouseenter', () => {
                if (!tooltip.classList.contains('show')) {
                    tooltip.style.visibility = 'visible';
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'translateX(-50%) scale(1)';
                }
            });
            
            tooltip.addEventListener('mouseleave', () => {
                if (!tooltip.classList.contains('show')) {
                    tooltip.style.visibility = 'hidden';
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateX(-50%) scale(0.95)';
                }
            });
            
            // Prevent tooltip from closing when clicking inside it
            tooltip.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    });
    
    // Close tooltip when clicking outside
    document.addEventListener('click', (e) => {
        if (activeTooltip && !activeTooltip.contains(e.target)) {
            const container = activeTooltip.closest('.column-tooltip-container');
            const icon = container.querySelector('.column-info-icon');
            
            if (!icon.contains(e.target)) {
                activeTooltip.classList.remove('show');
                activeTooltip = null;
            }
        }
    });
}