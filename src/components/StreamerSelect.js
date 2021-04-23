import React, {useState, useEffect} from 'react'

import {Button, ListGroup, ListGroupItem} from 'reactstrap'

export const StreamerSelect = (props) => {
    const {selectStreamer} = props
    const {setSelStreamer} = props

    const {streamerList} = props

    const [removed, setRemoved] = useState([])

    const removeStream = (streamer) =>{
        var temp = removed
        temp[streamerList.indexOf(streamer)] = !removed[streamerList.indexOf(streamer)]
        setRemoved(temp)
        console.log(removed)
        console.log(removed[streamerList.indexOf(streamer)])
    }
    
    useEffect(()=>{
        let list = []
        for(var i=0; i<streamerList.length; i++){
            list.push(true)
        }
        setRemoved(list)
    },[streamerList.length])

    return (
        <div>
            <ListGroup>
            {
                streamerList.map(streamer=>(
                    removed[streamerList.indexOf(streamer)]===true?
                    <Button outline ><ListGroupItem onClick={()=>{removeStream(streamer)}}>{streamer}</ListGroupItem></Button>:
                    <ListGroupItem style={{backgroundColor:'red'}} onClick={()=>{removeStream(streamer)}}>{streamer}</ListGroupItem>
                ))
            }
            </ListGroup>
            <Button onClick={()=>setSelStreamer(!selectStreamer)}></Button>
        </div>
    )
}
