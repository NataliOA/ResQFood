// services/WhatsappRestaurantService.js

import restaurantFlow from './restaurantFlow.js';

let currentStep = null;
let RestaurantID = null;
let RestaurantName = null;
let RestaurantAddress = null;
let newFood = {item_id: 0, name: "",price: 0,status: "disponible",quantity: 0}

const handleMessage = async (messageBody, from, twiml) => {
    if (messageBody === "hola") {
        resetRestaurantFlow();
        return welcomeMessage(twiml);
    }

    switch (currentStep) {
        case null:
            currentStep = "startRestaurant";
            return restaurantFlow.startRestaurant(twiml);
        case "startRestaurant":
            return handleStartRestaurant(twiml);
        case "setRestaurant":
            return handleNewRestaurant(twiml);
        case "setAddress":
            return handleNewRestaurant(twiml);
        case "getRestaurant":
            return handleGetRestaurant(twiml,messageBody);
        case "restaurantOptions":
            return handleRestaurantOptions(twiml,messageBody);
        case "listOrders":
            return handleOrderOptions(twiml,messageBody);
        case "getOrder":
            return handleUpdateOrder(twiml,messageBody);
        case "updateMenu":
            return handleUpdateMenu(twiml,messageBody);
        case "addFood":
            return handleGetInfo(twiml,messageBody);
        default:
            return welcomeMessage(twiml);
    }
};

const resetRestaurantFlow = () => {
    currentStep = null;
};

// const welcomeMessage = (twiml) => {
//     twiml.message("¡Hola! Bienvenido a la sección de restaurante. ¿Qué deseas hacer?");
//     return twiml;
// };

const handleStartRestaurant = async (messageBody,twiml) => {
    if(messageBody == "1"){
        currentStep = "getRestaurant";
        return restaurantFlow.getRestaurant(twiml);
    }else if (messageBody == "2"){
        currentStep = "setRestaurant";
        return restaurantFlow.setRestaurant(twiml);
    }
}

const handleNewRestaurant = async (messageBody,twiml) => {
    if(currentStep == "setRestaurant"){
        currentStep = "setAddress";
        RestaurantName = messageBody.trim();
        restaurantFlow.setaddress(twiml);
    }else if(currentStep == "setAddress"){
        RestaurantAddress = messageBody.trim();
        success = restaurantFlow.saveRestaurant(RestaurantName, RestaurantAddress);
        if(success){
            RestaurantID = parseInt(success);
            currentStep = "restaurantOptions";
            restaurantFlow.restaurantOptions(twiml);
        }else{
            currentStep = "setRestaurant";
            RestaurantName = "";
            RestaurantAddress = "";
            restaurantFlow.setRestaurant(twiml);
        }
    }
};

const handleGetRestaurant = async (twiml, messageBody) => {
    restID = parseInt(messageBody.trim())
    restaurant = restaurantFlow.getRestaurantInfo(restID)
    if(restaurant){
        RestaurantName = restaurant.name;
        RestaurantAddress = restaurant.address;
        RestaurantID = restaurant.business_id;
        currentStep = "restaurantOptions";
        restaurantFlow.restaurantOptions(twiml);
    }else {
        currentStep = "getRestaurant";
        restaurantFlowl.getRestaurant(twiml);
    }
}

const handleRestaurantOptions = async (twiml,messageBody) => {
    if (messageBody === "1") {
        currentStep = "updateMenu";
        return restaurantFlow.getMenuFrom(twiml,RestaurantID);
    } else if (messageBody === "2") {
        currentStep = "listOrders";
        return restaurantFlow.getOrdersFrom(twiml,RestaurantID);
    }
};

const handleOrderOptions = async (twiml,messageBody) => {
    if (messageBody === "1"){
        currentStep = "restaurantOptions";
        return restaurantFlow.restaurantOptions(twiml);
    }else if (messageBody === "2"){
        currentStep = "getOrder";
        return restaurantFlow.getOrder(twiml);
    }
}

const handleUpdateOrder = async (twiml,messageBody) => {
    orderId = parseInt(messageBody.trim());
    success = restaurantFlow.updateOrder(orderId);
    if(success){
        currentStep = "restaurantOptions";
        restaurantFlow.restaurantOptions(twiml);
    }else{
        currentStep = "getOrder";
        restaurantFlow.getOrder(twiml);
    }
}

const handleUpdateMenu = async (twiml,messageBody) => {
    if (messageBody === "1"){
        currentStep = "addFood";
        return restaurantFlow.collectInfo(twiml,0);
    }else if (messageBody === "2"){
        currentStep = "removeFood";
        return restaurantFlow.getFood(twiml);
    }else if (messageBody === "3"){
        currentStep = "modifyFood";
        return resetRestaurantFlow.getFood(twiml)
    }
}

export default { handleMessage };
