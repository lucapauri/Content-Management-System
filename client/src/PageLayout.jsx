import { Button, Col, Container, Row, Spinner, Form, Alert} from "react-bootstrap"
import { useNavigate, useParams } from "react-router"
import dayjs from 'dayjs'
import { useState } from "react"

function PageLayout(props){
    const [changeAuthor, setChangeAuthor] = useState(false)
    const [author, setAuthor] = useState("")
    let {id} = useParams()
    const navigate = useNavigate()
    const page = props.pages.find(p=>p.id == id)
    const URL = "http://localhost:3001/static"
    if(page){
        page.contents.sort((a,b)=>a.positionId - b.positionId)
    }
    const handleSubmit = (e)=>{
        e.preventDefault()
        props.changeAuthor(id, author)
        setChangeAuthor(false)
    }
    return(
        <>
        {
            page ?
            <Container fluid={true} style={{ "marginTop": "4rem" }}>
                {
                    props.errors &&
                    <Alert variant="danger" dismissible>{props.errors}</Alert>
                }
                <Row className="align-items-top">
                    <Col xs={2}>
                        <Row className="justify-content-start">
                            <Col xs={6}>
                                <Button variant="light" onClick={() => {
                                    if (props.buttons) {
                                        navigate("/back")
                                    } else {
                                        navigate("/")
                                    }
                                    props.setDirty(true)
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                                    </svg>
                                </Button>
                            </Col>
                            <Col xs={6}>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={8}>
                        <Row className="justify-content-center">
                            <h1>{page.title}</h1>
                        </Row>
                        <Row className="align-items-center">
                            {
                                !changeAuthor ?
                                    <>
                                        <Col xs={12}>
                                            Written by: {page.authorName}
                                            {
                                                (props.user && props.user.admin) ?
                                                    <Button variant="light" onClick={() => {
                                                        setChangeAuthor(true)
                                                        setAuthor(page.authorId)
                                                    }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                        </svg>
                                                    </Button> : null
                                            }
                                        </Col>
                                        <Col xs={1}>

                                        </Col>
                                    </> :
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="justify-content-start">
                                            <Col xs={8}>
                                                <Form.Select onChange={(e) =>
                                                    setAuthor(e.target.value)
                                                } value={author} size='sm'>
                                                    {props.authors.map((a) => {
                                                        return (
                                                            <option key={a.id} value={a.id}>{a.email}</option>
                                                        )
                                                    })}
                                                </Form.Select>
                                            </Col>
                                            <Col xs={2} className="p-0">
                                                <Button type="submit" variant="outline-primary" style={{ marginRight: '4px' }} size='sm'>Change</Button>
                                            </Col>
                                            <Col xs={2} className="p-0">
                                                <Button variant="outline-danger" onClick={() => {
                                                    setChangeAuthor(false)
                                                }} size='sm'>Cancel</Button>
                                            </Col>
                                        </Row>
                                    </Form>
                            }

                        </Row>
                        <Row>
                            <p>Written on: {dayjs(page.creationDate).format('DD MMM YYYY')}</p>
                        </Row>
                        <Row>
                            <p>Published on: {page.publicationDate ? dayjs(page.publicationDate).format('DD MMM YYYY') : '<Not specified>'}</p>
                        </Row>
                    </Col>
                    <Col xs={2}>
                        {props.buttons ?
                            <Row>
                                {
                                    !page.marked ?
                                        <>
                                            <Col xs={6}>
                                                <Button disabled={props.user.admin == 0 && props.user.id !== page.authorId} onClick={() => {
                                                    navigate(`/back/edit/${page.id}`)
                                                }} variant="outline-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                    </svg>
                                                </Button>
                                            </Col>
                                            <Col xs={6}>
                                                <Button variant="outline-danger" disabled={props.user.admin == 0 && props.user.id !== page.authorId} onClick={() => {
                                                    props.deleteP(page.id)
                                                }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                                    </svg>
                                                </Button>
                                            </Col>
                                        </> :
                                        <Col>
                                            <Spinner animation="border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                        </Col>
                                }
                            </Row>
                            : <></>}
                    </Col>
                </Row>
                <Row>
                    <Col xs={2}>

                    </Col>
                    <Col xs={8}>
                        {
                            page.contents.map((c, i) => {
                                switch (c.type) {
                                    case 'Header':
                                        return (
                                            <Row key={i} style={{ marginTop: "25px" }}>
                                                <h3>{c.content}</h3>
                                            </Row>
                                        )
                                    case 'Paragraph':
                                        return (
                                            <Row key={i} style={{ marginTop: "25px" }}>
                                                <p>{c.content}</p>
                                            </Row>
                                        )
                                    case 'Image':
                                        const src = URL + `/${c.content}`
                                        return (
                                            <Row key={i} style={{ marginTop: "25px" }}>
                                                <img src={src} />
                                            </Row>
                                        )
                                    default:
                                        return <Row key={i}></Row>
                                }
                            })
                        }
                    </Col>
                    <Col xs={2}>

                    </Col>
                </Row>
            </Container> :
            <Container fluid={true} style={{ "marginTop": "4rem" }}>
                <Row className="justify-content-center">
                    <Alert variant='danger' dismissible onClose={()=>{
                        if(props.buttons){
                            navigate('/back')
                        }else{
                            navigate('/')
                        }
                        props.setDirty(true)
                    }}>Page not found</Alert>
                </Row>
            </Container>
        }
        </>
    )
}

export default PageLayout