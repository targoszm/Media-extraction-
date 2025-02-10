import json, time
from google import genai

from google.genai import types
from pydantic import BaseModel
from typing import Optional

# load environment variables
from dotenv import load_dotenv
load_dotenv()

# set up gemini
client = genai.Client()
model = "gemini-2.0-flash"

podcast_file = client.files.upload(file='files/lex_fridman_podcast_dylan_patel.mp3')

print(podcast_file.name)

while podcast_file.state.name == "PROCESSING":
    print("processing video...")
    time.sleep(5)
    print("podcast file name:")
    print(podcast_file.name)
    podcast_file = client.files.get(name=podcast_file.name)

# podcast_file = genai.get_file("files/m1bayt1bic9m")

class Prediction(BaseModel):
    prediction: str
    timeframe: str


prompt = """
I have attached the audio of a podcast. Give me a list of predictions made by the interviewee and the timeframe of the prediction.
"""

# count the tokens in the prompt and file
print(client.models.count_tokens(model=model, contents=[podcast_file, prompt]))

# send the prompt and file to gemini
result = client.models.generate_content(
    model=model,
    contents=[podcast_file, prompt], 
    config=types.GenerateContentConfig(
        response_mime_type="application/json", response_schema=list[Prediction]
    )
)

#print(result)
response = json.loads(result.text)

print(json.dumps(response, indent=4))