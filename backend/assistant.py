from pywhatkit import playonyt
import pywhatkit
import speech_recognition as sr
import pyttsx3
import wikipedia
import re
import io
import sys  # For fetching command-line arguments

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Initialize recognizer and speaker
listener = sr.Recognizer()
speaker = pyttsx3.init()
voices = speaker.getProperty('voices')
speaker.setProperty('voice', voices[1].id)

# Function for text-to-speech
def talk(text):
    speaker.say(text)
    speaker.runAndWait()

# Function to handle the command
def run_alexa(command):
    if command:  # Check if the command is not None
        command = command.lower()  # Convert to lowercase

        # Handle greetings
        if 'ruby' in command or 'rubi' in command:
            if any(greeting in command for greeting in ['hello', 'hi', 'hey', 'wake up']):
                response = "Hello sir, what can I do for you?"
                talk(response)
                return response

        # Handle stop/exit
        if 'stop' in command or 'exit' in command:
            response = "Goodbye!"
            talk(response)
            return response

        # Handle play on YouTube
        if 'play' in command:
            playonyt(command)
            response = "Playing your request."
            talk(response)
            return response

        # Handle calculations
        pattern = r'(\d+)\s*([+\-*/])\s*(\d+)'
        match = re.search(pattern, command)
        if match:
            num1, operator, num2 = match.groups()
            result = eval(match.group(0))
            response = f"{num1} {operator} {num2} is {result}"
            talk(response) 
            return response

        # Handle Wikipedia search
        try:
            response = wikipedia.summary(command, 1)
        except:
            response = f"Sorry, I couldn't find anything for {command}."
        
        talk(response)
        return response

    talk("Sorry, I didn't understand that.")
    return "Sorry, I didn't understand that."

# Main script execution
if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = " ".join(sys.argv[1:])  # Combine all command-line arguments
        output = run_alexa(command)
        print(output)  # Print the output for the backend to capture
        sys.exit(0)  # Exit with success code
    else:
        print("No command provided.")
        sys.exit(1)  # Exit with error code
