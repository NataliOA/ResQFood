import { getRestaurantInfo,saveRestaurant,getOrdersByRestaurant,updateDeliveredOrder,getMenuByRestaurant,removeMenuItem,updateMenuItem, 
    getMenuItem,saveFood,getName
} from "./dbUtils.js";

let id = "0";
const startRestaurant = (twiml) => {
    twiml.message("Bienvenido, para iniciar responde con el número:\n1. Restaurante registrado\n2. Nuevo Restaurante");
    return twiml;
};

const getRestaurant = (twiml) => {
        twiml.message("Por favor, proporciona tu número de identificación de restaurante (Solo números):");
        return twiml;
}

const setRestaurant = (twiml) => {
    twiml.message("Para registrar tu restaurante, primero proporciona el nombre.\nConsidera que tal como lo escribas se va a guardar.");
    return twiml;
}

const setaddress = (twiml) => {
    twiml.message("Para continuar, proporciona la dirección escrita del restaurante.\nConsidera que tal como lo escribas se va a guardar.");
    return twiml;
}

const getRestaurantInformation = async (restId, twiml) => {

    const result = await getRestaurantInfo(restId);

    if(result){
        //twiml.message(`Bienvenido, sus datos son:\nNombre: ${result.restaurant.name}\nDirección: ",result.restaurant.address`);
        return twiml;
    }else {
        twiml.message("No encontramos sus datos. Verifique su código de identificación.");
        return twiml;
    }
}

const saveNewRestaurant = async (restName, restAddress, twiml) => {
    try{
        const result = await saveRestaurant(restName,restAddress);
        console.log(result);
        if (result.success){
            //twiml.message("Su id de restaurante es "+result.message.toString());
            id = result.message;
            console.log(id);
            return twiml;
        }else{
            twiml.message("Hubo un error al intentar guardar sus datos.\nPor favor, intente de nuevo.");
            return twiml;
        }
    }catch(Error){
        console.log(Error.message);
        twiml.message("Hubo un error al intentar guardar sus datos.\nPor favor, intente de nuevo.");
        return twiml;
    }
}

const getRestId = () =>{ 
    const rId = id.toString();
    console.log("A  ",rId);
    return rId;
}

const restaurantOptions = (twiml) => {
    twiml.message("¿Qué deseas hacer? Responde con el número:\n1. Actualizar Menú\n2. Ver Pedidos\n3. Salir");
    return twiml;
};

const getOrdersFrom = async (twiml,restId) => {
    console.log(restId);
    const orders = await getOrdersByRestaurant(restId);
    console.log(orders);
    let orderText = "Órdenes pendientes:\n";

    orders.forEach((order,index) =>{
        orderText += `${index+1}. Orden #${order.order_id} - ${order.client_id}\n$${order.total}\n`;
        if(Array.isArray(order.detalles)){
            const orderDetails = orders.detalles;
            if(orderDetails){
                orderDetails.forEach((det,Detindex) =>{
                    orderText += `  ${Detindex+1}- ${det.item_id}: ${det.cantidad} $${det.subtotal}\n`
                })
            }else{
                orderText += "Sin alimentos.\n"
            }
        }else{
            orderText += "Sin alimentos.\n"
        }

        orderText += "¿Qué deseas hacer? Responde con:\n1. Atrás.";
        twiml.message(orderText);
        return twiml;
         
    })
}

const getOrder = async (twiml) => {
    twiml.message("Por favor, proporciona el número de orden que vas a actualizar (Solo números):");
    return twiml;
}

const updateOrder = async (twiml,orderId) => {
    try{
        const result = await updateDeliveredOrder(orderId);
        if (result.success){
            twiml.message(`La orden se actualizó correctamente.\nOrden #${result.message.pos}\n`);
            return twiml;
        }
    }catch{
        twiml.message("Hubo un error al intentar actualizar la orden.\nPor favor, intente de nuevo.")
        return null;
    }
}

const getMenuFrom = async (twiml,restID) => {
    const Menu = await getMenuByRestaurant(restID);
    let menuText = "Menú:\n";

    Menu.forEach((art, index) => {
        menuText += `${index + 1}. ${art.name}: ${art.price}\n   Cantidad: ${art.quantity}\n   Estado: ${art.status}\n`;
    });

    menuText += "¿Qué deseas hacer?\nResponde con:\n1. Nuevo alimento\n2. Eliminar alimento\n3. Modificar alimento\n4. Salir";
    twiml.message(menuText);
    return twiml;
};

const collectInfo = async (twiml,data) => {
    switch(data){
        case 0:
            twiml.message("Escribe el nombre del artículo (Considera que tal como lo escribas se guardará):");
            return twiml;
        case 1:
            twiml.message("Escribe el precio del artículo (Sin decimales):");
            return twiml;
        case 2:
            twiml.message("Escribe la cantidad disponible del artículo (Sin decimales):");
            return twiml;
        default:
            twiml.message("Ups, no tengo información para esta acción");
            return twiml;
    }
}

const validateFood = async (twiml,info) => {
    twiml.message(`Verifique el movimiento:\n  Nombre: ${info.name}\n  Precio: $${info.price}\n  Cantidad: ${info.quantity}\n¿Los datos son correctos?\nResponde \n1. Sí\n2. No`);
    return twiml;
}

const addFood = async (twiml, newFood, restId) => {
    try{
        console.log("addF")
        console.log(newFood,restId)
        const result = await saveFood(newFood,restId);
        console.log(result);
        if (result.success){
            twiml.message("El artículo se guardó exitosamente.");
            return success.message;
        }
    }catch{
        twiml.message("Hubo un error al intentar guardar sus datos.\nPor favor, intente de nuevo.")
        return null;
    }
}

const modifyOptions = async (twiml) => {
    twiml.message("¿Qué dato deseas cambiar?\nResponde con: 1.Nombre 2.Precio 3.Cantidad")
    return twiml;
}

const modify = async (twiml,feat) => {
    let msg = "";
    console.log(feat);
    switch(feat){
        case 1:
            console.log("1");
            msg = "Escribe el nombre del artículo (Considera que tal como lo escribas se guardará):";
            break;
        case 2:
            console.log("2");
            msg = "Escribe el precio del artículo (Sin decimales):";
            break;
        case 3:
            console.log("3");
            msg = "Escribe la cantidad disponible del artículo (Sin decimales):";
            break;
        default:
            console.log("4");
            msg = "Invalido";
            break;
    }
    console.log(msg);
    twiml.message(msg);
    return twiml;
}

const getFoodConsole = async (twiml) => {
    twiml.message("Escribe el número del artículo a afectar.");
    return twiml;
}

const getFoodById = async (twiml,itemid,restId) => {

    const result = await getMenuItem(itemid,restId);

    if(result){
        
        return twiml;
    }else {
        twiml.message("No encontramos sus datos. Verifique su código de identificación.");
        return twiml;
    }
}

const updateFood = async (twiml,item,restId) => {
    try{
        const result = await updateMenuItem(item,restId);
        if (result.success){
            twiml.message("El artículo se actualizó correctamente.");
            return success.message;
        }
    }catch{
        twiml.message("Hubo un error al intentar actualizar el artículo.\nPor favor, intente de nuevo.")
        return null;
    }
}

const removeFood = async (twiml,item,restId) => {
    try{
        const result = await removeMenuItem(item,restId);
        if (result.success){
            twiml.message("El artículo se eliminó correctamente.");
            return twiml;
        }
    }catch{
        twiml.message("Hubo un error al intentar actualizar el artículo.\nPor favor, intente de nuevo.")
        return twiml;
    }
}

export default { restaurantOptions,startRestaurant,setRestaurant,getRestaurantInformation,getRestaurant,setaddress,saveNewRestaurant,
    getOrdersFrom,getOrder,getMenuFrom,updateOrder,removeFood,updateFood,collectInfo,validateFood,addFood,modify,modifyOptions,
    getFoodConsole,getFoodById,getRestId };
