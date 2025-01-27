const User = require('../models/userModel');

const isLogin = async(req,res,next)=>{
    try{
        if(req.session.user_id){next()}
            else{
                res.redirect('/login');
            }
        }
    
    catch(error){
console.log(error.message);
    }
}
const isLogout = async(req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/index1');
    }next();
}
    
    catch(error){
console.log(error.message);
    }
}
const is_blocked = async(req,res,next)=>{
    
    try {
      
          const userData = await User.findById(req.session.user_id);
          if (userData && userData.is_blocked) {
            return res.render('logine1', { message: 'Your account has been blocked. Please contact support.' });
              
          }
      
        next();
      } catch (error) {
        console.log(error.message);
      }
}
module.exports = {
  isLogin,isLogout  ,is_blocked
}