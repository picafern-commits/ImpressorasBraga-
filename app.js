// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let todosStock=[];


// NAV
window.mudarPagina = function(p){
  document.getElementById("impressoras").style.display="none";
  document.getElementById("config").style.display="none";
  document.getElementById(p).style.display="block";
};


// BOTÃO HOJE
window.hoje = function(){
  document.getElementById("data").value = new Date().toISOString().split("T")[0];
};


// DISPONIVEL
window.disponivel = async function(){

  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = cor.value;
  let data = document.getElementById("data").value;

  if(!loc) loc="Sem Localização";
  if(!data) data="Não tem Data";

  if(!eq || !cor){
    alert("Preenche equipamento e cor");
    return;
  }

  localStorage.setItem("ultimaLoc", loc);

  await db.collection("stock").add({equipamento:eq,localizacao:loc,cor,data});
};


// STOCK
db.collection("stock").onSnapshot(snap=>{
  todosStock=[];
  let filtroSet=new Set();

  snap.forEach(doc=>{
    let t=doc.data();
    t.id=doc.id;
    todosStock.push(t);
    filtroSet.add(t.localizacao);
  });

  atualizarFiltro([...filtroSet]);
  mostrarStock(todosStock);
});


// FILTRO
function atualizarFiltro(lista){
  let f=document.getElementById("filtro");
  f.innerHTML="<option value=''>Todas</option>";
  lista.forEach(l=>{
    f.innerHTML+=`<option>${l}</option>`;
  });
}

window.filtrar = function(){
  let val=document.getElementById("filtro").value;

  if(!val){
    mostrarStock(todosStock);
  }else{
    mostrarStock(todosStock.filter(t=>t.localizacao===val));
  }
};


// MOSTRAR STOCK
function mostrarStock(lista){
  let div=document.getElementById("listaStock");
  div.innerHTML="";

  lista.forEach(t=>{
    div.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
      </div>
    `;
  });
}


// HISTÓRICO
db.collection("historico").onSnapshot(snap=>{
  let div=document.getElementById("listaHistorico");
  div.innerHTML="";

  snap.forEach(doc=>{
    let t=doc.data();

    div.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}
        <button class="delete" onclick="apagar('${doc.id}')">❌</button>
      </div>
    `;
  });
});

window.apagar = async function(id){
  await db.collection("historico").doc(id).delete();
};


// DARK MODE + LOCALIZAÇÃO AUTOMÁTICA
window.onload = ()=>{

  // DARK
  let sw=document.getElementById("darkSwitch");

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
    sw.checked=true;
  }

  sw.addEventListener("change",function(){
    document.body.classList.toggle("dark",this.checked);
    localStorage.setItem("modo",this.checked?"dark":"light");
  });

  // LOCALIZAÇÃO AUTOMÁTICA
  let ultima=localStorage.getItem("ultimaLoc");
  if(ultima){
    document.getElementById("localizacao").value=ultima;
  }

};