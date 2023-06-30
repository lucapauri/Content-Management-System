import { useState } from 'react';
import {Navbar, Container, Nav, Row, Form, Button} from 'react-bootstrap'
import { useNavigate } from 'react-router';
import validator from 'validator'

function MyNavbar(props){
    const navigate = useNavigate()
    const [title, setTitle] = useState("")
    const [changeTitle, setChangeTitle] = useState(false)
    const handleClick = () =>{
      if(validator.isEmpty(title.trim())){
        props.handleErr({error : 'Title must not be empty'})
        return
      }
      props.changeTitle(title)
      setChangeTitle(false)
    }

    return(
        <Navbar bg="light" className="shadow" fixed="top" style={{"marginBottom": "2rem"}}>
        <Container>
          <Navbar.Text>
            <i className="bi bi-card-list" />
            {
              !changeTitle ? 
                <>
                  {props.title + " "}
                  {
                    (props.user && props.user.admin) ?
                      <Button variant="light" onClick={() => {
                        setChangeTitle(true)
                        setTitle("")
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                          <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                        </svg>
                      </Button> : null
                  }
                </>:
                <Form>
                  <Form.Control placeholder='Set title...' value = {title} onChange={(e)=>{
                    setTitle(e.target.value)
                  }} size='sm'/>
                  <Button variant='outline-primary' size="sm" style={{marginRight:'4px'}} onClick={handleClick}>Change</Button>
                  <Button variant="outline-danger" onClick={()=>{
                    setChangeTitle(false)
                  }} size = "sm">Cancel</Button>
                </Form>
            }
            {!changeTitle ?
            <Navbar.Text>
              | <a href="/" onClick={event => { 
                event.preventDefault()
                navigate("/") 
                props.setDirty(true)
                 }}>Home</a>
            </Navbar.Text>:null}
          </Navbar.Text>
          <Nav>
            {
              props.user ?
                <Navbar.Text>
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16" style={{marginRight:"7px"}}>
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                  </svg>{props.user.name} | {props.user.admin ? <>Admin | </>: null}<a href="/back" onClick={
                    event => {
                      event.preventDefault()
                      navigate("/back")
                      props.setDirty(true)
                    }
                  }>Private Area</a> | <a href="/logout" onClick={
                    event => {
                      event.preventDefault()
                      props.logoutCbk()
                      setChangeTitle(false)
                    }
                    }>Logout</a>
                </Navbar.Text> 
                
                :
                <Nav.Link href="/login" active={false} onClick={event => {event.preventDefault(); navigate("/login");}}>
                  Login
                  {" "}
                  <i className="bi bi-person-fill"/>
                </Nav.Link>
            }
          </Nav>
        </Container>
      </Navbar>
    )
}

export default MyNavbar