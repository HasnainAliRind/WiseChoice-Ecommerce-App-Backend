const express = require("express")
const router = express.Router()
const fs = require("fs");
const axios = require('axios');


const guessDiscount = () =>{
  const min = 10;
  const max = 60;
  const randomNumber = Math.floor(Math.random() * (max - min + 1) + min)
  return randomNumber;
}


const data = fs.readFileSync(`${__dirname}/OrginalData.json`, "utf8")
let dat = JSON.parse(data)
let category =
[
  'Shirt',                'Gaget',
  'Sports',               'Home Decoration',
  'Electronics',          'clocks',
  'Jewelry',              'Office Supplies',
  'Travel Product',       'Fashion Product',
  'Stationery Book',      'Toys & Games',
  'Appliances',           'Automotive',
  'Pet Supplies',         'Art & Craft Supplies',
  'Music Instruments',    'Eco-friendly Product',
  'Baking Supplies',      'Cleaning_Supplies',
  'Clothing Accessories', 'Party Supplies',
  'Furniture',            'DIY Kits'
];

function guessRandomPrice() {
  const randomPrice = Math.floor(Math.random() * (120 - 20 + 1)) + 20;
  return randomPrice.toFixed(2);
}


router.get("/", (req, res) => {
  res.json(dat)
})
// router.get("/change",(req , res)=>{
//   let NewData = [];
//   let ProductsWithNoPrice = dat.filter((product)=>product.price.current_price === 0);
//   let productsWithPrice = dat.filter(product=>product.price.current_price !== 0)
//   ProductsWithNoPrice.forEach(product=>{
//     let price = guessRandomPrice()
//     product.price.current_price = parseFloat(price);
//     NewData.push(product)
//   })
//   res.json(NewData.concat(productsWithPrice))
 
// })
router.get("/products", (req, res) => {
  res.json(dat)
})
router.get("/products/discounts", (req , res)=>{
  let products = dat.filter(item=>item.price.discounted === true);
  let categories = []
  products.forEach(element => {
    if (categories.some(item=>item.category !== element.category)) {
      categories.push(element.category)
    }
  });
})

router.get("/products/featured", async (req, res) => {
  const featuredCategories = ['Gaget', 'clocks', 'Clothing Accessories', 'Baking Supplies', 'Toys & Games' , 'Cleaning_Supplies'];
  const allItems = [];

  try {
    for (const category of featuredCategories) {
      const response = await axios.get(`http://localhost:5000/products/category/${category}`);
      const data = response.data;
      allItems.push(data[2]);
    }

    res.json(allItems);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});


router.get("/products/category/:category", (req, res) => {
  let dataOfCategory = [];
  dat.forEach((element) => {
    if (element.category === req.params.category) {
      dataOfCategory.push(element)
    }
  });
  res.json(dataOfCategory)
})

router.get("/products/:id", (req, res) => {
  let product;
  dat.forEach(item => {
    if (item.asin == req.params.id) {
      product = item;
    }
  });
  const FindRelatedProducts = (product) =>{
    let relatedProducts = [];
    function GetRelatedCategoryProducts() {
      dat.forEach(element => {
        if(element.category === product.category && element.asin !== product.asin){
          relatedProducts.push(element)
        }
      });
    }
    function GetRelatedTitledProducts() {
      let TitleKeywords = product.title.split(" ");
      if (TitleKeywords.length >= 8) {
        for (let i = 0; i < 8; i++) {
          if(TitleKeywords[i].length >= 3){
          let keyword = TitleKeywords[i].toLowerCase();
          
          dat.forEach((specific_product , index) => {
            let keywordInTitle = specific_product.title.split(" ")
            keywordInTitle.forEach(word => {
              if (keyword === word.toLowerCase()) {
                let isAlreadyPresent = relatedProducts.some(item=>item.asin === specific_product.asin)
                if (!isAlreadyPresent) {
                  relatedProducts.push(specific_product)
                }
              }
            });
          });
        }
        }
      }else{
        for (let i = 0; i < TitleKeywords.length; i++) {
          if(TitleKeywords[i].length >= 3){
          let keyword = TitleKeywords[i].toLowerCase();
          
          dat.forEach((specific_product , index) => {
            let keywordInTitle = specific_product.title.split(" ")
            keywordInTitle.forEach(word => {
              if (keyword === word.toLowerCase()) {
                let isAlreadyPresent = relatedProducts.some(item=>item.asin === specific_product.asin)
                if (!isAlreadyPresent) {
                  relatedProducts.push(specific_product)
                }
              }
            });
          });
        }
        }
      }
      
    }
    
    GetRelatedTitledProducts();
    GetRelatedCategoryProducts();
    return relatedProducts.filter((item,index)=>index<40);
  }
  res.json({
    product: product,
    otherMatchingProducts: FindRelatedProducts(product)
  })
})

router.get("/products/search/:search", (req, res) => {
  let results = []
  let searchedQuery = req.params.search
  let searchedWords = searchedQuery.split(" ")
  dat.forEach((element,index) => {
    let title = element.title.split(" ");
    searchedWords.forEach((word)=>{
      word = word.toLowerCase()
      for (let i = 0; i < title.length; i++) {
      if (word !== "the" && word !== "," && word !== "'" && word !== ":" , word !== ";") {
        if (title[i].toLowerCase() === word.toLowerCase()) {
          let isAlreadyPresent = results.some(product => product.asin === element.asin)
          if (!isAlreadyPresent) {
            results.push(element)
          } 
        } 
      }
      }
    })
  });
  res.json(results)
})

module.exports = router;