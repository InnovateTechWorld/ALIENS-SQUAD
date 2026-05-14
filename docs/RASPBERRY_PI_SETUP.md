# Raspberry Pi Integration Guide

This guide explains how to integrate the Raspberry Pi hardware with the RecyclePay Next.js backend.

---

## Overview

The Raspberry Pi acts as the "physical hands and eyes" of the system:
- **Eyes**: Camera + Gemini Flash AI to verify bottles
- **Hands**: Servo motors (SG90/MG996R) to control bin mechanism
- **Brain**: Python script that watches Supabase and calls the Next.js API

---

## Hardware Requirements

- Raspberry Pi 4 (or Pi 3B+)
- Camera Module or USB Webcam
- SG90 or MG996R Servo Motor
- Power supply (5V 3A recommended)
- SD Card (16GB+)

---

## Software Setup

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python dependencies
pip3 install supabase picamera2 google-generativeai requests python-dotenv RPi.GPIO

# For USB camera (if not using Pi Camera)
pip3 install opencv-python
```

### 2. Configure Environment Variables

Create `.env` file on the Pi:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
NEXTJS_API_URL=https://your-app.com
BIN_ID=001
```

---

## Python Script

Create `recycle_bin.py`:

```python
#!/usr/bin/env python3
import os
import time
import requests
from supabase import create_client, Client
from google import generativeai as genai
import RPi.GPIO as GPIO
from picamera2 import Picamera2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
NEXTJS_API_URL = os.getenv('NEXTJS_API_URL')
BIN_ID = os.getenv('BIN_ID', '001')

# GPIO Setup for Servo
SERVO_PIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(SERVO_PIN, GPIO.OUT)
servo = GPIO.PWM(SERVO_PIN, 50)  # 50Hz frequency
servo.start(0)

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Initialize Camera
camera = Picamera2()
camera.configure(camera.create_still_configuration())
camera.start()

print(f"🟢 Bin {BIN_ID} is idle. Waiting for user...")

def open_door():
    """Open the bin door using servo"""
    servo.ChangeDutyCycle(7.5)  # 90 degrees
    time.sleep(1)
    servo.ChangeDutyCycle(0)

def close_door():
    """Close the bin door"""
    servo.ChangeDutyCycle(2.5)  # 0 degrees
    time.sleep(1)
    servo.ChangeDutyCycle(0)

def capture_image():
    """Capture an image from the camera"""
    image_path = '/tmp/bottle.jpg'
    camera.capture_file(image_path)
    return image_path

def verify_bottle_with_gemini(image_path):
    """
    Use Gemini Flash to verify if the image contains a recyclable bottle
    """
    try:
        with open(image_path, 'rb') as img_file:
            image_data = img_file.read()
        
        prompt = """
        Analyze this image and determine if it contains a plastic bottle or recyclable container.
        Respond with ONLY "YES" if you see a clear plastic bottle, glass bottle, or aluminum can.
        Respond with "NO" if you see anything else (trash, food, hands, etc).
        Be strict - only accept clean, recognizable bottles/cans.
        """
        
        response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_data}])
        result = response.text.strip().upper()
        
        return "YES" in result
    except Exception as e:
        print(f"❌ Gemini error: {e}")
        return False

def notify_nextjs_success(bin_id):
    """
    Call the Next.js API to process the reward
    """
    try:
        response = requests.post(
            f"{NEXTJS_API_URL}/api/recycle-success",
            json={"bin_id": bin_id},
            timeout=10
        )
        return response.status_code == 200
    except Exception as e:
        print(f"❌ API call failed: {e}")
        return False

def check_for_active_session():
    """
    Check if there's an active session for this bin
    """
    try:
        response = supabase.table('active_sessions').select('*').eq('bin_id', BIN_ID).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"❌ Supabase error: {e}")
        return None

def main_loop():
    """
    Main loop: Watch for sessions, verify bottles, process rewards
    """
    print(f"🔍 Monitoring Supabase for Bin {BIN_ID}...")
    
    while True:
        try:
            # Check for active session
            session = check_for_active_session()
            
            if session:
                user_phone = session['user_phone']
                print(f"✅ User {user_phone} checked in!")
                print("📸 Waiting for bottle...")
                
                # Open door
                open_door()
                
                # Wait for user to insert bottle
                time.sleep(3)
                
                # Capture image
                print("📸 Capturing image...")
                image_path = capture_image()
                
                # Verify with Gemini
                print("🤖 Verifying with Gemini AI...")
                is_valid = verify_bottle_with_gemini(image_path)
                
                if is_valid:
                    print("✅ Bottle verified!")
                    
                    # Close door
                    close_door()
                    
                    # Notify Next.js backend
                    print("💰 Processing reward...")
                    success = notify_nextjs_success(BIN_ID)
                    
                    if success:
                        print(f"🎉 ₦10 sent to {user_phone}!")
                    else:
                        print("❌ Failed to process reward")
                else:
                    print("❌ Invalid item detected. Rejected.")
                    close_door()
                
                # Clean up
                os.remove(image_path)
                
                print(f"🟢 Bin {BIN_ID} is idle again.")
            
            # Poll every 2 seconds
            time.sleep(2)
            
        except KeyboardInterrupt:
            print("\n🛑 Shutting down...")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            time.sleep(5)
    
    # Cleanup
    servo.stop()
    GPIO.cleanup()
    camera.stop()

if __name__ == "__main__":
    main_loop()
```

---

## Running the Script

### Test Mode (Without Hardware)

Comment out GPIO and camera code, use a test image:

```bash
python3 recycle_bin.py
```

### Production Mode

```bash
# Make executable
chmod +x recycle_bin.py

# Run in background
nohup python3 recycle_bin.py > /var/log/recycle_bin.log 2>&1 &

# Or use systemd service (recommended)
```

---

## Systemd Service (Auto-start on Boot)

Create `/etc/systemd/system/recycle-bin.service`:

```ini
[Unit]
Description=RecyclePay Bin Monitor
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/recycle-pay
ExecStart=/usr/bin/python3 /home/pi/recycle-pay/recycle_bin.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable recycle-bin.service
sudo systemctl start recycle-bin.service
sudo systemctl status recycle-bin.service
```

---

## Troubleshooting

### Camera Not Working
```bash
# Enable camera
sudo raspi-config
# Navigate to Interface Options > Camera > Enable

# Test camera
libcamera-hello
```

### GPIO Permissions
```bash
sudo usermod -a -G gpio pi
```

### Network Issues
```bash
# Test API connectivity
curl https://your-app.com/api/users/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"+2348012345678"}'
```

---

## Hardware Wiring

### Servo Motor Connection

| Servo Wire | Pi GPIO |
|------------|---------|
| Red (VCC)  | 5V Pin 2 |
| Brown (GND)| GND Pin 6 |
| Orange (Signal) | GPIO 18 (Pin 12) |

### Camera Connection

For Raspberry Pi Camera Module:
- Connect ribbon cable to Camera port (CSI)
- Ensure contacts are facing toward the HDMI port

---

## Testing Flow

1. **Start Pi script**: Should print "Bin is idle"
2. **Open web app**: Go to `/bin/001`
3. **Start session**: Enter phone number
4. **Pi detects session**: "User checked in!"
5. **Show bottle to camera**: Door opens
6. **Gemini verifies**: "Bottle verified!"
7. **Reward processed**: "₦10 sent!"
8. **Check dashboard**: Balance updated

---

## Production Optimization

1. **Use motion sensor**: Only capture when object detected
2. **Add LED indicators**: Show bin status visually
3. **Implement retry logic**: Handle network failures gracefully
4. **Log everything**: Use proper logging instead of print
5. **Add authentication**: Secure the API endpoint with API keys

---

## Alternative: Using Webhooks

Instead of polling, use Supabase real-time subscriptions:

```python
def on_session_insert(payload):
    print(f"New session: {payload}")
    # Process bottle verification

supabase.table('active_sessions').on('INSERT', on_session_insert).subscribe()
```

This is more efficient than polling every 2 seconds.

---

**The Pi is now the eyes and hands. The Next.js app is the brain. Together, they make recycling magical! ♻️**
