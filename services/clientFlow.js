import { getRestaurantsFromDB, reserveItem } from './dbUtils.js';
import Business from '../models/Business.js'; // Asegúrate de importar el modelo Business si es necesario en el código

let currentOrder = [];

const clientOptions = (twiml) => {
    twiml.message("¿Qué deseas hacer? Responde con el número:\n1.1 Ver Menú\n1.2 Ordenar");
    return twiml;
};

const showMenu = async (twiml) => {
    const businesses = await getRestaurantsFromDB();
    let menuText = "Menú de todos los negocios:\n";

    businesses.forEach((business, index) => {
        menuText += `${index + 1}. ${business.name}:\n`;

        if (Array.isArray(business.menu)) {
            const availableItems = business.menu.filter(item => item.quantity > 0);
            if (availableItems.length > 0) {
                availableItems.forEach((item, itemIndex) => {
                    menuText += `  ${itemIndex + 1}. ${item.name} - $${item.price} (Cantidad: ${item.quantity})\n`;
                });
            } else {
                menuText += "  - No hay alimentos disponibles actualmente.\n";
            }
        } else {
            menuText += "  - No hay alimentos disponibles actualmente.\n";
        }

        menuText += '\n';
    });

    menuText += "¿Deseas ordenar? Responde con:\n1. Sí\n2. No";
    twiml.message(menuText);
    return twiml;
};

const confirmOrder = (twiml) => {
    twiml.message("¿Deseas ordenar? Responde con:\n1. Sí\n2. No");
    return twiml;
};

const askForRestaurantSelection = (twiml, restaurants) => {
    let restaurantText = "Selecciona un restaurante:\n";
    restaurants.forEach((restaurant, index) => {
        restaurantText += `${index + 1}. ${restaurant.name}\n`;
    });
    twiml.message(restaurantText);
    return twiml;
};

const showRestaurantMenu = async (twiml, restaurant) => {
    let menuText = `Menú de ${restaurant.name}:\n`;
    const availableItems = restaurant.menu.filter(item => item.quantity > 0);

    if (availableItems.length > 0) {
        availableItems.forEach((item, index) => {
            menuText += `${index + 1}. ${item.name} - $${item.price}\n`;
        });
        menuText += "\nResponde con el número del alimento para agregarlo a tu orden.";
    } else {
        menuText += "No hay alimentos disponibles actualmente.";
    }

    twiml.message(menuText);
    return twiml;
};

const getBusinessIdByName = async (restaurantName) => {
    const restaurant = await Business.findOne({ name: restaurantName }, { business_id: 1 });
    return restaurant ? restaurant.business_id : null;
};

const requestItemQuantity = (twiml, selectedItem) => {
    twiml.message(`Has seleccionado ${selectedItem.name}.\nCantidad disponible: ${selectedItem.quantity}\n\n¿Cuántas unidades deseas ordenar?`);
    return twiml;
};

// Modifica selectItem en lugar de añadir el item a la orden inmediatamente
const selectItem = async (twiml, restaurantName, item) => {
    return requestItemQuantity(twiml, item);
};

// Nueva función para procesar la cantidad solicitada y verificar disponibilidad
const processItemQuantity = async (twiml, restaurantName, item, quantity) => {
    if (quantity > item.quantity) {
        twiml.message(`Lo siento, solo tenemos ${item.quantity} unidades de ${item.name} disponibles. Por favor, elige una cantidad menor o igual a la disponible.`);
        return twiml;
    }

    // Llama a `reserveItem` con el `business_id` y `item_id`
    const businessId = await getBusinessIdByName(restaurantName);
    if (!businessId) {
        twiml.message("No se pudo encontrar el restaurante.");
        return twiml;
    }

    const result = await reserveItem(businessId, item._id, quantity);

    if (result.success) {
        currentOrder.push({
            restaurant: restaurantName,
            item: { ...item, quantity },
        });
        twiml.message(`Has agregado ${quantity} de ${item.name} a tu orden.\n\n¿Qué deseas hacer ahora?\n1. Agregar otro alimento\n2. Eliminar un alimento\n3. Ver resumen de la orden`);
    } else {
        twiml.message(result.message);
    }
    return twiml;
};

const handleOrderOptions = (twiml, option) => {
    switch (option) {
        case "1":
            return twiml.message("Selecciona otro alimento del menú para agregar a tu orden.");
        case "2":
            return removeItem(twiml);
        case "3":
            return viewOrderSummary(twiml);
        default:
            return twiml.message("Opción no válida. Selecciona una de las opciones disponibles.");
    }
};

const removeItem = (twiml) => {
    if (currentOrder.length === 0) {
        twiml.message("No tienes alimentos en tu orden para eliminar.");
        return twiml;
    }

    let orderText = "Selecciona el número del alimento que deseas eliminar:\n";
    currentOrder.forEach((orderItem, index) => {
        orderText += `${index + 1}. ${orderItem.item.name} - $${orderItem.item.price}\n`;
    });
    twiml.message(orderText);
    return twiml;
};

const viewOrderSummary = (twiml) => {
    if (currentOrder.length === 0) {
        twiml.message("Tu orden está vacía.");
        return twiml;
    }

    let summaryText = "Resumen de tu orden:\n";
    let total = 0;

    currentOrder.forEach((orderItem, index) => {
        summaryText += `${index + 1}. ${orderItem.item.name} - $${orderItem.item.price} (de ${orderItem.restaurant})\n`;
        total += orderItem.item.price;
    });

    summaryText += `\nTotal: $${total}\n\nPara finalizar la orden, responde con 'Finalizar' o elige otra acción.`;
    twiml.message(summaryText);
    return twiml;
};

export default { 
    clientOptions, 
    showMenu, 
    confirmOrder, 
    askForRestaurantSelection, 
    showRestaurantMenu, 
    selectItem, 
    handleOrderOptions, 
    removeItem, 
    viewOrderSummary,
    requestItemQuantity,
    processItemQuantity,
};
