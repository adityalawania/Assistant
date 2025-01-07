import React, { useEffect } from 'react'
import '../App.css'
import Circle from './Circle'
import Swing from './Swing'

function Animation() {

  return (
    <div className='animationContainer'>
    
      <Circle/>
      <Swing/>
    </div>
  )
}

export default Animation