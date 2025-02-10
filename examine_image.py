from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import PIL.Image

load_dotenv()

# set up gemini
client = genai.Client()
model = "gemini-2.0-flash"

# first test, texting text
response = client.models.generate_content(model=model, contents="What is the stock symbol for Apple?")

print(response.text)

# second test, texting image
image = PIL.Image.open('files/ipo_pulse.png')

client = genai.Client()
response = client.models.generate_content(model=model, contents=["What is this image?", image])

print(response.text)