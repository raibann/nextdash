'use client'
import React from 'react'
import { Spinner } from './ui/spinner'

const Loading = () => {
  return (
    <div className='flex h-full w-full items-center justify-center rounded-lg'>
      <Spinner className='size-6' />
    </div>
  )
}

export default Loading
