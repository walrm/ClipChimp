import React, {useEffect, useState} from 'react'
import { Button, Row, Col, ButtonGroup, Pagination, PaginationItem, PaginationLink} from 'reactstrap';

import axios from 'axios';
import {Clips} from './Clips'

export const Search = () => {
    const [clips,setClips] = useState([])
    const [range, setRange] = useState(0)
    const [timeRange, setTimeRange] = useState(7)
    const [loading, setLoading] = useState(true)
    const [pages, setPages] = useState([])
    
    useEffect(() => {
        async function getClips(data,t){
            const list = []
            data.data.forEach(d => {
                list.push(d.to_id)
            })

            var date = new Date()
            date.setDate(date.getDate()-timeRange)
            const year = date.getFullYear()
            const month = (date.getMonth()+1).toString().length===2? date.getMonth()+1: `0${date.getMonth()+1}`
            const day = (date.getDate()).toString().length===2? date.getDate(): `0${date.getDate()}`
            const hours = (date.getHours()).toString().length===2? date.getHours(): `0${date.getHours()}`
            const minutes = (date.getMinutes()).toString().length===2? date.getMinutes(): `0${date.getMinutes()}`
            const seconds = (date.getSeconds()).toString().length===2? date.getSeconds(): `0${date.getSeconds()}`
            console.log(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`)

            var clipData = []
            if(timeRange!==0){
                for(var i=0; i<list.length; i++){
                    axios.get('https://api.twitch.tv/helix/clips',{
                        headers:{
                            'Client-ID': 'denha589zf379hxp046k8o9hhl3cjp',
                            Authorization: `Bearer ${t}`
                        },
                        params:{
                            broadcaster_id: list[i],
                            first: 6,
                            started_at: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
                        }
                    }).then(res => {
                        res.data.data.forEach(d => {
                            clipData.push(d)
                        })
                        sortClips(clipData)
                        setClips([...clipData])
                        var array = []
                        var counter = 0;
                        for(var ind=0; ind<Math.ceil(clipData.length/6); ind++){
                            array.push(counter)
                            counter++
                        }
                        setPages(array)
                    })
                }
            }else {
                for(i=0; i<list.length; i++){
                    axios.get('https://api.twitch.tv/helix/clips',{
                        headers:{
                            'Client-ID': 'denha589zf379hxp046k8o9hhl3cjp',
                            Authorization: `Bearer ${t}`
                        },
                        params:{
                            broadcaster_id: list[i],
                            first: 6,
                        }
                    }).then(res => {
                        res.data.data.forEach(d => {
                            clipData.push(d)
                        })
                        sortClips(clipData)
                        setClips([...clipData])
                        var array = []
                        var counter = 0;
                        for(var ind=0; ind<Math.ceil(clipData.length/6); ind++){
                            array.push(counter)
                            counter++
                        }
                        setPages(array)
                    })
                }
            }
        }

        async function getFollowers(data,t){
            const id = data.data[0].id
            console.log(id)
    
            axios.get('https://api.twitch.tv/helix/users/follows',{
                headers:{
                    'Client-ID': 'denha589zf379hxp046k8o9hhl3cjp',
                    Authorization: `Bearer ${t}`
                },
                params: {
                    from_id: id,
                    first: 100
                }
            }).then(res =>{
                console.log('successfully got follows')
                getClips(res.data,t)
            }).catch(err => {
                console.log(err)
            })
        }

        const token = window.location.hash
        if(token === "")
            return
        const t = token.substring(token.indexOf('=')+1,token.indexOf('&'))
        
        axios.get('https://api.twitch.tv/helix/users',{
            headers:{
                'Client-ID': 'denha589zf379hxp046k8o9hhl3cjp',
                Authorization: `Bearer ${t}`
            },
        }).then(res =>{
            getFollowers(res.data,t)
        }).catch(err => {
            console.log(err)
        })
    },[timeRange])

    const login = () =>{
        window.location = `https://id.twitch.tv/oauth2/authorize?client_id=denha589zf379hxp046k8o9hhl3cjp&redirect_uri=${window.location}&response_type=token&scope=user:read:email`
    }

    const sortClips = (clipData) =>{
        for(var i=0; i<clipData.length; i++){
            var reset = false
            while(i < clipData.length-1 && clipData[i].view_count < clipData[i+1].view_count){
                var temp = clipData[i];
                clipData[i] = clipData[i+1]
                clipData[i+1] = temp
                i++
                reset = true;
            }
            if(reset)
                i=0   
        }
        setLoading(false)
        return clipData
    }

    const rightArrow = () =>{
        if(range+6 < clips.length)
            setRange(range+6)
    }

    const leftArrow = () =>{
        if(range-6 >= 0)
            setRange(range-6)
    }

    const change24 = () =>{
        setTimeRange(1)
    }
    const change7 = () =>{
        setTimeRange(7)
    }
    const change30 = () =>{
        setTimeRange(30)
    }
    const changeAll = () =>{
        setTimeRange(0)
    }

    const changePage = (num) =>{
        setRange(num*6)
    }

    return (
        <>
        {
            loading?
            <Button onClick={login} color="primary">LOGIN</Button>:
            <Col>
                <Row>
                    <ButtonGroup style={{marginBottom:'5px'}} id="timeSelect">
                        <Button style={{marginRight:'10px'}}>Select Streamers</Button>
                        <Button onClick={change24}>24 Hours</Button>
                        <Button onClick={change7}>7 Days</Button>
                        <Button onClick={change30}>30 Days</Button>
                        <Button onClick={changeAll}>All Time</Button>
                    </ButtonGroup>
                </Row>
                <Row>
                    <Button id="leftButton" onClick={leftArrow} size="lg">{'<-'}</Button>
                    <Clips pages={pages} clips1={clips.slice(range,range+3)} clips2={clips.slice(range+3,range+6)}/>
                    <Button id="rightButton" onClick={rightArrow} size="lg">{'->'}</Button>
                </Row>
                <Pagination id="pages" style={{marginTop:'5px'}}>
                    {
                        pages.map(page=>(
                            <PaginationItem key={page}>
                                <PaginationLink onClick={()=>changePage(page)}>{page+1}</PaginationLink>
                            </PaginationItem>
                        ))  
                    }
                </Pagination>
            </Col>
        }
        </>
    )
}