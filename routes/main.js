const express = require('express');
const router = express.Router();

// models
let People = require('../models/people');
let Item = require('../models/item');

// home page
router.get('/', (req,res) => {
    res.render('index', {
        title:'Home',
        homeActive:'bg-light text-dark'
    });
});

// about us page
router.get('/aboutUs', (req,res) => {
    res.render('aboutUs', {
        title:'About Us',
        aboutUsActive:'bg-light text-dark'
    });
});

// add persons route
router.get('/messMates', ensureAuth, (req,res) => {
    People.find({'userID':req.user._id}, (err,peoples) => {
        if(err){
            console.log(err);
        }else{
            res.render('messMates',{
                title:'Mess Mates',
                messMatesActive:'bg-light text-dark',
                peoples
            });
        }
    }).sort({'person':1});
});

// add persons to user in db
router.post('/addMessMates', (req,res) => {
    req.checkBody('person', 'Name is required').notEmpty();

    let errors = req.validationErrors();

    // check for errors
    if(errors){
        res.render('addMessMates',{
            title:'Add Mess Mates',
            errors
        });
    }else{
        let people = new People();
        people.person = req.body.person;
        people.userID = req.user._id;
    
        people.save(err => {
            if(err){
                console.log(err);
            }else{
                res.redirect('/messMates');
            }
        });
    }
});

// edit person of user in db
router.post('/editMessMates/:id', (req,res) => {
    req.checkBody('editPerson', 'Name is required').notEmpty();

    let errors = req.validationErrors();

    // check for errors
    if(errors){
        People.find({'userID':req.user._id}, (err,peoples) => {
            if (err){
                console.log(err);
            }else{
                res.render('messMates',{
                    title:'Mess Mates',
                    peoples,
                    errors
                });
            }
        }).sort({'person':1});
    }else{
        let people = {};
        people.person = req.body.editPerson;
        people.userID = req.user._id;

        People.find({'_id':req.params.id, 'userID':req.user._id}, (err,peoples) => {
            if(err){
                console.log(err);
            }else{
                Item.updateMany({'paidBy':peoples[0].person, 'userID':req.user._id}, {$set:{'paidBy':req.body.editPerson}}, (err) => {
                    if(err){
                        console.log(err);
                    }else{
                        People.updateOne({'_id':req.params.id}, people, (err) => {
                            if(err){
                                console.log(err);
                            }else{
                                res.redirect('/messMates');
                            }
                        });
                    }
                });
            }
        });
    }
});

// async delete person
router.delete('/deletePerson/:id', (req,res) => {
    People.find({'_id':req.params.id, 'userID':req.user._id}, (err,peoples) => {
        if(err){
            res.send('Error');
            console.log(err);
        }else{
            People.deleteOne({'_id':req.params.id, 'userID':req.user._id}, err => {
                if(err){
                    res.send('Error');
                    console.log(err);
                }else{
                    Item.deleteMany({'paidBy':peoples[0].person, 'userID':req.user._id}, err => {
                        if(err){
                            res.send('Error');
                            console.log(err);
                        }else{
                            res.send('Deleted!!');
                        }
                    });
                }
            });
        }
    });
});

// add item route
router.get('/addItem', ensureAuth, (req,res) => {
    People.find({'userID':req.user._id}, (err,peoples) => {
        if (err){
            console.log(err);
        }else{
            res.render('addItem', {
                title:'Add Item',
                addItemActive:'bg-light text-dark',
                peoples
            });
        }
    }).sort({'person':1})
});

// add item to db
router.post('/addItem', (req,res) => {
    req.checkBody('date', 'Date is required').notEmpty();
    req.checkBody('itemName', 'Item Name is required').notEmpty();
    req.checkBody('itemPrice', 'Item Price is required').notEmpty();
    req.checkBody('paidBy', 'Person is required').notEmpty();

    let errors = req.validationErrors();

    // check for errors
    if(errors){
        People.find({}, (err,peoples) => {
            if (err){
                console.log(err);
            }else{
                res.render('addItem', {
                    title:'Add Item',
                    addItemActive:'bg-light text-dark',
                    peoples,
                    errors
                });
            }
        }).sort({'person':1});
    }else{
        let item = new Item();
        item.day = (req.body.date).substr(8,2);
        item.month = (req.body.date).substr(5,2);
        item.year = (req.body.date).substr(0,4);
        item.itemName = req.body.itemName;
        item.itemPrice = req.body.itemPrice;
        item.paidBy = req.body.paidBy;
        item.userID = req.user._id;
    
        item.save(err => {
            if(err){
                console.log(err);
            }else{
                res.redirect('/');
            }
        });
    }
});

// edit item route
router.get('/editItem/:id', ensureAuth, (req,res) => {
    Item.find({'_id':req.params.id, 'userID':req.user._id}, (err,items) => {
        if (err){
            console.log(err);
        }else{
            if(items[0]){
                res.render('editItem', {
                    title:'Edit Item',
                    items:items[0]
                });
            }else{
                res.redirect('/');
            }
        }
    });
});

// async send items and persons to edit item page
router.get('/edit/:id', (req,res) => {
    Item.find({'_id':req.params.id, 'userID':req.user._id}, (err,items) => {
        if (err){
            console.log(err);
        }else{
            People.find({'userID':req.user._id}, (err,peoples) => {
                if (err){
                    console.log(err);
                }else{
                    response = [items[0], peoples];
                    res.send(response);
                }
            }).sort({'person':1});
        }
    });
});

// edit item to db
router.post('/editItem/:id', (req,res) => {
    req.checkBody('date', 'Date is required').notEmpty();
    req.checkBody('itemName', 'Item Name is required').notEmpty();
    req.checkBody('itemPrice', 'Item Price is required').notEmpty();
    req.checkBody('paidBy', 'Person is required').notEmpty();

    let errors = req.validationErrors();

    // check for errors
    if(errors){
        Item.find({'_id':req.params.id, 'userID':req.user._id}, (err,items) => {
            if (err){
                console.log(err);
            }else{
                res.render('editItem', {
                    title:'Edit Item',
                    items:items[0],
                    errors
                });
            }
        });
    }else{
        let item = {};
        item.day = (req.body.date).substr(8,2);
        item.month = (req.body.date).substr(5,2);
        item.year = (req.body.date).substr(0,4);
        item.itemName = req.body.itemName;
        item.itemPrice = req.body.itemPrice;
        item.paidBy = req.body.paidBy;
        item.userID = req.user._id;

        Item.updateOne({'_id':req.params.id, 'userID':req.user._id},item,(err) => {
            if(err){
                console.log(err);
            }else{
                res.redirect('/');
            }
        });
    }
});

// async delete item
router.delete('/deleteItem/:id', (req,res) => {
    Item.deleteOne({'_id':req.params.id, 'userID':req.user._id}, err => {
        if(err){
            res.send('Error');
            console.log(err);
        }
        res.send('Deleted!!');
    });
});

// view per day
router.get('/perDay', ensureAuth, (req,res) => {
    People.find({'userID':req.user._id}, (err,peoples) => {
        if (err){
            console.log(err);
        }else{
            res.render('perDay', {
                title:'View Per Day',
                viewActive:'bg-light text-dark',
                peoples
            });
        }
    }).sort({'person':1});
});

// async send items and persons to per day page
router.get('/itemsDay/:date', (req,res) => {
    Item.find({'userID':req.user._id, 'day':req.params.date.substr(0,2), 'month':req.params.date.substr(3,2), 'year':req.params.date.substr(6,4)}, (err,items) => {
        if (err){
            console.log(err);
        }else{
            People.find({'userID':req.user._id}, (err,peoples) => {
                if(err){
                    console.log(err);
                }else{
                    let response = [items, peoples]
                    res.send(response);
                }
            });
        }
    }).sort({'day':1});
});

// view per month
router.get('/perMonth', ensureAuth, (req,res) => {
    People.find({'userID':req.user._id}, (err,peoples) => {
        if (err){
            console.log(err);
        }else{
            res.render('perMonth', {
                title:'View Per Month',
                viewActive:'bg-light text-dark',
                peoples
            });
        }
    }).sort({'person':1});
});

// async send dates to per month and per day page
router.get('/dates', (req,res) => {
    Item.find({'userID':req.user._id}, (err,items) => {
        if (err){
            console.log(err);
        }else{
            let day = [];
            let month = [];
            let year = [];
            items.forEach(item => {
                day.push(item.day);
                month.push(item.month);
                year.push(item.year);
            });
            let dates = [day, month, year];
            res.send(dates);
        }
    }).sort({'month':1});
});

// async send items and persons to per month page
router.get('/itemsMonth/:date', (req,res) => {
    Item.find({'userID':req.user._id, 'month':req.params.date.substr(0,2), 'year':req.params.date.substr(3,4)}, (err,items) => {
        if (err){
            console.log(err);
        }else{
            People.find({'userID':req.user._id}, (err,peoples) => {
                if(err){
                    console.log(err);
                }else{
                    let response = [items, peoples]
                    res.send(response);
                }
            });
        }
    }).sort({'day':1});
});

// view per person
router.get('/perPerson', ensureAuth, (req,res) => {
    People.find({'userID':req.user._id}, (err,peoples) => {
        if (err){
            console.log(err);
        }else{
            res.render('perPerson', {
                title:'View Per Person',
                viewActive:'bg-light text-dark',
                peoples
            });
        }
    }).sort({'person':1});
});

// async send items to per person page
router.get('/items/:person', (req,res) => {
    Item.find({'userID':req.user._id, 'paidBy':req.params.person}, (err,items) => {
        if (err){
            console.log(err);
        }else{
            res.send(items);
        }
    }).sort({'year':1, 'month':1, 'day':1});
});

// access control
function ensureAuth(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/users/login');
    }
}

module.exports = router;