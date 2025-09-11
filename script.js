/*
  script.js
  Autor: Eduardo Montandon
  Documentado por: GitHub Copilot (para Pedro Degen)

  Propósito:
  - Buscar uma lista de salas via API.
  - Preencher selects de filtros (bloco e funcionalidades).
  - Exibir as salas na página e permitir filtragem por bloco, nome e
    funcionalidades.

  Formato esperado dos dados (arraySalas):
  [
    {
      id: number,
      name: string,
      building: string,
      resources: ["projector", "whiteboard", ...]
    },
    ...
  ]

  Observações rápidas para iniciantes:
  - O código está dentro de uma função auto-executável para evitar
    poluir o escopo global (variáveis não ficam disponíveis em window).
  - Sempre verifique se os elementos DOM (ex: #salas, #salasForm) existem
    no HTML antes de usar querySelector.
  - Erros de rede não estão sendo tratados aqui; em produção, envolva
    o fetch com try/catch e trate status != 200.
*/

(async function () {
  "use strict";

  // Faz a requisição para a API e transforma a resposta em JSON.
  // Atribuímos o resultado à `arraySalas` (array de objetos de sala).
  const arraySalas = await fetch(
    "https://sistema-de-reservas-node-js-express.onrender.com/api/rooms"
  ).then((res) => res.json());

  // Referências para elementos do DOM que vamos manipular
  const salasDiv = document.querySelector("#salas");
  const salasForm = document.querySelector("#salasForm");
  const selectBlocos = document.querySelector("#blocos");
  const selectFuncionalidades = document.querySelector("#funcionalidades");

  // Quando o formulário de filtros for enviado, vamos montar um objeto
  // `filtros` com os valores escolhidos e chamar `buscarSalas`.
  salasForm.addEventListener("submit", (event) => {
    console.log(event); // útil para depuração durante aprendizado
    event.preventDefault();
    let filtros = {};

    // Se houver valor no select de blocos, adiciona ao objeto filtros
    if (selectBlocos.value != "") {
      filtros.blocos = selectBlocos.value;
    }

    // Se o campo de nome da sala tiver texto, adiciona ao filtros
    if (event.target.querySelector("#nomeSala").value != "") {
      filtros.nome = event.target.querySelector("#nomeSala").value;
    }

    // Se uma funcionalidade foi escolhida, adiciona também
    if (selectFuncionalidades.value != "") {
      filtros.funcionalidades = selectFuncionalidades.value;
    }

    buscarSalas(filtros);
  });

  // Função que recebe um objeto `filtros` e exibe apenas as salas que
  // correspondem aos critérios. Se `filtros` for vazio, exibe todas.
  function buscarSalas(filtros) {
    console.log(filtros);
    // Limpa o conteúdo atual antes de renderizar os resultados
    salasDiv.innerHTML = "";

    // Se `filtros` existir, usamos filter; caso contrário
    // renderizamos todas as salas.
    if (filtros) {
      const salasFiltradas = arraySalas.filter((sala) => {
 

        // filtro por bloco (building)
        if (filtros.blocos && sala.building !== filtros.blocos) {
          return false;
        }

        // filtro por nome (contains, case-insensitive)
        if (
          filtros.nome &&
          !sala.name.toLowerCase().includes(filtros.nome.toLowerCase())
        ) {
          return false;
        }

        // filtro por funcionalidades (recursos) — verifica se o array inclui
        if (
          filtros.funcionalidades &&
          !sala.resources.includes(filtros.funcionalidades)
        ) {
          return false;
        }

        return true;
      });

      // Renderiza cada sala filtrada criando um elemento `div`
      salasFiltradas.forEach((sala) => {
        const salaDiv = document.createElement("div");
        salaDiv.classList.add("h-25", "bg-secondary");
        salaDiv.textContent = sala.name + " - " + sala.building;
        salasDiv.appendChild(salaDiv);
      });
    } else {
      // Se não houver filtros, renderiza todas as salas
      arraySalas.forEach((sala) => {
        const salaDiv = document.createElement("div");
        salaDiv.classList.add("h-25", "bg-secondary");
        salaDiv.textContent = sala.name + " - " + sala.building;
        salasDiv.appendChild(salaDiv);
      });
    }
  }

  // Preenche o select de blocos (building) sem repetir valores
  function criarOptionsBlocos() {
    const setBlocos = new Set(arraySalas.map((sala) => sala.building));
    setBlocos.forEach((bloco) => {
      const blocoOption = document.createElement("option");
      blocoOption.value = bloco;
      blocoOption.textContent = bloco;
      selectBlocos.appendChild(blocoOption);
    });
  }
  criarOptionsBlocos();

  // Preenche o select de funcionalidades (resources) sem repetir valores
  function criarOptionsFuncionalidades() {
    const funcionalidadesArray = arraySalas.flatMap((sala) => sala.resources || []);
    const setFuncionalidades = new Set(funcionalidadesArray);
    setFuncionalidades.forEach((funcionalidade) => {
      const funcionalidadesOption = document.createElement("option");
      funcionalidadesOption.value = funcionalidade;
      funcionalidadesOption.textContent = funcionalidade;
      selectFuncionalidades.appendChild(funcionalidadesOption);
    });
  }
  criarOptionsFuncionalidades();
})();
