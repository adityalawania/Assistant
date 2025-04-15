import React, { useEffect } from 'react'
import '../App.css'
import Circle from './Circle'
import Swing from './Swing'
import { memo } from 'react'

function Animation(props) {
  
  return (
    <div className='animationContainer'>
     <Circle/>
     <Swing/>
    </div>
  )
}

export default memo(Animation)