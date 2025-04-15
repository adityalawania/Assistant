import sys
import google.generativeai as genai
import os
import warnings
import webbrowser  # Import webbrowser module
import requests  # Import requests to search YouTube

# Suppress gRPC log noise
os.environ['GRPC_VERBOSITY'] = 'ERROR'
warnings.filterwarnings("ignore")

# Configure Gemini
genai.configure(api_key="AIzaSyCO0P_vovUfua1hvBVJKw2_xybgv_yPNBg")  # Replace with actual key or use env vars

model = genai.GenerativeModel("gemini-1.5-flash")

# Function to search YouTube for a video based on the search query
def search_youtube(query):
    # YouTube API or alternative method to search for videos.
    search_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&key=AIzaSyD-7WKkqP5vVAIvJ4pQv04uIDRlQwCSR3A"
    response = requests.get(search_url)
    
    if response.status_code == 200:
        data = response.json()
        if data['items']:
            video_id = data['items'][0]['id']['videoId']
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            return video_url
    return None

# Command processor
def run_ruby(command):
    if not command:
        return "No command provided."

    command = command.lower()

    if any(greet in command for greet in ['hello', 'hi', 'hey', 'good morning', 'good night']):
        return "Hello! What can I do for you?"

    if 'stop' in command or 'exit' in command:
        return "Goodbye!"

    # Check if the command contains "play" and a search query
    if 'play' in command:
        search_query = command.replace('play', '').strip()
        video_url = search_youtube(search_query)
        
        if video_url:
            # Open the video URL in the default web browser
            webbrowser.open(video_url)
            return f"Playing {search_query} "

        else:
            return "Sorry, I couldn't find a video."

    try:
        result = model.generate_content(command)
        response = result.text
        response = ". ".join(response.split(". ")[:2])  # Keep first 2 lines
        return response
    except Exception as e:
        return f"Error fetching response: {str(e)}"

# Entry point
if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_command = " ".join(sys.argv[1:])
        output = run_ruby(input_command)
        print(output)
        sys.stdout.flush()
        sys.exit(0)
    else:
        print("No command provided.")
        sys.stdout.flush()
        sys.exit(1)
