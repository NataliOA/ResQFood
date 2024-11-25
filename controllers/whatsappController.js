import Twilio from 'twilio';
import WhatsappClientService from '../services/WhatsappClientService.js';
import WhatsappRestaurantService from '../services/WhatsappRestaurantService.js';

const userState = {}; // Objeto para guardar el estado de cada usuario temporalmente

export default async (req, res) => {
    const { Body: messageBody, From: from } = req.body;
    const twiml = new Twilio.twiml.MessagingResponse();

    // Inicializar estado del usuario si no existe
    if (!userState[from]) {
        userState[from] = {
            currentStep: null,
            currentOrder: [],
            selectedRestaurant: null,
            selectedItem: null,
            flow: null,
        };
    }

    const user = userState[from];


    if (!user.flow) {
        if (messageBody === "1") {
            user.flow = 'client';
            user.currentStep = "clientOptions";
            await WhatsappClientService.handleMessage(messageBody, user, twiml);
        } else if (messageBody === "2") {
            user.flow = 'restaurant';
            await WhatsappRestaurantService.handleMessage(messageBody, user, twiml);
        } else {
            twiml.message("¡Hola! Soy ResQFood, tu asistente de pedidos. Responde con el número de una opción:\n1. Soy Cliente\n2. Soy Restaurante");
        }
    } else if (user.flow === 'client') {
        await WhatsappClientService.handleMessage(messageBody, user, twiml);
    } else if (user.flow === 'restaurant') {
        await WhatsappRestaurantService.handleMessage(messageBody, user, twiml);
    }

    const responseMessage = twiml.toString();

    res.status(200).send(responseMessage);
};
