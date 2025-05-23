from dotenv import load_dotenv

load_dotenv()

from langchain_groq import ChatGroq
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.0,
    max_retries=2
)

print("\n=== Mindmitra Chatbot ===")
print("Type 'quit' to exit the chat")
print("Type your message and press Enter to chat with Mindmitra\n")

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