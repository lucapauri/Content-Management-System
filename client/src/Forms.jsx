import { useState } from "react"
import { Form, Row, Col, Container, Button, Image, Alert} from "react-bootstrap"
import { useNavigate, useParams } from "react-router"
import {ImageList, ImageListItem} from '@mui/material'
import dayjs from 'dayjs'
import validator from 'validator'

function MyForm(props){

    const {id} = useParams()
    const page = id && props.pages.find(p=>p.id===parseInt(id))
    const navigate = useNavigate()
    const [title, setTitle] = useState(page ? page.title : "")
    const [published, setPublished] = useState(page ? (page.publicationDate ? true : false) : false)
    const [date, setDate] = useState(page ? page.publicationDate : "")
    const [contents, setContents] = useState(page ? page.contents : [])

    const handleSubmit = (e) => {
        e.preventDefault()
        let valid = true
        let errors = []
        let creationDate = page ? page.creationDate : dayjs().format('YYYY-MM-DD')
        if(validator.isEmpty(title.trim())){
            valid = false
            errors = [...errors, {msg:'Title must not be empty'}]
        }
        if(!validator.isDate(date) && !validator.isEmpty(date)){
            valid = false
            errors = [...errors, {msg:'Invalid publication date'}]
        }
        if(date){
            if(dayjs(creationDate).isAfter(dayjs(date))){
            valid = false
            errors = [...errors, {msg:'Publication date must be after creation date'}]
            }
        }
        if(!contents.find(c=>c.type=='Header')){
            valid = false
            errors = [...errors, {msg:'At least one header required'}]
        }
        if(contents.length<2){
            valid = false
            errors = [...errors, {msg:'At least two contents required'}]
        }
        if(contents.find(c=>validator.isEmpty(c.content))){
            valid = false
            errors = [...errors, {msg:'Contents must not be empty'}]
        }
        if(!valid){
            props.handleErr({errors:errors})
            return
        }
        if(page){
            props.editPage(page.id, title, page.authorId, page.authorName, page.creationDate, date || null, contents)
        }else{
            props.addPage(title, date || null, contents)
        }
    }
    return(
        <Container fluid = {true} style={{marginTop:"4rem"}}>
            <Row className="align-items-center">
                <Col xs={2}></Col>
                <Col xs={8}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" value={title} placeholder="Insert title..." onChange={(e) => {
                                setTitle(e.target.value)
                            }}/>
                        </Form.Group>
                        {
                            contents.map((c, index)=>{
                                return(
                                    <Row key={index}>
                                        <Col xs ={11}>
                                            <Form.Group style={{ marginTop: "35px" }}>
                                                <Form.Select onChange={(e) => {
                                                    setContents(contents => contents.map((content, i) => {
                                                        if (i == index) {
                                                            return {
                                                                type: e.target.value,
                                                                content: ""
                                                            }
                                                        } else {
                                                            return content
                                                        }
                                                    }))
                                                }} value={contents.find((c, i) => i == index).type} style={{ marginBottom: "7px" }}>
                                                    <option value="Image">Image</option>
                                                    <option value="Header">Header</option>
                                                    <option value="Paragraph">Paragraph</option>
                                                </Form.Select>
                                                {
                                                    (c.type !== 'Image') ?
                                                        <Form.Control as="textarea" placeholder="Insert content..." value={c.content} onChange={(e) => {
                                                            setContents(contents => contents.map((content, i) => {
                                                                if (index == i) {
                                                                    return {
                                                                        type: content.type,
                                                                        content: e.target.value
                                                                    }
                                                                } else {
                                                                    return content
                                                                }
                                                            }))
                                                        }} rows={(c.type == 'Header') ? 2 : 5} />
                                                        :
                                                        <ImageList rowHeight={120} cols={4}>
                                                            {
                                                                props.images.map((img, imgInd) => {
                                                                    return (
                                                                        <ImageListItem key={imgInd}>
                                                                            <Image id={img} src={`http://localhost:3001/static/${img}`} fluid onClick={(e) => {
                                                                                setContents(contents => contents.map((content, i) => {
                                                                                    if (i == index) {
                                                                                        return {
                                                                                            type: content.type,
                                                                                            content: e.target.id
                                                                                        }
                                                                                    } else {
                                                                                        return content
                                                                                    }
                                                                                }))
                                                                            }} thumbnail={contents.find((co, i) => i == index).content == img} rounded />
                                                                        </ImageListItem>
                                                                    )
                                                                })
                                                            }
                                                        </ImageList>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col xs={1}>
                                            <Row style={{ marginTop: "35px", marginBottom:"10px" }}>
                                                <Button variant="outline-danger"  onClick={()=>{
                                                setContents(contents=>contents.filter((cont,i)=>i!==index))
                                            }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                                    </svg>
                                                </Button>
                                            </Row>
                                            <Row>
                                                <Button variant="light" disabled={index==0} onClick={()=>{
                                                    setContents(contents=>{
                                                        let myArray = [...contents];
                                                        [myArray[index-1], myArray[index]] = [myArray[index], myArray[index-1]]
                                                        return myArray
                                                    })
                                                }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-up-fill" viewBox="0 0 16 16">
                                                        <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                                                    </svg>
                                                </Button>
                                            </Row>
                                            <Row>
                                                <Button variant="light" disabled={index==(contents.length-1)} onClick={()=>{
                                                    setContents(contents=>{
                                                        let myArray = [...contents];
                                                        [myArray[index], myArray[index+1]] = [myArray[index+1], myArray[index]]
                                                        return myArray
                                                    })
                                                }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                                                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                                    </svg>
                                                </Button>
                                            </Row>
                                        </Col>
                                    </Row>
                                    
                                )
                            })
                        }
                        <Form.Group style={{marginTop:"35px"}}>
                            <Form.Select onChange={(e)=>{
                                setContents(contents=>[
                                    ...contents,
                                    {
                                        type : e.target.value,
                                        content : ""
                                    }
                                ])
                            }} value="">
                                <option value="">Add content...</option>
                                <option value="Image">Image</option>
                                <option value="Header">Header</option>
                                <option value="Paragraph">Paragraph</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group style={{marginTop:"20px"}}>
                            <Form.Label>Set publication date</Form.Label>
                            <Form.Check type="switch" checked={published} onChange={(e)=>{
                                setPublished(e.target.checked)
                                if(!e.target.checked){
                                    setDate("")
                                }
                            }}/>
                            {
                                published &&
                                <Form.Control type="date" value={date} onChange={(e)=>{
                                    setDate(e.target.value ? dayjs(e.target.value).format('YYYY-MM-DD'): "")
                                }}/>
                            }
                        </Form.Group>
                        <Button className='my-2' type='submit' variant="outline-primary">Create</Button>
                        <Button className='my-2 mx-2' variant='outline-danger' onClick={() => {
                            navigate('/back')
                            props.setDirty(true)
                            }}>Cancel</Button>
                    </Form>
                </Col>
                <Col xs={2}>
                    {
                        props.errors &&
                        <Alert variant="danger" dismissible>{props.errors}</Alert>
                    }
                </Col>
            </Row>
        </Container>
        
    )
}

export {MyForm}