import sys
import google.generativeai as genai
import os
import warnings
import webbrowser  # Import webbrowser module

# Suppress gRPC log noise
os.environ['GRPC_VERBOSITY'] = 'ERROR'
warnings.filterwarnings("ignore")

# Configure Gemini
genai.configure(api_key="AIzaSyCO0P_vovUfua1hvBVJKw2_xybgv_yPNBg")  # Replace with actual key or use env vars

model = genai.GenerativeModel("gemini-1.5-flash")

# Command processor
def run_ruby(command):
    if not command:
        return "No command provided."

    command = command.lower()

    if any(greet in command for greet in ['hello', 'hi', 'hey', 'good morning', 'good night']):
        return "Hello! What can I do for you?"

    if 'stop' in command or 'exit' in command:
        return "Goodbye!"

    # Check if the command contains "play" and a YouTube URL
    if 'play' in command:
        # Search for the term after 'play' (Assuming user provides the full URL or just a query)
        search_query = command.replace('play', '').strip()
        youtube_url = f"https://www.youtube.com/results?search_query={search_query}"
        
        # Open the URL in the default web browser
        webbrowser.open(youtube_url)
        return f"Playing {search_query} on YouTube."

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
