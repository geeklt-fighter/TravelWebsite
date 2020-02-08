/* eslint-disable */
import '@babel/polyfill'
import { login, logout } from './login'
import { displayMap } from './mapbox'


// DOM Elements
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('form')
const logoutButton = document.querySelector('.nav__el--logout')


// Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations)
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        // Values
        const email = document.querySelector('#email').value
        const password = document.querySelector('#password').value
        login(email, password)
    })
}


if (logoutButton) {
    logoutButton.addEventListener('click', logout)
}




