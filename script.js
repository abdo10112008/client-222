let clients = JSON.parse(localStorage.getItem("clients")) || [];

function saveData(){
    localStorage.setItem("clients", JSON.stringify(clients));
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

                // اللي عليه تنبيه يطلع فوق
                if(aAlert && !bAlert) return -1;
                if(!aAlert && bAlert) return 1;

                // بعد كده الأقدم في آخر تواصل
                return a.lastCall - b.lastCall;
            });

        columnClients.forEach(client=>{
            createCard(client, client.index);
        });
    }
}
function addClient(e){
    e.preventDefault();

    let name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;
    let dateInput = document.getElementById("clientDate").value;

    let createdTime = new Date(dateInput).getTime();

    let newClient = {
        name,
        phone,
        date: dateInput,
        created: createdTime,
        lastCall: createdTime,
        stage: 1
    };

    clients.push(newClient);
    saveData();
    renderClients();
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

function moveNext(index){
    if(clients[index].stage < 3){
        clients[index].stage++;
        saveData();
        renderClients();
    }
}

function moveBack(index){
    if(clients[index].stage > 1){
        clients[index].stage--;
        saveData();
        renderClients();
    }
}

function removeClient(index){
    clients.splice(index,1);
    saveData();
    renderClients();
}

function markDone(index){
    clients[index].lastCall = Date.now();
    saveData();
    renderClients();
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
},1000);

renderClients();