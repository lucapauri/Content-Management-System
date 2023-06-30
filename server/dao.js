'use strict'

const sqlite = require('sqlite3');
const dayjs = require('dayjs');
const e = require('express');

// open the database
const db = new sqlite.Database('data.db', (err) => {
  if(err) throw err;
});

exports.getAllPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM pages"
        db.all(sql, [], (err, rows) => {
            if(err){
                reject(err)
                return
            }
            const result = rows.map(r=>({
                id : r.id,
                title : r.title,
                authorId : r.authorId,
                creationDate : r.creationDate,
                publicationDate : r.publicationDate
            }))
            resolve(result)
        })
    })
}

exports.getPublishedPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM pages WHERE publicationDate <= ?"
        const today = dayjs().format('YYYY-MM-DD')
        db.all(sql, [today], (err, rows)=>{
            if(err){
                reject(err)
                return
            }
            const result = rows.map(r=>({
                id : r.id,
                title : r.title,
                authorId : r.authorId,
                creationDate : r.creationDate,
                publicationDate : r.publicationDate
            }))
            resolve(result)
        })
    })
}

exports.getPageId = (id) => {
    return new Promise((resolve, reject)=>{
        const today = dayjs().format('YYYY-MM-DD')
        const sql = "SELECT * FROM pages WHERE id = ? AND publicationDate <= ?"
        db.get(sql, [id, today], (err, row) => {
            if(err){
                reject(err)
                return
            }
            if(row == undefined){
                resolve(row)
            }else{
                const page = {
                    id : row.id,
                    title : row.title,
                    authorId : row.authorId,
                    creationDate : row.creationDate,
                    publicationDate : row.publicationDate
                }
                resolve(page)
            }
        })
    })
}

exports.getAuthor = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT email FROM users WHERE id = ?"
        db.get(sql, [id], (err, row) => {
            if(err){
                reject(err)
                return
            }
            resolve(row)
        })
    })
}

exports.getImages = () => {
    return new Promise((resolve,reject)=>{
        const sql = "SELECT name FROM images"
        db.all(sql, (err, rows) => {
            if(err){
                reject(err)
                return
            }
            resolve(rows.map(r=>r.name))
        })
    })
}

exports.getTitle = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT title FROM title"
        db.get(sql, (err, row) => {
            if(err){
                reject(err)
                return
            }
            resolve(row.title)
        })
    })
}

exports.setTitle = (title) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE title SET title=? WHERE id=1"
        db.run(sql, [title], function(err){
            if(err){
                reject(err)
                return 
            }
            resolve(this.changes)
        })
    })
}

exports.getPageIdAll = (id)=>{
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM pages WHERE id = ?"
        db.get(sql, [id], (err, row) => {
            if(err){
                reject(err)
                return
            }
            if(row == undefined){
                resolve(row)
            }else{
                const page = {
                    id : row.id,
                    title : row.title,
                    authorId : row.authorId,
                    creationDate : row.creationDate,
                    publicationDate : row.publicationDate
                }
                resolve(page)
            }
        })
    })
}

exports.getContentsId = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM contents WHERE pageId = ?"
        db.all(sql, [id], (err, rows) => {
            if(err){
                reject(err)
                return
            }
            const result = rows.map(r=>({
                contentId : r.id,
                type : r.type,
                content : r.content,
                positionId : r.positionId
            }))
            resolve(result)
        })
    })
}

exports.createPage = (title, authorId, creationDate, publicationDate) => {
    return new Promise((resolve, reject)=>{
        const sql = "INSERT INTO pages(title, authorId, creationDate, publicationDate) VALUES(?,?,?,?)"
        db.run(sql, [title, authorId, creationDate, publicationDate], function(err){
            if(err){
                reject(err)
                return
            }
            resolve(this.lastID)
        })
    })
}

exports.createContent = (cont) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO contents(type,content,pageId,positionId) VALUES(?,?,?,?)"
        db.run(sql, [cont.type, cont.content, cont.pageId, cont.positionId], function(err){
            if(err){
                reject(err)
                return
            }
            resolve(this.lastID)
        })
    })
}

exports.updatePage = (page) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE pages SET title=?, publicationDate=? WHERE id=?"
        db.run(sql, [page.title, page.publicationDate, page.id], function(err){
            if(err){
                reject(err)
                return
            }
            resolve(this.changes)
        })
    })
}

exports.deleteContent = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM contents WHERE pageId = ?"
        db.run(sql, [id], function(err){
            if(err){
                reject(err)
                return
            }
            resolve(this.changes)
        })
    })
}

exports.deletePage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM pages WHERE id = ?"
        db.run(sql, [id], function(err){
            if(err){
                reject(err)
                return
            }
            resolve(this.changes)
        })
    })
}

exports.updateAuthor = (author, id) => {
    return new Promise((resolve,reject) => {
        const sql = "UPDATE pages SET authorId=? WHERE id=?"
        db.run(sql, [author, id], function(err){
            if(err){
                reject(err)
                return
            }
            resolve(this.changes)
        })
    })
}

exports.getAuthors = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users"
        db.all(sql, (err, rows) => {
            if(err){
                reject(err)
                return
            }
            resolve(rows.map(r=>{
                return{
                id : r.id,
                email : r.email
                }
            }))
        })
    })
}