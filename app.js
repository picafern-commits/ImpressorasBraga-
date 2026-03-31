// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// 🔥 GARANTE QUE OS BOTÕES FUNCIONAM
window.mudarPagina = function(p){

  document.getElementById("impressoras").style.display="none";
  document.getElementById("config").style.display="none";

  document.getElementById(p).style.display="block";
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
    data:data
  });

  alert("Guardado!");
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
      </div>
    `;
  });
});


// HISTÓRICO
db.collection("historico").onSnapshot(snap=>{
  let lista = document.getElementById("listaHistorico");
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t = doc.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento} - ${t.cor}
        <button class="delete" onclick="apagarHistorico('${doc.id}')">❌</button>
      </div>
    `;
  });
});


// APAGAR
window.apagarHistorico = async function(id){
  await db.collection("historico").doc(id).delete();
};


// DARK MODE
window.onload = function(){

  let sw = document.getElementById("darkSwitch");

  sw.addEventListener("change", function(){
    document.body.classList.toggle("dark", this.checked);
  });

};