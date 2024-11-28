import WhatsappClientService from '../services/WhatsappClientService.js';
import WhatsappRestaurantService from '../services/WhatsappRestaurantService.js';
import Twilio from 'twilio';

let userState = {}; // Objeto para guardar el estado de cada usuario

const whatsappController = async (req, res) => {
    try {
        const { Body: messageBody, From: from } = req.body;
        const twiml = new Twilio.twiml.MessagingResponse();
        console.log("*****************************inicio****************************************")
        console.log("Mensaje recibido: ", messageBody);

        // Reiniciar el flujo si el mensaje es "hola"
        if (messageBody.toLowerCase() === "hola") {
            console.log("Reiniciando estado del usuario...");
            userState[from] = {
                currentStep: null,
                currentOrder: [],
                selectedRestaurant: null,
                selectedItem: null,
                flow: null,
            };

            console.log("Enviando mensaje de bienvenida");
            twiml.message(
                "¡Hola! Soy ResQFood, tu asistente de pedidos. Responde con el número de una opción:\n1. Soy Cliente\n2. Soy Restaurante"
            );
            res.status(200).send(twiml.toString());
            console.log("Mensaje de respuesta enviado: ", twiml.toString());
            return;
        }

        // Si el usuario ya tiene un flujo definido, continuar en su flujo
        if (userState[from]?.flow) {
            console.log(`Flujo definido: ${userState[from].flow}`);
            const user = userState[from];
            if (user.flow === "client") {
                await WhatsappClientService.handleMessage(messageBody, user, twiml);
            } else if (user.flow === "restaurant") {
                await WhatsappRestaurantService.handleMessage(messageBody, user, twiml);
            }
        } else {
            // Si no se ha definido un flujo, manejar opciones iniciales
            if (messageBody === "1") {
                console.log("Cliente identificado");
                userState[from] = {
                    flow: "client",
                    currentStep: "clientOptions",
                    currentOrder: [],
                    selectedRestaurant: null,
                    selectedItem: null,
                };
                await WhatsappClientService.handleMessage(messageBody, userState[from], twiml);
            } else if (messageBody === "2") {
                console.log("Restaurante identificado");
                userState[from] = {
                    flow: "restaurant",
                    currentStep: null,
                    currentOrder: [],
                    selectedRestaurant: null,
                    selectedItem: null,
                };
                await WhatsappRestaurantService.handleMessage(messageBody, userState[from], twiml);
            } else {
                console.log("Enviando mensaje de bienvenida");
                twiml.message(
                    "¡Hola! Soy ResQFood, tu asistente de pedidos. Responde con el número de una opción:\n1. Soy Cliente\n2. Soy Restaurante"
                );
            }
        }

        const responseMessage = twiml.toString();
        console.log("Mensaje de respuesta enviado:", responseMessage);
        res.status(200).send(responseMessage);
    } catch (error) {
        console.error("Error en whatsappController:", error.message);
        res.status(500).send("Error interno del servidor.");
    }
};

export default whatsappController;
