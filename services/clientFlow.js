import { getRestaurantsFromDB, reserveItem } from './dbUtils.js';
import Business from '../models/Business.js';
import WhatsappClientService from './WhatsappClientService.js';

let currentOrder = [];

const clientOptions = (twiml) => {
    twiml.message("¿Qué deseas hacer? Responde con el número:\n1. Ver Menú\n2. Ordenar");
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

const selectItem = async (twiml, restaurantName, item) => {
    return requestItemQuantity(twiml, item);
};

const processItemQuantity = async (twiml, restaurantName, item, quantity) => {
    if (quantity > item.quantity) {
        twiml.message(`Lo siento, solo tenemos ${item.quantity} unidades de ${item.name} disponibles. Por favor, elige una cantidad menor o igual a la disponible.`);
        return twiml;
    }

    const businessId = await getBusinessIdByName(restaurantName);
    if (!businessId) {
        twiml.message("No se pudo encontrar el restaurante.");
        return twiml;
    }
    

    const result = await reserveItem(businessId, item.item_id, quantity);

    if (result.success) {
        currentOrder.push({
            restaurant: restaurantName,
            item: {
                item_id: item.item_id,
                name: item.name,
                price: item.price,
                quantity: quantity
            }
        });
        twiml.message(`Has agregado ${quantity} de ${item.name} a tu orden.\n\n¿Qué deseas hacer ahora?\n1. Agregar otro alimento\n2. Eliminar un alimento\n3. Ver resumen de la orden`);
    } else {
        twiml.message(result.message);
    }
    return twiml;
};

const handleOrderOptions = async (twiml, option) => {
    switch (option) {
        case "1":
            return twiml.message("Selecciona otro alimento del menú para agregar a tu orden.");
        case "2": // Eliminar un alimento
            const itemToRemoveIndex = parseInt(messageBody) - 1;
            if (itemToRemoveIndex >= 0 && itemToRemoveIndex < currentOrder.length) {
                await removeItemFromOrder(currentOrder[itemToRemoveIndex]);
                twiml.message("El alimento ha sido eliminado de tu orden y restaurado al inventario.");
            } else {
                twiml.message("El índice proporcionado no es válido. Intenta de nuevo.");
            }
            return twiml;
        case "3":
            return viewOrderSummary(twiml);
        default:
            return twiml.message("Opción no válida. Selecciona una de las opciones disponibles.");
    }
};

const handleRemoveItemFlow = (twiml) => {
    if (currentOrder.length > 0) {
        let itemsText = "¿Qué alimento deseas eliminar? Responde con el número:\n";
        currentOrder.forEach((orderItem, index) => {
            itemsText += `${index + 1}. ${orderItem.item.name} - ${orderItem.item.quantity} unidades\n`;
        });
        twiml.message(itemsText);
        return "selectItemToRemove";
    } else {
        twiml.message("Tu orden está vacía. No hay nada que eliminar.");
        return "orderOptions";
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

const selectItemToRemove = (selectedIndex, twiml) => {
    
    const itemIndex = parseInt(selectedIndex) - 1;
    
    if (itemIndex >= 0 && itemIndex < currentOrder.length) {
        const selectedItem = currentOrder[itemIndex];
        twiml.message(
            `Has seleccionado ${selectedItem.item.name}. ¿Cuántas unidades deseas eliminar?`
        );
        return { nextStep: "specifyRemoveQuantity", message: twiml, selectedItem: selectedItem};
    } else {
        twiml.message("El índice proporcionado no es válido. Intenta de nuevo.");
        return { nextStep: "selectItemToRemove", message: twiml };
    }
};

const handleRemoveQuantity = async (twiml, selectedItem, quantityToRemove) => {
    const quantity = parseInt(quantityToRemove);
    if (isNaN(quantity) || quantity <= 0) {
        twiml.message("Por favor, ingresa una cantidad válida.");
        return { nextStep: "specifyRemoveQuantity", message: twiml };
    }
    if (quantity > selectedItem.item.quantity) {
        twiml.message(
            `No puedes eliminar más de ${selectedItem.item.quantity} unidades.`
        );
        return { nextStep: "specifyRemoveQuantity", message: twiml };
    }
    // Actualizar la cantidad en la orden
    selectedItem.item.quantity -= quantity;
    if (selectedItem.item.quantity === 0) {
        currentOrder = currentOrder.filter(
            (orderItem) => orderItem !== selectedItem
        );
    }
    // Restaurar la cantidad en la base de datos
    await restoreItemsToDatabase(selectedItem, quantity);

    twiml.message(
        `Se han eliminado ${quantity} unidades de ${selectedItem.item.name} de tu orden.\n\n¿Qué deseas hacer ahora?\n1. Agregar otro alimento\n2. Eliminar un alimento\n3. Ver resumen de la orden`
    );

    return { nextStep: "orderOptions", message: twiml };
};



const viewOrderSummary = (twiml) => {
    if (currentOrder.length === 0) {
        twiml.message("Tu orden está vacía.");
        return twiml;
    }

    let summaryText = "Resumen de tu orden:\n";
    let total = 0;
    
    currentOrder.forEach((orderItem, index) => {
        summaryText += `${index + 1}. ${orderItem.item.name} x ${orderItem.item.quantity} - $${orderItem.item.price * orderItem.item.quantity} (de ${orderItem.restaurant})\n`;
        total += orderItem.item.price * orderItem.item.quantity;
    });

    summaryText += `\nTotal: $${total}\n\nPara finalizar la orden, responde con:\n 1. Confirmar orden\n 2. Cancelar orden`;
    twiml.message(summaryText);
    return twiml;
};

const removeItemFromOrder = async (orderItemToRemove) => {
    const business = await Business.findOne({ name: orderItemToRemove.restaurant });

    if (business) {
        const item = business.menu.find(menuItem => menuItem.item_id === orderItemToRemove.item.item_id);

        if (item) {
            item.quantity += orderItemToRemove.item.quantity;
            await business.save();

            // Eliminar el alimento de la orden actual
            const orderIndex = currentOrder.findIndex(order => order.item.item_id === orderItemToRemove.item.item_id);
            if (orderIndex !== -1) {
                currentOrder.splice(orderIndex, 1);
            }
        } else {
            console.log("Item not found in the menu of the business.");
        }
    } else {
        console.log("Business not found for restaurant:", orderItemToRemove.restaurant);
    }
};

const restoreItemsToDatabase = async (orderData, quantityToRestore = null) => {
    if (!orderData) {
        // Caso: Cancelación de toda la orden

        for (const orderItem of currentOrder) {
            const business = await Business.findOne({ name: orderItem.restaurant });
            if (business) {
                const item = business.menu.find(menuItem => menuItem.item_id === orderItem.item.item_id);
                if (item) {
                    item.quantity += orderItem.item.quantity; 
                    await business.save();
                    WhatsappClientService.resetClientFlow();
                    currentOrder = [];
                } else {
                    console.log("El artículo no se encontró en el menú del negocio.");
                }
            } else {
                console.log("Negocio no encontrado para el restaurante:", orderItem.restaurant);
            }
        }
    } else {
        // Caso: Eliminación de un solo item

        const business = await Business.findOne({ name: orderData.restaurant });
        if (business) {
            const item = business.menu.find(menuItem => menuItem.item_id === orderData.item.item_id);
            if (item) {
                item.quantity += quantityToRestore; // Restaurar la cantidad eliminada
                await business.save();

            } else {
                console.log("El artículo no se encontró en el menú del negocio.");
            }
        } else {
            console.log("Negocio no encontrado para el restaurante:", orderData.restaurant);
        }
    }
};

const resetClientOrder = () => {
    currentOrder = [];
};


export default { 
    clientOptions, 
    showMenu, 
    confirmOrder, 
    askForRestaurantSelection, 
    showRestaurantMenu, 
    selectItem, 
    handleRemoveItemFlow,
    handleOrderOptions, 
    removeItem, 
    viewOrderSummary,
    requestItemQuantity,
    processItemQuantity,
    restoreItemsToDatabase,
    selectItemToRemove,
    handleRemoveQuantity,
    resetClientOrder,
};
