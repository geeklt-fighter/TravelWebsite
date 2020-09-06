const express = require('express')

const router = express.Router()
const { getAllUsers, createUser, getUser,
    updateUser, deleteUser, updateMe,
    deleteMe, getMe, uploadUserPhoto, resizeUserPhoto } = require('../controllers/userController')
const { signup, login, forgotPassword,
    resetPassword, protect, updatePassword,
    restrictTo, logout } = require('../controllers/authController')



// Not actually the REST format
router.post('/signup', signup)
router.post('/login', login) 
router.get('/logout', logout)

router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)


/**
 * This will basically protect all the routes come after this middleware
 * (Middleware runs in sequence)
 */
router.use(protect)

router.get('/me', getMe, getUser)
router.patch('/deleteMe', deleteMe)
router.patch('/updateMyPassword', updatePassword)
router.patch('/updateMe',
    uploadUserPhoto,
    resizeUserPhoto,
    updateMe)



router.use(restrictTo('admin'))

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
