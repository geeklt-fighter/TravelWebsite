/* eslint-disable */
import axios from 'axios'
import { showAlert } from './alerts'
const stripe = Stripe('pk_test_51HNqymI2TJzWV13FJpcnciTxQZ1eFq2oba2msr4Pru3jTstU5ipsyBVkkT8GZV9pyLX8gsVUxbrxkjONSBPgwUmw00F9ID4iZh')


export const bookTour = async tourId => {

    try {
        // Get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
        console.log(session)
        // Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id 
        })
    } catch (err) {
        showAlert('error',err)
    }
}