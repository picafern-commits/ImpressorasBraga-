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

  ["impressoras","instalacao","config"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });

  document.getElementById(p).style.display="block";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  if(btn) btn.classList.add("active");
};


// DARK MODE PRO
function aplicarDark(estado){
  if(estado){
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}


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
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}<br>
        ${t.data}
        <input type="checkbox" onchange="usar('${doc.id}')">
        <button onclick="apagarStock('${doc.id}')">❌</button>
      </div>
    `;
  });
});


// USAR
window.usar = async function(id){
  let ref = db.collection("stock").doc(id);
  let snap = await ref.get();

  await db.collection("historico").add(snap.data());
  await ref.delete();
};


// APAGAR
window.apagarStock = async id=>{
  await db.collection("stock").doc(id).delete();
};


// HISTÓRICO
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
        <button onclick="apagarHistorico('${doc.id}')">❌</button>
      </div>
    `;
  });
});

window.apagarHistorico = async id=>{
  await db.collection("historico").doc(id).delete();
};


// INSTALAÇÃO
const passos = ["TEAMVIEWER HOST","TEAMS","DNS","Sistema","Domínio","MCFee","Sophos","Office","Impressora","Energia","Apagar User","Criar User"];

function carregarChecklist(){
  let html="";
  passos.forEach((p,i)=>{
    html+=`<div><input type="checkbox" id="p${i}"> ${p}</div>`;
  });
  document.getElementById("checklist").innerHTML=html;
}


// GUARDAR PC
window.guardarInstalacao = async function(){

  let nome = nomePC.value;
  if(!nome){
    alert("Nome obrigatório");
    return;
  }

  let dados=[];
  passos.forEach((p,i)=>{
    dados.push({passo:p,feito:document.getElementById("p"+i).checked});
  });

  await db.collection("instalacoes").add({
    nome,
    passos:dados,
    data:new Date().toLocaleDateString()
  });
};


// HISTÓRICO PC
db.collection("instalacoes").onSnapshot(snap=>{
  let lista=document.getElementById("listaPC");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let d=doc.data();

    let html="";
    d.passos.forEach(p=>{
      html+=`<div>${p.feito?"✔":"❌"} ${p.passo}</div>`;
    });

    lista.innerHTML+=`
      <div class="card">
        <b>${d.nome}</b><br>${html}
        <button onclick="apagarPC('${doc.id}')">❌</button>
      </div>
    `;
  });
});

window.apagarPC = async id=>{
  await db.collection("instalacoes").doc(id).delete();
};


// START
window.onload = ()=>{

  // DARK AUTO
  let sistemaDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let modo = localStorage.getItem("modo");

  let ativo = modo ? modo==="dark" : sistemaDark;

  aplicarDark(ativo);
  document.getElementById("darkSwitch").checked = ativo;

  document.getElementById("darkSwitch").addEventListener("change", function(){
    if(this.checked){
      aplicarDark(true);
      localStorage.setItem("modo","dark");
    } else {
      aplicarDark(false);
      localStorage.setItem("modo","light");
    }
  });

  carregarChecklist();
  document.querySelector("nav button").classList.add("active");
};
