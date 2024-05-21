import express, { response } from 'express'
import cors from 'cors'
import jwt, { decode } from 'jsonwebtoken'
import multer from 'multer'
import bcrypt, { hash } from 'bcrypt'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import dbconnect from './dbconnect'

const jwtParam = 8;


const port = 9080
const app = expres()
//initialising storage for user photo using multer

const storage = multer.diskStorage({
    destination: function(req,res){
        const dir = "/public/userimage"
    },
    filename : function(req, file, cb){
        cb(
            file.filename + "-"+ path.extname(file.originalname)
        );
    },
});
const uploadImage = multer({storage: storage});

//middlewars
app.use(express.static("public"));
app.use(
    cors({
        origin: [''],
        methods : ['POST', 'PUT', 'DELETE', 'PATCH', 'GET'],
        credentials:true,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use(bodyParser.json())
//db connection

dbconnect.connect((err)=>{
    if(err){
    console.log("Error While Conncting");
    process.exit(1)
    }
    console.log("Database connected successfully")
});

//jwt middleware
const verifyUser = (req, res, next)=>{
    const token = req.cookies.token;
    console.log(token)
    if(!token){
        return res.status(401).json({error: "Unauthenticated user"})

    }else{
        jwt.verify(token, "jwt-secret-key", (err, decoded)=>{
            if(err){
                res.status(403).json({err : "Invalid Token"})

            }else{
                console.log(decoded)
                req.name = decoded.name;
                req.role = decoded.role;
                req.id = decoded.id;
                next();
            }
        })
    }

};

//check auth route

app.get("/AuthCheck", (req,res)=>{
    return res.json({
        status: "success",
        name : req.name,
        role: req.role,
        id : req.id,
    });
});

//register route

app.post("/UserRegister", (req,res)=>{
    const sql = "INSERT INTO appUser (`name`, `email`, `password`) VALUES (?, ?, ?) "
    bcrypt.hash(req.body.password.toStrin(), jwtParam , (err, hash)=>{
        if(err){
            console.error(err)
            return res.status(500).json({error : 'Password cant be submitted'})

        }
        const values = [req.body.name, req.body.email, hash];
        console.log(values)
        dbconnect.query(sql, values, (err, result)=>{
            if(err){
                console.log(err)
                return res.status(500).json({error: "Error while inserting dataset"}

                )
            }
            if(result.length>0){
                return res.status(400).json({err: "login please"})
            }else{
                return res.status(200).json({status :"success"})
            }
        });
    } );
});

//login user

app.post("/login", (req,res)=>{
    const sql = "SELECT FROM appUser WHERE email = ?";
    dbconnect.query(sql, [req.body.email], (err, data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({error: "error while login"})
        }

        if(data.length>0){
            bcrypt.compare(req.body.password.toString(), data[0].password, (err,response)=>{
                if(err){
                    console.log(err)
                    return res.status(500).json({error: "password not macthing"})
                }
                if(response){
                    const {id, name, role} = data[0];
                    console.log(name);
                    console.log(id)  ;
                    const token = jwt.sign({id,name,role}, "jwt-secret-key",{
                        
                        expiresIn: "id"
                    });
                    console.log(token);
                    res.cookie(token, {
                        httpOnly: true,
                        sameSite: 'lax',

                    });
                    console.log(role);
                    return res.status(200).json({ status: "success", role });

                }else{
                    return res.status(500).json({erro: "Mail not present"})
                }
            });

        };
    });
});

//add blood group details -> to be displayed as a card in frontend
app.post('/addBlood',uploadImage.single("image"), (req,res)=>{
    const {name, location, bloodgroup, available}= req.body;
    console.log(name, location, bloodgroup, available)

    const imagePath = req.file? req.file.filename:numm;
    console.log(imagePath);

    const query = "INSERT INTO bank (name, location, bloodgroup, available) VALUES (?,?,?,?)";
    dbconnect.query(query, [name, location, bloodgroup, available], (err, result)=>{
        if(err){
            console.log(err);
            return res.status(500).json({error: "not able to submit data"})

        }
        res.json(200).json({message: "blood added to the bank"});
    });
} );

//to be add: edit route for blood bank
//to be add: delete route for blood  bank

//displaying data route

app.get("/BankBlood",(req,res)=>{
    const query = "SELECT * FROM bank";
    dbconnect.query(query, (err, result)=>{
        if(err){
            console.log(err);
            res.status(500).json({error: "unable to retrieve data"})
        }
        res.json({data: result});
    });
});

//display by id searchin user

app.get("/BankBlood/:id", (req,res)=>{
    const {id}= req.params;
    console.log(id);

    if(!id){
        return res.status(400).json({error: "id require or some error"})
    }
    //logic for sql injection_---->>>> parse int --->>> to be implement

    const query = "SELECT * FROM bank WHERE id = ?";
    dbconnect.query(query, (err, result)=>{
        if(err){
            res.status(500).json({error: "unable to retrueve error"})

        }
        if(result.length == 0){
            return res.status(404).json({error: "book not found"})

        }
        const blood = result[0];
        res.json(blood);

    });
});









app.listen(port, ()=>{
    console.log('Server has started')
})