import Business from '../models/Business.js';
import Order from '../models/Order.js';
import Client from '../models/Client.js';

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

export const getDetsByOrder = async (orderId) => {
    const order = await Order.findOne({ order_id: orderId }).select('detalles');
    console.log("orden",order);
    if (!order || !order.detalles) {
        throw new Error("No se encontró la orden.");
    }
    console.log("detalles",order.detalles)
    return order.detalles;
};

export const getItemName = async (itemid, restId) => {
    const menu = await getMenuByRestaurant(restId);
    console.log("menu",menu);
    const art = menu.find((item) => item.item_id == itemid);
    console.log("art",art);

    return art.name;
}

export const getName = async (id) => {
    const client = await Client.findOne({cliente_id:id});
    return client.name;
}

export const getOrdersByRestaurant = async (restaurantId) => {
    const orders = await Order.find({business_id:restaurantId});
    
    console.log(orders);

  for(const order of orders){
    order.detalles = await getDetsByOrder(order.order_id);
  }

    console.log(orders);

    return orders;
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
    });

    const result = await newbusiness.save();

    if(!result){
        throw new Error("El negocio no se creó correctamente.");
    }

    console.log(result);
    let id = parseInt(result.business_id);
    console.log(id);

    return id;
}

// export function getNewRestaurantId(){
//     return id
// }

export const saveFood = async (food,rest) => {
    console.log("addFood");
    const nuevoItem = food;
    console.log(food);

    let menu = await getMenuByRestaurant(rest);
    let newID = menu.length + 1;
    const resultado = await Business.findOneAndUpdate(
        { business_id: rest }, 
        { $push: { menu: {item_id: newID,name: nuevoItem.name,price: nuevoItem.price,status: nuevoItem.status,quantity: nuevoItem.quantity}} },
        { new: true }
    );

    console.log("res: ",resultado)

    if(!resultado){
        throw new Error("El artículo no se creó correctamente.");
    }

    return {success:true, message: resultado.menu};
}

export const getMenuItem = async (itemid,restId) => {
    const menu = await getMenuByRestaurant(restId);

    const newItem = menu.find(item => item.item_id == itemid);

    console.log("ni",newItem);

    if(!newItem){
        throw new Error("No se pudo encontrar el artículo.");
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

