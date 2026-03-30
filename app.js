// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// NAV
window.mudarPagina = function(p, btn){

  ["impressoras","computadores","config"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });

  document.getElementById(p).style.display="block";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  btn.classList.add("active");
};


// TONERS
window.disponivel = async function(){

  let eq = equipamento.value;
  let loc = localizacao.value;
  let cor = cor.value;
  let data = data.value;

  if(!eq || !loc || !cor){
    alert("Preenche tudo!");
    return;
  }

  await db.collection("stock").add({equipamento:eq,localizacao:loc,cor,data});
};


// STOCK
db.collection("stock").onSnapshot(snap=>{
  let lista = document.getElementById("listaStock");
  let select = document.getElementById("selectStock");

  lista.innerHTML="";
  select.innerHTML="<option value=''>Selecionar</option>";

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
  if(!id) return alert("Seleciona um toner");

  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add(snap.data());
  await ref.delete();
};


// HISTÓRICO + DELETE
db.collection("historico").onSnapshot(snap=>{
  let lista = document.getElementById("listaHistorico");
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
const passos = ["TEAMVIEWER","TEAMS","DNS","Sistema","Dominio"];

function carregarChecklist(){
  let html="";
  passos.forEach((p,i)=>{
    html+=`<div><input type="checkbox" id="p${i}"> ${p}</div>`;
  });
  document.getElementById("checklist").innerHTML=html;
}

window.guardarPC = async function(){

  let nome = nomePC.value;
  if(!nome) return alert("Nome obrigatório");

  let dados=[];
  passos.forEach((p,i)=>{
    dados.push({passo:p,feito:document.getElementById("p"+i).checked});
  });

  await db.collection("pcs").add({nome,passos:dados});
};


// HISTÓRICO PC
db.collection("pcs").onSnapshot(snap=>{
  let lista=document.getElementById("listaPC");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let d=doc.data();

    let html="";
    d.passos.forEach(p=>{
      html+=`<div>${p.feito?"✔":"❌"} ${p.passo}</div>`;
    });

    lista.innerHTML+=`<div class="card">${d.nome}<br>${html}</div>`;
  });
});


// DARK MODE
window.onload = ()=>{

  let sw = document.getElementById("darkSwitch");

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
    sw.checked=true;
  }

  sw.addEventListener("change", function(){
    document.body.classList.toggle("dark", this.checked);
    localStorage.setItem("modo", this.checked?"dark":"light");
  });

  carregarChecklist();
};
