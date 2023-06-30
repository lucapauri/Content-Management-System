import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { useEffect, useState } from 'react'
import { Alert, Button, Container, Row, Spinner } from 'react-bootstrap';
import {BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate} from 'react-router-dom'
import MyNavbar from './MyNavbar';
import { LoginForm } from './LoginForm';
import API from './API'
import Pages from './Pages';
import PageLayout from './PageLayout';
import dayjs from 'dayjs'
import {MyForm} from './Forms'

function Page(id, title, authorId, authorName, creationDate, publicationDate, contents, marked = undefined){
  this.id = id
  this.title = title
  this.authorId = authorId
  this.authorName = authorName
  this.creationDate = creationDate
  this.publicationDate = publicationDate
  this.contents = contents
  this.marked = marked
}

function App() {

  return (
    <BrowserRouter>
      <Container>
        <Main/>
      </Container>
    </BrowserRouter>
  )
}

function Main(){
  const [title, setTitle] = useState("")
  const [user, setUser] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState("")
  const [dirty, setDirty] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [pages, setPages] = useState([])
  const [images, setImages] = useState([])
  const [authors, setAuthors] = useState([])
  const [timer, setTimer] = useState(null)
  const navigate = useNavigate()
  

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch(err) {
      }
    };
    checkAuth();
  }, []);

  useEffect(()=>{
    const fetchPages = async() =>{
      try{
        if(dirty){
          setDirty(false)
          const name = await API.fetchTitle()
          setTitle(name)
          if(loggedIn){
            const result = await API.fetchAll()
            setPages(formatPages(result))
            const imgs = await API.getImages()
            setImages(imgs)
            if(user.admin){
              const a = await API.fetchAuthors()
              setAuthors(a)
            }
          }else{
            const result = await API.fetchPublished()
            setPages(formatPages(result))
          }
          setLoading(false)
        }
      }catch(err){
        handleErr(err)
      }
    }
    fetchPages()
  }, [dirty])

  const formatPages = (pages) => {
    return pages.map((p) => {
      return new Page(p.id, p.title, p.authorId, p.authorName, p.creationDate, p.publicationDate || "", p.contents)
    })
  }

  const handleErr = (err)=>{
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0])
        if (err.errors[0].msg)
          errMsg = err.errors[0].msg;
    } else if (err.error) {
      errMsg = err.error;
    }
    setErrors(errMsg)
    if(true){
      clearTimeout(timer)
    }
    setTimer(setTimeout(() => {
      setErrors("")
    }, 2000))
    setLoading(true)
    setDirty(true)
  }

  const doLogOut = async () => {
    await API.logOut();
    navigate("/login");
    setLoggedIn(false);
    setUser(undefined);
    setDirty(true)
  }
  

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
    setLoading(true)
    setDirty(true);
  }

  const filterPages = (pages) => {
    return pages.filter(p => dayjs(p.publicationDate).isSame(dayjs(), 'day') || dayjs(p.publicationDate).isBefore(dayjs(), 'day'))
  }

  const addPage = async (title, publicationDate, contents) =>{
    const lastId = pages.slice(-1).id
    const c = contents.map((c, index)=>{
      return({
        id : index,
        type : c.type,
        content : c.content,
        pageId : lastId+1,
        positionId : index
      })})
    const page = new Page(lastId+1, title, user.id, user.name, dayjs().format('YYYY-MM-DD'), publicationDate, c, true)
    setPages(oldState=>{
      return [...oldState, page]
    })
    try{
      await API.createPage(page)
      setDirty(true)
      navigate('/back')
    }catch(err){
      handleErr(err)
    }
  }

  const editPage = async (id, title, authorId, authorName, creationDate, publicationDate, contents) => {
    const c = contents.map((c,index)=>{
      return({
        ...c,
        positionId : index
      })
    })
    const page = new Page(id, title, authorId, authorName, creationDate, publicationDate, c)
    setPages(oldState=>{
      return oldState.map(p=>{
        if(page.id === p.id){
          page.marked = true
          return page
        }else{
          return p
        }
      })
    })
    try{
      await API.editPage(page)
      setDirty(true)
      navigate('/back')
    }catch(err){
      handleErr(err)
    }
  }

  const deleteP = async (id) => {
    try{
      setPages(pages=>pages.map(p=>{
        if(p.id == id){
          return new Page(p.id, p.title, p.authorId, p.authorName, p.creationDate, p.publicationDate, p.contents, true)
        }else{
          return p
        }
      }))
      await API.deletePage(id)
      setDirty(true)
      navigate("/back")
    }catch(err){
      handleErr(err)
    }
  }

  const changeAuthor = async (id, authorId) => {
    try{
      setPages(pages=>pages.map(p=>{
        if(p.id == id){
          return new Page(p.id, p.title, p.authorId, p.authorName, p.creationDate, p.publicationDate, p.contents, true)
        }else{
          return p
        }
      }))
      await API.changeAuthor(id, authorId)
      setDirty(true)
    }catch(err){
      handleErr(err)
    }
  }

  const changeTitle = async (title) => {
    try{
      setTitle(title)
      await API.changeTitle(title)
      setDirty(true)
    }catch(err){
      handleErr(err)
    }
  }

  return(
    <Routes>
      <Route path = "/" element = {
        <Header user={user} title={title} logoutCbk = {doLogOut} changeTitle={changeTitle} setDirty={setDirty} handleErr={handleErr}/>
        }>
        <Route path="" element={
          loading ?
            <Spin />
            : <FrontOffice pages={filterPages(pages)} errors={errors} setDirty={setDirty}/>
        } />
        <Route path = ":id" element = {loading ? 
            <Spin/> : 
            <PageLayout pages = {filterPages(pages)} buttons={false} errors={errors} setDirty={setDirty}/>
          }/>
        <Route path = "login" element={<LoginForm loginSuccessful = {loginSuccessful} errors={errors} handleErr={handleErr} setDirty={setDirty}/>}/>
        <Route path = "back" element={loading ? 
          <Spin/> : 
          <BackOffice pages={pages} deleteP={deleteP} user={user} errors={errors} setDirty={setDirty}/>
          }/>
        <Route path="back/pages/:id" element=
          {
            loading ?
              <Spin />
              : <PageLayout pages={pages} buttons={true} deleteP={deleteP} user={user} authors={authors}
                changeAuthor={changeAuthor} errors={errors} setErrors={setErrors} setDirty={setDirty}/>
          } />
        <Route path="back/create" element = {
          <MyForm images={images} addPage={addPage} errors={errors} handleErr={handleErr} setDirty={setDirty}/>
          }/>
        <Route path="back/edit/:id" element= {
          <MyForm images={images} errors={errors} handleErr={handleErr} pages={pages} editPage={editPage} setDirty={setDirty}/>
          }/> 
      </Route>
      <Route/>
      <Route path="*" element={
        <Container>
          <h1>Page not found</h1>
          <Button onClick={()=>navigate("/")}>Home</Button>
        </Container>
      }/>
    </Routes>
  )
}

function FrontOffice(props){
  return(
    <Pages pages = {props.pages} front = {true} errors={props.errors} setErrors={props.setErrors} setDirty={props.setDirty}/>
  )
}

function BackOffice(props){
  return(
    <Pages pages={props.pages} front={false} deleteP={props.deleteP}
      user={props.user} errors={props.errors} setErrors={props.setErrors} setDirty={props.setDirty}/>
  )
}

function Header(props){
  return(
    <>
      <MyNavbar user={props.user} title={props.title} logoutCbk = {props.logoutCbk} changeTitle={props.changeTitle} setDirty={props.setDirty} handleErr={props.handleErr}/>
      <Outlet/>
    </>
  )
}

function Spin(){
  return(
    <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
}

export default App
