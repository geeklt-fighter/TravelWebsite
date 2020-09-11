/* eslint-disable */
import axios from 'axios'
import { showAlert } from './alerts'

export const getTop5Cheap = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/tours/top-5-cheap'
        })
        // console.log(res.data.data.data)
        return res.data.data.data
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}