/* eslint-disable */
import axios from 'axios'
import { showAlert } from "./alerts";

/**
 * 
 * @param {Object} data 
 * @param {String} type password or data
 */
export const updateSettings = async (data, type) => {
    console.log(name, email)
    try {
        const url =
            type === 'password'
                ? 'http://localhost:3000/api/v1/users/updateMyPassword'
                : 'http://localhost:3000/api/v1/users/updateMe'
        const res = await axios({
            method: 'PATCH', 
            url,
            data
        })
        console.log(res)

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`)
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }

}