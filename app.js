// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// NAV
function mudarPagina(p, btn){

  ["registo","stock","historico","settings"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });

  document.getElementById(p).style.display="block";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });

  if(btn) btn.classList.add("active");
}
window.mudarPagina = mudarPagina;


// DARK
function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("modo", document.body.classList.contains("dark")?"dark":"light");
}
window.toggleDark = toggleDark;


// START
window.onload = ()=>{

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
  }

  document.getElementById("registo").style.display="block";

  mostrarStock();
  mostrarHistorico();
};


// REGISTO
async function disponivel(){

  let eq = equipamento.value;
  let loc = localizacao.value;
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

  alert("Guardado!");
}
window.disponivel = disponivel;


// STOCK (TEMPO REAL)
function mostrarStock(){

  const lista = document.getElementById("listaStock");

  db.collection("stock").onSnapshot(snapshot=>{

    lista.innerHTML="";

    snapshot.forEach(doc=>{
      let t = doc.data();

      lista.innerHTML+=`
        <div class="card">
          ${t.equipamento} - ${t.cor}
          <small>📍 ${t.localizacao}</small>
          <small>📅 ${t.data}</small>

          <input type="
