const products = [
 {id:1,name:"Single Bed",cat:"Furniture",icon:"🛏️",rent:499,deposit:1500,stock:12},
 {id:2,name:"Study Table",cat:"Study",icon:"🪑",rent:249,deposit:700,stock:18},
 {id:3,name:"Study Chair",cat:"Study",icon:"💺",rent:149,deposit:400,stock:25},
 {id:4,name:"Mini Refrigerator",cat:"Appliances",icon:"🧊",rent:599,deposit:2000,stock:7},
 {id:5,name:"Washing Machine",cat:"Appliances",icon:"🧺",rent:799,deposit:2500,stock:5},
 {id:6,name:"Wardrobe",cat:"Furniture",icon:"🚪",rent:349,deposit:1000,stock:10},
 {id:7,name:"Microwave Oven",cat:"Appliances",icon:"🍲",rent:449,deposit:1200,stock:9},
 {id:8,name:"Bookshelf",cat:"Study",icon:"📚",rent:199,deposit:500,stock:14}
];

let category="All";
let cart=[];
let currentUser=null;
let rentals=JSON.parse(localStorage.getItem("rentEaseRentals")||"[]");
let supportRequests=JSON.parse(localStorage.getItem("rentEaseSupport")||"[]");

function renderProducts(){
 const q=document.getElementById("searchBox").value.toLowerCase();
 const list=products.filter(p=>(category==="All"||p.cat===category)&&p.name.toLowerCase().includes(q));
 document.getElementById("productGrid").innerHTML=list.map(p=>`
  <article class="product">
   <div class="product-img">${p.icon}</div>
   <div class="product-body">
    <div class="category">${p.cat}</div>
    <h3>${p.name}</h3>
    <div class="price">₹${p.rent}<small>/month</small></div>
    <p style="font-size:12px;color:#747b89">Deposit: ₹${p.deposit} · ${p.stock} available</p>
    <button onclick="viewProduct(${p.id})">View Details</button>
   </div>
  </article>`).join("")||"<p>No products found.</p>";
}
function filterCategory(c,b){category=c;document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProducts()}
function viewProduct(id){
 const p=products.find(x=>x.id===id);
 document.getElementById("productDetails").innerHTML=`
  <div style="font-size:70px;background:#f0f1f6;border-radius:15px;text-align:center;padding:15px">${p.icon}</div>
  <div class="category" style="margin-top:15px">${p.cat}</div>
  <h2>${p.name}</h2>
  <p>Affordable monthly rental for students and temporary stays.</p>
  <p><b>Monthly rent:</b> ₹${p.rent}</p>
  <p><b>Security deposit:</b> ₹${p.deposit}</p>
  <p><b>Tenure:</b> 1, 3, 6 or 12 months</p>
  <p><b>Availability:</b> ${p.stock} units</p>
  <button class="primary-btn full" onclick="addToCart(${p.id});closeModal('productModal')">Add to Cart</button>`;
 openModal("productModal");
}
function addToCart(id){const p=products.find(x=>x.id===id);cart.push(p);updateCart();toast(p.name+" added to cart")}
function updateCart(){
 document.getElementById("cartCount").textContent=cart.length;
 document.getElementById("cartItems").innerHTML=cart.length?cart.map((p,i)=>`
 <div class="cart-item"><span>${p.icon} ${p.name}</span><b>₹${p.rent}</b><button onclick="removeCart(${i})">✕</button></div>`).join(""):"<p>Your cart is empty.</p>";
 document.getElementById("cartTotal").textContent="₹"+cart.reduce((a,p)=>a+p.rent,0);
}
function removeCart(i){cart.splice(i,1);updateCart()}
function openCart(){document.getElementById("cartDrawer").classList.add("open");document.getElementById("overlay").classList.add("show")}
function closeCart(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("overlay").classList.remove("show")}
function openModal(id){document.getElementById(id).classList.add("show")}
function closeModal(id){document.getElementById(id).classList.remove("show")}
function openLogin(){openModal("loginModal")}
function login(){
 const name=document.getElementById("userName").value.trim(),email=document.getElementById("userEmail").value.trim(),city=document.getElementById("userCity").value.trim();
 if(!name||!email||!city){toast("Please fill all fields");return}
 currentUser={name,email,city};localStorage.setItem("rentEaseUser",JSON.stringify(currentUser));closeModal("loginModal");toast("Welcome, "+name+"!");renderRentals();
}
function startCheckout(){
 if(!cart.length){toast("Add an item first");return}
 if(!currentUser){closeCart();openLogin();toast("Login before booking");return}
 closeCart();
 document.getElementById("checkoutSummary").innerHTML=`<p><b>${cart.map(p=>p.name).join(", ")}</b></p><p>Monthly rent: <b>₹${cart.reduce((a,p)=>a+p.rent,0)}</b></p><p>Security deposit: <b>₹${cart.reduce((a,p)=>a+p.deposit,0)}</b></p>`;
 updateCheckout();openModal("checkoutModal");
}
function updateCheckout(){
 const months=Number(document.getElementById("duration").value);
 const rent=cart.reduce((a,p)=>a+p.rent,0);
 document.getElementById("checkoutSummary").innerHTML=`<p><b>${cart.map(p=>p.name).join(", ")}</b></p><p>${months} month plan · Monthly rent ₹${rent} · Estimated rental cost ₹${rent*months}</p><p>Security deposit: ₹${cart.reduce((a,p)=>a+p.deposit,0)}</p>`;
}
function confirmBooking(){
 const address=document.getElementById("address").value.trim(),date=document.getElementById("deliveryDate").value,months=Number(document.getElementById("duration").value);
 if(!address||!date){toast("Enter address and delivery date");return}
 const rental={id:Date.now(),user:currentUser.name,items:[...cart],months,address,date,status:"Active"};
 rentals.push(rental);localStorage.setItem("rentEaseRentals",JSON.stringify(rentals));cart=[];updateCart();closeModal("checkoutModal");renderRentals();loadAdmin();toast("Booking confirmed successfully!");
}
function renderRentals(){
 const box=document.getElementById("rentalsBox");
 if(!rentals.length){box.className="empty-box";box.textContent="Login and book an item to see your active rentals here.";return}
 box.className="";
 box.innerHTML=rentals.map(r=>`<div class="rental-card"><div><h3>${r.items.map(x=>x.name).join(", ")}</h3><p>${r.months} months · Delivery: ${r.date}</p><p>${r.address}</p></div><span class="status">${r.status}</span></div>`).join("");
}
function submitSupport(e){
 e.preventDefault();
 const item=document.getElementById("supportItem").value,issue=document.getElementById("supportIssue").value,note=document.getElementById("supportNote").value;
 supportRequests.push({item,issue,note,status:"Pending"});localStorage.setItem("rentEaseSupport",JSON.stringify(supportRequests));e.target.reset();loadAdmin();toast("Maintenance request submitted");
}
function loadAdmin(){
 document.getElementById("adminRentals").textContent=rentals.length;
 document.getElementById("adminSupport").textContent=supportRequests.filter(x=>x.status==="Pending").length;
 const mrr=rentals.reduce((sum,r)=>sum+r.items.reduce((a,p)=>a+p.rent,0),0);
 document.getElementById("adminMRR").textContent="₹"+mrr;
 document.getElementById("adminTable").innerHTML=products.map(p=>`<tr><td>${p.icon} ${p.name}</td><td>${p.cat}</td><td>₹${p.rent}</td><td>₹${p.deposit}</td><td>${p.stock} units</td></tr>`).join("");
}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}
const savedUser=localStorage.getItem("rentEaseUser");if(savedUser)currentUser=JSON.parse(savedUser);
renderProducts();updateCart();renderRentals();loadAdmin();
