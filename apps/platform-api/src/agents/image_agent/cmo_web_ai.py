from flask import Flask, render_template, request, jsonify, send_from_directory
import requests
import os
import time
import threading
from PIL import Image
import io

app = Flask(__name__)

class CMOWebAgent:
    def __init__(self):
        self.model_loaded = False
        
    def load_model(self):
        # Simulate model loading
        time.sleep(2)
        self.model_loaded = True
        return True
    
    def optimize_prompt(self, startup_info):
        # Create optimized prompt for image generation
        prompt = f"professional marketing poster with a {startup_info['brand_style']} style, industry type: {startup_info['industry']}, {startup_info['image_description']}, high quality, detailed, commercial design. make sure that there is no text on the image"
        return prompt
    
    def generate_image(self, startup_info):
        try:
            # Create static directory if it doesn't exist
            os.makedirs("static", exist_ok=True)
            
            # Clean filename
            clean_name = startup_info['startup_name'].strip().replace(' ', '_').replace('\n', '').replace('\r', '')
            invalid_chars = '<>:"/\\|?*'
            for char in invalid_chars:
                clean_name = clean_name.replace(char, '_')
            
            filename = f"static/{clean_name}_marketing.png"
            
            # Generate prompt
            prompt = self.optimize_prompt(startup_info)
            
            # Use Pollinations AI (free API)
            api_url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}?width=512&height=512&model=flux"
            
            # Download generated image
            response = requests.get(api_url, timeout=30)
            
            if response.status_code == 200:
                # Save the image
                with open(filename, 'wb') as f:
                    f.write(response.content)
                return filename, "Marketing image generated successfully!"
            else:
                return None, f"API request failed with status {response.status_code}"
                
        except Exception as e:
            return None, str(e)

# Global agent instance
cmo_agent = CMOWebAgent()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/load_model', methods=['POST'])
def load_model():
    def load_in_background():
        cmo_agent.load_model()
    
    if not cmo_agent.model_loaded:
        threading.Thread(target=load_in_background, daemon=True).start()
        return jsonify({"status": "loading", "message": "AI model loading..."})
    else:
        return jsonify({"status": "loaded", "message": "AI model ready!"})

@app.route('/check_model_status', methods=['GET'])
def check_model_status():
    if cmo_agent.model_loaded:
        return jsonify({"status": "loaded", "message": "AI model loaded! Ready to generate"})
    else:
        return jsonify({"status": "loading", "message": "AI model still loading..."})

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    
    # Validate input
    required_fields = ['startup_name', 'industry', 'target_audience', 'brand_style', 'image_description']
    if not all(field in data and data[field].strip() for field in required_fields):
        return jsonify({"status": "error", "message": "Please fill all fields"})
    
    startup_info = {
        'startup_name': data['startup_name'],
        'industry': data['industry'],
        'target_audience': data['target_audience'],
        'brand_style': data['brand_style'],
        'image_description': data['image_description']
    }
    
    try:
        filename, message = cmo_agent.generate_image(startup_info)
        if filename:
            return jsonify({
                "status": "success", 
                "message": message,
                "image_url": f"/{filename}"
            })
        else:
            return jsonify({"status": "error", "message": message})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Generation failed: {str(e)}"})

@app.route('/static/<filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)