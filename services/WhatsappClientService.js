// services/WhatsappClientService.js

import clientFlow from './clientFlow.js';
import { getRestaurantsFromDB } from './dbUtils.js';

let currentOrder = [];
let currentStep = null;
let selectedRestaurant = null;
let selectedItem = null;

const handleMessage = async (messageBody, from, twiml) => {
    if (messageBody === "hola") {
        resetClientFlow();
        return welcomeMessage(twiml);
    }

    switch (currentStep) {
        case null:
            currentStep = "clientOptions";
            return clientFlow.clientOptions(twiml);
        case "clientOptions":
            return handleClientOptions(messageBody, twiml);
        case "confirmOrder":
            return handleConfirmOrder(messageBody, twiml);
        case "selectRestaurant":
            return handleSelectRestaurant(messageBody, twiml);
        case "showRestaurantMenu":
            return handleShowRestaurantMenu(messageBody, twiml);
        case "requestQuantity":
            return handleRequestQuantity(messageBody, twiml);
        case "orderOptions":
            return clientFlow.handleOrderOptions(twiml, messageBody);
        default:
            return welcomeMessage(twiml);
    }
};

const handleClientOptions = async (messageBody, twiml) => {
    if (messageBody === "1.1") {
        currentStep = "confirmOrder";
        return clientFlow.showMenu(twiml);
    } else if (messageBody === "1.2") {
        currentStep = "selectRestaurant";
        const restaurants = await getRestaurantsFromDB();
        return clientFlow.askForRestaurantSelection(twiml, restaurants);
    }
    return clientFlow.clientOptions(twiml);
};

const handleConfirmOrder = async (messageBody, twiml) => {
    if (messageBody === "1") {
        currentStep = "selectRestaurant";
        const restaurants = await getRestaurantsFromDB();
        return clientFlow.askForRestaurantSelection(twiml, restaurants);
    } else if (messageBody === "2") {
        currentStep = "clientOptions";
        return clientFlow.clientOptions(twiml);
    }
    return clientFlow.confirmOrder(twiml);
};

const handleSelectRestaurant = async (messageBody, twiml) => {
    const restaurantIndex = parseInt(messageBody) - 1;
    const restaurants = await getRestaurantsFromDB();
    if (restaurantIndex >= 0 && restaurantIndex < restaurants.length) {
        selectedRestaurant = restaurants[restaurantIndex];
        currentStep = "showRestaurantMenu";
        return clientFlow.showRestaurantMenu(twiml, selectedRestaurant);
    }
    return clientFlow.askForRestaurantSelection(twiml, restaurants);
};

const handleShowRestaurantMenu = (messageBody, twiml) => {
    const itemIndex = parseInt(messageBody) - 1;
    const availableItems = selectedRestaurant.menu.filter(item => item.quantity > 0);

    if (itemIndex >= 0 && itemIndex < availableItems.length) {
        selectedItem = availableItems[itemIndex];
        currentStep = "requestQuantity";
        return clientFlow.requestItemQuantity(twiml, selectedItem);
    }
    return clientFlow.showRestaurantMenu(twiml, selectedRestaurant);
};

const handleRequestQuantity = (messageBody, twiml) => {
    const quantity = parseInt(messageBody);
    if (isNaN(quantity) || quantity <= 0) {
        twiml.message("Por favor, introduce un número válido para la cantidad.");
        return twiml;
    }
    currentStep = "orderOptions";
    return clientFlow.processItemQuantity(twiml, selectedRestaurant.name, selectedItem, quantity);
};

const resetClientFlow = () => {
    currentOrder = [];
    currentStep = null;
    selectedRestaurant = null;
    selectedItem = null;
};

const welcomeMessage = (twiml) => {
    twiml.message("¡Hola! Bienvenido a la sección de cliente. ¿Qué deseas hacer?");
    return twiml;
};

export default { handleMessage };
