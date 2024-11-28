import mongoose, { Schema, model } from 'mongoose';

const ClientSchema = new mongoose.Schema({
    cliente_id: {type:Number,required:true},
    name:{type:String,required:true},
    telefono:{type:String,required:true}
})

export default model('Client', ClientSchema, 'client');