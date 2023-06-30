import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './API';
import validator from 'validator'

function LoginForm(props) {
  const [username, setUsername] = useState('enrico@test.com');
  const [password, setPassword] = useState('pwd');

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        props.loginSuccessful(user);
        navigate("/back")
      })
      .catch(err => {
        props.handleErr({error : 'Wrong username or password'});
      })
  }
  
  const handleSubmit = (event) => {
      event.preventDefault();
      let errors = []
      const credentials = { username, password };
      let valid = true;
      if(!validator.isEmail(username)){
        valid = false;
        errors = [...errors,{msg:'Invalid email format'}]
      }
      if(validator.isEmpty(password.trim())){
        valid = false;
        errors = [...errors,{msg:'Password must not be empty'}]
      }
      if(valid)
      {
        doLogIn(credentials);
      } else {
        props.handleErr({errors : errors})
      }
  };

  return (
      <Container fluid = {true} style={{"marginTop": "6rem"}}>
          <Row>
              <Col xs={3}></Col>
              <Col xs={6}>
                  <h2>Login</h2>
                  <Form onSubmit={handleSubmit}>
                      {props.errors ? <Alert variant='danger' dismissible>{props.errors}</Alert> : ''}
                      <Form.Group controlId='username'>
                          <Form.Label>Email</Form.Label>
                          <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                      </Form.Group>
                      <Form.Group controlId='password'>
                          <Form.Label>Password</Form.Label>
                          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                      </Form.Group>
                      <Button className='my-2' type='submit' variant="outline-primary">Login</Button>
                      <Button className='my-2 mx-2' variant='outline-danger' onClick={()=>{
                        navigate('/')
                        props.setDirty(true)
                        }}>Cancel</Button>
                  </Form>
              </Col>
              <Col xs={3}></Col>
          </Row>
      </Container>
    )
}

export { LoginForm };