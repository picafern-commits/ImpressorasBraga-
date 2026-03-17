// 🔥 FIREBASE (COLOCA OS TEUS DADOS)
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// NAV
function mudarPagina(p){
document.querySelectorAll(".card").forEach(el=>el.style.display="none");
document.getElementById(p).style.display="block";
}

// GERAR ID
async function gerarID(){
let snap = await db.collection("toners").get();
return "TN" + String(snap.size+1).padStart(3,"0");
}

// REGISTO TONER
async function registar(){
let eq = equipamento.value;
let loc = localizacao.value;
let cor = document.getElementById("cor").value;

let id = await gerarID();

await db.collection("toners").add({id,eq,loc,cor});

alert("✅ Toner registado!");
carregarStock();
}

// STOCK
function carregarStock(){
let lista = document.getElementById("listaStock");

db.collection("toners").get().then(snap=>{
lista.innerHTML="";
snap.forEach(doc=>{
let d = doc.data();
lista.innerHTML += `<div>${d.id} - ${d.eq} - ${d.cor} - ${d.loc}</div>`;
});
});
}
carregarStock();

// PESQUISA
function filtrar(){
let f = document.getElementById("pesquisa").value.toLowerCase();
Array.from(listaStock.children).forEach(el=>{
el.style.display = el.innerText.toLowerCase().includes(f) ? "block" : "none";
});
}

// MANUTENÇÃO
function guardarManutencao(){
let eq = equipamentoM.value;
let loc = localizacaoM.value;
let desc = descricao.value;
let data = document.getElementById("data").value;

db.collection("manutencao").add({eq,loc,desc,data});

alert("✅ Guardado!");
carregarHistorico();
}

// HISTÓRICO
function carregarHistorico(){
let t = document.getElementById("tabela");

db.collection("manutencao").get().then(snap=>{
t.innerHTML="";
snap.forEach(doc=>{
let d = doc.data();
t.innerHTML += `<tr><td>${d.eq}</td><td>${d.loc}</td><td>${d.desc}</td><td>${d.data}</td></tr>`;
});
});
}
carregarHistorico();

// SCANNER
function abrirScanner(){
alert("Scanner pronto 📷 (ativa depois se quiseres)");
}
