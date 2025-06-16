// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenuBtn = document.querySelector('.close-menu');
  
    if (mobileMenuBtn && mobileMenu && closeMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.add('active');
      });
  
      closeMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
      });
    }
  
    // Save settings in localStorage
    const saveSettings = function() {
      // Get current settings
      const settings = {
        vibrationIntensity: document.getElementById('vibrationIntensity')?.value || 5,
        vibrationDuration: document.getElementById('vibrationDuration')?.value || 300,
        feedbackMode: document.querySelector('input[name="feedbackMode"]:checked')?.value || 'vibrate',
        deviceName: document.getElementById('deviceName')?.value || 'StepUp Insole',
        childName: document.getElementById('childName')?.value || '',
        childAge: document.getElementById('childAge')?.value || '',
        footSize: document.getElementById('footSize')?.value || ''
      };
  
      localStorage.setItem('stepUpSettings', JSON.stringify(settings));
      console.log('Settings saved:', settings);
      
      // Show save confirmation
      showNotification('Settings saved successfully');
    };
  
    // Load settings from localStorage
    const loadSettings = function() {
      const savedSettings = localStorage.getItem('stepUpSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          console.log('Loading saved settings:', settings);
          
          // Apply settings to UI elements
          const vibrationIntensity = document.getElementById('vibrationIntensity');
          if (vibrationIntensity) {
            vibrationIntensity.value = settings.vibrationIntensity || 5;
            document.getElementById('intensityValue').textContent = settings.vibrationIntensity || 5;
          }
          
          const vibrationDuration = document.getElementById('vibrationDuration');
          if (vibrationDuration) {
            vibrationDuration.value = settings.vibrationDuration || 300;
            document.getElementById('durationValue').textContent = settings.vibrationDuration || 300;
          }
          
          const feedbackMode = document.querySelector(`input[name="feedbackMode"][value="${settings.feedbackMode || 'vibrate'}"]`);
          if (feedbackMode) {
            feedbackMode.checked = true;
          }
          
          const deviceName = document.getElementById('deviceName');
          if (deviceName) {
            deviceName.value = settings.deviceName || 'StepUp Insole';
          }
          
          const childName = document.getElementById('childName');
          if (childName) {
            childName.value = settings.childName || '';
          }
          
          const childAge = document.getElementById('childAge');
          if (childAge) {
            childAge.value = settings.childAge || '';
          }
          
          const footSize = document.getElementById('footSize');
          if (footSize) {
            footSize.value = settings.footSize || '';
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    };
  
    // Initialize UI values from settings
    loadSettings();
  
    // Add event listeners for settings page
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', saveSettings);
    }
  
    const saveProfileBtn = document.getElementById('saveProfile');
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', saveSettings);
    }
  
    // Intensity slider update
    const intensitySlider = document.getElementById('vibrationIntensity');
    const intensityValue = document.getElementById('intensityValue');
    if (intensitySlider && intensityValue) {
      intensitySlider.addEventListener('input', function() {
        intensityValue.textContent = this.value;
      });
    }
  
    // Duration slider update
    const durationSlider = document.getElementById('vibrationDuration');
    const durationValue = document.getElementById('durationValue');
    if (durationSlider && durationValue) {
      durationSlider.addEventListener('input', function() {
        durationValue.textContent = this.value;
      });
    }
  
    // Export data functionality
    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', function() {
        exportUserData();
      });
    }
  
    // Reset device functionality
    const resetDeviceBtn = document.getElementById('resetDevice');
    if (resetDeviceBtn) {
      resetDeviceBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the device to factory settings?')) {
          resetDevice();
        }
      });
    }
  
    // Check for updates
    const checkUpdateBtn = document.getElementById('checkUpdate');
    if (checkUpdateBtn) {
      checkUpdateBtn.addEventListener('click', function() {
        checkForUpdates();
      });
    }
  });
  
  // Show notification
  function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    // Update message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  
  // Export user data as JSON file
  function exportUserData() {
    // Generate mock data
    const userData = {
      profile: {
        name: document.getElementById('childName')?.value || 'User',
        age: document.getElementById('childAge')?.value || 'Unknown',
        footSize: document.getElementById('footSize')?.value || 'Medium'
      },
      stats: {
        totalSteps: 24680,
        heelStrikePercentage: 76,
        totalUsageHours: 127,
        dailyAverageSteps: 1234,
        weeklyProgress: [65, 68, 70, 73, 75, 76, 78]
      },
      settings: JSON.parse(localStorage.getItem('stepUpSettings') || '{}'),
      exportDate: new Date().toISOString()
    };
    
    // Create downloadable file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "stepup_data_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showNotification('Data exported successfully');
  }
  
  // Reset device function
  function resetDevice() {
    // Clear settings
    localStorage.removeItem('stepUpSettings');
    
    // Reset UI to defaults
    const vibrationIntensity = document.getElementById('vibrationIntensity');
    if (vibrationIntensity) {
      vibrationIntensity.value = 5;
      document.getElementById('intensityValue').textContent = 5;
    }
    
    const vibrationDuration = document.getElementById('vibrationDuration');
    if (vibrationDuration) {
      vibrationDuration.value = 300;
      document.getElementById('durationValue').textContent = 300;
    }
    
    const vibrateMode = document.getElementById('vibrateMode');
    if (vibrateMode) {
      vibrateMode.checked = true;
    }
    
    const deviceName = document.getElementById('deviceName');
    if (deviceName) {
      deviceName.value = 'StepUp Insole';
    }
    
    // Show confirmation
    showNotification('Device reset to factory settings');
  }
  
  // Check for firmware updates
  function checkForUpdates() {
    // Simulate checking for updates
    showNotification('Checking for updates...');
    
    // Show result after 2 seconds (simulated check)
    setTimeout(() => {
      showNotification('Your firmware is up to date (v1.0.2)');
    }, 2000);
  }
  