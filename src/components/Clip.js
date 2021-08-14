import React, {useState} from 'react'

import {Card, CardHeader, CardText} from 'reactstrap'

export const Clip = (props) => {
    const {clip} = props
    const [load, setLoad] = useState(false)

    const loadVideo = (e) =>{
        e.preventDefault()
        setLoad(true)
    }

    return (
        <Card body key={clip.id}>
            {
                load?
                <iframe
                    src={`${clip.embed_url}&parent=clipchimp.onrender.com&parent=laughable-poison.surge.sh&parent=localhost&autoplay=false`}
                    scrolling="no"
                    preload="none"
                    allowFullScreen={true}
                    title={clip.id}
                >
                </iframe>:
                <button onClick={loadVideo}><img alt={clip.id} src={clip.thumbnail_url}/></button>
            }
            <CardHeader className="text-center" color="primary"><a rel="noopener noreferrer" target="_blank" href={clip.url}>{clip.title}</a></CardHeader>
            <CardText> Views: {clip.view_count}<br/>{clip.broadcaster_name}</CardText>
        </Card>
    )
}
