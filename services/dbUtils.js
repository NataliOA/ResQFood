import Business from '../models/Business.js';

export const getRestaurantsFromDB = async () => {
    return await Business.find({});
};

// Función para obtener el menú de un negocio específico y filtrar los alimentos disponibles
export const getAvailableMenu = async (restaurantId) => {
    const restaurant = await Business.findOne({ business_id: restaurantId }).select('menu');
    if (!restaurant || !restaurant.menu) {
        throw new Error("El negocio o el menú no se encontraron.");
    }
    return restaurant.menu.filter(item => item.quantity > 0);
};

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
