import { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const ShippingPanel = ({ token, order, onShipmentCreated }) => {
  const [loading, setLoading] = useState(false);

  // Calculate total order weight
  const calculateOrderWeight = (items) => {
    let totalWeight = 0;
    items.forEach(item => {
      // Use product weight if available, otherwise default to 0.5kg
      const itemWeight = item.weight ? Number(item.weight) : 0.5;
      totalWeight += item.quantity * itemWeight;
    });
    return totalWeight;
  };

  const createShipment = async () => {
    if (!window.confirm('Are you sure you want to create a shipment for this order?')) {
      return;
    }

    setLoading(true);
    try {
      // Prepare order data for Shiprocket
      const orderItems = order.items.map(item => ({
        name: item.name,
        sku: item._id,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: '123456' // Default HSN code, should be configurable
      }));

      const shipmentData = {
        orderId: order._id,
        orderDate: new Date(order.date).toISOString().split('T')[0],
        pickupLocation: 'Primary Warehouse', // Should be configurable
        billingCustomerName: order.address.firstName,
        billingLastName: order.address.lastName,
        billingAddress: order.address.street,
        billingCity: order.address.city,
        billingPincode: order.address.zipcode,
        billingState: order.address.state,
        billingCountry: order.address.country,
        billingEmail: order.address.email,
        billingPhone: order.address.phone,
        shippingIsBilling: true,
        orderItems: orderItems,
        paymentMethod: order.paymentMethod,
        subTotal: order.amount,
        length: 10, // Default dimensions, should be configurable
        breadth: 10,
        height: 10,
        weight: calculateOrderWeight(order.items)
      };

      const response = await axios.post(
        backendUrl + '/api/shipping/shiprocket/create',
        shipmentData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Shipment created successfully!');
        onShipmentCreated(response.data);
      } else {
        toast.error(response.data.message || 'Failed to create shipment');
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">Shipping Management</h3>
      
      {order.shipmentId ? (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
          <p className="text-green-700 font-medium">Shipment already created</p>
          <p className="text-sm text-gray-600 mt-1">
            AWB: {order.shipmentId.awb}
          </p>
          <div className="mt-2 flex gap-2">
            <a 
              href={order.shipmentId.labelUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
              aria-label="Download shipping label"
            >
              Download Label
            </a>
            <button 
              onClick={() => window.open(`${backendUrl}/api/shipping/shiprocket/track/${order.shipmentId.awb}`, '_blank')}
              className="text-blue-600 hover:underline text-sm"
              aria-label="Track shipment"
            >
              Track Shipment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={createShipment}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Shipment...' : 'Create Shipment'}
          </button>
        </div>
      )}
    </div>
  );
};

ShippingPanel.propTypes = {
  token: PropTypes.string.isRequired,
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.number.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      quantity: PropTypes.number,
      price: PropTypes.number
    })).isRequired,
    address: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      street: PropTypes.string,
      city: PropTypes.string,
      zipcode: PropTypes.string,
      state: PropTypes.string,
      country: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string
    }).isRequired,
    paymentMethod: PropTypes.string,
    amount: PropTypes.number,
    shipmentId: PropTypes.shape({
      awb: PropTypes.string,
      labelUrl: PropTypes.string
    })
  }).isRequired,
  onShipmentCreated: PropTypes.func.isRequired
};

export default ShippingPanel;