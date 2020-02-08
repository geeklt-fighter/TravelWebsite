/* eslint-disable */
import axios from 'axios'
import { showAlert } from "./alerts";

export const login = async (email, password) => {
    console.log(email, password)
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully')
            window.setTimeout(() => {
                location.assign('/')
            }, 15)
        }
        console.log(res)
    } catch (err) {
        showAlert('error', err.response.data.message)
    }

}

export const logout = async()=>{
    try {
        const res = await axios({
            method:'GET',
            url: 'http://localhost:3000/api/v1/users/logout'
        })
        if (res.data.status === 'success') {
            location.reload(true)   // force reload from the server not the browser cache
        }
    } catch (err) {
        console.log(err.response)
        showAlert('error', 'Err Logging out! Trying again')
    }
}