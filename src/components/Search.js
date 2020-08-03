import React, {useEffect, useState} from 'react'
import { Button, Row, Col, ButtonGroup, Pagination, PaginationItem, PaginationLink, Form, FormGroup, Label, Input} from 'reactstrap';

import axios from 'axios';
import {Clips} from './Clips'
import {StreamerSelect} from './StreamerSelect'

export const Search = () => {
    const [clips,setClips] = useState([])
    const [loading, setLoading] = useState(true)

    const [range, setRange] = useState(0)
    const [timeRange, setTimeRange] = useState(7)
    
    const pagination = [-5,-4,-3,-2,-1,0,1,2,3,4]
    const [pages, setPages] = useState([])
    const [activePage, setActivePage] = useState(0)

    const [numClips, setNumClips] = useState(6)

    const [selectStreamer, setSelStreamer] = useState(false)
    const [streamerList, setStreamerList] = useState([])
    
    useEffect(() => {
        async function getClips(data,t){
            const list = []
            const list2 = []
            console.log(data.data)
            data.data.forEach(d => {
                list.push(d.to_id)
                list2.push(d.to_name)
            })
            setStreamerList(list2)

            var date = new Date()
            date.setDate(date.getDate()-timeRange)
            const year = date.getFullYear()
            const month = (date.getMonth()+1).toString().length===2? date.getMonth()+1: `0${date.getMonth()+1}`
            const day = (date.getDate()).toString().length===2? date.getDate(): `0${date.getDate()}`
            const hours = (date.getHours()).toString().length===2? date.getHours(): `0${date.getHours()}`
            const minutes = (date.getMinutes()).toString().length===2? date.getMinutes(): `0${date.getMinutes()}`
            const seconds = (date.getSeconds()).toString().length===2? date.getSeconds(): `0${date.getSeconds()}`

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
                            first: numClips,
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
                            first: numClips,
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
    },[timeRange, numClips])

    const login = () =>{
        window.location = `https://id.twitch.tv/oauth2/authorize?client_id=denha589zf379hxp046k8o9hhl3cjp&redirect_uri=${window.location.protocol}//${window.location.host}&response_type=token&scope=user:read:email`
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
        if(range+6 < clips.length){
            setRange(range+6)
            setActivePage(activePage+1)
        }
    }

    const leftArrow = () =>{
        if(range-6 >= 0){
            setRange(range-6)
            setActivePage(activePage-1)
        }
    }

    const changeTime = (num) =>{
        setTimeRange(num)
        changePage(0)
    }

    const changePage = (num) =>{
        setRange(num*6)
        setActivePage(num)
    }

    const changeNumClips = (e) => {
        e.preventDefault()
        if(e.target.numclips.value > 100 || e.target.numclips.value < 1)
            return
        changePage(0)
        setNumClips(e.target.numclips.value)
    }

    return (
        <>
        {
            selectStreamer?
            <StreamerSelect selectStreamer={selectStreamer} setSelStreamer={setSelStreamer} streamerList={streamerList}/>:
            loading?
            <Button onClick={login} color="primary">LOGIN</Button>:
            <Col>
                <Row>
                    <ButtonGroup style={{marginBottom:'5px'}} id="timeSelect">
                        {/* <Button onClick={()=>setSelStreamer(true)} style={{marginRight:'10px'}}>Select Streamers</Button> */}
                        <Button onClick={()=>changeTime(1)}>24 Hours</Button>
                        <Button onClick={()=>changeTime(7)}>7 Days</Button>
                        <Button onClick={()=>changeTime(30)}>30 Days</Button>
                        <Button onClick={()=>changeTime(0)}>All Time</Button>
                    </ButtonGroup>
                    <Form onSubmit={changeNumClips} inline style={{marginRight:'100px'}}>
                        <FormGroup>
                            <Label for="numclips" className="mr-sm-2" style={{color:"lightgray !important;"}}>Num. Clips Per Streamer (1-100)</Label>
                            <Input type="number" name="numclips" id="numclips" style={{width:'100px'}}/>
                        </FormGroup>
                        <Button style={{backgroundColor:'#a970ff'}}>Submit</Button>
                    </Form>
                </Row>
                <Row>
                    <Button id="leftButton" onClick={leftArrow} size="lg">{'<-'}</Button>
                    <Clips pages={pages} clips1={clips.slice(range,range+3)} clips2={clips.slice(range+3,range+6)}/>
                    <Button id="rightButton" onClick={rightArrow} size="lg">{'->'}</Button>
                </Row>
                <Pagination id="pages" aria-label="Page navigation example">
                    <PaginationItem>
                        <PaginationLink first onClick={()=>{changePage(0)}} />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink previous onClick={leftArrow}/>
                    </PaginationItem>
                    {
                        pagination.map(page=>(
                            activePage+page===activePage?
                            <PaginationItem id="activePage" key={page}>
                            <PaginationLink>{activePage+page+1}</PaginationLink>
                            </PaginationItem>:
                            pages.includes(activePage+page)?
                            <PaginationItem key={page}>
                            <PaginationLink onClick={()=>changePage(activePage+page)}>{activePage+page+1}</PaginationLink>
                            </PaginationItem>:
                            <></>
                        ))
                    }
                    <PaginationItem>
                        <PaginationLink next onClick={rightArrow} />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink last onClick={()=>{changePage(pages.length-1)}} />
                    </PaginationItem>
                </Pagination>
            </Col>
        }
        </>
    )
}