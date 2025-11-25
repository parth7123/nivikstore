import React from 'react'
import Title from '../components/Title'

const RefundPolicy = () => {
  return (
    <div className='pt-10 border-t'>
        <div className='text-2xl mb-3'>
            <Title text1={'REFUND'} text2={'POLICY'} />
        </div>

        <div className='flex flex-col gap-6 text-gray-600 text-sm md:text-base mb-20'>
            <p>
                Thank you for shopping at Nivik Store.
            </p>
            <p>
                If, for any reason, You are not completely satisfied with a purchase We invite You to review our policy on refunds and returns.
            </p>
            <p>
                <strong>Conditions for Returns</strong><br/>
                In order for the Goods to be eligible for a return, please make sure that:<br/>
                - The Goods were purchased in the last 7 days.<br/>
                - The Goods are in the original packaging.<br/>
                - The Goods were not used or damaged.
            </p>
            <p>
                The following Goods cannot be returned:<br/>
                - The supply of Goods made to Your specifications or clearly personalized.<br/>
                - The supply of Goods which according to their nature are not suitable to be returned, deteriorate rapidly or where the date of expiry is over.<br/>
                - The supply of Goods which are not suitable for return due to health protection or hygiene reasons and were unsealed after delivery.<br/>
                - The supply of Goods which are, after delivery, according to their nature, inseparably mixed with other items.
            </p>
            <p>
                <strong>Returning Goods</strong><br/>
                You are responsible for the cost and risk of returning the Goods to Us. You should send the Goods at the following address:<br/>
                [Your Physical Address Here]
            </p>
            <p>
                We cannot be held responsible for Goods damaged or lost in return shipment. Therefore, We recommend an insured and trackable mail service. We are unable to issue a refund without actual receipt of the Goods or proof of received return delivery.
            </p>
            <p>
                <strong>Contact Us</strong><br/>
                If you have any questions about our Returns and Refunds Policy, please contact us via email or phone.
            </p>
        </div>
    </div>
  )
}

export default RefundPolicy
