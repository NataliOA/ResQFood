import Business from '../models/Business.js';

export const getRestaurantsFromDB = async () => {
    return await Business.find({}, { name: 1, menu: 1 });
};

// Función para obtener el menú de un negocio específico y filtrar los alimentos disponibles
export const getAvailableMenu = async (restaurantId) => {
    const restaurant = await Business.findOne({ business_id: restaurantId }).select('menu');
    if (!restaurant || !restaurant.menu) {
        throw new Error("El negocio o el menú no se encontraron.");
    }
    return restaurant.menu.filter(item => item.quantity > 0); // Filtra por cantidad disponible
};

export async function reserveItem(businessId, itemId, quantity) {
    console.log("businessId", businessId);
    
    // Obtiene el restaurante usando el `business_id` e incluye el menú
    const business = await Business.findOne({ business_id: businessId }).select('menu');
    console.log("Negocio obtenido después de la consulta:", business);

    // Verifica que `business` y `menu` existen
    if (!business || !business.menu) {
        throw new Error("El negocio o el menú no se encontraron.");
    }

    // Encuentra el elemento del menú usando su `itemId`
    const item = business.menu.id(itemId);

    // Verifica que el `item` existe
    if (!item) {
        throw new Error("El elemento del menú no se encontró.");
    }

    // Verifica si hay suficiente cantidad disponible
    if (quantity > item.quantity) {
        return { success: false, message: `No hay suficiente cantidad disponible para ${item.name}. Solo hay ${item.quantity} disponible(s).` };
    }

    // Reduce la cantidad del item en el menú
    item.quantity -= quantity;

    // Guarda los cambios en la base de datos
    await business.save();

    return { success: true, message: `${quantity} de ${item.name} reservado(s) correctamente.` };
}
