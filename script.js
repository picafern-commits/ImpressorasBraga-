import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// LOGIN
window.registarUser = async ()=>{
  await createUserWithEmailAndPassword(auth, email.value, password.value);
};

window.loginUser = async ()=>{
  await signInWithEmailAndPassword(auth, email.value, password.value);
};

onAuthStateChanged(auth, user=>{
  if(user){
    loginBox.style.display="none";
    app.style.display="block";
    mostrarStock();
    mostrarHistorico();
    atualizarDashboard();
  } else {
    loginBox.style.display="block";
    app.style.display="none";
  }
});

// DARK
window.toggleDark = ()=>document.body.classList.toggle("dark");

// PAGINAS
window.mudarPagina = (p)=>{
  ["dashboard","registo","stock","manutencao","historico"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });
  document.getElementById(p).style.display="block";
};

// ID
async function gerarID(){
  const q = query(collection(db,"stock"), orderBy("id","desc"), limit(1));
  const snap = await getDocs(q);
  let n=1;
  if(!snap.empty){
    n=parseInt(snap.docs[0].data().id.replace("TN",""))+1;
  }
  return "TN"+String(n).padStart(3,"0");
}

// REGISTAR
window.registarToner = async ()=>{
  let id = await gerarID();

  await addDoc(collection(db,"stock"),{
    id,
    equipamento:equipamento.value,
    localizacao:localizacao.value,
    cor:cor.value,
    user:auth.currentUser.email
  });

  alert("Guardado "+id);
  mostrarStock();
};

// STOCK
async function mostrarStock(){
  listaStock.innerHTML="";
  const snap = await getDocs(collection(db,"stock"));

  snap.forEach(d=>{
    let t=d.data();

    listaStock.innerHTML+=`
      <div class="card">
        <b>${t.id}</b><br>
        ${t.equipamento}<br>
        ${t.cor}<br>
        ${t.localizacao}
        <button onclick="remover('${d.id}')">X</button>
      </div>
    `;
  });

  if(snap.size<=3) alert("Stock baixo!");
}

// REMOVER
window.remover = async(id)=>{
  await deleteDoc(doc(db,"stock",id));
  mostrarStock();
};

// PESQUISA
window.filtrarStock = ()=>{
  let f=pesquisa.value.toLowerCase();
  Array.from(listaStock.children).forEach(el=>{
    el.style.display = el.innerText.toLowerCase().includes(f)?"block":"none";
  });
};

// MANUTENÇÃO
window.guardarManutencao = async ()=>{
  await addDoc(collection(db,"manutencoes"),{
    equipamento:equipamentoM.value,
    localizacao:localizacaoM.value,
    descricao:descricaoM.value,
    data:dataM.value,
    user:auth.currentUser.email
  });

  mostrarHistorico();
};

// HISTÓRICO
async function mostrarHistorico(){
  tabelaManutencao.innerHTML="";
  const snap = await getDocs(collection(db,"manutencoes"));

  snap.forEach(d=>{
    let m=d.data();
    tabelaManutencao.innerHTML+=`
      <tr>
        <td>${m.equipamento}</td>
        <td>${m.localizacao}</td>
        <td>${m.descricao}</td>
        <td>${m.data}</td>
      </tr>
    `;
  });
}

// DASHBOARD
async function atualizarDashboard(){
  const s = await getDocs(collection(db,"stock"));
  const m = await getDocs(collection(db,"manutencoes"));

  totalStock.innerText=s.size;
  totalMan.innerText=m.size;

  let pretos=0;
  s.forEach(d=>{ if(d.data().cor==="Preto") pretos++; });
  pretosEl.innerText=pretos;
}

// EXPORT
window.exportarStock = async ()=>{
  const snap = await getDocs(collection(db,"stock"));
  let dados=[];
  snap.forEach(d=>dados.push(d.data()));
  let ws=XLSX.utils.json_to_sheet(dados);
  let wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Stock");
  XLSX.writeFile(wb,"stock.xlsx");
};

window.exportarManutencoes = async ()=>{
  const snap = await getDocs(collection(db,"manutencoes"));
  let dados=[];
  snap.forEach(d=>dados.push(d.data()));
  let ws=XLSX.utils.json_to_sheet(dados);
  let wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Man");
  XLSX.writeFile(wb,"manutencoes.xlsx");
};
