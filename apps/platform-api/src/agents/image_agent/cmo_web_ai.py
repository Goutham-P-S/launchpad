from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import threading
from cmo_agent import CMOAgent

app = Flask(__name__)
CORS(app)

class CMOWebAgent:
    def __init__(self):
        self.model_loaded = False
        self.agent = None
        
    def load_model(self):
        try:
            self.agent = CMOAgent()
            self.model_loaded = True
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def generate_image(self, startup_info):
        if not self.model_loaded or not self.agent:
            return None, "Model is not loaded yet. Please wait!"
            
        try:
            os.makedirs("static", exist_ok=True)
            
            # Use the local model directly
            filename = self.agent.generate_image(startup_info)
            
            # Move file to static dir if needed
            if not filename.startswith("static/"):
                import shutil
                new_filename = f"static/{filename}"
                shutil.move(filename, new_filename)
                filename = new_filename
                
            return filename, "Marketing image generated successfully via Local SD!"
        except Exception as e:
            return None, str(e)

# Global agent instance
cmo_agent = CMOWebAgent()

# Auto-load the model in the background when the server starts
def auto_load_model():
    print("Auto-loading Stable Diffusion Model in background...")
    cmo_agent.load_model()

threading.Thread(target=auto_load_model, daemon=True).start()

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