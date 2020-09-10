/* eslint-disable */
import '@babel/polyfill'
import { login, logout } from './login'
import { displayMap } from './mapbox'
import { updateSettings } from './updateSettings'
import { bookTour } from './stripe'
import { singup } from './signup'

// DOM Elements
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const signupForm = document.querySelector('.form--signup')
const logoutButton = document.querySelector('.nav-logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour')

const menubar = document.querySelector('.fas')
const menu = document.querySelector('.nav-menu')
// UI Change
menubar.addEventListener('click', () => {
    if (menubar.classList.contains('fa-bars')) {
        menubar.classList.remove('fa-bars')
        menubar.classList.add('fa-times')
        console.log("open menu")
        menu.classList.add('active')
    } else {
        menubar.classList.remove('fa-times')
        menubar.classList.add('fa-bars')
        console.log("close menu")
        menu.classList.remove('active')
    }
})


// Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations)
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        // Values
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })
}

if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault()
        // Values
        const email = document.getElementById('email').value
        const name = document.getElementById('name').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('passwordConfirm').value

        singup(email, name, password, passwordConfirm)
    })
}

if (logoutButton) {
    logoutButton.addEventListener('click', logout)
}

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault()
        const form = new FormData()
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])

        console.log(form)
        updateSettings(form, 'data')
    })
}


if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault()
        document.querySelector('.btn--save-password').textContent = 'Updating ...'
        const passwordCurrent = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password')

        document.querySelector('.btn--save-password').textContent = 'Save password'
        document.getElementById('password-current').value = ''
        document.getElementById('password').value = ''
        document.getElementById('password-confirm').value = ''
    })
}


if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...'
        const { tourId } = e.target.dataset
        bookTour(tourId)
    })
}
