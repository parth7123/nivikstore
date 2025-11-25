import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'order',
    required: true 
  },
  awb: { 
    type: String, 
    required: true,
    unique: true 
  },
  status: { 
    type: String, 
    default: 'Pending' 
  },
  labelUrl: { 
    type: String 
  },
  courier: { 
    type: String, 
    default: 'BlueDart' 
  },
  provider: { 
    type: String, 
    enum: ['bluedart', 'shiprocket'],
    default: 'bluedart' 
  },
  providerOrderId: { 
    type: String 
  },
  events: [{
    status: String,
    location: String,
    timestamp: Date,
    description: String,
    raw: mongoose.Schema.Types.Mixed
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
shipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Shipment = mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema);

export default Shipment;