// services/WhatsappRestaurantService.js
import mainService from './mainService.js'
import restaurantFlow from './restaurantFlow.js';
import {saveRestaurant,getRestaurantInfo,getMenuItem} from "./dbUtils.js"

let currentStep = null;
let RestaurantID = null;
let RestaurantName = null;
let RestaurantAddress = null;
let infoCount = 0;
let feat = 0;
let newFood = {item_id:0,name: "",price: 0,status: "disponible",quantity: 0}

const handleMessage = async (messageBody, from, twiml, initialStep) => {
    //currentStep = currentStep;
    messageBody = mainService.normalizeText(messageBody.trim());

    // Reset flow if the user types "hola"
    if (messageBody.toLowerCase() === "hola") {
        console.log("Reiniciando flujo desde ClientService...");
        //currentStep = null;
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
            currentStep = "startRestaurant";
            return restaurantFlow.startRestaurant(twiml);
        case "startRestaurant":
            return handleStartRestaurant(twiml,messageBody);
        case "setRestaurant":
            return handleNewRestaurant(twiml,messageBody);
        case "setAddress":
            return handleNewRestaurant(twiml,messageBody);
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
        case "validateFood":
            return handleValidationOptions(twiml,messageBody);
        case "chooseFeat":
            return handleModifyOptions(twiml,messageBody);
        case "modifyFeat":
            return handleModifiyFeat(twiml,messageBody);
        case "modifyFood":
            return handleModifyFood(twiml,messageBody);
        case "removeFood":
            return handleRemoveFood(twiml,messageBody);
        case "chooseFeatUpdate":
            return handleModifyUpdateOptions(twiml,messageBody);
        case "modifyFeatUpdate":
            return handleModifiyFeatUpdate(twiml,messageBody);
        case "validateUpdate":
            return handleValidationUpdateOptions(twiml,messageBody);
        case "validateRemove":
            return handleValidationRemoveOptions(twiml,messageBody)
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

const handleStartRestaurant = async (twiml,messageBody) => {
    if(messageBody == "1"){
        currentStep = "getRestaurant";
        return restaurantFlow.getRestaurant(twiml);
    }else if (messageBody == "2"){
        currentStep = "setRestaurant";
        return restaurantFlow.setRestaurant(twiml);
    }
}

const handleNewRestaurant = async (twiml,messageBody) => {
    if(currentStep == "setRestaurant"){
        currentStep = "setAddress";
        RestaurantName = messageBody;
        return restaurantFlow.setaddress(twiml);
    }else if(currentStep == "setAddress"){
        RestaurantAddress = messageBody;
        const success = await saveRestaurant(RestaurantName, RestaurantAddress);
        if(success){
            console.log("entró",success);
            currentStep = "restaurantOptions";
            RestaurantID = parseInt(success);
            console.log("success ",RestaurantID);
            twiml.message("Su id de restaurante es: "+RestaurantID+"\nGuardelo para poder acceder de nuevo.");
            return restaurantFlow.restaurantOptions(twiml);
        }else{
            twiml.message("Reintentelo, por favor.")
            currentStep = "setRestaurant";
            return restaurantFlow.setRestaurant(twiml);
        }
    }
};

const handleGetRestaurant = async (twiml, messageBody) => {
    const restID = parseInt(messageBody.trim())
    const result = await getRestaurantInfo(restID)
    if(result){
        RestaurantName = result.name;
        RestaurantAddress = result.address;
        RestaurantID = result.business_id;
        currentStep = "restaurantOptions";
        return restaurantFlow.restaurantOptions(twiml);
    }else {
        currentStep = "getRestaurant";
        return restaurantFlowl.getRestaurant(twiml);
    }
}

const handleRestaurantOptions = async (twiml,messageBody) => {
    if (messageBody === "1") {
        currentStep = "updateMenu";
        console.log("rest",RestaurantID);
        return restaurantFlow.getMenuFrom(twiml,RestaurantID);
    } else if (messageBody === "2") {
        currentStep = "listOrders";
        return restaurantFlow.getOrdersFrom(twiml,RestaurantID);
    } else{
        currentStep = "startRestaurant";
        return restaurantFlow.startRestaurant(twiml);
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
    success = await restaurantFlow.updateOrder(orderId);
    if(success){
        currentStep = "restaurantOptions";
        return restaurantFlow.restaurantOptions(twiml);
    }else{
        currentStep = "getOrder";
        return restaurantFlow.getOrder(twiml);
    }
}

const handleUpdateMenu = async (twiml,messageBody) => {
    if (messageBody === "1"){
        currentStep = "addFood";
        return restaurantFlow.collectInfo(twiml,0);
    }else if (messageBody === "2"){
        currentStep = "removeFood";
        return restaurantFlow.getFoodConsole(twiml);
    }else if (messageBody === "3"){
        currentStep = "modifyFood";
        return restaurantFlow.getFoodConsole(twiml)
    }else{
        currentStep = "restaurantOptions";
        return restaurantFlow.restaurantOptions(twiml);
    }
}

const handleGetInfo = async (twiml, messageBody) => {
    switch (infoCount){
        case 0:
            newFood.name = messageBody;
            infoCount++;
            return restaurantFlow.collectInfo(twiml,infoCount);
        case 1:
            newFood.price = parseInt(messageBody);
            infoCount++;
            return restaurantFlow.collectInfo(twiml,infoCount);
        case 2:
            newFood.quantity = parseInt(messageBody);
            infoCount = 0;
            currentStep = "validateFood";
            return restaurantFlow.validateFood(twiml,newFood);
    }
}

const handleValidationOptions = async (twiml,messageBody) => {
    if(messageBody === '1'){
        console.log("add");
        const resultado = await restaurantFlow.addFood(twiml,{name:newFood.name,price:newFood.price,quantity:newFood.quantity,status:newFood.status},RestaurantID);
        if(resultado){
            currentStep = "updateMenu";
            return restaurantFlow.getMenuFrom(twiml,RestaurantID);
        }else{
            currentStep = "validateFood";
            return restaurantFlow.validateFood(twiml,newFood);
        }
    }else if(messageBody === '2'){
        currentStep = "chooseFeat";
        return restaurantFlow.modifyOptions(twiml);
    }
}

const handleValidationUpdateOptions = async (twiml,messageBody) => {
    if(messageBody === '1'){
        const resultado = await restaurantFlow.updateFood(twiml,newFood,RestaurantID);
        if(resultado){
            currentStep = "updateMenu";
            return restaurantFlow.getMenuFrom(twiml,RestaurantID);
        }else{
            currentStep = "validateUpdate";
            return restaurantFlow.validateFood(twiml,{name: newFood.name,price: newFood.price,status: newFood.status,quantity: newFood.quantity});
        }
    }else if(messageBody === '2'){
        currentStep = "chooseFeatUpdate";
        return restaurantFlow.modifyOptions(twiml);
    }
}

const handleValidationRemoveOptions = async (twiml,messageBody) => {
    if(messageBody === '1'){
        const resultado = await restaurantFlow.removeFood(twiml,newFood,RestaurantID);
        if(resultado){
            currentStep = "updateMenu";
            return restaurantFlow.getMenuFrom(twiml,RestaurantID);
        }else{
            currentStep = "validateRemove";
            return restaurantFlow.validateFood(twiml,newFood);
        }
    }else if(messageBody === '2'){
        currentStep = "removeFood";
        return restaurantFlow.getFoodConsole(twiml);
    }
}


const handleModifyOptions = async (twiml,messageBody) => {
    currentStep = "modifyFeat";
    switch (messageBody){
        case "1":
            feat = parseInt(messageBody);
            return restaurantFlow.modify(twiml,1);
        case "2":
            feat = parseInt(messageBody);
            return restaurantFlow.modify(twiml,2);
        case "3":
            feat = parseInt(messageBody);
            return restaurantFlow.modify(twiml,3);
        default:
            twiml.message("Comando inválido.");
            currentStep = "chooseFeat";
            return restaurantFlow.modifyOptions(twiml);
    }
}

const handleModifyUpdateOptions = async (twiml,messageBody) => {
    currentStep = "modifyFeatUpdate";
    switch (messageBody){
        case "1":
            feat = parseInt(messageBody);
            return restaurantFlow.modify(twiml,1);
        case "2":
            feat = parseInt(messageBody);
            return restaurantFlow.modify(twiml,2);
        case "3":
            feat = parseInt(messageBody);
            return restaurantFlow.modify(twiml,3);
        default:
            twiml.message("Comando inválido.");
            currentStep = "chooseFeatUpdate";
            return restaurantFlow.modifyOptions(twiml);
    }
}

const handleModifiyFeat = async (twiml,messageBody) => {
    switch(feat){
        case 1:
            newFood.name = messageBody;
            currentStep = "validateFood";
            return restaurantFlow.validateFood(twiml,newFood);
        case 2:
            newFood.price = parseInt(messageBody);
            currentStep = "validateFood";
            return restaurantFlow.validateFood(twiml,newFood);
        case 3:
            newFood.quantity = parseInt(messageBody);
            currentStep = "validateFood";
            return restaurantFlow.validateFood(twiml,newFood);
        default:
            twiml.message("Comando inválido.");
            currentStep = "chooseFeat";
            return restaurantFlow.modifyOptions(twiml);
    }
}

const handleModifiyFeatUpdate = async (twiml,messageBody) => {
    switch(feat){
        case 1:
            newFood.name = messageBody;
            currentStep = "validateUpdate";
            return restaurantFlow.validateFood(twiml,newFood);
        case 2:
            newFood.price = parseInt(messageBody);
            currentStep = "validateUpdate";
            return restaurantFlow.validateFood(twiml,newFood);
        case 3:
            newFood.quantity = parseInt(messageBody);
            currentStep = "validateUpdate";
            return restaurantFlow.validateFood(twiml,newFood);
        default:
            twiml.message("Comando inválido.");
            currentStep = "chooseFeatUpdate";
            return restaurantFlow.modifyOptions(twiml);
    }
}

const handleModifyFood = async (twiml,messageBody) => {
    const result = await getMenuItem(messageBody,RestaurantID);
    if(!result.success){
        twiml.message("No se encontró el artículo.");
        currentStep = "modifyFood";
        return restaurantFlow.getFoodConsole(twiml);
    }else{
        console.log("entró", result.message);
        newFood.item_id = result.message.item_id;
        newFood.name = result.message.name;
        newFood.price = result.message.price;
        newFood.quantity = result.message.quantity;
        newFood.status = result.message.status;
        twiml.message("Artículo\nNombre:"+newFood.name+"\nPrecio:"+newFood.price+"\nCantidad:"+newFood.quantity);
        currentStep = "chooseFeatUpdate"
        return restaurantFlow.modifyOptions(twiml);
    }
}

const handleRemoveFood = async (twiml,messageBody) => {
    const result = await getMenuItem(messageBody,RestaurantID);
    console.log(result);
    if(!result.success){
        twiml.message("No se encontró el artículo.");
        currentStep = "removeFood";
        return restaurantFlow.getFoodConsole(twiml);
    }else {
        console.log("entró", result.message);
        newFood.item_id = result.message.item_id;
        newFood.name = result.message.name;
        newFood.price = result.message.price;
        newFood.quantity = result.message.quantity;
        newFood.status = result.message.status;
        currentStep = "validateRemove"
        return restaurantFlow.validateFood(twiml,newFood);
    }
}

export default { handleMessage,resetRestaurantFlow };
