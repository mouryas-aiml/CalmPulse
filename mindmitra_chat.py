import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

if not GROQ_API_KEY:
    print("Error: GROQ_API_KEY not found in environment variables")
    print("Please create a .env file with your GROQ_API_KEY=your_api_key")
    exit(1)

from langchain_groq import ChatGroq

# Initialize the chatbot
llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="llama-3.3-70b-versatile",
    temperature=0.0,
    max_retries=2
)

print("\n=== Mindmitra Chatbot ===")
print("Type 'quit' to exit the chat")
print("Type your message and press Enter to chat\n")

while True:
    user_input = input("You: ").strip()
    
    if user_input.lower() == 'quit':
        print("Goodbye! Thank you for chatting with Mindmitra.")
        break
    
    if not user_input:
        print("Please type something!")
        continue
        
    try:
        response = llm.invoke(user_input)
        print("\nMindmitra:", response.content.strip(), "\n")
    except Exception as e:
        print(f"Error: Failed to get response - {str(e)}") 