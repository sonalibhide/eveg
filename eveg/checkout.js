let productDetails = {};
let creditCardShown = false;

/*
* When the page is loaded, initialise the products and reset the listeners
*/
function init(){
  //initProducts takes a callback function - when the products are loaded the basket will be recalculated
  initProducts(calculateBasket);
  resetListeners();
}

//When changing the page, you should make sure that each adjust button has exactly one click event
//(otherwise it might trigger multiple times)
function resetListeners(){
document.getElementById("paycreditcard").removeEventListener("click",showCreditCardPage);
document.getElementById("paycreditcard").addEventListener('click',showCreditCardPage);
}

//When the payment button link is clicked, show the payment.html in an iframe

function showCreditCardPage(){
  if(!creditCardShown){
    var payIFrame = document.createElement("iframe");
    payIFrame.src = "payment.html";
    payIFrame.width = "50%";
  
    document.querySelector('#customerDetails').appendChild(payIFrame);
  }
}


/*
* Calculate the totals and show the basket
*/
function calculateBasket(){
  let total = 0;
  let basket = JSON.parse(getCookie("basket"));

  let checkoutList = document.querySelector('#basketList')

  checkoutList.innerHTML = ''

  for(const productID in basket){
    console.log(productID)
    let quantity = basket[productID];
    let price = productDetails[productID].price;
    let productTotal = price * quantity;
    total = total + productTotal;

    let rowHTML = `
            <td>${productDetails[productID].name}</td>
            <td>
                <div style="width: 9em">
                    <input style="display: inline; width: 7em" class="amount-to-buy-input" min="0" value="${quantity}" type="number" onchange="changeAmountInBasket(this)">
                    <button style="display: inline; width: 2em" onclick="removeItemFromBasket(this)">✖</button>
                </div>
                
              </td>
            <td>£${(price / 100).toFixed(2)} </td>
            <td>£${(productTotal / 100).toFixed(2)}</td>`;


    let thisProduct = document.createElement("tr");
    thisProduct.setAttribute("data-num", productID)
    thisProduct.innerHTML = rowHTML;
    checkoutList.appendChild(thisProduct);
  }

  if (Object.keys(basket).length === 0) {
    rowHTML = `
        <td colspan="4" style="text-align: center; font-weight: normal">The basket is empty!</td>`;
    let emptyBasketColumn = document.createElement("tr");
    emptyBasketColumn.innerHTML = rowHTML;
    checkoutList.appendChild(emptyBasketColumn).appendChild(document.createElement("tr"));
  }

  document.getElementById("basketTotal").innerHTML = `£${(total / 100).toFixed(2)}`
}


function removeItemFromBasket(el) {
  let productId = parseInt(el.closest("tr").getAttribute("data-num"))
  let basket = JSON.parse(getCookie("basket"));
  delete basket[productId]
  setCookie('basket', JSON.stringify(basket));
  calculateBasket()
}

function changeAmountInBasket(el) {
  console.log(el.parentElement)
  let productId = parseInt(el.closest("tr").getAttribute("data-num"))
  let basket = JSON.parse(getCookie("basket"));
  console.log(productId)
  basket[productId] = parseInt(el.value)
  console.log(basket)
  setCookie('basket', JSON.stringify(basket));
  calculateBasket()
}

window.addEventListener("load", init);