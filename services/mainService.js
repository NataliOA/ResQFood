// services/WhatsappService.js

import WhatsappClientService from './WhatsappClientService.js';
import WhatsappRestaurantService from './WhatsappRestaurantService.js';

let currentFlow = null; // Tracks whether the user is a client or restaurant

// Main function to handle messages and decide on the flow
const handleMessage = async (messageBody, from, twiml) => {
    messageBody = normalizeText(messageBody.trim());

    // Reset flow if the user types "hola"
    if (messageBody === "hola") {
        currentFlow = null;
        return welcomeMessage(twiml);
    }

    // Determine initial flow based on user choice (client or restaurant)
    if (!currentFlow) {
        switch (messageBody) {
            case "1": // Client flow
                currentFlow = "client";
                return WhatsappClientService.handleMessage(messageBody, from, twiml);
            case "2": // Restaurant flow
                currentFlow = "restaurant";
                return WhatsappRestaurantService.handleMessage(messageBody, from, twiml);
            default:
                return welcomeMessage(twiml);
        }
    }

    // Delegate to the appropriate flow based on the currentFlow variable
    if (currentFlow === "client") {
        return WhatsappClientService.handleMessage(messageBody, from, twiml);
    } else if (currentFlow === "restaurant") {
        return WhatsappRestaurantService.handleMessage(messageBody, from, twiml);
    }
};

// Function to normalize text
const normalizeText = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// Initial welcome message
const welcomeMessage = (twiml) => {
    twiml.message("¡Hola! Soy tu asistente de pedidos. Responde con el número de una opción:\n1. Soy Cliente\n2. Soy Restaurante");
    return twiml;
};

export default { handleMessage };
