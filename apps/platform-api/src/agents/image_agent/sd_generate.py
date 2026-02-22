from diffusers import StableDiffusionPipeline
import torch

model_id = "runwayml/stable-diffusion-v1-5"  # base SD 1.5

print("Loading model....")

pipe = StableDiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
)

# Move to GPU
pipe = pipe.to("cuda")

prompt = "a small startup marketing team working at sleek laptops, white minimalist modern office, coffee cups, motivational posters, soft natural light, calm creative atmosphere, highly detailed design studio"

result = pipe(
    prompt,
    num_inference_steps=30,      # Defines how many denoising iterations
    guidance_scale=7.5           # Controls how strongly the model sticks to your prompt
)

image = result.images[0]
image.save("output1.png")

print("Done! Saved as output.png")
