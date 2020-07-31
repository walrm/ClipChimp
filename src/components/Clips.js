import React from 'react'
import {CardGroup} from 'reactstrap'

import {Clip} from './Clip'

export const Clips = (props) => {
    const {clips1} = props
    const {clips2} = props

    return (
        <div>
            <CardGroup>
            {
                clips1.map(clip=>(
                    <Clip key={clip.id} clip={clip}/>
                ))  
            }
            </CardGroup>
            <CardGroup>
            {
                clips2.map(clip=>(
                    <Clip key={clip.id} clip={clip}/>
                ))  
            }
            </CardGroup>
        </div>
    )
}
