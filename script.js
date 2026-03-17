import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 USA OS TEUS DADOS VERDADEIROS
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4",
  storageBucket: "toner-manager-756c4.firebasestorage.app",
  messagingSenderId: "1004492465437",
  appId: "1:1004492465437:web:6a745933c51fc17b04adf4"}; Initialize Firebaseconst app = initializeApp(firebaseConfig
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DARK MODE
window.toggleDark = ()=>{
  document.body.classList.toggle("dark");
};

// PAGINAS
window.mudarPagina = (p)=>{
  ["registo","stock"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });
  document.getElementById(p).style.display="block";
};

// INIT
window.onload = ()=>{
  mostrarStock();
};

// REGISTAR
window.registarToner = async ()=>{

  const eq = document.getElementById("equipamento").value;
  const loc = document.getElementById("localizacao").value;
  const cor = document.getElementById("cor").value;

  try{
    await addDoc(collection(db,"stock"),{
      equipamento:eq,
      localizacao:loc,
      cor:cor
    });

    alert("Guardado com sucesso!");
    mostrarStock();

  }catch(e){
    console.error(e);
    alert("Erro ao guardar!");
  }
};

// MOSTRAR STOCK
async function mostrarStock(){

  const lista = document.getElementById("listaStock");
  if(!lista) return;

  lista.innerHTML="";

  const snap = await getDocs(collection(db,"stock"));

  snap.forEach(docSnap=>{
    const t = docSnap.data();

    lista.innerHTML+=`
      <div class="card">
        ${t.equipamento}<br>
        ${t.cor}<br>
        ${t.localizacao}<br><br>

        <button onclick="remover('${docSnap.id}')">Remover</button>
        <button onclick="disponivel()">Disponível</button>
      </div>
    `;
  });
}

// REMOVER
window.remover = async(id)=>{
  await deleteDoc(doc(db,"stock",id));
  mostrarStock();
};

// DISPONIVEL (FIX)
window.disponivel = async ()=>{

  try{
    await addDoc(collection(db,"historico"),{
      acao:"Disponivel",
      data:new Date().toISOString()
    });

    alert("Marcado como disponível");

  }catch(e){
    console.error(e);
    alert("Erro ao guardar histórico");
  }
};

// PESQUISA
window.filtrarStock = ()=>{
  const filtro = document.getElementById("pesquisa").value.toLowerCase();
  const items = document.getElementById("listaStock").children;

  Array.from(items).forEach(el=>{
    el.style.display = el.innerText.toLowerCase().includes(filtro) ? "block":"none";
  });
};
