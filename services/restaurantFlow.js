import { getOrdersByRestaurant } from "./dbUtils";

const startRestaurant = (twiml) => {
    twiml.message("Responde con el número:\n1. Restaurante registrado\n2. Nuevo Restaurante");
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

const getRestaurantInfo = async (restId, twiml) => {
    success = false;

    const result = await getRestaurantInfo(restId);

    if(result){
        twiml.message("Bienvenido, sus datos son:\nNombre: ",result.restaurant.name,"\nDirección: ",result.restaurant.address);
        return result.restaurant;
    }else {
        twiml.message("No encontramos sus daots. Verifique su código de identificación.");
        return null;
    }
}

const saveRestaurant = async (restName, restAddress, twiml) => {
    try{
        const result = await saveRestaurant(restName,restAddress);
        if (result.success){
            twiml.message("Su restaurante se guardó exitosamente.\nSu código de identificación es: ",result.message,"\nGuarde este código para poder acceder a su restaurante en futuras ocasiones.");
            return success.message;
        }
    }catch{
        twiml.message("Hubo un error al intentar guardar sus datos.\nPor favor, intente de nuevo.")
        return null;
    }
}

const restaurantOptions = (twiml) => {
    twiml.message("¿Qué deseas hacer? Responde con el número:\n1. Actualizar Menú\n2. Ver Pedidos");
    return twiml;
};

const getOrdersFrom = async (restId,twiml) => {
    const orders = await getOrdersByRestaurant(restId);
    let orderText = "Órdenes pendientes:\n";

    orders.forEach((order,index) =>{
        orderText += `${index+1}. Orden #${art.pos} - ${getName(order.client_id)}\n$${order.total}\n`;
        if(Array.isArray(order.detalles)){
            const orderDetails = orders.detalles;
            if(orderDetails.length > 0){
                orderDetails.forEach((det,Detindex) =>{
                    orderText += `  ${Detindex+1}- ${det.item_id}: ${det.cantidad} $${det.subtotal}\n`
                })
            }else{
                orderText += "Sin alimentos.\n"
            }
        }else{
            orderText += "Sin alimentos.\n"
        }

        orderText += "¿Qué deseas hacer? Responde con:\n1. Atrás\n2. Marcar pedido como entregado.";
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
            twiml.message("La orden se actualizó correctamente.\nOrden #",result.message.pos,"\n");
            return success.message;
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
        menuText += `${index + 1}. ${art.name}: ${art.price}\nCantidad: ${art.quantity}\nEstado: ${art.status}\n`;
    });

    menuText += "¿Qué deseas hacer? Responde con:\n1. Nuevo alimento\n2. Eliminar alimento\n3.Modificar alimento\n";
    twiml.message(menuText);
    return twiml;
};

const collectInfo = async (twiml) => {
    
}

export default { restaurantOptions };
