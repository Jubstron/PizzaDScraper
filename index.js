const axios = require("axios");
const cheerio = require("cheerio");
const AWS = require("aws-sdk");
AWS.config.update({region: 'us-east-1'});

const url = "http://pizzadelicious.com/";

const fetchData = async (url) => {
  const result = await axios.get(url);
  return cheerio.load(result.data);
};

const fetchPizzaList = async (url) => {
  const $ = await fetchData(url);
  let pizzas;

  $('div#current_pizzas.menu_section.col-md-6.col-sm-6.col-xs-6').each((index, element) => {
    pizzas = $(element).find('span.item-name.flex-box').text();
  });
  
  return pizzas;
}


fetchPizzaList(url).then((data) => {
  let pizzaList = String(data);
  console.log("Today's Pizzas:\n" + pizzaList);

  let params = {
    Message: "*PIZZA DELICIOUS ALERT*\nEggplant Parmigiana Pizza Available Today", 
    //TopicArn: 'arn:aws:sns:us-east-2:433850899585:pizza-d-scraper-recipients'
    PhoneNumber: '+10015042391142',
  };

  if(pizzaList.includes("Cheese")){
    console.log("Found Cheese");
    let publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
 
    publishTextPromise.then(
      function(data) {
        console.log("Message \'" + params.Message + "\' sent to the topic \'" + params.TopicArn);
        console.log("MessageID is " + data.MessageId);
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });
  }

  if(pizzaList.includes("Eggplant")){
    let publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
 
    publishTextPromise.then(
      function(data) {
        console.log("Message \'" + params.Message + "\' sent to the topic \'" + params.TopicArn);
        console.log("MessageID is " + data.MessageId);
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });
  }
});
