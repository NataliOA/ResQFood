import clientFlow from './clientFlow.js';
import { getRestaurantsFromDB } from './dbUtils.js';
import mainService from './mainService.js'
import whatsappController from '../controllers/whatsappController.js';

let currentOrder = [];
let currentStep = null;
let selectedRestaurant = null;
let selectedItem = null;
let nextStep, message;

const handleMessage = async (messageBody, from, twiml) => {
    //currentStep = currentStep;
    messageBody = mainService.normalizeText(messageBody.trim());

    // Reset flow if the user types "hola"
    if (messageBody.toLowerCase() === "hola") {
        currentStep = null;
        console.log("Reiniciando flujo desde ClientService...");
        resetClientFlow();
        currentStep = null;
        return await whatsappController(
            { 
                body: { Body: messageBody, From: user.phone }, // Simula la estructura de req.body
            },
            {
                status: () => ({
                    send: (response) => {
                        console.log("Respuesta simulada enviada desde ClientService:", response);
                    }
                })
            }
        );
    }

    console.log('currentStep', currentStep);
    

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
            return handleOrderOptions(messageBody, twiml);
        case "specifyRemoveQuantity":
                ({ nextStep, message } = await clientFlow.handleRemoveQuantity(twiml, selectedItem, messageBody));
                currentStep = nextStep;
                return message;
        case "selectItemToRemove":
             ({ nextStep, message, selectedItem } = clientFlow.selectItemToRemove(messageBody, twiml));
            currentStep = nextStep;
            return message;
            
        case "confirmOrCancelOrder":
            return handleConfirmOrCancelOrder(messageBody, twiml);
        default:
            return welcomeMessage(twiml);
    }
};

const handleClientOptions = async (messageBody, twiml) => {
    if (messageBody === "1") {
        currentStep = "confirmOrder";
        return clientFlow.showMenu(twiml);
    } else if (messageBody === "2") {
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

const handleShowRestaurantMenu = async (messageBody, twiml) => {
    const itemIndex = parseInt(messageBody) - 1;

    try {
        const restaurants = await getRestaurantsFromDB();

        const updatedRestaurant = restaurants.find(
            restaurant => restaurant.business_id === selectedRestaurant.business_id
        );
        if (!updatedRestaurant || !updatedRestaurant.menu) {
            throw new Error("No se pudo obtener el menú del restaurante.");
        }

        selectedRestaurant = updatedRestaurant;

        const availableItems = selectedRestaurant.menu.filter(item => item.quantity > 0);

        if (itemIndex >= 0 && itemIndex < availableItems.length) {
            selectedItem = availableItems[itemIndex];
            currentStep = "requestQuantity";
            return clientFlow.requestItemQuantity(twiml, selectedItem);
        } else {
            return clientFlow.showRestaurantMenu(twiml, selectedRestaurant);
        }
    } catch (error) {
        console.error("Error al obtener el menú del restaurante:", error.message);
        twiml.message("No se pudo obtener el menú del restaurante. Por favor, inténtalo de nuevo.");
        return twiml;
    }
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

const handleOrderOptions = async (messageBody, twiml) => {
    switch (messageBody) {
        case "1": // Agregar otro alimento
            currentStep = "showRestaurantMenu";
            return clientFlow.showRestaurantMenu(twiml, selectedRestaurant);
        case "2": // Eliminar un alimento
            currentStep = clientFlow.handleRemoveItemFlow(twiml, currentOrder);
            return twiml;
        case "3": // Ver resumen de la orden
            currentStep = "confirmOrCancelOrder";
            return clientFlow.viewOrderSummary(twiml, currentOrder);
        default:
            twiml.message("Opción no válida. Por favor elige una de las opciones.");
            return twiml;
    }
};


const handleConfirmOrCancelOrder = async (messageBody, twiml) => {
    if (messageBody === "1") { // Confirm Order
        currentOrder = []; 
        twiml.message("Gracias por utilizar ResQFood. Tu orden estará lista para recogerse en 30 minutos.");
        await clientFlow.restoreItemsToDatabase();
    } else if (messageBody === "2") { // Cancel Order
        clientFlow.resetClientOrder();
        currentOrder = [];
        twiml.message('Tu orden ha sido cancelada. Para hacer un nuevo pedido escribe "Hola"');
    } else {
        twiml.message("Por favor, responde con '1' para confirmar o '2' para cancelar.");
    }
    currentStep = null; // Reset the flow

    return twiml;
};

const resetClientFlow = () => {
    currentOrder = [];
    currentStep = null;
    selectedRestaurant = null;
    selectedItem = null;
};

export default { handleMessage, resetClientFlow };
