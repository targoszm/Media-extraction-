
# Multimodal Structured Extraction with Gemini 2.0 Flash and Google GenAI Python SDK 1.0

In this tutorial we extract structured data from a variety of sources, including an investment newsletter PDF, a podcast, and a YouTube video.

## Setup
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Create a .env file in the root directory with your Gemini API key
```
GOOGLE_API_KEY=your_google_api_key
```

## Handy Commands

### Download YouTube video
```
yt-dlp https://www.youtube.com/youryoutubeurl
```

## Download YouTube audio
```
yt-dlp -x --audio-format mp3 https://www.youtube.com/youryoutubeurl
```

### Split audio
```
ffmpeg -i input.mp3 -f segment -segment_time 10 -c copy output_%03d.mp3
```

### or use the shell script split_audio.sh
```
./split_audio.sh input.mp3
```

### Extract audio from video
```
ffmpeg -i input.mp4 -q:a 0 -map a output.mp3
```

