const URL = 'http://localhost:3001/api'

async function fetchTitle(){
    const response = await fetch(URL + '/title')
    if(response.ok){
        const title = await response.json()
        return title
    }else{
        const err = response.json()
        throw err
    }
}

async function fetchPublished(){
    const response = await fetch(URL + '/pages/published')
    if (response.ok){
        const pages = await response.json()
        return pages
    }else{
        const err = await response.json()
        throw err
    }
}

async function fetchAll(){
    const response = await fetch(URL + '/pages/all', {
      credentials : "include"
    })
    if (response.ok){
        const pages = await response.json()
        return pages
    }else{
        const err = await response.json()
        throw err
    }
}

async function fetchAuthors(){
  const response = await fetch(URL + '/authors', {
    credentials : "include"
  })
  if (response.ok){
    const authors = await response.json()
    return authors
  }else{
    const err = await response.json()
    throw err
}
}

async function deletePage(id){
  const response = await fetch(URL + `/pages/${id}`, {
    method : 'DELETE',
    credentials : "include"
  })
  if(response.ok){
    return true
  }else{
    const err = await response.json()
    throw err
  }
}

async function getImages(){
  const response = await fetch(URL + '/images',{
    credentials : 'include'
  })
  if(response.ok){
    const images = await response.json()
    return images
  }else{
    const err = await response.json()
    throw err
  }
}

async function createPage(page){
  const response = await fetch(URL + '/pages', {
    method : 'POST', 
    credentials : "include",
    headers : {
      'Content-Type' : 'application/json',
    },
    body : JSON.stringify(page)
  })
  if(response.ok){
    return response
  }else{
    const err = await response.json()
    throw err
  }

}

async function editPage(page){
  const response = await fetch(URL + `/pages/${page.id}`,{
    method : 'PUT',
    credentials : "include",
    headers : {
      'Content-Type' : 'application/json',
    },
    body : JSON.stringify(page)
  })
  if(response.ok){
    return response
  }else{
    const err = await response.json()
    throw err
  }
}

async function changeAuthor(id, authorId){
  const response = await fetch(URL + `/pages/${id}/author`, {
    method : 'PUT',
    credentials : "include",
    headers : {
      'Content-Type' : 'application/json',
    },
    body : JSON.stringify({
      id : id,
      authorId : authorId
    })
  })
  if(response.ok){
    return response
  }else{
    const err = await response.json()
    throw err
  }
}

async function changeTitle(title){
  const response = await fetch(URL + '/title', {
    method : 'PUT',
    credentials : "include",
    headers : {
      'Content-Type' : 'application/json',
    },
    body : JSON.stringify({
      title : title
    })
  })
  if(response.ok){
    return response
  }else{
    const err = await response.json()
    throw err
}
}

async function logIn(credentials) {
    const response = await fetch(URL + '/sessions', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (response.ok) {
      const user = await response.json();
      return user;
    } else {
      const errDetail = await response.json();
      throw errDetail.msg;
    }
  }
  
  async function logOut() {
    await fetch(URL+'/sessions/current', {
      method: 'DELETE', 
      credentials: 'include' 
    });
  }
  
  async function getUserInfo() {
    const response = await fetch(URL+'/sessions/current', {
      credentials: 'include'
    });
    const userInfo = await response.json();
    if (response.ok) {
      return userInfo;
    } else {
      throw userInfo;  // an object with the error coming from the server
    }
  }

  const API = {logIn, logOut, getUserInfo, fetchTitle, changeTitle, fetchAll, fetchPublished, deletePage, getImages, createPage, editPage, fetchAuthors, changeAuthor}
  export default API