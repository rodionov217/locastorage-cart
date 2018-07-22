'use strict';
localStorage.defaultColor;
localStorage.defaultSize;
//---------------GET COLORS & SIZES---------------------
const colorXHR = new XMLHttpRequest();
const sizeXHR = new XMLHttpRequest();
const data = {};
colorXHR.open('GET', 'https://neto-api.herokuapp.com/cart/colors', true);
sizeXHR.open('GET', 'https://neto-api.herokuapp.com/cart/sizes', true);
colorXHR.send();
sizeXHR.send();
colorXHR.addEventListener('load', () => data.colors = JSON.parse(colorXHR.response));
sizeXHR.addEventListener('load', () => data.sizes = JSON.parse(sizeXHR.response));
colorXHR.addEventListener('loadend', addColors);
sizeXHR.addEventListener('loadend', addSizes);
//-------------------------------------------------------

//-------------------SELECT ACTIVE PRODUCT-----------------------------
const thumbImages = document.getElementsByClassName('thumb-image');
const bigImage = document.getElementById('big-image');
let activeProduct = document.querySelector('.active');

Array.from(thumbImages).forEach(img => img.addEventListener('click', selectProduct));

function selectProduct(event) { 
  event.preventDefault();
  Array.from(thumbImages).forEach(img => img.classList.remove('active'));
  event.currentTarget.classList.add('active');
  activeProduct = event.currentTarget;
  bigImage.style.backgroundImage = `url(${event.currentTarget.getAttribute('href')})`;
}
//-------------------------------------------------------

//----------------ADD COLOR & SIZE SNIPPETS--------------------------
let colorSwatch = document.getElementById('colorSwatch');
let sizeSwatch = document.getElementById('sizeSwatch');

function addColors() { 
  //let target = event.currentTarget; //thumb-image
  let colorSnippet = data.colors.map((el, i) => `<div data-value="${el.code}" class="swatch-element color ${el.code} ${isAvailable(el)}">
  <div class="tooltip">${el.title}</div>
  <input quickbeam="color" id="swatch-${i}-${el.code}" type="radio" name="color" value="${el.code}" ${isCheckedOrDisabled(el, i)}>
  <label for="swatch-${i}-${el.code}" style="border-color: ${el.code};">
    <span style="background-color: ${el.code};"></span>
    <img class="crossed-out" src="https://neto-api.herokuapp.com/hj/3.3/cart/soldout.png?10994296540668815886">
  </label>
</div>`);
  colorSwatch.innerHTML = colorSnippet.join(' ');
}

function addSizes() { 
  let sizeSnippet = data.sizes.map((el, i) => `<div data-value="${el.type}" class="swatch-element plain ${el.type} ${isAvailable(el)}">
  <input id="swatch-${i}-${el.type}" type="radio" name="size" value="${el.type}" ${isCheckedOrDisabled(el, i)}>
  <label for="swatch-${i}-${el.type}">
    ${el.title}
    <img class="crossed-out" src="https://neto-api.herokuapp.com/hj/3.3/cart/soldout.png?10994296540668815886">
  </label>
</div>`);
  sizeSwatch.innerHTML = sizeSnippet.join(' ');
}

function isAvailable(element) { 
  return element.isAvailable ? 'available' : 'soldout';
}

function isCheckedOrDisabled(element, i) { 
  if (!element.isAvailable) {
    return 'disabled';
  }
  if (localStorage.defaultColor === element.type || localStorage.defaultSize === element.type) {
    return 'checked';
  }
  return '';
}
//-------------------------------------------------------

//----------------------CART---------------------------------
let cart = document.getElementById('quick-cart');
let form = document.getElementById('AddToCartForm');
const cartXHR = new XMLHttpRequest();
const removeXHR = new XMLHttpRequest();

const addButton = document.getElementById('AddToCart');
addButton.addEventListener('click', addToCart);

function addToCart(event) {
  event.preventDefault();
  cartXHR.open('POST', 'https://neto-api.herokuapp.com/cart', true);
  let formdata = new FormData(form);
  formdata.append('productId', form.dataset.productId);
  cartXHR.send(formdata);
}

cartXHR.addEventListener('load', updateCart);
removeXHR.addEventListener('load', updateCart)

function updateCart(event) { 
  let response = JSON.parse(event.currentTarget.response);
  if (response.error) { 
    console.log(response.message);
    return;
  }
  
  if (response.length === 0) { 
    cart.innerHTML = `<a id="quick-cart-pay" quickbeam="cart-pay" class="cart-ico open">
    <span>
      <strong class="quick-cart-text">Оформить заказ<br></strong>
      <span id="quick-cart-price">$0.00</span>
    </span>
    </a>`
    return;
  }
  cart.innerHTML = `<div class="quick-cart-product quick-cart-product-static" id="quick-cart-product-${response[0].id}" style="opacity: 1;">
  <div class="quick-cart-product-wrap">
    <img src="${response[0].pic}" title="${response[0].title}">
    <span class="s1" style="background-color: #000; opacity: .5">$800.00</span>
    <span class="s2"></span>
  </div>
  <span class="count hide fadeUp" id="quick-cart-product-count-${response[0].id}">${response[0].quantity}</span>
  <span class="quick-cart-product-remove remove" data-id="${response[0].id}"></span>
  </div>
  <a id="quick-cart-pay" quickbeam="cart-pay" class="cart-ico open">
    <span>
      <strong class="quick-cart-text">Оформить заказ<br></strong>
      <span id="quick-cart-price">$${response[0].quantity * response[0].price}.00</span>
    </span>
  </a>`;
  const remove = cart.querySelector('.remove');
  remove.addEventListener('click', (event) => { 
    event.preventDefault();
    removeXHR.open('POST', 'https://neto-api.herokuapp.com/cart/remove', true);
    let body = new FormData();
    body.append('productId', event.currentTarget.dataset.id);
    removeXHR.send(body);
  })
}
//--------------------SET DEFAULT OPTIONS---------------------------------------
colorXHR.addEventListener('loadend', () => {
  sizeXHR.addEventListener('loadend', () => { 
    let swatches = Array.from(form.getElementsByTagName('input')).filter(el => el.type === 'radio');
    Array.from(swatches).forEach(swatch => swatch.addEventListener('click', save));
  });
})

function save(event) { 
  let target = event.currentTarget;
  if (target.name === 'color') { 
    localStorage.defaultColor = target.value;
  }
  if (target.name === 'size') { 
    localStorage.defaultSize = target.value;
  }
}

document.addEventListener('DOMContentLoaded', () => { 
  let updateXHR = new XMLHttpRequest();
  updateXHR.open('GET', 'https://neto-api.herokuapp.com/cart', true);
  updateXHR.send();
  updateXHR.addEventListener('load', updateCart);
})