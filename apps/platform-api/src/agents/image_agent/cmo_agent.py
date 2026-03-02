from diffusers import StableDiffusionPipeline
from transformers import CLIPTokenizer
import torch
import os

class CMOAgent:
    def __init__(self):
        print("Loading Stable Diffusion model...")
        model_id = "runwayml/stable-diffusion-v1-5"
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"CUDA status: {torch.cuda.is_available()}, Using device: {self.device}")
        
        # Use float16 only for CUDA, fallback to float32 for CPU
        dtype = torch.float16 if self.device == "cuda" else torch.float32
        
        self.pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=dtype,
        )
        self.pipe = self.pipe.to(self.device)
        self.tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-base-patch32")
        print("Model loaded successfully!")
    
    def collect_startup_info(self):
        print("\n=== CMO Agent - Marketing Image Generator ===")
        startup_name = input("Enter your startup name: ")
        industry = input("Enter your industry/sector: ")
        target_audience = input("Enter your target audience: ")
        brand_style = input("Enter brand style (modern/minimalist/corporate/creative): ")
        image_description = input("Describe the marketing image you want: ")
        
        return {
            'startup_name': startup_name,
            'industry': industry,
            'target_audience': target_audience,
            'brand_style': brand_style,
            'image_description': image_description
        }
    
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
    
    def generate_marketing_prompt(self, startup_info):
        optimized_prompt = self.optimize_prompt(startup_info)
        token_count = self.count_tokens(optimized_prompt)
        print(f"Optimized prompt ({token_count} tokens): {optimized_prompt}")
        return optimized_prompt
    
    def generate_image(self, startup_info):
        prompt = self.generate_marketing_prompt(startup_info)
        print(f"\nGenerating image with prompt: {prompt}")
        
        result = self.pipe(
            prompt,
            num_inference_steps=30,
            guidance_scale=10
        )
        
        # Create filename based on startup name
        filename = f"{startup_info['startup_name'].replace(' ', '_')}_marketing.png"
        result.images[0].save(filename)
        
        print(f"Marketing image saved as: {filename}")
        return filename

def main():
    cmo = CMOAgent()
    startup_info = cmo.collect_startup_info()
    cmo.generate_image(startup_info)

if __name__ == "__main__":
    main()