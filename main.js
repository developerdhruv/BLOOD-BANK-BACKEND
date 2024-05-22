import bcrypt, { hash } from 'bcrypt'
const jwtParam = 9
var password = 1234
const sql = "INSERT INTO appUser (`name`, `email`, `password`) VALUES (?, ?, ?) "
bcrypt.hash(req.body.password.toString(), jwtParam, (err, hash)=>{
    if(err){
        console.log(err)
        return res.status(500).json({error: "not possible internal error"})
    }
    const values = [req.body.name, req.body.email, hash];

    dbconnect.query(sql, values, (err, result)=>{
        if(err){
            return res.status(500).json({error: "Error while inserting dataset"});
            
        }
        if(result.length > 0){
            return res.status(400).json({err: "login please"})

        }else{
            return res.status(200).json({status :"success"})

        }
    })
});