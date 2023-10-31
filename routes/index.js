var express = require('express');
const { log } = require('handlebars');
var router = express.Router();
var session = require('express-session')
const bodyParser = require('body-parser');
const userHelpers = require('../helpers/userHelpers');
const { response } = require('../app');

// Middleware for parsing form data
router.use(bodyParser.urlencoded({ extended: false }));
const verifylogInSuper=(req,res,next)=>{
  if(req.session.logedIn){
    next()
  }
  else{
    res.redirect('/super')
  }
}
/* GET home page. */
router.get('/', function (req, res, next) {
  userHelpers.superAdmin().then(() => {
    console.log("Super Admin registered");
  });
  req.session.destroy()
  console.log(req.session);
  res.render('index.hbs', { layout: 'layout' });
});

router.get('/basic', function (req, res, next) {
  // Example of storing plan information in an object
  req.session.plan = {
    name: 'basic', // Plan name
    amount: 100,   // Plan amount
  };

  res.render('register_payment.hbs', { layout: 'layout', plan: req.session.plan });
});

router.get('/pro', function (req, res, next) {
  // Example of storing plan information in an object
  req.session.plan = {
    name: 'pro', // Plan name
    amount: 300,   // Plan amount
  };

  res.render('register_payment.hbs', { layout: 'layout', plan: req.session.plan });
});

router.get('/premium', function (req, res, next) {
  // Example of storing plan information in an object
  req.session.plan = {
    name: 'premium', // Plan name
    amount: 500,   // Plan amount
  };
  res.render('register_payment.hbs', { layout: 'layout', plan: req.session.plan });
});

router.post('/data', (req, res) => {
  // Access form data using req.body
  const numFields = req.body.numFields;
  var total;
  const formData = [];

  for (let i = 1; i <= numFields; i++) {
    const name = req.body[`name${i}`];
    const phone = req.body[`phone${i}`];
    const gender = req.body[`gender${i}`];
    const email = req.body[`email${i}`];
    formData.push({ name, phone, gender, email });
  }
  if (req.session.plan.name === 'basic') {
    total = numFields * req.session.plan.amount;
  } else if (req.session.plan.name === 'pro') {
    total = numFields * req.session.plan.amount;
  } else {
    total = numFields * req.session.plan.amount;
  }
  let data = {
    College: req.body.college,
    TotalAmount: total,
    date: new Date(),
    status: false,
    participents: formData
  }
  console.log('Data :',data);

  userHelpers.genarateBooking(data).then((orderDetails) => {
    if (orderDetails) {
      userHelpers.genarateRazorpay(orderDetails).then((response)=>{
        res.json(response)
      })
    } else {
      
    }
  }).catch((error) => {
    console.error(error);
  });


});

router.post('/verify-payment', (req, res) => {
  console.log('To verify Payment:', req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentstatus(req.body['order[receipt]']).then((response) => {
      console.log(response);
      if (response.updated) {
        console.log("Payment Successfull");
        req.session.puchacheDetails = response;
        res.json(response)
        // res.render('ticket.hbs', { layout: 'layout',response });
      } else {
        res.json(response)
        
      }
      
    });
  });
});

router.get('/ticket', function (req, res, next) {
  data = req.session.puchacheDetails;
  res.render('ticket.hbs', { data });
});

router.get('/super', function (req, res, next) {
  console.log(req.session);
  if (req.session.LogErr) {
  res.render('super-admin.hbs',{layout:'layout',LogErr:req.session.LogErr});
  } else {
  res.render('super-admin.hbs',{layout:'layout'});
  }
});

router.post('/super-login', (req, res) => {
  userHelpers.superLogin(req.body).then((response) => {
    if (response.Status) {
      console.log(response);
      req.session.user = response.user;
      req.session.logedIn = true;
      userHelpers.fetchBookings().then((Bookings)=>{
        res.render('super-admin/super-admin-view-bookings.hbs',{layout:'super-admin/super-admin-layout',Bookings})
      })
    } else {
      req.session.LogErr = response.Mss;
      res.redirect('/super')
    }
  });
});
router.get('/new-admin',verifylogInSuper, function (req, res, next) {
  if (req.session.addAdminErr) {
  res.render('super-admin/add-admin.hbs',{layout:'super-admin/super-admin-layout',addErr : req.session.addAdminErr})
  } else if(req.session.addAdminSucc){
    res.render('super-admin/add-admin.hbs',{layout:'super-admin/super-admin-layout',addsucc : req.session.addAdminSucc})
  
  }
});

router.post('/super-login',verifylogInSuper, (req, res) => {
  if (req.body.password !== req.body.confirmPassword) {
    req.session.addAdminErr = 'Password not match ';
        res.redirect('/new-admin')
  } else {
    userHelpers.addAdmin(req.body).then((response) => {
      if (response.Status) {
        userHelpers.fetchBookings().then((Bookings)=>{
          req.session.addAdminSucc = 'admin adedd successfully'
          res.redirect('/new-admin')
        })
      } else {
        
      }
    });
  }
 
});
module.exports = router;