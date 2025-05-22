// Bluetooth connection handling
let bluetoothDevice = null;
let bluetoothServer = null;
let gattCharacteristic = null;
let isConnected = false;

document.addEventListener('DOMContentLoaded', function() {
  const connectBtn = document.getElementById('connectBtn');
  const statusIndicator = document.getElementById('statusIndicator');
  const connectionText = document.getElementById('connectionText');

  if (connectBtn && statusIndicator && connectionText) {
    // Check if the browser supports Web Bluetooth
    if ('bluetooth' in navigator) {
      connectBtn.addEventListener('click', connectToInsoles);
    } else {
      connectBtn.textContent = 'Bluetooth Not Supported';
      connectBtn.disabled = true;
      connectionText.textContent = 'Browser does not support Bluetooth';
      console.error('Web Bluetooth API is not supported in this browser');
    }

    // Restore connection status from session
    if (sessionStorage.getItem('bluetoothConnected') === 'true') {
      updateConnectionStatus(true);
    } else {
      updateConnectionStatus(false);
    }
  }
});

// Connect to insoles via Bluetooth
async function connectToInsoles() {
  if (isConnected) {
    try {
      await disconnectFromInsoles();
      return;
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  try {
    // Show connecting status
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
      connectBtn.textContent = 'Connecting...';
      connectBtn.disabled = true;
    }
    
    // Request device with appropriate filters
    // Note: In a real application, you would need to know the specific service UUIDs
    // This is a generic example and will need to be updated with actual service UUIDs
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'NHS' }],
      // Replace with actual service UUIDs for the insole device
      optionalServices: ['battery_service', '0000180a-0000-1000-8000-00805f9b34fb']
    });

    if (!bluetoothDevice) {
      throw new Error('No device selected');
    }

    // Add event listener for disconnection
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
    
    // Connect to GATT server
    console.log('Connecting to GATT Server...');
    bluetoothServer = await bluetoothDevice.gatt.connect();
    
    // Here we would get the specific service and characteristics
    // This is placeholder code that needs to be adapted to the actual insole device
    try {
      const batteryService = await bluetoothServer.getPrimaryService('battery_service');
      const batteryLevel = await batteryService.getCharacteristic('battery_level');
      
      // Read battery level
      const value = await batteryLevel.readValue();
      const battery = value.getUint8(0);
      console.log(`Battery level: ${battery}%`);
      
      // Update battery display if on settings page
      const batteryPercentage = document.getElementById('batteryPercentage');
      const batteryLevelIndicator = document.getElementById('batteryLevel');
      if (batteryPercentage && batteryLevelIndicator) {
        batteryPercentage.textContent = `${battery}%`;
        batteryLevelIndicator.style.width = `${battery}%`;
      }
    } catch (error) {
      console.log('Battery service not available:', error);
    }
    
    // Update connection status
    updateConnectionStatus(true);
    showNotification(`Connected to ${bluetoothDevice.name}`);
    
    // Store connection status in session
    sessionStorage.setItem('bluetoothConnected', 'true');
    
    return bluetoothServer;
  } catch (error) {
    console.error('Bluetooth connection error:', error);
    updateConnectionStatus(false);
    showNotification('Connection failed: ' + (error.message || 'Unknown error'));
    
    return null;
  } finally {
    // Reset button state
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
      connectBtn.disabled = false;
      connectBtn.textContent = isConnected ? 'Disconnect' : 'Connect Insoles';
    }
  }
}

// Handle disconnection
function onDisconnected(event) {
  console.log('Bluetooth Device disconnected');
  updateConnectionStatus(false);
  
  // Clear session storage
  sessionStorage.removeItem('bluetoothConnected');
  
  // Show notification
  if (event.type === 'gattserverdisconnected') {
    showNotification('Device disconnected');
  }
}

// Disconnect from insoles
async function disconnectFromInsoles() {
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  }
  
  bluetoothDevice = null;
  bluetoothServer = null;
  gattCharacteristic = null;
  
  updateConnectionStatus(false);
  showNotification('Disconnected from device');
  
  // Clear session storage
  sessionStorage.removeItem('bluetoothConnected');
  
  return true;
}

// Update UI to reflect connection status
function updateConnectionStatus(connected) {
  isConnected = connected;
  
  const statusIndicator = document.getElementById('statusIndicator');
  const connectionText = document.getElementById('connectionText');
  const connectBtn = document.getElementById('connectBtn');
  
  if (statusIndicator && connectionText && connectBtn) {
    if (connected) {
      statusIndicator.classList.remove('disconnected');
      statusIndicator.classList.add('connected');
      connectionText.textContent = 'Connected';
      connectBtn.textContent = 'Disconnect';
    } else {
      statusIndicator.classList.remove('connected');
      statusIndicator.classList.add('disconnected');
      connectionText.textContent = 'Not Connected';
      connectBtn.textContent = 'Connect Insoles';
    }
  }
}

// Send data to the insole device
async function sendToInsole(data) {
  if (!isConnected || !gattCharacteristic) {
    console.error('Not connected or characteristic not available');
    return false;
  }
  
  try {
    // Convert data to ArrayBuffer for sending
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    await gattCharacteristic.writeValue(dataBuffer);
    console.log('Data sent to insole:', data);
    return true;
  } catch (error) {
    console.error('Error sending data to insole:', error);
    return false;
  }
}

// Receive data from the insole device
async function setupNotifications(callback) {
  if (!isConnected || !gattCharacteristic) {
    console.error('Not connected or characteristic not available');
    return false;
  }
  
  try {
    // Start notifications
    await gattCharacteristic.startNotifications();
    
    // Add event listener for when characteristic value changes
    gattCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
      const value = event.target.value;
      const decoder = new TextDecoder();
      const data = JSON.parse(decoder.decode(value));
      
      console.log('Data received from insole:', data);
      
      // Call the callback function with the received data
      if (callback && typeof callback === 'function') {
        callback(data);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
}

// Check if we're connected (can be called from other scripts)
function isInsoleConnected() {
  return isConnected;
}
