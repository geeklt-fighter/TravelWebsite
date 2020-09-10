/* eslint-disable */
import axios from 'axios'
import { showAlert } from "./alerts";

export const singup = async (email,name, password,passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        })


        if (res.data.status === 'success') {
            showAlert('success', `Welcome to tl travel`)
            window.setTimeout(() => {
                location.assign('/')
            }, 15)
        }
    
    } catch (err) {
        showAlert('error', err.response.data.message)
    }

}
