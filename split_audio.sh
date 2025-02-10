#!/bin/bash

# Check if a filename is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <input_file>"
    exit 1
fi

# Get input file name
INPUT_FILE="$1"

# Extract the file name without the extension
BASENAME=$(basename "$INPUT_FILE" .mp3)

# Create an output directory to store the split files
OUTPUT_DIR="${BASENAME}_split"
mkdir -p "$OUTPUT_DIR"

# Run ffmpeg to split the file
ffmpeg -i "$INPUT_FILE" -f segment -segment_time 900 -c copy "$OUTPUT_DIR/out%03d.mp3"

echo "Splitting complete. Files saved in $OUTPUT_DIR/"
