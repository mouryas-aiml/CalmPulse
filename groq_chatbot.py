from dotenv import load_dotenv

load_dotenv()

from langchain_groq import ChatGroq
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.0,
    max_retries=2,
      # other params...
)
response = llm.invoke("who is america's president?")
print("response :" ,response.content)

print("Mindmitra Chatbot initialized. Type 'quit' to exit.")
print("Type your message and press Enter to chat with Mindmitra.")

