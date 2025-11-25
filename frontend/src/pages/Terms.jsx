import React from 'react'
import Title from '../components/Title'

const Terms = () => {
  return (
    <div className='pt-10 border-t'>
        <div className='text-2xl mb-3'>
            <Title text1={'TERMS &'} text2={'CONDITIONS'} />
        </div>

        <div className='flex flex-col gap-6 text-gray-600 text-sm md:text-base mb-20'>
            <p>
                Welcome to Nivik Store! These terms and conditions outline the rules and regulations for the use of Nivik Store's Website.
            </p>
            <p>
                By accessing this website we assume you accept these terms and conditions. Do not continue to use Nivik Store if you do not agree to take all of the terms and conditions stated on this page.
            </p>
            <p>
                The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves.
            </p>
            <p>
                <strong>Cookies</strong><br/>
                We employ the use of cookies. By accessing Nivik Store, you agreed to use cookies in agreement with the Nivik Store's Privacy Policy.
            </p>
            <p>
                <strong>License</strong><br/>
                Unless otherwise stated, Nivik Store and/or its licensors own the intellectual property rights for all material on Nivik Store. All intellectual property rights are reserved. You may access this from Nivik Store for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
            <p>
                You must not:<br/>
                - Republish material from Nivik Store<br/>
                - Sell, rent or sub-license material from Nivik Store<br/>
                - Reproduce, duplicate or copy material from Nivik Store<br/>
                - Redistribute content from Nivik Store
            </p>
            <p>
                <strong>Disclaimer</strong><br/>
                To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:<br/>
                - limit or exclude our or your liability for death or personal injury;<br/>
                - limit or exclude our or your liability for fraud or fraudulent misrepresentation;<br/>
                - limit any of our or your liabilities in any way that is not permitted under applicable law; or<br/>
                - exclude any of our or your liabilities that may not be excluded under applicable law.
            </p>
        </div>
    </div>
  )
}

export default Terms
