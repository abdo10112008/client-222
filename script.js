import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6nMtShH8czQRbsf5MZNUKwmNPMbERPwo",
  authDomain: "client-keep.firebaseapp.com",
  projectId: "client-keep",
  storageBucket: "client-keep.firebasestorage.app",
  messagingSenderId: "306548341972",
  appId: "1:306548341972:web:e9bd90a187ee849acacf41",
  measurementId: "G-LMLCJ18408"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let clients = [];

async function loadClients(){

    clients = [];

    const querySnapshot = await getDocs(collection(db,"clients"));

    querySnapshot.forEach((docItem)=>{
        clients.push({id:docItem.id,...docItem.data()});
    });

    renderClients();
}

function renderClients(){

    document.getElementById("col1").innerHTML = "<h2>📞 لسه مكلمناه</h2>";
    document.getElementById("col2").innerHTML = "<h2>📋 في مرحلة التفاصيل</h2>";
    document.getElementById("col3").innerHTML = "<h2>🚀 تم تحديد موعد تنفيذ</h2>";

    for(let stage=1; stage<=3; stage++){

        let columnClients = clients
            .map((client,index)=>({...client,index}))
            .filter(client=>client.stage === stage)
            .sort((a,b)=>{

                let now = Date.now();

                let aAlert = (now - a.lastCall) >= 3*24*60*60*1000;
                let bAlert = (now - b.lastCall) >= 3*24*60*60*1000;

                if(aAlert && !bAlert) return -1;
                if(!aAlert && bAlert) return 1;

                return a.lastCall - b.lastCall;
            });

        columnClients.forEach(client=>{
            createCard(client, client.index);
        });
    }
}

window.addClient = async function(e){
    e.preventDefault();

    let name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;
    let dateInput = document.getElementById("clientDate").value;

    let createdTime = new Date(dateInput).getTime();

    await addDoc(collection(db,"clients"),{
        name:name,
        phone:phone,
        date:dateInput,
        created:createdTime,
        lastCall:createdTime,
        stage:1
    });

    loadClients();
    document.querySelector("form").reset();
}

function createCard(client,index){

    let column = document.getElementById("col"+client.stage);

    let card = document.createElement("div");
    card.className="card";

    let now = Date.now();
    let alertActive = (now - client.lastCall) >= 3*24*60*60*1000;

    card.innerHTML = `
    <div class="card-header">${client.name}</div>
    📞 ${client.phone}<br>
    📅 ${client.date}
    <div class="time">
        ⏳ من أول تاريخ: <span id="created-${index}"></span><br>
        🔄 من آخر تواصل: <span id="last-${index}"></span>
    </div>
    <div class="alert" id="alert-${index}" style="display:${alertActive?'block':'none'};">
        ⚠️ عدى 3 أيام لازم نكلم العميل
    </div>

    <div class="buttons">
        <a href="tel:${client.phone}"><button class="call">اتصال</button></a>
        <a target="_blank" href="https://wa.me/${client.phone}">
            <button class="whatsapp">واتساب</button>
        </a>
        <button class="done" onclick="markDone(${index})">تم التواصل</button>
        <button class="prev" onclick="moveBack(${index})">رجوع</button>
        <button class="next" onclick="moveNext(${index})">التالي</button>
        <button class="delete" onclick="removeClient(${index})">تم التنفيذ</button>
    </div>
    `;

    column.appendChild(card);
}

window.moveNext = async function(index){

    let client = clients[index];

    if(client.stage < 3){

        await updateDoc(doc(db,"clients",client.id),{
            stage: client.stage + 1
        });

        loadClients();
    }
}

window.moveBack = async function(index){

    let client = clients[index];

    if(client.stage > 1){

        await updateDoc(doc(db,"clients",client.id),{
            stage: client.stage - 1
        });

        loadClients();
    }
}

window.removeClient = async function(index){

    let client = clients[index];

    await deleteDoc(doc(db,"clients",client.id));

    loadClients();
}

window.markDone = async function(index){

    let client = clients[index];

    await updateDoc(doc(db,"clients",client.id),{
        lastCall: Date.now()
    });

    loadClients();
}

function formatTime(ms){
    let days = Math.floor(ms/(1000*60*60*24));
    let hours = Math.floor((ms/(1000*60*60))%24);
    return days+" يوم "+hours+" ساعة";
}

setInterval(()=>{

    clients.forEach((client,index)=>{

        let created = Date.now()-client.created;
        let lastCall = Date.now()-client.lastCall;

        let createdEl = document.getElementById("created-"+index);
        let lastEl = document.getElementById("last-"+index);
        let alertEl = document.getElementById("alert-"+index);

        if(createdEl) createdEl.innerText = formatTime(created);
        if(lastEl) lastEl.innerText = formatTime(lastCall);

        if(alertEl){

            if(lastCall >= 3*24*60*60*1000){
                alertEl.style.display="block";
            }else{
                alertEl.style.display="none";
            }

        }

    });

  window.searchClient = function(){

let searchValue = document.getElementById("search").value.toLowerCase();

let cards = document.querySelectorAll(".card");

cards.forEach(card=>{

let text = card.innerText.toLowerCase();

if(text.includes(searchValue)){
card.style.display="block";
}else{
card.style.display="none";
}

});

}

},1000);

setInterval(loadClients,2000);
