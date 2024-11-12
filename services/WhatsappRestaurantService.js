// services/WhatsappRestaurantService.js

import restaurantFlow from './restaurantFlow.js';

let currentStep = null;

const handleMessage = async (messageBody, from, twiml) => {
    if (messageBody === "hola") {
        resetRestaurantFlow();
        return welcomeMessage(twiml);
    }

    switch (currentStep) {
        case null:
            currentStep = "restaurantOptions";
            return restaurantFlow.restaurantOptions(twiml);
        // Add more cases as needed for each restaurant-specific step
        default:
            return welcomeMessage(twiml);
    }
};

const resetRestaurantFlow = () => {
    currentStep = null;
};

const welcomeMessage = (twiml) => {
    twiml.message("¡Hola! Bienvenido a la sección de restaurante. ¿Qué deseas hacer?");
    return twiml;
};

export default { handleMessage };
