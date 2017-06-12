var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var morgan=require('morgan');
var mongoose=require('mongoose');
var jwt=require('jsonwebtoken');
var config=require('./config');
var User=require('./app/models/user');
var jsonpatch=require('jsonpatch');
var Jimp=require('jimp');
var https=require('https');
var fs=require('fs');
var port=process.env.PORT || 8080;
mongoose.Promise=require('bluebird');
mongoose.connect(config.database);
app.set('superSecret',config.secret);
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/',function(req,res){
	res.send("hello! The API is at http://localhost:"+port+'/api');

});

app.get('/setup',function(req,res){
	var nick= new User({
		name:'Nick Carminara',
		password:'password',
		admin:true

	});
	nick.save(function(err){
		if(err) throw err;
		console.log('User saved successfully');
		res.json({success:true});
	});
});

app.post('/createUser', function(req,res){
	var nick= new User({
		name:req.body.name,
		password:req.body.password,
		admin:true

	});
	nick.save(function(err){
		if(err) throw err;
		console.log('User saved successfully');
		res.json({success:true});
	});

});

var apiRoutes=express.Router();
app.use('/api',apiRoutes);
 apiRoutes.get('/',function(req,res){
 	var token =req.body.token || req.query.token || req.headers['x-access-token'];
 	if(token){
 		jwt.verify(token,app.get('superSecret'),function(err,decoded){
 	if(err){
 		return res.json({success:false, message:'Failed to authenticate token'});
 		 	}
 		 	else{
 		 		res.json({message:'Welcome !!',code:res.statusCode});
 		 	}
 });
}else{
	return res.status(403).send({
		success:false,
		message:'No token provided'
	});

}
});


  apiRoutes.post('/thumbnail',function(req,res){
 	var token =req.body.token || req.query.token || req.headers['x-access-token'];
 	if(token){
 		jwt.verify(token,app.get('superSecret'),function(err,decoded){
 	if(err){
 		return res.json({success:false, message:'Failed to authenticate token'});
 		 	}
 		 	else{
 		 		var url=req.body.url;
 		 		var file=fs.createWriteStream('file.jpg');
 		 		var request=https.get(url,function(response){
 		 			response.pipe(file);

 		 		});
 		 		Jimp.read(url,function(err,img){
 		 			if(err) throw err;
 		 			img.resize(50,50)
 		 			   .write("small.jpg");
 		 		});
 		 		res.json({message:"Done !!"});
 		 	}
 });
}else{
	return res.status(403).send({
		success:false,
		message:'No token provided'
	});

}
});




  apiRoutes.post('/apply',function(req,res){
 	var token =req.body.token || req.query.token || req.headers['x-access-token'];
 	if(token){
 		jwt.verify(token,app.get('superSecret'),function(err,decoded){
 	if(err){
 		return res.json({success:false, message:'Failed to authenticate token'});
 		 	}
 		 	else{
 		 	try{
 		 		var applied=false;
 		 		modJson=req.body.json;
 		 		jsonPatch=req.body.jsonPatch;
 		 		applied=jsonpatch.apply_patch(modJson,jsonPatch);
 		 		res.json({
 		 			success:true,
 		 			message:"done",
 		 			applied:applied,
 		 			original:modJson
 		 		});

 		 	} catch(error){
 		 		console.log(error);
 		 		res.json({message:"error patch not applied!!"});
 		 	}
 		 	}
 });
}else{
	return res.status(403).send({
		success:false,
		message:'No token provided'
	});

}
});



   apiRoutes.get('/users',function(req,res){
 	var token =req.body.token || req.query.token || req.headers['x-access-token'];
 	if(token){
 		jwt.verify(token,app.get('superSecret'),function(err,decoded){
 	if(err){
 		return res.json({success:false, message:'Failed to authenticate token'});
 		 	}
 		 	else{
 		 	User.find({},function(err,users){
 		 		res.json(users);
 		 	});
 		 	}
 });
}else{
	return res.status(403).send({
		success:false,
		message:'No token provided'
	});

}
});



    apiRoutes.post('/login',function(req,res){
 	User.findOne({
    name:req.body.name,
 	},function(err,user){
 		if(err) throw err;
 		if(!user){
 			res.json({success:false,message:"Authentication failed!! USer not found.."});
 		} else if(user){
 			if(user.password!=req.body.password){
 				res.json({success:false,message:"Authentication failed!! wrong password.."});

 			}else{
 				var token=jwt.sign(user,app.get('superSecret'),{
 					expiresIn:60*60*24

 				});
 				console.log(res);
 				res.json({
 					success:true,
 					message:"Enjoy your token",
 					token:token
 				});
 			}
 		}
 	});
});

  app.listen(port);
  console.log('Magic happens at http://localhost:'+port);  