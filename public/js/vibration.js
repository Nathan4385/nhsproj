// Vibration control functionality
document.addEventListener('DOMContentLoaded', function() {
    const testVibrationBtn = document.getElementById('testVibration');
    if (testVibrationBtn) {
      testVibrationBtn.addEventListener('click', testVibration);
    }
    
    // Update vibration settings when sliders change
    const intensitySlider = document.getElementById('vibrationIntensity');
    if (intensitySlider) {
      intensitySlider.addEventListener('change', updateVibrationSettings);
    }
    
    const durationSlider = document.getElementById('vibrationDuration');
    if (durationSlider) {
      durationSlider.addEventListener('change', updateVibrationSettings);
    }
    
    // Update settings when feedback mode changes
    const feedbackOptions = document.querySelectorAll('input[name="feedbackMode"]');
    if (feedbackOptions) {
      feedbackOptions.forEach(option => {
        option.addEventListener('change', updateFeedbackMode);
      });
    }
  });
  
  // Test vibration functionality
  async function testVibration() {
    // Check if connected to insole
    if (!isInsoleConnected()) {
      showNotification('Please connect to the insole first');
      return;
    }
    
    const intensity = document.getElementById('vibrationIntensity')?.value || 5;
    const duration = document.getElementById('vibrationDuration')?.value || 300;
    
    // Send vibration command to insole
    try {
      const vibrationData = {
        command: 'vibrate',
        intensity: parseInt(intensity),
        duration: parseInt(duration)
      };
      
      const result = await sendToInsole(vibrationData);
      
      if (result) {
        showNotification(`Testing vibration: Intensity ${intensity}, Duration ${duration}ms`);
        
        // Also trigger device vibration if supported (just as feedback)
        if ('vibrate' in navigator) {
          navigator.vibrate(parseInt(duration));
        }
      } else {
        showNotification('Failed to send vibration command to insole');
      }
    } catch (error) {
      console.error('Error testing vibration:', error);
      showNotification('Error: ' + (error.message || 'Unknown error'));
    }
  }
  
  // Update vibration settings
  async function updateVibrationSettings() {
    const intensity = document.getElementById('vibrationIntensity')?.value || 5;
    const duration = document.getElementById('vibrationDuration')?.value || 300;
    
    // If connected to insole, send new settings
    if (isInsoleConnected()) {
      try {
        const settingsData = {
          command: 'updateSettings',
          settings: {
            vibrationIntensity: parseInt(intensity),
            vibrationDuration: parseInt(duration)
          }
        };
        
        const result = await sendToInsole(settingsData);
        
        if (result) {
          console.log('Vibration settings updated on device');
        }
      } catch (error) {
        console.error('Error updating vibration settings:', error);
      }
    }
    
    // Always save to local storage
    const currentSettings = JSON.parse(localStorage.getItem('stepUpSettings') || '{}');
    currentSettings.vibrationIntensity = intensity;
    currentSettings.vibrationDuration = duration;
    localStorage.setItem('stepUpSettings', JSON.stringify(currentSettings));
  }
  
  // Update feedback mode
  async function updateFeedbackMode(event) {
    const mode = event.target.value;
    
    // If connected to insole, send new mode
    if (isInsoleConnected()) {
      try {
        const modeData = {
          command: 'setMode',
          mode: mode
        };
        
        const result = await sendToInsole(modeData);
        
        if (result) {
          showNotification(`Feedback mode set to: ${mode}`);
        }
      } catch (error) {
        console.error('Error updating feedback mode:', error);
      }
    } else {
      showNotification(`Feedback mode set to: ${mode} (device not connected)`);
    }
    
    // Always save to local storage
    const currentSettings = JSON.parse(localStorage.getItem('stepUpSettings') || '{}');
    currentSettings.feedbackMode = mode;
    localStorage.setItem('stepUpSettings', JSON.stringify(currentSettings));
    
    // Update UI based on selected mode
    updateUIForFeedbackMode(mode);
  }
  
  // Update UI based on selected feedback mode
  function updateUIForFeedbackMode(mode) {
    const vibrationSection = document.querySelector('.vibration-control');
    
    switch (mode) {
      case 'sound':
        if (vibrationSection) {
          vibrationSection.style.opacity = '0.5';
          document.getElementById('vibrationIntensity').disabled = true;
          document.getElementById('vibrationDuration').disabled = true;
          document.getElementById('testVibration').disabled = true;
          document.getElementById('testVibration').textContent = 'Test Sound';
        }
        break;
        
      case 'game':
        if (vibrationSection) {
          vibrationSection.style.opacity = '0.5';
          document.getElementById('vibrationIntensity').disabled = true;
          document.getElementById('vibrationDuration').disabled = true;
          document.getElementById('testVibration').disabled = true;
          document.getElementById('testVibration').textContent = 'Test Game Interaction';
        }
        break;
        
      case 'vibrate':
      default:
        if (vibrationSection) {
          vibrationSection.style.opacity = '1';
          document.getElementById('vibrationIntensity').disabled = false;
          document.getElementById('vibrationDuration').disabled = false;
          document.getElementById('testVibration').disabled = false;
          document.getElementById('testVibration').textContent = 'Test Vibration';
        }
        break;
    }
  }
  