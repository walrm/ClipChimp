import React, {useEffect, useState} from 'react'
import { Button, Row, Col, ButtonGroup, Pagination, PaginationItem, PaginationLink, Form, FormGroup, Label, Input} from 'reactstrap';

import axios from 'axios';
import {Clips} from './Clips'
import {StreamerSelect} from './StreamerSelect'

export const Search = () => {
    const [clips,setClips] = useState([])
    const [loading, setLoading] = useState(true)

    const [range, setRange] = useState(0)
    const times = [1, 7, 30, 0]
    const [activeTime, setactiveTime] = useState(7)
    const [timeRange, setTimeRange] = useState(7)
    
    const pagination = [-5,-4,-3,-2,-1,0,1,2,3,4]
    const [pages, setPages] = useState([])
    const [activePage, setActivePage] = useState(0)

    const [numClips, setNumClips] = useState(6)

    const [selectStreamer, setSelStreamer] = useState(false)
    const [streamerList, setStreamerList] = useState([])
    
    useEffect(() => {
        const token = window.location.hash
        if(token === "")
            return
        const t = token.substring(token.indexOf('=')+1,token.indexOf('&'))

        axios.get('https://clipchimp-backend.herokuapp.com/setup', {
            params:{
                numClips: numClips,
                timeRange: timeRange,
                token: t,
            }
        }).then(res=>{
            var followed = res.data.data

            const list = []
            const list2 = []
            followed.forEach(d => {
                list.push(d.to_id)
                list2.push(d.to_name)
            })
            setStreamerList(list2)

            var clipData = []
            for(var i=0; i<list.length; i++){
                axios.get('https://clipchimp-backend.herokuapp.com/getclips',{
                    params:{
                        token: t,
                        list: list,
                        i: i,
                    }
                }).then(res => {
                    var temp = res.data.data
                    for(var j=0; j<temp.length; j++){
                        clipData.push(temp[j])
                    }
                    sortClips(clipData)
                    setClips(clipData)
                    var array = []
                    for(var ind=0; ind<Math.ceil(clipData.length/6); ind++){
                        array.push(ind)
                    }
                    setPages(array)
                })
            }
        }).catch(err=>{
            console.log(err)
        })
    },[timeRange, numClips])

    const login = () =>{
        console.log(window.location.protocol);
        console.log(window.location.host);
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
        setactiveTime(num)
        changePage(0)
        setTimeRange(num)
        
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
                        {
                            times.map(time =>(
                                time===activeTime?
                                time===0?
                                <Button id='activeTime' onClick={()=>changeTime(time)}>All time</Button>:
                                <Button id='activeTime' onClick={()=>changeTime(time)}>{time} days</Button>:
                                time===0?
                                <Button onClick={()=>changeTime(time)}>All time</Button>:
                                <Button onClick={()=>changeTime(time)}>{time} days</Button>
                            ))
                        }
                    </ButtonGroup>
                    <Form onSubmit={changeNumClips} inline style={{marginRight:'100px'}}>
                        <FormGroup>
                            <Label for="numclips" className="mr-sm-2" style={{color:'white'}}>Num. Clips Per Streamer (1-100)</Label>
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