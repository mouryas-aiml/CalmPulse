from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
import traceback

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Get API key from environment
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

print("GROQ API Key found:", GROQ_API_KEY[:10] + "..." if GROQ_API_KEY else "None")

# System prompt for better responses
SYSTEM_PROMPT = """You are a knowledgeable AI assistant. When answering questions:
1. Provide accurate, comprehensive answers on the first try
2. Use clear, well-structured explanations
3. Include relevant scientific details when appropriate
4. Be direct and avoid unnecessary preliminaries
5. If asked about cells, organs, or biological systems, include their functions and characteristics
6. Format responses with proper markdown for better readability
7. Always aim to give complete information in a single response"""

# Initialize the chatbot
try:
    llm = ChatGroq(
        api_key=GROQ_API_KEY,
        model="mixtral-8x7b-32768",
        temperature=0.3,  # Lower temperature for more consistent responses
        max_retries=2,
        top_p=0.9
    )
    print("ChatGroq initialized successfully")
except Exception as e:
    print("Error initializing ChatGroq:", str(e))
    traceback.print_exc()

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "message": "Mindmitra Chatbot API is running",
        "endpoints": {
            "/api/chat": "POST - Send messages to the chatbot"
        }
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        print(f"Received message: {user_message}")
        
        try:
            # Create messages with system prompt
            messages = [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=user_message)
            ]
            
            response = llm.invoke(messages)
            print(f"Response received: {response.content[:100]}...")
            return jsonify({'response': response.content.strip()})
        except Exception as e:
            print("Error calling Groq API:", str(e))
            traceback.print_exc()
            return jsonify({'error': f'Groq API error: {str(e)}'}), 500
            
    except Exception as e:
        print("Server error:", str(e))
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested URL was not found on the server.',
        'available_endpoints': {
            '/': 'GET - API Status',
            '/api/chat': 'POST - Chat with Mindmitra'
        }
    }), 404

if __name__ == '__main__':
    print("\nStarting Mindmitra Chatbot API...")
    print("Available endpoints:")
    print("  - GET  /           : API Status")
    print("  - POST /api/chat   : Chat with Mindmitra")
    app.run(port=5000, debug=True) 