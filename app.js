// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// GARANTIR QUE TUDO EXISTE
window.onload = function(){

  carregarChecklist();

  // NAV ATIVO
  document.querySelectorAll("nav button")[0].classList.add("active");

  // DARK MODE
  const sw = document.getElementById("darkSwitch");

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
    if(sw) sw.checked = true;
  }

  if(sw){
    sw.addEventListener("change", function(){
      document.body.classList.toggle("dark", this.checked);
      localStorage.setItem("modo", this.checked ? "dark":"light");
    });
  }

};


// NAV
window.mudarPagina = function(p, btn){

  ["impressoras","computadores","config"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });

  document.getElementById(p).style.display="block";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  if(btn) btn.classList.add("active");
};


// TONER
window.disponivel = async function(){

  let eq = document.getElementById("equipamento").value;
  let loc = document.getElementById("localizacao").value;
  let cor = document.getElementById("cor").value;
  let data = document.getElementById("data").value;

  if(!eq || !loc || !cor){
    alert("Preenche tudo!");
    return;
  }

  await db.collection("stock").add({
    equipamento:eq,
    localizacao:loc,
    cor:cor,
    data:data || new Date().toISOString().split("T")[0]
  });
};


// STOCK
db.collection("stock").onSnapshot(snap=>{

  let lista = document.getElementById("listaStock");
  let select = document.getElementById("selectStock");

  if(!lista || !select) return;

  lista.innerHTML="";
  select.innerHTML="<option value=''>Selecionar toner</option>";

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
      </div>
    `;

    select.innerHTML+=`
      <option value="${doc.id}">
        ${t.equipamento} - ${t.cor}
      </option>
    `;
  });

});


// USAR
window.usarSelecionado = async function(){

  let id = document.getElementById("selectStock").value;

  if(!id){
    alert("Seleciona um toner");
    return;
  }

  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  if(!snap.exists){
    alert("Erro no toner");
    return;
  }

  await db.collection("historico").add(snap.data());
  await ref.delete();
};


// HISTÓRICO
db.collection("historico").onSnapshot(snap=>{

  let lista = document.getElementById("listaHistorico");
  if(!lista) return;

  lista.innerHTML="";

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
        <button class="delete" onclick="apagarHistorico('${doc.id}')">❌</button>
      </div>
    `;
  });

});


window.apagarHistorico = async function(id){
  await db.collection("historico").doc(id).delete();
};


// COMPUTADORES
const passos = [
"TEAMVIEWER HOST","TEAMS",
"DNS","Sistema",
"Dominio","MCFee",
"Sophos","Office",
"Impressora","Energia",
"Apagar User","Criar User"
];

function carregarChecklist(){

  let el = document.getElementById("checklist");
  if(!el) return;

  let html="";

  passos.forEach((p,i)=>{
    html+=`
      <div class="card">
        <input type="checkbox" id="p${i}"> ${p}
      </div>
    `;
  });

  el.innerHTML = html;
}


// GUARDAR PC
window.guardarPC = async function(){

  let nome = document.getElementById("nomePC").value;

  if(!nome){
    alert("Nome obrigatório");
    return;
  }

  let dados=[];

  passos.forEach((p,i)=>{
    dados.push({
      passo:p,
      feito:document.getElementById("p"+i).checked
    });
  });

  await db.collection("pcs").add({
    nome:nome,
    passos:dados
  });

  alert("Guardado!");
};


// HISTÓRICO PCs
db.collection("pcs").onSnapshot(snap=>{

  let lista = document.getElementById("listaPC");
  if(!lista) return;

  lista.innerHTML="";

  snap.forEach(doc=>{
    let d = doc.data();

    let html="";
    d.passos.forEach(p=>{
      html+=`<div>${p.feito ? "✔":"❌"} ${p.passo}</div>`;
    });

    lista.innerHTML+=`
      <div class="card">
        <b>${d.nome}</b><br>
        ${html}
        <button class="delete" onclick="apagarPC('${doc.id}')">❌</button>
      </div>
    `;
  });

});

window.apagarPC = async function(id){
  await db.collection("pcs").doc(id).delete();
};