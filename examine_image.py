from google import genai
import PIL.Image

from dotenv import load_dotenv
load_dotenv()

# set up gemini
client = genai.Client()
model = "gemini-2.0-flash"

# first test, texting text
# response = client.models.generate_content(model=model, contents="What is the stock symbol for Apple?")

# print(response.text)

# second test, texting image
image = PIL.Image.open('files/ipo_pulse.png')

client = genai.Client()
response = client.models.generate_content(model=model, contents=["According to this chart, when did the IPO market peak, when did it bottom out, and what does it look like for 2025?", image])

print(response.text)