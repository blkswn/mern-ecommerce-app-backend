import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'


//@desc authenticate user & get token
//@route POST /api/users/login
//access Public
const authUser = asyncHandler(async (req, res) => {

    //body data
  const { email, password } = req.body

 const user = await User.findOne({ email})

 if(user && (await user.matchPassword(password))){
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
    })
 }else{
    res.status(401).json({message:'Invalid email or password'})
 }
})

//@desc register new user
//@route POST /api/users
//access Public
const registerUser = asyncHandler(async (req, res) => {

    //body data
  const { name, email, password } = req.body

 const userExists = await User.findOne({ email})

 if(userExists){
    res.status(400)
    throw new Error('User already exists')
 }
 const user = await User.create({
    name, 
    email, 
    password
 })

 if(user){
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
    })

 }else{
    res.status(400)
    throw new Error('Invalid user data')
 }

 
})

//@desc GET user profile
//@route GET /api/uses/profile
//access Private
const getUserprofile = asyncHandler(async (req, res) => {
   const user = await User.findById(req.user._id)

   if(user){
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
    })
   }else{
    res.status(404)
    throw new Error('User not found')
   }
  })

  //@desc Update user profile
//@route Put /api/uses/profile
//access Private
const updateUserProfile = asyncHandler(async (req, res) => {
   const user = await User.findById(req.user._id)

   if(user){
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      if(req.body.password){
         user.password = req.body.password
      }

      const updatedUser = await user.save()

      res.json({
         _id: updatedUser._id,
         name: updatedUser.name,
         email: updatedUser.email,
         isAdmin: updatedUser.isAdmin,
         token: generateToken(updatedUser._id)
     })
   }else{
    res.status(404)
    throw new Error('User not found')
   }
  })


  //@desc GET all users
//@route GET /api/users
//access Private
const getUsers = asyncHandler(async (req, res) => {
   const users = await User.find({})
   res.json(users)
  })

//@desc Delete user
//@route DELETE /api/users/:id
//access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id)
   if (user){
      await user.deleteOne()
      res.json({message: 'User removed'})
   }else{
      res.status(404)
      throw new Error('User not found')
   }
   
  })


//@desc GET user by id
//@route GET /api/users/:id
//access Private/Admin
  const getUserById = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id).select('-password')
   if (user){
      res.json(user)
   }else{
      res.status(404)
      throw new Error('User not found')
   }
   
  })

//@desc Update user
//@route Put /api/users/:id
//access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id)

   if(user){
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.isAdmin = req.body.isAdmin === undefined ? user.isAdmin : req.body.isAdmin


      const updatedUser = await user.save()

      res.json({
         _id: updatedUser._id,
         name: updatedUser.name,
         email: updatedUser.email,
         isAdmin: updatedUser.isAdmin,
     })
   }else{
    res.status(404)
    throw new Error('User not found')
   }
  })


export{
    authUser, getUserprofile, registerUser, updateUserProfile, getUsers, deleteUser,
    getUserById, updateUser
}