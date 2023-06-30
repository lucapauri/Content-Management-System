import { Accordion, Col, Container, Row, Button, Spinner, Form, Alert} from "react-bootstrap";
import { useNavigate } from "react-router";
import dayjs from 'dayjs'

function Pages(props){
    const navigate = useNavigate()
    if(props.pages){
        props.pages.sort((a,b)=>{
            return (b.publicationDate ? dayjs(b.publicationDate).valueOf():0) - (a.publicationDate ? dayjs(a.publicationDate).valueOf():0)
        })
    }
    return(
        <Container fluid = {true} style={{"marginTop": "4rem"}}>
            {
                props.errors &&
                <Alert variant="danger" dismissible style={{marginTop:'20px'}}>{props.errors}</Alert>
            }
            {
                !props.front &&
                <Row className="justify-content-end mt-20">
                    <Col xs={9}></Col>
                    <Col xs={3}>
                        <Button style={{ width: "40px" }} variant="light" onClick={()=>{
                            navigate("/back/create")
                            props.setDirty(true)
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-square" viewBox="0 0 16 16">
                                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                            </svg>
                        </Button>
                    </Col>
                </Row>
            }
            <Accordion>
            {props.pages.map(p=>{
                return (
                    <Row key = {p.id} className="align-items-center" style = {{marginTop:"30px"}}>
                        <Col xs={props.front ? 11 : 9}>
                            <Accordion.Item eventKey={p.id}>
                                <Accordion.Header>{p.title}</Accordion.Header>
                                <Accordion.Body>
                                    <Row>
                                        <Col xs={4}>
                                            Written by: {p.authorName}
                                        </Col>
                                        <Col xs={4}>
                                            Created On: {dayjs(p.creationDate).format('DD MMM YYYY')}
                                        </Col>
                                        <Col xs={4}>
                                            Published On: {p.publicationDate ? dayjs(p.publicationDate).format('DD MMM YYYY'): '<Not specified>'}
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Col>
                        {
                            props.front ? 
                                <Col xs={1}>
                                    <Button variant="light" onClick={
                                        () => {
                                            navigate(`/${p.id}`)
                                            props.setDirty(true)
                                        }
                                    }>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-box-arrow-in-up-right" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M6.364 13.5a.5.5 0 0 0 .5.5H13.5a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 13.5 1h-10A1.5 1.5 0 0 0 2 2.5v6.636a.5.5 0 1 0 1 0V2.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H6.864a.5.5 0 0 0-.5.5z" />
                                            <path fillRule="evenodd" d="M11 5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793l-8.147 8.146a.5.5 0 0 0 .708.708L10 6.707V10.5a.5.5 0 0 0 1 0v-5z" />
                                        </svg>
                                    </Button>
                                </Col>:
                                <Col xs={3}>
                                    <Row className="align-items-center">
                                        {
                                            !p.marked ? 
                                                <>
                                                    <Col>
                                                        <Button variant="light" onClick={
                                                            () => {
                                                                navigate(`/back/pages/${p.id}`)
                                                                props.setDirty(true)
                                                            }
                                                        }>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-box-arrow-in-up-right" viewBox="0 0 16 16">
                                                                <path fillRule="evenodd" d="M6.364 13.5a.5.5 0 0 0 .5.5H13.5a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 13.5 1h-10A1.5 1.5 0 0 0 2 2.5v6.636a.5.5 0 1 0 1 0V2.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H6.864a.5.5 0 0 0-.5.5z" />
                                                                <path fillRule="evenodd" d="M11 5.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793l-8.147 8.146a.5.5 0 0 0 .708.708L10 6.707V10.5a.5.5 0 0 0 1 0v-5z" />
                                                            </svg>
                                                        </Button>
                                                    </Col>
                                                    <Col>
                                                        <Button disabled={props.user.admin == 0 && props.user.id !== p.authorId} variant="outline-primary"
                                                            onClick={()=>navigate(`/back/edit/${p.id}`)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                            </svg>
                                                        </Button>
                                                    </Col>
                                                    <Col>
                                                        <Button variant="outline-danger" onClick={() => {
                                                            props.deleteP(p.id)
                                                        }} disabled={props.user.admin == 0 && props.user.id !== p.authorId}>
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
                                </Col>
                                
                        }
                    </Row>
                )
            })}
        </Accordion>
        </Container>
    )
}

export default Pages