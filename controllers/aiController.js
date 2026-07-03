const { GoogleGenerativeAI } = require('@google/generative-ai');
const Room = require('../models/Room');

const chatWithConcierge = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Fetch all currently 'available' rooms from MongoDB
    const availableRooms = await Room.find({ status: 'available' }).select('title pricePerNight amenities description');
    
    // Format room data for the AI context
    const roomContext = availableRooms.map(room => {
      return `- ${room.title}: $${room.pricePerNight}/night. Amenities: ${room.amenities.join(', ')}. Description: ${room.description}`;
    }).join('\n');

    // Initialize GoogleGenerativeAI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Create a system prompt telling the AI that it is the NextHaven Hotel Concierge
    const systemInstruction = `You are the NextHaven Hotel Concierge, an AI-powered assistant. 
Your goal is to help guests find the perfect room and answer questions about the hotel.
Always be polite, professional, and welcoming. 

Here is the current list of available rooms at NextHaven:
${roomContext || "No rooms are currently available."}

When recommending rooms, use the provided context. If a user asks for a room with specific amenities, only suggest rooms that match from the list above.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // Return the AI's response text as JSON
    res.status(200).json({ response: text });
  } catch (error) {
    console.error(`AI Concierge Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to process AI request' });
  }
};

module.exports = { chatWithConcierge };
