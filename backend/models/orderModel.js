import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default:'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true , default: false },
    date: {type: Number, required:true},
    hiddenFromAdmin: { type: Boolean, default: false },
    deliveryOption: { type: String, required: false, default: 'normal' }, // 'normal' or 'fast'
    cancelled: { type: Boolean, default: false },
    cancellationDate: { type: Number, required: false },
    cancelledBy: { type: String, required: false }, // 'user' or 'admin',
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' }, // Reference to shipment
    shipping: {
        provider: { type: String, enum: ['bluedart', 'shiprocket'], default: 'bluedart' },
        providerOrderId: { type: String },
        awb: { type: String },
        labelUrl: { type: String },
        courierName: { type: String },
        tracking: [{
            status: { type: String },
            message: { type: String },
            timestamp: { type: Date },
            raw: { type: mongoose.Schema.Types.Mixed }
        }]
    }
})

const orderModel = mongoose.models.order || mongoose.model('order',orderSchema)
export default orderModel;