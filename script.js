import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ USA O TEU CONFIG COMPLETO
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  databaseURL: "https://toner-manager-756c4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "toner-manager-756c4",
  storageBucket: "toner-manager-756c4.firebasestorage.app",
  messagingSenderId: "1004492465437",
  appId: "1:1004492465437:web:6a745933c51fc17b04adf4"}; Initialize Firebaseconst app = initializeApp(firebaseConfig
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ------------------
// INIT
// ------------------
window.onload = () => {
  mostrarStock();
  mostrarHistorico();
};

// ------------------
// REGISTAR TONER
// ------------------
window.registarToner = async () => {

  const eq = document.getElementById("equipamento").value;
  const loc = document.getElementById("localizacao").value;
  const cor = document.getElementById("cor").value;

  try{
    await addDoc(collection(db,"stock"),{
      equipamento:eq,
      localizacao:loc,
      cor:cor
    });

    alert("Guardado!");
    mostrarStock();

  }catch(e){
    console.error(e);
    alert("Erro Firebase");
  }
};

// ------------------
// STOCK
// ------------------
async function mostrarStock(){
  const lista = document.getElementById("listaStock");
  if(!lista) return;

  lista.innerHTML="";

  const snap = await getDocs(collection(db,"stock"));

  snap.forEach(d=>{
    const t = d.data();

    lista.innerHTML += `
      <div class="card">
        ${t.equipamento}<br>
        ${t.localizacao}<br>
        ${t.cor}<br><br>

        <button onclick="remover('${d.id}')">Remover</button>
      </div>
    `;
  });
}

window.remover = async(id)=>{
  await deleteDoc(doc(db,"stock",id));
  mostrarStock();
};

// ------------------
// MANUTENÇÃO
// ------------------
window.guardarManutencao = async ()=>{

  const eq = document.getElementById("equipamentoM").value;
  const loc = document.getElementById("localizacaoM").value;
  const desc = document.getElementById("descricaoM").value;

  await addDoc(collection(db,"manutencoes"),{
    equipamento:eq,
    localizacao:loc,
    descricao:desc,
    concluido:false
  });

  alert("Manutenção criada!");
  mostrarHistorico();
};

// ------------------
// PENDENTES
// ------------------
async function mostrarHistorico(){

  const tabela = document.getElementById("tabelaManutencao");
  if(!tabela) return;

  tabela.innerHTML="";

  const snap = await getDocs(collection(db,"manutencoes"));

  snap.forEach(d=>{
    const m = d.data();

    if(m.concluido) return;

    tabela.innerHTML += `
      <tr>
        <td>${m.equipamento}</td>
        <td>${m.localizacao}</td>
        <td>${m.descricao}</td>
        <td>-</td>
        <td>
          <input type="checkbox" onchange="concluir('${d.id}')">
        </td>
      </tr>
    `;
  });
}

// ------------------
// CONCLUIR
// ------------------
window.concluir = async(id)=>{

  const data = new Date().toISOString().split("T")[0];

  await updateDoc(doc(db,"manutencoes",id),{
    concluido:true,
    data
  });

  mostrarHistorico();
};
