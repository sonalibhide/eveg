let productDetails = {};
let searchStr = "";
let basket = {};
//Each product is based on a 'card'; a box that contains information about that product.
//You can change the card template here. The [EVEGPRODUCT#] will always be subsituted for 
//the element in the imagesArr (see fruit.js)
//The classes can be styled using CSS
//The adjustDown and adjustUp buttons have their behaviour specified below, but you can change this if you like
//To change the quantity of a product, change the value of the input (with the class of amount-to-buy-input), you can then recalculate the basket with refreshBasket()
//Or you can adjust the basket object via javascript and call updateQuantityInputs() and refreshBasket()
var cardTemplate =
    `<div class="shop-product card" data-num="[EVEGPRODUCT#]">
          <div class="shop-product-img" data-field="img" data-num="[EVEGPRODUCT#]"></div>
          <div class="shop-product-details"  data-num="[EVEGPRODUCT#]"> 
            <div class="shop-product-title" data-field="title" data-num="[EVEGPRODUCT#]"></div>
            <div class="shop-product-price shop-product-text" data-field="price" data-num="[EVEGPRODUCT#]"></div>
            <div class="shop-product-units shop-product-text" data-field="units" data-num="[EVEGPRODUCT#]"></div>
          </div>
          <div class="shop-product-buying" data-num="[EVEGPRODUCT#]">
                <button class="btn shop-product-basket-btn">Add to Basket</button>
                <div class="shop-product-adjust-div" style="display: none">
                    <button class="btn adjust-down-btn">-</button>
                    <input class="amount-to-buy-input" data-num="[EVEGPRODUCT#]" min="0" value="0" type="text">
                    <button class="btn adjust-up-btn">+</button>
                </div>
          </div>
    </div>`;

  function init(){
    const toggleButton = document.getElementsByClassName('toggle-button')[0];
    const hero = document.getElementsByClassName('hero')[0];
    const navbarLinks = document.getElementsByClassName('navbar-links')[0];

    //When the toggle button is pressed (if visible by the screen size, the menu is shown)
    toggleButton.addEventListener('click',()=>{
      navbarLinks.classList.toggle('active');
      hero.classList.toggle('menuactive');
    });

    const searchBar = document.getElementsByClassName('search-bar')[0];
      searchBar.classList.toggle('active');

    //Do the search
    document.getElementById('searchbutton').addEventListener('click', ()=>{
      searchStr = document.getElementById('searchbox').value;
      redraw();
    });

    document.getElementById('searchbox').addEventListener('input', function (e) { 
      let length = e.currentTarget.value; 
      if (length==0) {
        searchStr = "";
        document.getElementById('searchbox').value = "";
        redraw();
      };
    }); 

    document.getElementById('searchbox').addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        document.getElementById("searchbutton").click();
      }
    });

    //Close the cookies message
    document.getElementById('acceptCookies').addEventListener('click', ()=>{
      setCookie('cookieMessageSeen', true);
      document.getElementById('cookieMessage').style.display = 'none';
    });

    if(getCookie("cookieMessageSeen") === "true"){
      document.getElementById('cookieMessage').style.display = 'none';
    }
    initProducts(redraw);
  }


  /*
  * When changing the page, you should make sure that each adjust button has exactly one click event
  * (otherwise it might trigger multiple times)
  * So this function loops through each adjustment button and removes any existing event listeners
  * Then it adds another event listener
  */
  function resetListeners(){
    let eIn;

    var elements = document.getElementsByClassName("adjust-up-btn");
    for(eIn = 0; eIn < elements.length; eIn++){
      elements[eIn].removeEventListener("click",increment);
      elements[eIn].addEventListener("click",increment);
    }

    elements = document.getElementsByClassName("adjust-down-btn");
    for(eIn = 0; eIn < elements.length; eIn++){
      elements[eIn].removeEventListener("click",decrement);
      elements[eIn].addEventListener("click",decrement);
    }
    elements = document.getElementsByClassName("amount-to-buy-input");
    for(eIn = 0; eIn < elements.length; eIn++){
      elements[eIn].removeEventListener("change",inputchange);
      elements[eIn].addEventListener("change",inputchange);
    }
    elements = document.getElementsByClassName("shop-product-basket-btn");
    for(eIn = 0; eIn < elements.length; eIn++){
      elements[eIn].removeEventListener("click",increment);
      elements[eIn].addEventListener("click",increment);
    }
  }


  /*
  * Change the quantity of the product with productID
  */
  function changeQuantity(productID, newQuantity, shopProductBuying){


    let addToBasket = shopProductBuying.getElementsByClassName("shop-product-basket-btn")[0]
    let adjustDiv = shopProductBuying.getElementsByClassName("shop-product-adjust-div")[0]

    console.log(newQuantity)

    if(newQuantity === 0) {
      adjustDiv.style.display = "none"
      addToBasket.style.display = "block"
      delete basket[productID];
    } else {
      addToBasket.style.display = "none"
      adjustDiv.style.display = "block"
      basket[productID] = newQuantity;
    }
    shopProductBuying.getElementsByClassName("amount-to-buy-input")[0].value = newQuantity;

    refreshBasket();
  }

  //When the input changes, add a 'bought' class if more than one is added
  function inputchange(ev){
    let shopProductBuying = ev.target.parentElement.closest(".shop-product-buying");
    let thisID = parseInt(shopProductBuying.getAttribute("data-num"));
    let newValue = shopProductBuying.getElementsByTagName("input")[0].value
    if (newValue >= 0)
      changeQuantity(thisID, newValue, shopProductBuying);
  }

  //Add 1 to the quantity
  function increment(ev){
    let shopProductBuying = ev.target.parentElement.closest(".shop-product-buying");
    let thisID = parseInt(shopProductBuying.getAttribute("data-num"));

    let previousValue = basket[thisID] === undefined ? 0 : basket[thisID]
    changeQuantity(thisID,previousValue + 1, shopProductBuying);
  }

  //Subtract 1 from the quantity
function decrement(ev){
  let shopProductBuying = ev.target.parentElement.closest(".shop-product-buying");
  let thisID = parseInt(shopProductBuying.getAttribute("data-num"));

  let previousValue = basket[thisID] === undefined ? 0 : basket[thisID]
  if (previousValue > 0)
    changeQuantity(thisID,previousValue - 1, shopProductBuying);
}

  function filterFunction(a){
    /*This demonstrates how to filter based on the search term*/
    return a.name.toLowerCase().includes(searchStr.toLowerCase());

    //If you wanted to just filter based on fruit/veg you could do something like this:
    // return a.type == 'veg';
    // return a.type == 'fruit';
    // return true;
  }

  function sortFunction(a,b){
    return a.price > b.price;
  }


  //Redraw all products based on the card template
  function redraw(){

    //Reset the product list (there are possibly more efficient ways of doing this, but this is simplest)
    let productListHTML = document.querySelector('.productList');
    productListHTML.innerHTML = '';

    const shownProducts = productDetails.filter(filterFunction);

    shownProducts.sort(sortFunction);

    if (shownProducts.length == 0) {
      productListHTML.innerHTML = `
      <div style="text-align:center">
        <p>No results found for this search term!</p>
      </div>
    `;
    }

    shownProducts.forEach((product) => {
      const cardHTML = cardTemplate.replaceAll("[EVEGPRODUCT#]", product.productID);
      const thisProduct = document.createElement("div");
      thisProduct.innerHTML = cardHTML;

      let productCard = thisProduct.firstElementChild

      productCard.getElementsByClassName("shop-product-img").item(0)
          .innerHTML = `<span class=\"imgspacer\"></span><img src=${"images/"+product.image} alt=${product.name}>`;

      let productDetails = productCard.getElementsByClassName("shop-product-details").item(0)

      productDetails.getElementsByClassName("shop-product-title").item(0)
          .innerHTML = product.name;

      productDetails.getElementsByClassName("shop-product-price").item(0)
          .innerHTML = "<span>£"+(product.price/100).toFixed(2)+"</span>";

      productDetails.getElementsByClassName("shop-product-units").item(0)
          .innerHTML = "<span>"+product.packsize + " " + product.units+"</span>";

      productListHTML.appendChild(thisProduct.firstChild);
    })

    resetListeners();
    updateQuantityInputs();
  }

  window.addEventListener("load", init);

  function updateQuantityInputs(){
    for(let productCard of document.querySelectorAll(".shop-product")){
      let buyInput = productCard.getElementsByClassName("shop-product-buying")[0]
      let productID = buyInput.getAttribute("data-num")
      let currentQuantity = isNaN(basket[productID]) ? 0 : basket[productID] ;
      changeQuantity(productID, currentQuantity, buyInput)
    }
  }

  //Recalculate basket
  function refreshBasket(){
    let total = 0;
    for(const productID in basket){
      let quantity = basket[productID];
      let price = productDetails[productID].price;
      total = total + (price * quantity);
    }
    setCookie('basket', JSON.stringify(basket));
    try{
      document.querySelector("#basketNumTotal").innerHTML = (total / 100).toFixed(2);
    }catch(e){

    }
    return total;
  }