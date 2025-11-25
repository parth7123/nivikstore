import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

const ShipmentTracking = ({ orderId, shipmentData }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shipmentData?.awb && shipmentData?.provider) {
      fetchTrackingData();
    }
  }, [shipmentData]);

  const fetchTrackingData = async () => {
    if (!shipmentData?.awb || !shipmentData?.provider) return;
    
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (shipmentData.provider === 'shiprocket') {
        response = await axios.get(
          `${backendUrl}/api/shipping/shiprocket/track/${shipmentData.awb}`,
          { headers: { token } }
        );
      } else {
        // BlueDart tracking
        response = await axios.get(
          `${backendUrl}/api/bluedart/track/${shipmentData.awb}`,
          { headers: { token } }
        );
      }
      
      if (response.data.success) {
        setTrackingData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch tracking data');
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError('Failed to fetch tracking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!shipmentData?.awb || !shipmentData?.provider) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Shipment Tracking</h3>
      
      {loading && (
        <div className="text-gray-500 text-sm">Loading tracking information...</div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      {trackingData && (
        <div className="border rounded p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-medium">AWB: {trackingData.awb}</div>
              <div className="text-sm text-gray-500">
                Courier: {trackingData.courier || shipmentData.courierName}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{trackingData.status}</div>
              {trackingData.labelUrl && (
                <a 
                  href={trackingData.labelUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm underline"
                >
                  Download Label
                </a>
              )}
            </div>
          </div>
          
          {trackingData.events && trackingData.events.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Tracking History</h4>
              <div className="space-y-3">
                {trackingData.events.map((event, index) => (
                  <div key={index} className="flex">
                    <div className="mr-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>
                      {index < trackingData.events.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 ml-1.5"></div>
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="font-medium">{event.status}</div>
                      <div className="text-sm text-gray-500">{event.message}</div>
                      <div className="text-xs text-gray-400">
                        {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}
                        {event.location && ` • ${event.location}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShipmentTracking;