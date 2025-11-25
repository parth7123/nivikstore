import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

const ShiprocketOptions = ({ 
  deliveryPincode, 
  weight, 
  dimensions, 
  onShippingOptionSelect,
  selectedOption 
}) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default pickup location (you would configure this based on your warehouse)
  const pickupPincode = '110001'; // Example: Delhi PIN code

  useEffect(() => {
    if (deliveryPincode && weight > 0) {
      fetchShippingOptions();
    }
  }, [deliveryPincode, weight]);

  const fetchShippingOptions = async () => {
    if (!deliveryPincode || weight <= 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/shipping/shiprocket/rates`,
        {
          pickupPincode,
          deliveryPincode,
          weight,
          dimensions
        },
        { headers: { token } }
      );
      
      if (response.data.success) {
        // Process and format the shipping options
        const options = response.data.data?.data?.available_courier_companies || [];
        setShippingOptions(options.map(courier => ({
          id: courier.id,
          name: courier.courier_name,
          rate: courier.rate,
          estimatedDeliveryTime: courier.estimated_delivery_days,
          etd: courier.etd,
          courierCompanyId: courier.courier_company_id
        })));
      } else {
        setError(response.data.message || 'Failed to fetch shipping options');
      }
    } catch (err) {
      console.error('Error fetching shipping options:', err);
      setError('Failed to fetch shipping options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    onShippingOptionSelect({
      provider: 'shiprocket',
      courierName: option.name,
      cost: option.rate,
      estimatedDeliveryTime: option.estimatedDeliveryTime,
      courierCompanyId: option.courierCompanyId,
      ...option
    });
  };

  if (!deliveryPincode || weight <= 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Shiprocket Shipping Options</h3>
      
      {loading && (
        <div className="text-gray-500 text-sm">Loading shipping options...</div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      {!loading && !error && shippingOptions.length === 0 && (
        <div className="text-gray-500 text-sm">No shipping options available for this location.</div>
      )}
      
      <div className="space-y-2">
        {shippingOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleOptionSelect(option)}
            className={`flex items-center justify-between p-3 border rounded cursor-pointer ${
              selectedOption?.courierCompanyId === option.courierCompanyId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
          >
            <div>
              <div className="font-medium">{option.name}</div>
              <div className="text-sm text-gray-500">
                Est. Delivery: {option.estimatedDeliveryTime} days
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">₹{option.rate}</div>
              {option.etd && (
                <div className="text-xs text-gray-500">{option.etd}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShiprocketOptions;