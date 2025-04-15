import sys
import google.generativeai as genai
import os
import warnings
import requests
import json

# Suppress gRPC log noise
os.environ['GRPC_VERBOSITY'] = 'ERROR'
warnings.filterwarnings("ignore")

# Configure Gemini
genai.configure(api_key="AIzaSyCO0P_vovUfua1hvBVJKw2_xybgv_yPNBg")  # Replace with your Gemini API key

model = genai.GenerativeModel("gemini-1.5-flash")

# Function to search YouTube for a video based on the search query
def search_youtube(query):
    api_key = "AIzaSyD-7WKkqP5vVAIvJ4pQv04uIDRlQwCSR3A"  # Replace with your YouTube API key
    search_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q={query}&key={api_key}"
    response = requests.get(search_url)
    
    if response.status_code == 200:
        data = response.json()
        if data['items']:
            video_id = data['items'][0]['id']['videoId']
            return f"https://www.youtube.com/watch?v={video_id}"
    return None

# Command processor
def run_ruby(command):
    if not command:
        return json.dumps({ "message": "No command provided." })

    command = command.lower()

    if any(greet in command for greet in ['hello', 'hi', 'hey', 'good morning', 'good night']):
        return json.dumps({ "message": "Hello! What can I do for you?" })

    if 'stop' in command or 'exit' in command:
        return json.dumps({ "message": "Goodbye!" })

    # Handle YouTube play request
    if 'play' in command:
        search_query = command.replace('play', '').strip()
        video_url = search_youtube(search_query)
        
        if video_url:
            return json.dumps({
                "message": f"Playing {search_query}",
                "video_url": video_url
            })
        else:
            return json.dumps({ "message": "Sorry, I couldn't find a video." })

    try:
        result = model.generate_content(command)
        response = result.text
        response = ". ".join(response.split(". ")[:2])  # Keep first 2 lines
        return json.dumps({ "message": response })
    except Exception as e:
        return json.dumps({ "message": f"Error fetching response: {str(e)}" })

# Entry point
if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_command = " ".join(sys.argv[1:])
        output = run_ruby(input_command)
        print(output)
        sys.stdout.flush()
        sys.exit(0)
    else:
        print(json.dumps({ "message": "No command provided." }))
        sys.stdout.flush()
        sys.exit(1)
