import React, { useEffect } from 'react'
import '../App.css'
import Circle from './Circle'
import Swing from './Swing'

function Animation(props) {
  
  return (
    <div className='animationContainer'>
     <Circle/>
     <Swing/>
    </div>
  )
}

export default Animation