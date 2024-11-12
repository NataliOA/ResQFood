import mongoose, { Schema, model } from 'mongoose';

// Define un esquema para mantener el contador
const CounterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema);

const MenuItemSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: true }, // Genera automáticamente un _id para cada item
    name: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, default: "disponible" },
    quantity: { type: Number, required: true },
});

const BusinessSchema = new Schema({
    business_id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    menu: [MenuItemSchema], // Utiliza el subdocumento para el menú
});

// Middleware para incrementar el business_id antes de guardar un nuevo negocio
BusinessSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Obtiene y actualiza el contador en la colección Counter
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'businessId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.business_id = counter.seq;
    }
    next();
});

export default model('Business', BusinessSchema);
