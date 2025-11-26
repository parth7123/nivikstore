import React from 'react'
import Title from '../components/Title'

const ShippingPolicy = () => {
  return (
    <div className='pt-10 border-t'>
        <div className='text-2xl mb-3'>
            <Title text1={'SHIPPING'} text2={'POLICY'} />
        </div>

        <div className='flex flex-col gap-6 text-gray-600 text-sm md:text-base mb-20'>
            <p>
                <strong>Shipment processing time</strong><br/>
                All orders are processed within 2-3 business days. Orders are not shipped or delivered on weekends or holidays.<br/><br/>
                <strong>Delivery Timelines</strong><br/>
                - Minimum Delivery Time: 3 business days<br/>
                - Maximum Delivery Time: 7 business days<br/>
                Delivery times may vary depending on the delivery location and courier service.
            </p>
            <p>
                If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in shipment of your order, we will contact you via email or telephone.
            </p>
            <p>
                <strong>Shipping rates & delivery estimates</strong><br/>
                Shipping charges for your order will be calculated and displayed at checkout.
            </p>
            <p>
                <strong>Shipment confirmation & Order tracking</strong><br/>
                You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
            </p>
            <p>
                <strong>Customs, Duties and Taxes</strong><br/>
                Nivik Store is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
            </p>
            <p>
                <strong>Damages</strong><br/>
                Nivik Store is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
            </p>
        </div>
    </div>
  )
}

export default ShippingPolicy
