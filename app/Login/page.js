"use client"
import { useRouter } from 'next/navigation'
import { FormEvent } from 'react'
import React, { useState }  from 'react'
import axios from 'axios'
const page = () => {
 const router=useRouter()
const [email, setemail] = useState('')
const [password, setpassword] = useState('')

const submitHandler=async(e)=>
{
  e.preventDefault()

    try {
       
        let post=await axios.post('/api/admin-auth',{email,password})
        console.log(post.data)
        warn("Admin Login Successful")
    } catch (error) {
        console.log(error)
    }
    
}

  return (
    <div className="flex items-center flex-col justify-center h-screen bg-gray-100">
        <h1 className='text-center font-semibold text-slate-900 text-3xl mb-5'>Admin Login</h1>
    {/* Container with shadow effect */}
    <div className="bg-white p-8 rounded-lg shadow-md">
      {/* Login form */}
      <form className="space-y-4" action={submitHandler}>
        {/* Email input */}
        <div>
          <label  className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
           value={email}
            onChange={(e) =>{ setemail(e.target.value),console.log(email)}}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Your email"
          />
        </div>

        {/* Password input */}
        <div>
          <label  className="block text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            type="password"
            value={password}
             onChange={(e)=>setpassword(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Your password"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
         
          
        >
          Log in
        </button>
      </form>
    </div>
  </div>
  )
}

export default page