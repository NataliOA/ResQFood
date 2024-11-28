
import whatsappController from '../controllers/whatsappController.js';

const handleMessage = async (messageBody, from, twiml) => {
    // Delegar al controlador principal
    return whatsappController({ body: { messageBody, from } }, { status: () => ({ send: () => twiml }) });
};



// Function to normalize text (si lo sigues necesitando aquí)
const normalizeText = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// Initial welcome message (puedes mantener esto si es llamado directamente)
const welcomeMessage = (twiml) => {
    twiml.message("¡Hola! Soy ResQFood, tu asistente de pedidos. Responde con el número de una opción:\n1. Soy Cliente\n2. Soy Restaurante");
    return twiml;
};

export default { handleMessage, welcomeMessage, normalizeText };
