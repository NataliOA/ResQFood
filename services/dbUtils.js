import Business from '../models/Business.js';
import Order from '../models/Order.js';

export const getRestaurantsFromDB = async () => {
    return await Business.find({});
};

export const getOrdersFromDB = async () => {
    return await Order.find({});
};
// Función para obtener el menú de un negocio específico y filtrar los alimentos disponibles
export const getAvailableMenu = async (restaurantId) => {
    const restaurant = await Business.findOne({ business_id: restaurantId }).select('menu');
    if (!restaurant || !restaurant.menu) {
        throw new Error("El negocio o el menú no se encontraron.");
    }
    return restaurant.menu.filter(item => item.quantity > 0);
};

export const getMenuByRestaurant = async (restaurantId) => {
    const restaurant = await Business.findOne({ business_id: restaurantId }).select('menu');
    if (!restaurant || !restaurant.menu) {
        throw new Error("El negocio o el menú no se encontraron.");
    }
    return restaurant.menu;
};

export const getOrdersByRestaurant = async (restaurantId) => {
    const restaurant = await Business.findOne({ business_id: restaurantId });
    if (!restaurant) {
        throw new Error("El negocio no se encontró.");
    }
    const orders = await getOrdersFromDB();
    return orders.filter(ord => ord.business_id == restaurantId);
};

export const updateDeliveredOrder = async (orderId) => {
    const exists = await Order.findOne({pos: orderId});
    if (!exists){
        throw new Error("No se encontró la orden.");
    }
    const order = await Order.updateOne(
        { pos: orderId }, 
        { $set: { 'order.status': "ENTREGADO" } } 
    );

    if(!order){
        throw new Error("No se pudo actualizar la orden.");
    }

    return {success:true, message: order};
}

export const getRestaurantInfo = async (restaurantId) => {
    const restaurant = await Business.findOne({business_id:restaurantId})
    if (!restaurant || !restaurant.menu) {
        throw new Error("El negocio o el menú no se encontraron.");
    }
    return restaurant;
}

export async function saveRestaurant(restName,restAddress) {

    const newbusiness = new Business({
        name: restName,
        menu: [],
        address: restAddress
    })

    const result = await newbusiness.save();

    console.log("resultado: ",result)

    if(!result){
        throw new Error("El negocio no se creó correctamente.");
    }

    return {success:true, message: result.business_id};
}

export async function saveFood(food,rest) {
    const nuevoItem = food;

    const resultado = await Business.updateOne(
        { business_id: rest }, 
        { $push: { menu: nuevoItem } }
    );

    if(!resultado){
        throw new Error("El negocio no se creó correctamente.");
    }

    return {success:true, message: resultado.menu};
}

export const getMenuItem = async (itemid,restId) => {
    const newItem = await Business.updateOne(
        { business_id: restId, 'menu.item_id': itemid }
    );

    if(!newItem){
        throw new Error("No se pudo encontró el artículo.");
    }

    return {success:true, message: newItem};
}


export const updateMenuItem = async (item,restId) => {
    const newItem = await Business.updateOne(
        { business_id: restId, 'menu.item_id': item.item_id },
        { $set: { 'menu.$': item } } 
    );

    if(!newItem){
        throw new Error("No se pudo actualizar la orden.");
    }

    return {success:true, message: newItem};
}

export const removeMenuItem = async (item,restId) => {
    const resultado = await Business.updateOne(
        { business_id: restId }, 
        { $pull: { menu: { item_id: item.item_id } } } 
    )

    if(!resultado){
        throw new Error("No se pudo actualizar la orden.");
    }

    return {success:true, message: resultado};
}

export async function reserveItem(businessId, itemId, quantity) {
    console.log("itemId", itemId);
    console.log("quantity", quantity);
    console.log("businessId", businessId);

    const business = await Business.findOne({ business_id: businessId }).select('menu');
    console.log("Negocio obtenido después de la consulta:", business);

    if (!business || !business.menu) {
        throw new Error("El negocio o el menú no se encontraron.");
    }

    const item = business.menu.find(menuItem => menuItem.item_id === itemId);

    if (!item) {
        throw new Error("El elemento del menú no se encontró.");
    }

    if (quantity > item.quantity) {
        return { success: false, message: `No hay suficiente cantidad disponible para ${item.name}. Solo hay ${item.quantity} disponible(s).` };
    }

    item.quantity -= quantity;

    business.markModified('menu');

    await business.save();

    return { success: true, message: `${quantity} de ${item.name} reservado(s) correctamente.` };
}

