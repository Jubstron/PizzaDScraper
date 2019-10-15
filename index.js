const axios = require("axios");
const cheerio = require("cheerio");
const AWS = require("aws-sdk");
const fs = require("fs");
AWS.config.update({region: 'us-east-1'});

const url = "http://pizzadelicious.com/";


//-------------------------- Helper Functions --------------------------------

// Function to fetch data from url
const fetchData = async (url) => {
  const result = await axios.get(url);
  return cheerio.load(result.data);
};

// Function to scrape the data for list of current pizzas available
const fetchPizzaList = async (url) => {
  const $ = await fetchData(url);
  let pizzas;

  $('div#current_pizzas.menu_section.col-md-6.col-sm-6.col-xs-6').each((index, element) => {
    pizzas = $(element).find('span.item-name.flex-box').text();
  });
  
  return pizzas;
}

// Function to send alert to given recipients
const sendEggplantAlert = (recipients) => {
  let recipientsByLine = recipients.split("\n");
  console.log("Recipients:\n" + recipientsByLine);

  // Send alert to each recipient
  for (let i = 0; i < (recipientsByLine.length - 1); ++i) {
    let params = { Message: "*PIZZA DELICIOUS ALERT*\nEggplant Parmigiana Pizza Available Today"};
    params.PhoneNumber = recipientsByLine[i];

    let publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
    publishTextPromise.then(
      function(data) {
        console.log("Message \"" + params.Message +"\" sent to " + params.PhoneNumber);
        console.log("MessageID is " + data.MessageId);
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });
  }
}

//----------------------------------------------------------------------------

fetchPizzaList(url).then((data) => {
  let pizzaList = String(data);
  console.log("Today's Pizzas:\n" + pizzaList + '\n');

/*
  // For testing purposes
  if(pizzaList.includes("Cheese")){
    console.log("Found Cheese");
    let recipients = fs.readFileSync("recipients", "utf8");
    sendEggplantAlert(recipients);
  }
*/
  if(pizzaList.includes("Eggplant")){
    console.log("Found Eggplant Parmigiana Pizza");
    let recipients = fs.readFileSync("recipients", "utf8");
    sendEggplantAlert(recipients);
  }

});
