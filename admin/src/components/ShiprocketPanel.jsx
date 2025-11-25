import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const ShiprocketPanel = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState([]);

  const refreshToken = async () => {
    if (!window.confirm('Are you sure you want to refresh the Shiprocket token?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + '/api/shipping/shiprocket/token',
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Shiprocket token refreshed successfully!');
      } else {
        toast.error(response.data.message || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing Shiprocket token:', error);
      toast.error('Failed to refresh Shiprocket token');
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookLogs = async () => {
    // This would typically fetch from a database or log service
    // For now, we'll just show a placeholder
    toast.info('Webhook logs would be displayed here in a real implementation');
  };

  return (
    <div className="border rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">Shiprocket Management</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-medium mb-2">Authentication</h4>
          <p className="text-sm text-gray-600 mb-3">
            Manage your Shiprocket API authentication token. Tokens are automatically refreshed,
            but you can manually refresh if needed.
          </p>
          <button
            onClick={refreshToken}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing Token...' : 'Refresh Token'}
          </button>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded p-3">
          <h4 className="font-medium mb-2">Webhook Logs</h4>
          <p className="text-sm text-gray-600 mb-3">
            View recent webhook events received from Shiprocket. These include tracking updates
            and delivery status changes.
          </p>
          <button
            onClick={fetchWebhookLogs}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            View Webhook Logs
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded p-3">
          <h4 className="font-medium mb-2">Setup Instructions</h4>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Configure your Shiprocket API credentials in the backend .env file</li>
            <li>Set up webhooks in your Shiprocket dashboard:</li>
            <li className="ml-4">URL: {backendUrl}/api/shipping/shiprocket/webhook</li>
            <li className="ml-4">Secret: Your SHIPROCKET_WEBHOOK_SECRET</li>
            <li>Test webhooks using the Postman collection provided</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShiprocketPanel;