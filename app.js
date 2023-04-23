//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const connectionString = "mongodb+srv://sughoshsv:wmxn67ke88@cluster0.uzegvmv.mongodb.net/TodoListDB";

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Welcom to the TodoList"
});

const item2 = new Item({
  name: "This is Sample"
});

const item3 = new Item({
  name: "Test"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
const day = date.getDate();
app.get("/", function (req, res) {

  

  Item.find({})
    .then(function (items) {
      // Handle the results of the query
      var itemCount = items.length;
      if (itemCount == 0) {
        Item.insertMany(defaultItems).then(function () {
          console.log("Success");
        }).catch(function () {
          console.log("Failed");
        });
      }
      res.render("list", {
        listTitle: day,
        newListItems: items
      });
    })
    .catch(function (error) {
      // Handle any errors that occurred
      console.error(error);
    });


});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
      name: customListName
    })
    .then(function (foundList) {

      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    })
    .catch(function (error) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName)
    });

});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.listbtn;

  const item = new Item({
    name: itemName
  });
  console.log(day);
  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
        name: listName
      })
      .then(function (foundList) {

        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName)
      })
      .catch(function (error) {
        console.log("Error in posting");
      });
  }


});



app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/delete", function (req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove({
        _id: checkedItemID
      })
      .then(function () {
        console.log("Deleted");
      })
      .catch(function () {
        console.log("Failed");
      });
    res.redirect("/");
  } else {

      List.findOneAndUpdate(
        {name : listName},
        {$pull :  {items : {_id: checkedItemID} } }
      ).then(function(){
        res.redirect("/"+listName);
      })
      
      
  }





});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});