const passos=[
"TEAMVIEWER HOST","TEAMS","DNS",
"NOME DO SISTEMA","Atribuir Dominio",
"Desinstalar MCFee","Instalar Sophos",
"MICROSOFT 365","Instalar Impressora",
"Alterar Energia","Apagar User","Criar novo user"
];

function carregarChecklist(){
  let el=document.getElementById("checklist");

  let html="";
  passos.forEach((p,i)=>{
    html+=`
      <label class="checkItem">
        <input type="checkbox" id="p${i}">
        <span>${p}</span>
      </label>
    `;
  });

  el.innerHTML=html;
}


// GUARDAR PC COM DATA
async function guardarPC(){

  let nome=document.getElementById("nomePC").value;
  let data=document.getElementById("dataPC").value;

  if(!nome){ alert("Nome obrigatório"); return; }

  if(!data) data="Sem Data";

  let dados=[];

  passos.forEach((p,i)=>{
    dados.push({
      passo:p,
      feito:document.getElementById("p"+i).checked
    });
  });

  await db.collection("pcs").add({
    nome:nome,
    data:data,
    passos:dados
  });

  document.getElementById("nomePC").value="";
  document.getElementById("dataPC").value="";
  carregarChecklist();
}


// HISTÓRICO PCs COM BOTÃO APAGAR
db.collection("pcs").onSnapshot(snap=>{
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
        <b>${d.nome}</b><br>
        📅 ${d.data}<br>
        ${html}
        <button class="delete" onclick="apagarPC('${doc.id}')">❌</button>
      </div>
    `;
  });
});


// APAGAR REGISTO PC
async function apagarPC(id){
  if(!confirm("Apagar registo?")) return;
  await db.collection("pcs").doc(id).delete();
}


// carregar checklist ao abrir
window.onload=()=>{
  carregarChecklist();
};