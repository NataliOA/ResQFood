import mongoose, { Schema, model } from 'mongoose';
// Define un esquema para mantener el contador
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', CounterSchema);
const MenuItemSchema = new mongoose.Schema({
    item_id: { type: Number, unique: true, required:false }, // Campo autoincremental para item_id
    name: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true, default: "disponible" },
    quantity: { type: Number, required: true }
});

// Middleware para incrementar item_id antes de guardar un nuevo elemento en el menú
MenuItemSchema.pre('save', async function (next) {
    if (this.isNew) { // Solo incrementar para nuevos documentos
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'itemId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.item_id = counter.seq;
    }
    next();
});

const BusinessSchema = new mongoose.Schema({
    business_id: { type: Number, unique: true, required: false },
    name: { type: String, required: true },
    menu: [MenuItemSchema],
    address: {type: String, required:true}
});

BusinessSchema.pre('save', async function (next) {
    //console.log("middleware")
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'businessId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        if (counter) {
            this.business_id = counter.seq;
        } else {
            throw new Error('No se pudo generar el business_id');
        }
        //console.log("middleware ", counter)
    }
    next();
});

export default model('Business', BusinessSchema, 'business');
