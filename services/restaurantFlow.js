const restaurantOptions = (twiml) => {
    const message = twiml.message("¿Qué deseas hacer? Responde con el número:\n1. Actualizar Menú\n2. Ver Pedidos");
    return twiml;
};

export default { restaurantOptions };
