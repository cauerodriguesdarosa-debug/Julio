// Referências aos elementos do DOM para tarefas, contador, tema e calculadora
const formTarefa = document.getElementById("formTarefa");
const inputTarefa = document.getElementById("inputTarefa");
const listaTarefas = document.getElementById("listaTarefas");
const contador = document.getElementById("contador");
const btnLimparTudo = document.getElementById("limparTudo");
const btnTemaClaro = document.getElementById("temaClaro");
const btnTemaEscuro = document.getElementById("temaEscuro");
const displayCalc = document.getElementById("displayCalc");
const buttonsCalc = document.querySelectorAll(".grid-botoes button");

// Estado da aplicação: lista de tarefas e expressão atual da calculadora
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let expressaoCalc = "";

// Salva a lista de tarefas no localStorage para persistência entre carregamentos
function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// Atualiza o display da calculadora com a expressão atual ou 0 quando vazio
function atualizarDisplayCalc() {
  displayCalc.value = expressaoCalc === "" ? "0" : expressaoCalc;
}

// Limpa a expressão da calculadora
function limparCalculadora() {
  expressaoCalc = "";
  atualizarDisplayCalc();
}

// Calcula o resultado exibido na calculadora, validando a expressão antes
function calcularResultado() {
  // Verifica se há algo para calcular antes de prosseguir
  if (expressaoCalc === "") {
    return;
  }

  const expressaoSegura = expressaoCalc.replace(/×/g, "*").replace(/÷/g, "/");
  const regexValido = /^[0-9+\-*/.%() ]+$/;

  // Valida a expressão para evitar caracteres não permitidos
  if (!regexValido.test(expressaoSegura)) {
    displayCalc.value = "Erro";
    expressaoCalc = "";
    return;
  }

  try {
    const resultado = eval(expressaoSegura);
    expressaoCalc = String(resultado);
  } catch {
    expressaoCalc = "Erro";
  }

  atualizarDisplayCalc();
}

// Renderiza a lista de tarefas na interface
function renderizarTarefas() {
  listaTarefas.innerHTML = "";

  // Exibe uma mensagem quando não há tarefas salvas
  if (tarefas.length === 0) {
    listaTarefas.innerHTML = "<li>Nenhuma tarefa salva ainda.</li>";
  }

  tarefas.forEach((tarefa, index) => {
    const item = document.createElement("li");

    if (tarefa.concluida) {
      item.classList.add("concluida");
    }

    item.innerHTML = `
      <span>${tarefa.texto}</span>
      <div class="acoes">
        <button class="concluir" type="button" onclick="alternarTarefa(${index})">
          ${tarefa.concluida ? "Desfazer" : "Concluir"}
        </button>
        <button class="remover" type="button" onclick="removerTarefa(${index})">
          Remover
        </button>
      </div>
    `;

    listaTarefas.appendChild(item);
  });

  contador.textContent = `${tarefas.length} ${tarefas.length === 1 ? "tarefa salva" : "tarefas salvas"}`;
}

// Adiciona uma nova tarefa à lista e atualiza a interface
function adicionarTarefa(texto) {
  tarefas.push({
    texto,
    concluida: false
  });

  salvarTarefas();
  renderizarTarefas();
}

// Alterna o estado de conclusão de uma tarefa específica
function alternarTarefa(index) {
  tarefas[index].concluida = !tarefas[index].concluida;
  salvarTarefas();
  renderizarTarefas();
}

// Remove uma tarefa da lista e atualiza o armazenamento
function removerTarefa(index) {
  tarefas.splice(index, 1);
  salvarTarefas();
  renderizarTarefas();
}

// Evento para envio do formulário de nova tarefa
formTarefa.addEventListener("submit", (event) => {
  event.preventDefault();

  const texto = inputTarefa.value.trim();

  // Evita adicionar uma tarefa vazia
  if (texto === "") {
    alert("Digite uma tarefa antes de adicionar.");
    return;
  }

  adicionarTarefa(texto);
  inputTarefa.value = "";
  inputTarefa.focus();
});

// Limpa todas as tarefas quando o botão é clicado
btnLimparTudo.addEventListener("click", () => {
  tarefas = [];
  salvarTarefas();
  renderizarTarefas();
});

// Manipula os botões da calculadora
buttonsCalc.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    // Limpa a calculadora quando o botão C é pressionado
    if (value === "C") {
      limparCalculadora();
      return;
    }

    // Calcula o resultado quando o botão = é pressionado
    if (value === "=") {
      calcularResultado();
      return;
    }

    // Alterna o sinal da expressão quando o botão +/- é pressionado
    if (value === "+/-") {
      if (expressaoCalc.startsWith("-")) {
        expressaoCalc = expressaoCalc.slice(1);
      } else {
        expressaoCalc = expressaoCalc ? `-${expressaoCalc}` : expressaoCalc;
      }
      atualizarDisplayCalc();
      return;
    }

    expressaoCalc += value;
    atualizarDisplayCalc();
  });
});

// Cria um cookie com nome, valor e tempo de expiração em dias
function criarCookie(nome, valor, dias) {
  const data = new Date();
  data.setTime(data.getTime() + dias * 24 * 60 * 60 * 1000);
  document.cookie = `${nome}=${valor}; expires=${data.toUTCString()}; path=/`;
}

// Lê um cookie pelo nome informado
function lerCookie(nome) {
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();

    if (cookie.startsWith(nome + "=")) {
      return cookie.substring(nome.length + 1);
    }
  }

  return null;
}

// Aplica o tema escuro ou claro ao corpo da página
function aplicarTema(tema) {
  // Aplica classe de tema escuro ou remove para tema claro
  if (tema === "escuro") {
    document.body.classList.add("tema-escuro");
  } else {
    document.body.classList.remove("tema-escuro");
  }
}

// Configura o tema claro quando o botão correspondente é clicado
btnTemaClaro.addEventListener("click", () => {
  criarCookie("tema", "claro", 30);
  aplicarTema("claro");
});

// Configura o tema escuro quando o botão correspondente é clicado
btnTemaEscuro.addEventListener("click", () => {
  criarCookie("tema", "escuro", 30);
  aplicarTema("escuro");
});

// Aplica o tema salvo pelo cookie ou padrão "claro" e renderiza as tarefas
const temaSalvo = lerCookie("tema") || "claro";
aplicarTema(temaSalvo);
renderizarTarefas();
