// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let stockGlobal = [];


// NAV
window.mudarPagina = function(p){
  ["impressoras","computadores","config"].forEach(id=>{
    let el = document.getElementById(id);
    if(el) el.style.display="none";
  });
  document.getElementById(p).style.display="block";
};


// GERAR ID
async function gerarID(){
  const ref = db.collection("config").doc("contador");

  return db.runTransaction(async (t)=>{
    const doc = await t.get(ref);

    let numero = doc.exists ? doc.data().valor + 1 : 1;
    t.set(ref,{valor:numero});

    return "TON-" + String(numero).padStart(4,"0");
  });
}


// ADICIONAR
window.disponivel = async function(){

  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = document.getElementById("cor").value;
  let data = document.getElementById("data").value;

  if(!loc) loc="Sem Localização";
  if(!data) data="Não tem Data";

  if(!eq || !cor){
    alert("Preenche tudo");
    return;
  }

  let id = await gerarID();

  await db.collection("stock").add({
    idInterno:id,
    equipamento:eq,
    localizacao:loc,
    cor:cor,
    data:data,
    created:new Date()
  });

};


// STOCK
db.collection("stock").orderBy("created","desc").onSnapshot(snap=>{

  stockGlobal = [];

  document.getElementById("countStock").innerText = snap.size;

  if(snap.size < 5){
    document.getElementById("countStock").style.color="red";
  } else {
    document.getElementById("countStock").style.color="black";
  }

  snap.forEach(doc=>{
    let t = doc.data();
    t.idDoc = doc.id;
    stockGlobal.push(t);
  });

  renderStock(stockGlobal);
});


// HISTÓRICO
db.collection("historico").onSnapshot(snap=>{

  document.getElementById("countUsados").innerText = snap.size;

  let lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t=doc.data();

    lista.innerHTML+=`
      <div class="card">
        <b>${t.idInterno}</b><br>
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
        <button class="delete" onclick="apagar('${doc.id}')">❌</button>
      </div>
    `;
  });
});


// RENDER STOCK
function renderStock(lista){
  let div=document.getElementById("listaStock");
  div.innerHTML="";

  lista.forEach(t=>{
    div.innerHTML+=`
      <div class="card">
        <input type="checkbox" onchange="usar('${t.idDoc}')">
        <b>${t.idInterno}</b><br>
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
      </div>
    `;
  });
}


// FILTRO POR LOCALIZAÇÃO
window.filtrar = function(){

  let txt = document.getElementById("search").value.toLowerCase();

  let filtrado = stockGlobal.filter(t =>
    (t.localizacao || "").toLowerCase().includes(txt)
  );

  renderStock(filtrado);
};


// USAR
window.usar = async function(id){
  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add(snap.data());
  await ref.delete();
};


// APAGAR HISTÓRICO
window.apagar = async function(id){
  await db.collection("historico").doc(id).delete();
};


// DARK MODE
window.onload=()=>{
  let sw=document.getElementById("darkSwitch");

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
    sw.checked=true;
  }

  sw.addEventListener("change",function(){
    document.body.classList.toggle("dark",this.checked);
    localStorage.setItem("modo",this.checked?"dark":"light");
  });
};