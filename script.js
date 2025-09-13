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
  const selectcapacity = document.querySelector("#capacity");
  const selectFuncionalidades = document.querySelector("#funcionalidades");
  const botaoCriarSala = document.querySelector("#criarsala");
  const selectBlocosCriar = document.querySelector("#blocoSala");
  const selectFuncionalidadesCriar = document.querySelector(
    "#funcionalidadesSala"
  );
  const nomeCriarSala = document.querySelector("#nomeCriarSala");
  const capacidadeCriarSala = document.querySelector("#capacidadeSala");
  const selectBlocosEditar = document.querySelector("#blocoEditarSala");
  const selectFuncionalidadesEditar = document.querySelector(
    "#funcionalidadesEditarSala"
  );
  const botaoEditarSala = document.querySelector("#editarsala");
  let salaEditarId;
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

    if (selectcapacity.value != "") {
      filtros.capacity = Number(selectcapacity.value); // pega o número
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
        if (filtros.capacity && sala.capacity > Number(filtros.capacity)) {
          return false;
        }

        return true;
      });

      // Renderiza cada sala filtrada criando um elemento `div`
      salasFiltradas.forEach((sala) => {
        const salaContainer = document.createElement("div");
        salaContainer.classList.add(
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "bg-secondary",
          "p-2",
          "mb-2",
          "text-white"
        );

        // Informações da sala
        const salaInfo = document.createElement("span");
        salaInfo.textContent =
          sala.name +
          " - " +
          sala.building +
          " - " +
          sala.capacity +
          " - " +
          sala.resources;

        // Botão Editar
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.id = "botaoEditarSala";
        btnEditar.type = "button";
        btnEditar.setAttribute("data-bs-toggle", "modal");
        btnEditar.setAttribute("data-bs-target", "#modalEditarSala");
        btnEditar.classList.add("btn", "btn-warning");
        // Passa a sala como argumento para a função do modal
        btnEditar.addEventListener("click", function () {
          adicionarInfoNoModal(sala);
        });

        const btnreservar = document.createElement("button");
        btnreservar.textContent = "reservar";
        btnreservar.classList.add("btn", "btn-warning");

        const btnremover = document.createElement("button");
        btnremover.textContent = "remover";
        btnremover.classList.add("btn", "btn-warning");
        btnremover.type = 'button'
        btnremover.addEventListener("click", function() {
          deleteSala(sala)
        })

        btnreservar.addEventListener("click", () => {
          const formReserva = document.querySelector("#formReserva");
          formReserva.style.display = "block"; // mostra o formulário
          document.querySelector("#salaSelecionada").value =
            sala.name + " - " + sala.building;
        });

        // Coloca o texto e o botão dentro do container
        salaContainer.appendChild(salaInfo);
        salaContainer.appendChild(btnreservar);
        salaContainer.appendChild(btnremover);
        salaContainer.appendChild(btnEditar);

        // Adiciona o container completo à div principal
        salasDiv.appendChild(salaContainer);
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
      const blocoOptionCriar = document.createElement("option");
      blocoOptionCriar.value = bloco;
      blocoOptionCriar.textContent = bloco;
      selectBlocos.appendChild(blocoOption);
      selectBlocosCriar.appendChild(blocoOptionCriar);
    });
  }
  criarOptionsBlocos();

  // Preenche o select de funcionalidades (resources) sem repetir valores
  function criarOptionsFuncionalidades() {
    const funcionalidadesArray = arraySalas.flatMap(
      (sala) => sala.resources || []
    );
    const setFuncionalidades = new Set(funcionalidadesArray);
    setFuncionalidades.forEach((funcionalidade) => {
      const funcionalidadesOption = document.createElement("option");
      funcionalidadesOption.value = funcionalidade;
      funcionalidadesOption.textContent = funcionalidade;
      const funcionalidadesOptionCriar = document.createElement("option");
      funcionalidadesOptionCriar.value = funcionalidade;
      funcionalidadesOptionCriar.textContent = funcionalidade;

      selectFuncionalidades.appendChild(funcionalidadesOption);
      selectFuncionalidadesCriar.appendChild(funcionalidadesOptionCriar);
    });
  }
  criarOptionsFuncionalidades();

  botaoCriarSala.addEventListener("click", async () => {
    console.log(capacidadeCriarSala);
    const body = {
      name: nomeCriarSala.value,
      building: selectBlocosCriar.value,
      capacity: Number(capacidadeCriarSala.value),
      resources: [selectFuncionalidadesCriar.value],
    };

    console.log(JSON.stringify(body));
    const response = await fetch(
      "https://sistema-de-reservas-node-js-express.onrender.com/api/rooms",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response);
  });

  function adicionarInfoNoModal(sala) {
    salaEditarId = sala.id;
    const setBlocos = new Set(arraySalas.map((sala) => sala.building));
    setBlocos.forEach((bloco) => {
      const blocoOptionEditar = document.createElement("option");
      blocoOptionEditar.value = bloco;
      blocoOptionEditar.textContent = bloco;
      selectBlocosEditar.appendChild(blocoOptionEditar);
    });

    const funcionalidadesArray = arraySalas.flatMap(
      (sala) => sala.resources || []
    );
    const setFuncionalidades = new Set(funcionalidadesArray);
    setFuncionalidades.forEach((funcionalidade) => {
      const funcionalidadesOption = document.createElement("option");
      funcionalidadesOption.value = funcionalidade;
      funcionalidadesOption.textContent = funcionalidade;
      selectFuncionalidadesEditar.appendChild(funcionalidadesOption);
    });

    console.log(sala);
    // Preenche os campos do modal com os dados da sala
    document.querySelector("#nomeEditarSala").value = sala.name;
    document.querySelector("#capacidadeEditarSala").value = sala.capacity;
    document.querySelector("#blocoEditarSala").value = sala.building;
    // Se houver funcionalidades, pega a primeira (ou adapte para múltiplas)
    if (sala.resources && sala.resources.length > 0) {
      document.querySelector("#funcionalidadesEditarSala").value =
        sala.resources[0];
    } else {
      document.querySelector("#funcionalidadesEditarSala").value = "";
    }
  }
  botaoEditarSala.addEventListener("click", async () => {
    const body = {
      name: document.querySelector("#nomeEditarSala").value,
      building: document.querySelector("#blocoEditarSala").value,
      capacity: Number(document.querySelector("#capacidadeEditarSala").value),
      resources: [selectFuncionalidadesCriar.value],
    };

    console.log(JSON.stringify(body));
    const response = await fetch(
      `https://sistema-de-reservas-node-js-express.onrender.com/api/rooms/${salaEditarId}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    buscarSalas();
    console.log(response);
  });

  async function deleteSala(sala){
    await fetch(
      `https://sistema-de-reservas-node-js-express.onrender.com/api/rooms/${sala.id}`,
      {
        method: "DELETE",
      }
    );
    buscarSalas();
  }
})();
