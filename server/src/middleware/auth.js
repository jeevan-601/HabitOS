const jwt = require('jsonwebtoken')

function auth(req, res, next){
  const h = req.headers.authorization
  if(!h) return res.status(401).json({error:'missing token'})
  const token = h.split(' ')[1]
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  }catch(e){
    return res.status(401).json({error:'invalid token'})
  }
}

module.exports = auth
