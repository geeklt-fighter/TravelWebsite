const express = require('express')

const router = express.Router()
const { getAllUsers, createUser, getUser, updateUser, deleteUser } = require('../controllers/userController')
const { signup, login } = require('../controllers/authController')


// Not actually the REST format
router.post('/signup', signup)
router.post('/login', login)

// More REST format
router
    .route('/')
    .get(getAllUsers)
    .post(createUser)

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)


module.exports = router
