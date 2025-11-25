import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const TrackingWidget = ({ token, awb: initialAwb }) => {
  const [awb, setAwb] = useState(initialAwb || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const trackShipment = async () => {
    if (!awb) {
      toast.error('Please enter an AWB number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/shipping/shiprocket/track/${awb}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setTrackingData(response.data);
      } else {
        toast.error(response.data.message || 'Failed to track shipment');
        setTrackingData(null);
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast.error('Failed to track shipment');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAwb) {
      setAwb(initialAwb);
      // Auto-track if initial AWB is provided
      if (!trackingData) {
        trackShipment();
      }
    }
  }, [initialAwb]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800';
      case 'in transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'pickup scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">Shipment Tracking</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          placeholder="Enter AWB number"
          className="flex-1 border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={trackShipment}
          disabled={loading || !awb}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </div>

      {trackingData && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-medium">AWB: {trackingData.awb}</p>
              <p className="text-sm text-gray-600">Status: 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(trackingData.status)}`}>
                  {trackingData.status}
                </span>
              </p>
            </div>
            {trackingData.labelUrl && (
              <a 
                href={trackingData.labelUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Download Label
              </a>
            )}
          </div>

          {trackingData.events && trackingData.events.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium">Tracking Timeline</h4>
              <div className="space-y-3">
                {trackingData.events.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      {index < trackingData.events.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-gray-600">{event.location}</p>
                      <p className="text-xs text-gray-500">
                        {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}
                      </p>
                      {event.description && (
                        <p className="text-sm mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No tracking events available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackingWidget;