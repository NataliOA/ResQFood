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
    twiml.message("¿Qué deseas hacer? Responde con el número:\n1. Actualizar Menú\n2. Ver Pedidos\n3. Salir");
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

    menuText += "¿Qué deseas hacer? Responde con:\n1. Nuevo alimento\n2. Eliminar alimento\n3.Modificar alimento\n4.Salir";
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
    twiml.message("El producto a añadir es el siguiente:\n  Nombre: ",info.name,"\n  Precio: $",info.price,"\n  Cantidad: ",info.quantity,"\n¿Los datos son correctos?\nResponde 1.Sí 2.No");
    return twiml;
}

const addFood = async (twiml, newFood, restId) => {
    try{
        const result = await saveFood(newFood,restId);
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
    switch(feat){
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
            return twiml;
    }
}

const getFood = async (twiml) => {
    twiml.message("Escribe el número del artículo a afectar.");
    return twiml;
}

const getFoodById = async (twiml,itemId,restId) => {
    success = false;

    const result = await getMenuItem(itemId,restId);

    if(result){
        twiml.message("Artículo\nNombre: ",result.name,"\nPrecio: ",result.price,"\nCantidad:",result.quantity);
        return result;
    }else {
        twiml.message("No encontramos sus daots. Verifique su código de identificación.");
        return null;
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
            return success.message;
        }
    }catch{
        twiml.message("Hubo un error al intentar actualizar el artículo.\nPor favor, intente de nuevo.")
        return null;
    }
}

export default { restaurantOptions,startRestaurant,setRestaurant,getRestaurantInfo,getRestaurant,setaddress,saveRestaurant,
    getOrdersFrom,getOrder,getMenuFrom,updateOrder,removeFood,updateFood,collectInfo,validateFood,addFood,modify,modifyOptions,
    getFood,getFoodById };
