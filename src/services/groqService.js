import { ChatGroq } from 'langchain-groq';

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.0,
    max_retries: 2
});

export const generateGroqResponse = async (messages) => {
    try {
        const response = await llm.invoke(messages[messages.length - 1].text);
        return response.content;
    } catch (error) {
        console.error('Error generating Groq response:', error);
        throw error;
    }
};

export const generateStreamedGroqResponse = async (messages, onChunk, options = {}) => {
    try {
        const response = await llm.invoke(messages[messages.length - 1].text);
        onChunk(response.content);
    } catch (error) {
        console.error('Error generating streamed Groq response:', error);
        throw error;
    }
}; 