'use strict';

const express = require('express');
const {check, body, validationResult, oneOf} = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the user info in the DB
const cors = require('cors');
const dayjs = require('dayjs')

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;

app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'Not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wge8d239bwd93rkskb',   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

//Static images
app.use('/static', express.static('images'))

//API

//Get all published pages
app.get("/api/pages/published", async (req, res) => {
  try{
    const pages = await dao.getPublishedPages()
    const result = await Promise.all(pages.map(async element => {
      const contents = await dao.getContentsId(element.id)
      const author = await dao.getAuthor(element.authorId)
      return { ...element, authorName : author.email, contents: contents }
    }))
    res.status(200).json(result)
  }catch(err){
    res.status(500).json(err)
  }
})

//Get all pages (authenticated)
app.get("/api/pages/all", isLoggedIn, async (req, res) =>{
  try{
    const pages = await dao.getAllPages()
    const result = await Promise.all(pages.map(async element => {
      const contents = await dao.getContentsId(element.id)
      const author = await dao.getAuthor(element.authorId)
      return { ...element, authorName : author.email, contents: contents }
    }))
    res.status(200).json(result)
  }catch(err){
    res.status(500).json(err)
  }
})

//Get image names
app.get("/api/images", isLoggedIn, async (req,res) => {
  try{
    const result = await dao.getImages()
    res.status(200).json(result)
  }catch(err){
    res.status(500).json(err)
  }
})

//Get app name
app.get("/api/title", async (req,res) => {
  try{
    const result = await dao.getTitle()
    res.status(200).json(result)
  }catch(err){
    res.status(500).json(err)
  }
})

//Get users
app.get('/api/authors', isLoggedIn, async (req, res)=>{
  try{
    if(!req.user.admin){
      return res.status(401).json({error : 'Unauthorized'})
    }
    const authors = await dao.getAuthors()
    res.status(200).json(authors)
  }catch(err){
    res.status(500).json(err)
  }
})

//Set title 
app.put("/api/title", [
  check('title').trim().isLength({min:1}).withMessage('Title must not be empty')
], isLoggedIn, async (req, res)=>{
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if(!req.user.admin){
      return res.status(401).json({error: 'Only an admin can change the title'})
    }
    const title = req.body.title
    const result = await dao.setTitle(title)
    res.status(200).json(result)
  }catch(err){
    res.status(500).json(err)
  }
})

//Create new page (authenticated)
app.post("/api/pages", [
  check('title').trim().isLength({min:1}).withMessage('Title must not be empty'),
  check('creationDate').isDate({format:'YYYY-MM-DD', strictMode:true}).withMessage('Invalid creation date'),
  check('publicationDate').isDate({format:'YYYY-MM-DD', strictMode:true}).optional({nullable:true}).withMessage('Invalid publication date'),
  check('creationDate').custom((value,{req})=>{
    if(req.body.publicationDate && dayjs(value).isAfter(dayjs(req.body.publicationDate))){
      throw new Error('Publication date must be after creation date')
    }else{
      return true
    }
  }),
  check('contents.*.type').isIn(['Header', 'Image', 'Paragraph']).withMessage('Invalid content type'),
  check('contents').custom((value)=>{
    if(!value.find(v=>v.type=='Header')){
      throw new Error('Header required')
    }else{
      return true
    }
  }),
  check('contents.*.content').trim().isLength({min:1}).withMessage('Contents must not be empty'),
  check('contents.*.positionId').isInt().withMessage('Position Id must me an integer'),
  check('contents').isArray({min:2}).withMessage('At least two contents are required')
], isLoggedIn, async (req, res) =>{
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const id = await dao.createPage(req.body.title, req.user.id, req.body.creationDate, req.body.publicationDate || "")
    const result = await Promise.all(
      req.body.contents.map(async (e) => {
        const content = {
          type : e.type, 
          content : e.content,
          pageId : id,
          positionId : e.positionId
        }
        return await dao.createContent(content)
      })
    )
    res.status(200).json(id)
  }catch(err){
    res.status(500).json(err)
  }
})

//Edit page (author or admin)
app.put("/api/pages/:id", [
  check('title').trim().isLength({min:1}).withMessage('Title must not be empty'),
  check('publicationDate').isDate({format:'YYYY-MM-DD', strictMode:true}).optional({nullable:true}).withMessage('Invalid publication date'),
  check('creationDate').isDate({format:'YYYY-MM-DD', strictMode:true}).withMessage('Invalid creation date'),
  check('creationDate').custom((value,{req})=>{
        if(req.body.publicationDate && dayjs(value).isAfter(dayjs(req.body.publicationDate))){
          throw new Error('Publication date must be after creation date')
        }else{
          return true
        }
  }),
  check('contents.*.type').isIn(['Header', 'Image', 'Paragraph']).withMessage('Invalid content type'),
  check('contents').custom((value)=>{
    if(!value.find(v=>v.type=='Header')){
      throw new Error('Header required')
    }else{
      return true
    }
  }),
  check('contents.*.content').trim().isLength({min:1}).withMessage('Contents must not be empty'),
  check('contents.*.positionId').isInt().withMessage('Position Id must me an integer'),
  check('contents').isArray({min:2}).withMessage('At least two contents are required')
], isLoggedIn, async (req, res) => {
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const id = parseInt(req.params.id)
    if (id !== req.body.id) {
      return res.status(422).json({ error: 'URL Id does not match body Id' })
    }
    if(req.body.authorId == req.user.id || req.user.admin){
      const page = {
        id: id,
        title: req.body.title,
        publicationDate: req.body.publicationDate
      }
      const changes = await dao.updatePage(page)
      await dao.deleteContent(id)
      if(changes === 0){
        return res.status(404).json({error : 'Page id not found'})
      }
      await Promise.all(req.body.contents.map(async (c) => {
        const content = {
          type : c.type, 
          content : c.content,
          pageId : id,
          positionId : c.positionId
        }
        return await dao.createContent(content)
      }))
      res.status(200).json(changes)
    }else{
      return res.status(401).json({error : 'Only the author or an admin can edit a page'})
    }
  }catch(err){
    res.status(500).json(err)
  }
  
})

//Delete page
app.delete("/api/pages/:id", isLoggedIn,[
  check('id').isInt()
], async (req, res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const id = req.params.id
  try{
    const page = await dao.getPageIdAll(id)
    if(page == undefined){
      return res.status(404).json({error : 'Page id not found'})
    }
    if(page.authorId == req.user.id || req.user.admin){
      const changes = await dao.deletePage(id)
      await dao.deleteContent(id)
      if (changes == 0) {
        return res.status(404).json({ error: 'Page id not found' })
      }
      return res.status(200).json(changes)
    }else{
      return res.status(401).json({error : 'Only the author or an admin can delete a page'})
    }
  }catch(err){
    res.status(500).json(err)
  }
})

//Change page author
app.put("/api/pages/:id/author", isLoggedIn, [
  check('id').isInt().withMessage('Page Id must be an integer'),
  check('authorId').isInt().withMessage('Author Id must be an integer')
], async (req,res)=>{
  const id = req.params.id
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try{
    if(!req.user.admin){
      return res.status(401).json({error: 'Only an admin can change the author'})
    }
    const authors = await dao.getAuthors()
    if(id !== req.body.id){
      return res.status(422).json({error : 'URL Id does not match body ID'})
    }
    if(authors.filter(e => e.id == req.body.authorId).length > 0){
      const changes = await dao.updateAuthor(req.body.authorId, id)
      if(changes == 0){
        return res.status(404).json({error : 'Page id not found'})
      }
      return res.status(200).json(changes)
    }else{
      return res.status(404).json({error : 'Author id not found'})
    }
  }catch(err){
    res.status(500).json(err)
  }
}) 

app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        return res.status(401).json(info);
      }
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        return res.json(req.user);
      });
  })(req, res, next);
});

app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});

app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
