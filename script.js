import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DARK MODE
window.toggleDark = () => {
  document.body.classList.toggle("dark");
};

// PAGINAS
window.mudarPagina = (p) => {
  ["registo","stock","manutencao","historico"].forEach(x=>{
    document.getElementById(x).style.display="none";
  });
  document.getElementById(p).style.display="block";
};

// ID PROFISSIONAL
async function gerarID(){
  const q = query(collection(db,"stock"), orderBy("id","desc"), limit(1));
  const snap = await getDocs(q);

  let n = 1;
  if(!snap.empty){
    let ultimo = snap.docs[0].data().id;
    n = parseInt(ultimo.replace("TN","")) + 1;
  }

  return "TN" + String(n).padStart(3,"0");
}

// REGISTAR
window.registarToner = async () => {

  let id = await gerarID();

  await addDoc(collection(db,"stock"),{
    id,
    equipamento: equipamento.value,
    localizacao: localizacao.value,
    cor: cor.value
  });

  alert("Guardado: "+id);
  mostrarStock();
};

// STOCK
async function mostrarStock(){
  listaStock.innerHTML="";

  const snap = await getDocs(collection(db,"stock"));

  snap.forEach(d=>{
    let t = d.data();

    listaStock.innerHTML+=`
      <div class="card">
        <b>${t.id}</b><br>
        ${t.equipamento}<br>
        ${t.cor}<br>
        ${t.localizacao}<br>
        <button onclick="remover('${d.id}')">Remover</button>
      </div>
    `;
  });

  if(snap.size <= 3){
    alert("⚠️ Stock baixo!");
  }
}

window.remover = async (id)=>{
  await deleteDoc(doc(db,"stock",id));
  mostrarStock();
};

// PESQUISA
window.filtrarStock = ()=>{
  let f = pesquisa.value.toLowerCase();
  Array.from(listaStock.children).forEach(el=>{
    el.style.display = el.innerText.toLowerCase().includes(f)?"block":"none";
  });
};

// MANUTENÇÃO
window.guardarManutencao = async ()=>{
  await addDoc(collection(db,"manutencoes"),{
    equipamento: equipamentoM.value,
    localizacao: localizacaoM.value,
    descricao: descricaoM.value,
    data: dataM.value
  });

  alert("Guardado!");
  mostrarHistorico();
};

// HISTÓRICO
async function mostrarHistorico(){
  tabelaManutencao.innerHTML="";

  const snap = await getDocs(collection(db,"manutencoes"));

  snap.forEach(d=>{
    let m = d.data();

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

// EXPORTAR
window.exportarStock = async ()=>{
  const snap = await getDocs(collection(db,"stock"));
  let dados=[];

  snap.forEach(d=>dados.push(d.data()));

  let ws = XLSX.utils.json_to_sheet(dados);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Stock");

  XLSX.writeFile(wb,"stock.xlsx");
};

window.exportarManutencoes = async ()=>{
  const snap = await getDocs(collection(db,"manutencoes"));
  let dados=[];

  snap.forEach(d=>dados.push(d.data()));

  let ws = XLSX.utils.json_to_sheet(dados);
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Manutencoes");

  XLSX.writeFile(wb,"manutencoes.xlsx");
};

// SCANNER
let scanner;
window.abrirScanner = ()=>{
  scanner = new Html5Qrcode("reader");

  scanner.start({facingMode:"environment"}, {fps:10},
    txt=>{
      let d = txt.split("|");

      equipamento.value = d[0] || "";
      localizacao.value = d[1] || "";
      cor.value = d[2] || "";

      alert("QR carregado!");

      scanner.stop();
    }
  );
};

// INIT
window.onload = ()=>{
  mostrarStock();
  mostrarHistorico();
};
