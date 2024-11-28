import mongoose, { Schema, model } from 'mongoose';

const OrderDetSchema = new mongoose.Schema({
    item_id:{type:Number,required:true},
    cantidad:{type:Number,required:true},
    subtotal:{type:Number,required:true}
})

OrderDetSchema.pre('save', async function (next) {
    if (this.isNew) { // Solo incrementar para nuevos documentos
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'itemId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.pos = counter.seq;
    }
    next();
});

const OrderSchema = new mongoose.Schema({
    order_id: { type: Number, unique: true },
    fecha: { type: String, required: true },
    detalles:[OrderDetSchema],
    total:{type: Number, required: true },
    client_id: { type: String, required: true },
    business_id: { type: Number, required: true },
});

OrderSchema.pre('save', async function (next) {
    if (this.isNew) {
        next();
    }
});

export default model('Order', OrderSchema, 'order');