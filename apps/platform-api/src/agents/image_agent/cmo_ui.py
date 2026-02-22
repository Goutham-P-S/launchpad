import tkinter as tk
from tkinter import ttk, messagebox
from diffusers import StableDiffusionPipeline
from transformers import CLIPTokenizer
import torch
import threading
from PIL import Image, ImageTk

class CMOAgentUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("CMO Agent - Marketing Image Generator")
        self.root.geometry("1000x700")
        self.root.configure(bg='#f0f0f0')
        
        self.pipe = None
        self.current_image = None
        self.setup_ui()
        
    def setup_ui(self):
        # Main container
        main_frame = tk.Frame(self.root, bg='#f0f0f0', padx=20, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title = tk.Label(main_frame, text="CMO Agent", font=("Arial", 24, "bold"), 
                        bg='#f0f0f0', fg='#2c3e50')
        title.pack(pady=(0, 10))
        
        subtitle = tk.Label(main_frame, text="Marketing Image Generator", 
                           font=("Arial", 12), bg='#f0f0f0', fg='#7f8c8d')
        subtitle.pack(pady=(0, 20))
        
        # Content container - side by side layout
        content_frame = tk.Frame(main_frame, bg='#f0f0f0')
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Left side - Input section
        input_frame = tk.Frame(content_frame, bg='white', relief=tk.RAISED, bd=1)
        input_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        
        tk.Label(input_frame, text="Startup Details", font=("Arial", 14, "bold"), 
                bg='white', fg='#2c3e50').pack(pady=10)
        
        # Form fields
        fields_frame = tk.Frame(input_frame, bg='white')
        fields_frame.pack(padx=20, pady=(0, 20))
        
        # Startup Name
        tk.Label(fields_frame, text="Startup Name:", bg='white', font=("Arial", 10)).grid(row=0, column=0, sticky='w', pady=5)
        self.startup_name = tk.Entry(fields_frame, width=30, font=("Arial", 10))
        self.startup_name.grid(row=0, column=1, pady=5, padx=(10, 0))
        
        # Industry
        tk.Label(fields_frame, text="Industry:", bg='white', font=("Arial", 10)).grid(row=1, column=0, sticky='w', pady=5)
        self.industry = tk.Entry(fields_frame, width=30, font=("Arial", 10))
        self.industry.grid(row=1, column=1, pady=5, padx=(10, 0))
        
        # Target Audience
        tk.Label(fields_frame, text="Target Audience:", bg='white', font=("Arial", 10)).grid(row=2, column=0, sticky='w', pady=5)
        self.target_audience = tk.Entry(fields_frame, width=30, font=("Arial", 10))
        self.target_audience.grid(row=2, column=1, pady=5, padx=(10, 0))
        
        # Brand Style
        tk.Label(fields_frame, text="Brand Style:", bg='white', font=("Arial", 10)).grid(row=3, column=0, sticky='w', pady=5)
        self.brand_style = ttk.Combobox(fields_frame, values=["modern", "minimalist", "corporate", "creative"], 
                                       width=27, font=("Arial", 10))
        self.brand_style.grid(row=3, column=1, pady=5, padx=(10, 0))
        
        # Image Description
        tk.Label(fields_frame, text="Image Description:", bg='white', font=("Arial", 10)).grid(row=4, column=0, sticky='nw', pady=5)
        self.image_description = tk.Text(fields_frame, width=30, height=4, font=("Arial", 10))
        self.image_description.grid(row=4, column=1, pady=5, padx=(10, 0))
        
        # Buttons
        button_frame = tk.Frame(input_frame, bg='white')
        button_frame.pack(pady=10)
        
        self.load_btn = tk.Button(button_frame, text="Load Model", command=self.load_model,
                                 bg='#3498db', fg='white', font=("Arial", 10, "bold"), 
                                 padx=15, pady=5)
        self.load_btn.pack(pady=5)
        
        self.generate_btn = tk.Button(button_frame, text="Generate Image", command=self.generate_image,
                                     bg='#e74c3c', fg='white', font=("Arial", 10, "bold"), 
                                     padx=15, pady=5, state="disabled")
        self.generate_btn.pack(pady=5)
        
        # Status
        self.status_label = tk.Label(input_frame, text="Click 'Load Model' to start", 
                                    bg='white', fg='#7f8c8d', font=("Arial", 9), wraplength=300)
        self.status_label.pack(pady=(0, 10))
        
        # Right side - Image display section
        image_frame = tk.Frame(content_frame, bg='white', relief=tk.RAISED, bd=1)
        image_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        tk.Label(image_frame, text="Generated Image", font=("Arial", 14, "bold"), 
                bg='white', fg='#2c3e50').pack(pady=10)
        
        self.image_label = tk.Label(image_frame, text="No image generated yet", 
                                   bg='#ecf0f1', fg='#95a5a6', font=("Arial", 12))
        self.image_label.pack(pady=20, padx=20, fill=tk.BOTH, expand=True)
        
    def load_model(self):
        self.status_label.config(text="Loading model... Please wait", fg='#f39c12')
        self.load_btn.config(state="disabled")
        
        def load_in_thread():
            try:
                model_id = "runwayml/stable-diffusion-v1-5"
                self.pipe = StableDiffusionPipeline.from_pretrained(
                    model_id,
                    torch_dtype=torch.float16,
                )
                self.pipe = self.pipe.to("cuda")
                self.tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-base-patch32")
                
                self.root.after(0, lambda: self.status_label.config(text="Model loaded! Ready to generate", fg='#27ae60'))
                self.root.after(0, lambda: self.generate_btn.config(state="normal"))
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Error", f"Failed to load model: {str(e)}"))
                self.root.after(0, lambda: self.load_btn.config(state="normal"))
                self.root.after(0, lambda: self.status_label.config(text="Failed to load model", fg='#e74c3c'))
        
        threading.Thread(target=load_in_thread, daemon=True).start()
    
    def generate_image(self):
        if not all([self.startup_name.get(), self.industry.get(), 
                   self.target_audience.get(), self.brand_style.get(),
                   self.image_description.get("1.0", tk.END).strip()]):
            messagebox.showwarning("Missing Information", "Please fill all fields")
            return
        
        self.status_label.config(text="Generating image... Please wait", fg='#f39c12')
        self.generate_btn.config(state="disabled")
        
        def generate_in_thread():
            try:
                # Optimize prompt to stay within 77 tokens
                startup_info = {
                    'image_description': self.image_description.get('1.0', tk.END).strip(),
                    'startup_name': self.startup_name.get(),
                    'brand_style': self.brand_style.get(),
                    'industry': self.industry.get(),
                    'target_audience': self.target_audience.get()
                }
                prompt = self.optimize_prompt(startup_info)
                
                result = self.pipe(
                    prompt,
                    num_inference_steps=30,
                    guidance_scale=7.5
                )
                
                # Clean filename by removing invalid characters
                clean_name = self.startup_name.get().strip().replace(' ', '_').replace('\n', '').replace('\r', '')
                # Remove other invalid filename characters
                invalid_chars = '<>:"/\\|?*'
                for char in invalid_chars:
                    clean_name = clean_name.replace(char, '_')
                filename = f"{clean_name}_marketing.png"
                result.images[0].save(filename)
                
                # Display image in UI
                self.display_image(result.images[0])
                
                self.root.after(0, lambda: self.status_label.config(text=f"Image generated and saved as {filename}", fg='#27ae60'))
                self.root.after(0, lambda: self.generate_btn.config(state="normal"))
                
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Error", f"Failed to generate image: {str(e)}"))
                self.root.after(0, lambda: self.generate_btn.config(state="normal"))
                self.root.after(0, lambda: self.status_label.config(text="Failed to generate image", fg='#e74c3c'))
        
        threading.Thread(target=generate_in_thread, daemon=True).start()
    
    def count_tokens(self, prompt):
        tokens = self.tokenizer.encode(prompt)
        return len(tokens)
    
    def optimize_prompt(self, startup_info):
        # Use structured template format
        base_template = f"Need a visually appealing poster for {startup_info['target_audience']} for the brand {startup_info['startup_name']}. The brand is in the {startup_info['industry']} sector. Create a professional, neat, high-quality image of {startup_info['image_description']}"
        
        # Check if template fits within token limit
        if self.count_tokens(base_template) <= 75:
            return base_template
        
        # If too long, use shortened version
        short_template = f"Poster for {startup_info['target_audience']}, {startup_info['startup_name']} brand, {startup_info['industry']} sector, {startup_info['image_description']}, professional, high-quality"
        
        # If still too long, prioritize core elements
        if self.count_tokens(short_template) > 75:
            core_prompt = startup_info['image_description']
            additions = [
                startup_info['startup_name'],
                startup_info['target_audience'],
                startup_info['industry'],
                "professional poster"
            ]
            
            for addition in additions:
                test_prompt = f"{core_prompt}, {addition}"
                if self.count_tokens(test_prompt) <= 75:
                    core_prompt = test_prompt
                else:
                    break
            return core_prompt
        
        return short_template
    
    def display_image(self, pil_image):
        # Get the actual size of the image display area
        self.image_label.update_idletasks()
        label_width = self.image_label.winfo_width()
        label_height = self.image_label.winfo_height()
        
        # Use larger size if label dimensions are not available yet
        if label_width <= 1 or label_height <= 1:
            display_size = (600, 450)
        else:
            # Use 90% of available space with some padding
            display_size = (int(label_width * 0.9), int(label_height * 0.9))
        
        # Resize image to fit the display area while maintaining aspect ratio
        pil_image.thumbnail(display_size, Image.Resampling.LANCZOS)
        
        # Convert to PhotoImage
        photo = ImageTk.PhotoImage(pil_image)
        
        # Update label
        self.root.after(0, lambda: self.image_label.config(image=photo, text=""))
        self.root.after(0, lambda: setattr(self.image_label, 'image', photo))  # Keep reference
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = CMOAgentUI()
    app.run()