

const OrderDetSchema = new mongoose.Schema({
    cliente_id: {type:Number,required:true},
    name:{type:String,required:true},
    telefono:{type:String,required:true}
})