const express=require("express");
const bodyparser=require("body-parser");
const { listen } = require("express/lib/application");
const app = express();
const mongoose=require("mongoose");
const _ = require("lodash");

routes.IgnoreRoute("favicon.ico");



app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://newuser:Reddevil7@realmcluster.e8zyq.mongodb.net/todolistDB");

const itemSchema={
    name:String
}

const Item =mongoose.model(
    "item",
    itemSchema
);

const item1=new Item({
    name:"Welcome to your todo list"
})
const item2=new Item({
    name:"Hit + button to add new item"
})
const item3=new Item({
    name:"<---hit this to delete an item"
})

const defaultItems=[item1,item2,item3]

const listSchema={
    name:String,
    items:[itemSchema]
}

const List = mongoose.model("List",listSchema);

app.set('view engine','ejs');

app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
        if (!err){
            if (!foundList){
                // create a new list 
                 const list = new List({
                    name:customListName,
                    items:defaultItems
                 });
                 list.save();
                 res.redirect("/"+customListName)
        
            }else{
                // Show an existing list
                res.render("list",{
                    listTitle:foundList.name , NewListItem: foundList.items
                });
            }
        }

    });  

   
})

app.get("/",function(req,res){


    Item.find({},function(err,foundItems){
        if (foundItems===0){
            Item.insertMany(defaultItems,function(err){
                if (err){
                    console.log(err)
                }else{
                    console.log("Sucessfully added")
                }
            })
            res.redirect("/");
        }else{
            res.render("list",{
                listTitle:"Today" , NewListItem: foundItems
            });
        }



       
    });

    
}); 

app.post("/",function(req,res){ 
    // Taking item from the form created in listen.ejs
    const itemName = req.body.newItem;
    const listName = req.body.list;
// made item document to store name
    const item=new Item({
        name:itemName
    });
    if (listName==="Today"){
        // saving the new item
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
});

app.post("/delete",function(req,res){
    const checkedItem = req.body.checkbox;
    const listName=req.body.listName;

    if (listName=="Today"){
        Item.findByIdAndRemove(checkedItem,function(err){
            if (err){
                console.log(err)
            }else{
                console.log("Sucessfully Removed")
            }
        });
        res.redirect("/");

    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
        if (!err){
            res.redirect("/"+listName)
        }
    })
    }

    
});

// app.get("/work",function(req,res){
//     res.render("list",{listTitle:"Work List",NewListItem:workitems});
// });

// app.post("/work",function(req,res){
//     let item = req.body.newItem;
    
// });

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });