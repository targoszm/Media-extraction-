import json
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

# set up pydantic models for companies and themes
class Company(BaseModel):
    name: str
    public: bool
    symbol: Optional[str]
    long: Optional[bool]

class Theme(BaseModel):
    name: str


# upload the pdf file to gemini
file_ref = client.files.upload(file="files/citrini_24_trades.pdf")

# prepare the prompt
extract_themes_prompt = """
Attached a a list of thematic trade ideas for 2024. Analyze the following text and extract all of the theme names discussed.
"""

# count the tokens in the prompt and file
print(client.models.count_tokens(model=model, contents=[extract_themes_prompt, file_ref]))

# send the prompt and file to gemini
result = client.models.generate_content(
    model=model,
    contents=[file_ref, extract_themes_prompt],
    config=types.GenerateContentConfig(
        response_mime_type="application/json", 
        response_schema=list[Theme]
    ),
)

# # debug print for the raw result object
print(result)

# # load and show the json structure of the result
themes = json.loads(result.text)

print(themes)

# # loop through each theme and build a prompt to extract the companies mentioned in the theme
for theme in themes:
    print(theme["name"])

    extract_companies_prompt = f"""
    Attached a a list of thematic trade ideas for 2025. I am only interested in the companies mentioned in the theme: {theme["name"]}. 
    Extract all of the companies mentioned in the theme, including the company name, whether they are publicly traded or not, the ticker symbol associated with each company (if it is publicly traded), and whether the company was recommended to go long or short, True if long, False if short.
    """

    result = client.models.generate_content(
        model=model,
        contents=[file_ref, extract_companies_prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json", 
            response_schema=list[Company]
        ),
    )

    companies= json.loads(result.text)
    for company in companies:
        print(company)
