from pywhatkit import playonyt
import speech_recognition as sr
import pyttsx3
import re
import sys  # For fetching command-line arguments
import google.generativeai as genai


genai.configure(api_key="AIzaSyCO0P_vovUfua1hvBVJKw2_xybgv_yPNBg")
model = genai.GenerativeModel("gemini-1.5-flash")

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
        print(command)
        # Handle greetings
        if 'rubi' in command or 'ruby' in command:
            if any(greeting in command for greeting in ['hello', 'hi', 'hey', 'wake up','hy','hye','hii','hay','heya' ,'good morning','good evening','good night','good afternoon']):
                response = "Hello sir, what can I do for you?"
                talk(response)
                return response
            else:
                list=command.split(' ')
                command=''
                for i in list :
                    if(i=='ruby' or i=='rubi'):
                        anything='ok'
                    else:
                        command=command+i+' '

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
            print('searching on web... '+command)
            # response = wikipedia.summary(command, 1)
            response = model.generate_content(command)
            response=response.text

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
