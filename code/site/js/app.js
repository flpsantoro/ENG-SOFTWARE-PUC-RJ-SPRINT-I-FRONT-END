//LEITURA E FORMATAÇÃO DOS DADOS

function obterDadosCadastroId() {
    const urlParams = new URLSearchParams(window.location.search); // Obtem os parâmetros da URL
    const dadosCadastroId = urlParams.get('id'); // Obtém o valor do parâmetro 'id'
    return dadosCadastroId;
}

const API_URL_CADASTRO = 'http://www.santoroalcantara.com/api/cadastro';
const API_URL_DADOS = 'http://www.santoroalcantara.com/api/dados?order=asc&id=' + obterDadosCadastroId();
const API_URL_DADOS_POST_DELETE = 'http://www.santoroalcantara.com/api/dados';

async function lerCadastro() {
    const response = await fetch(API_URL_CADASTRO);
    const jsonDataCadastro = await response.json();
    return jsonDataCadastro;
}

async function lerDados() {
    const response = await fetch(API_URL_DADOS);
    const jsonDataDados = await response.json();
    return jsonDataDados;
}

function formatarDataHora(data) {
    const date = new Date(data);
    const dia = adicionarZero(date.getDate());
    const mes = adicionarZero(date.getMonth() + 1);
    const ano = date.getFullYear();
    const hora = adicionarZero(date.getHours());
    const minuto = adicionarZero(date.getMinutes());
    return `${dia}/${mes}/${ano} - ${hora}:${minuto}`;
}

function formatarData(data) {
    const date = new Date(data);
    const dia = adicionarZero(date.getDate() + 1);
    const mes = adicionarZero(date.getMonth() + 1);
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function adicionarZero(valor) {
    return valor < 10 ? `0${valor}` : valor;
}

//FUNÇÃO PRINCIPAL DA PÁGINA

async function main() {
    // Mostrar a mensagem de carregamento
    const loadingMessage = document.getElementById("loading-message");
    loadingMessage.style.display = "block";

    // Esconder os elementos
    const tabelaSec = document.getElementById("tabelaSec");
    tabelaSec.style.display = "none";

    const graficoSec = document.getElementById("graficoSec");
    graficoSec.style.display = "none";

    const salvarSec = document.getElementById("salvarSec");
    salvarSec.style.display = "none";

    const usuarioSec = document.getElementById("usuarioSec");
    usuarioSec.style.display = "none";

    const ultimoValorSec = document.getElementById("ultimoValorSec");
    usuarioSec.style.display = "none";

    // Ler Cadastro
    lerCadastro()
        .then((jsonDataCadastro) => {
            // Preencher caixa de seleção e dados do usuário
            preencherCaixaSelecao(jsonDataCadastro);
            // Chamar função dadosUsuario após preencher a caixa de seleção
            dadosUsuario(jsonDataCadastro);
            salvarSec.style.display = "block";
            usuarioSec.style.display = "block";
            // Ler Dados
            lerDados()
                .then((jsonDataDados) => {
                    // Gerar tabela
                    gerarTabela(jsonDataDados);

                    // Valores atuais
                    valoresAtuais(jsonDataDados);

                    // Gráfico de peso
                    graficoPeso(jsonDataDados);

                    // Gráfico de músculo e gordura
                    graficoMusculoGordura(jsonDataDados);

                    // Gráfico de IMC
                    graficoImc(jsonDataDados);

                    // Gráfico de metabolismo basal
                    graficoMetBas(jsonDataDados);

                    // Exibir os elementos
                    loadingMessage.style.display = "none";                   
                    
                    //Os gráficos só serão exibidos com mais de 1 registo
                    if (jsonDataDados.length > 1) {                       
                        graficoSec.style.display = "block";                     
                    }
                    //A tabela só será exibida de houver dado
                    if (jsonDataDados.length > 0) {                      
                        tabelaSec.style.display = "block";
                    }                    
                    
                })
                .catch((error) => {
                    console.error('Ocorreu um erro:', error);
                });
        })
        .catch((error) => {
            console.error('Ocorreu um erro:', error);
        });

}

main();


//GRAVAR DADOS

function salvarDados(event) {
    event.preventDefault();
    const form = event.target;
    const dados = {
        cadastro_id: obterDadosCadastroId(),
        peso: form.peso.value,
        gordura: form.gordura.value,
        musculo: form.musculo.value,
        met_basal: form.metBas.value,
        idade_corporal: form.idadeCorporal.value,
        gordura_visceral: form.gorduraVisceral.value
    };
    console.log(JSON.stringify(dados));

    fetch(API_URL_DADOS_POST_DELETE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Dados salvos com sucesso:', data);
            form.reset();

        })
        .catch(error => {
            console.error('Erro ao salvar dados:', error);
        });
}

//APAGAR DADOS

function apagarDado(id) {
    fetch(API_URL_DADOS_POST_DELETE + '?id=' +  id, {method: 'DELETE'})
        .then(response => response.json())
        .then(data => {
            location.reload();
        })
        .catch(error => console.error(error));
}

// Listeners
const form = document.querySelector('form');
form.addEventListener('submit', salvarDados);

const nomesSelect = document.getElementById("nomes");
nomesSelect.addEventListener("change", () => {
    const id = nomesSelect.value;
    localStorage.setItem("usuarioSelecionado", id);
    const url = window.location.href.split("?")[0] + "?id=" + id;
    history.pushState(null, null, url);
    window.location.reload();
});

const usuarioSelecionado = obterDadosCadastroId();
if (usuarioSelecionado !== null) {
    nomesSelect.value = usuarioSelecionado;
} else{
    nomesSelect.value = '';
}


//APRESENTAR DADOS

//Preenche caixa de seleção

function preencherCaixaSelecao(data) {
    const nomesSelect = document.getElementById("nomes"); // Elemento select no HTML
    nomesSelect.innerHTML = '<option value="">Selecione um usuário</option>';
    data.forEach(usuario => {
        const option = document.createElement("option");
        option.value = usuario.id;
        option.text = usuario.nome+' '+usuario.sobrenome;
        nomesSelect.add(option);
    });
    if (usuarioSelecionado !== null) {
        nomesSelect.value = usuarioSelecionado;
    }
}

//Dados do usuário
function dadosUsuario(dados) {
    let usuarioDado = dados.filter(dado => dado.id === parseInt(obterDadosCadastroId()))[0];
    const ultimoValorDiv = document.querySelector('#dados-usuario');
    ultimoValorDiv.innerHTML = `<h2>Dados do Usuário</h2>
  <div class="row">
  <div class="col-sm-6">
    <ul>
      <li>Nome: ${usuarioDado.nome + " " + usuarioDado.sobrenome}</li>
      <li>Data de Nascimento: ${formatarData(usuarioDado.nascimento)}</li>
      <li>Altura: ${usuarioDado.altura / 100}m</li>
    </ul>
  </div>
  <div class="col-sm-6">
    <ul>      
      <li>e-mail: ${usuarioDado.email}</li>
      <li>Número de medições: ${Object.keys(usuarioDado.dados_medidos).length}</li>
    </ul>
  </div>
</div>
  `;
}

//Valores atuais
function valoresAtuais(data) {
    let ultimoDado = data[data.length - 1];
    const ultimoValorDiv = document.querySelector('#ultimo-valor');
    ultimoValorDiv.innerHTML = `<h2>Valores Atuais</h2>
    <div class="row">
    <div class="col-sm-6">
     <ul>
        <li>Peso: ${ultimoDado.peso} kg</li>
        <li>Gordura: ${ultimoDado.gordura} %</li>
        <li>Metabolismo Basal: ${ultimoDado.met_basal} cal</li>
        <li>Gordura visceral: ${ultimoDado.gordura_visceral}</li>
      </ul>
  </div>
  <div class="col-sm-6">
    <ul>
      <li>IMC: ${ultimoDado.imc}</li>
      <li>Músculo: ${ultimoDado.musculo} %</li>
      <li>Idade: ${ultimoDado.idade} anos</li>
      <li>Idade corporal: ${ultimoDado.idade_corporal} anos</li>
    </ul>
  </div>
</div>
  `;
}

// Formulário no html

//Gera os gráficos
function graficoPeso(data) {
    const pesos = data.map(d => d.peso);
    const labels = data.map(d => formatarDataHora(d.data));

    const ctx = document.getElementById('pesoChart').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Peso',
                data: pesos,
                borderColor: 'rgb(55, 62, 235)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução do peso no tempo'
                }
            },
            scales: {
                y: {
                    ticks: {
                        beginAtZero: false
                    }
                },
                x: {
                    ticks: {
                        display: false,
                        autoSkip: true,
                        maxTicksLimit: 20
                    }
                }
            }
        }
    });
}

function graficoMusculoGordura(data) {
    const musculoData = data.map(d => d.musculo);
    const gorduraData = data.map(d => d.gordura);
    const gorduraViscData = data.map(d => d.gordura_visceral);
    const labels = data.map(d => formatarDataHora(d.data));

    const ctx = document.getElementById('muscGord').getContext('2d');

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Músculo',
                data: musculoData,
                borderColor: 'rgb(17,125,198)',
                fill: false
            }, {
                label: 'Gordura',
                data: gorduraData,
                borderColor: 'rgb(238,12,58)',
                fill: false
            }, {
                label: 'Gordura Visceral',
                data: gorduraViscData,
                borderColor: 'rgb(175,55,235)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução de músculo e gordura no tempo'
                }
            },
            scales: {
                yAxes: {
                    ticks: {
                        beginAtZero: false
                    }
                },
                xAxes: {
                    ticks: {
                        display: false,
                        autoSkip: true,
                        maxTicksLimit: 20
                    }
                }
            }
        }
    });
}

function graficoImc(data) {
    const pesos = data.map(d => d.imc);
    const labels = data.map(d => formatarDataHora(d.data));

    const ctx = document.getElementById('imcChart').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'IMC',
                data: pesos,
                borderColor: 'rgb(61,235,55)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução do IMC no tempo'
                }
            },
            scales: {
                y: {
                    ticks: {
                        beginAtZero: false
                    }
                },
                x: {
                    ticks: {
                        display: false,
                        autoSkip: true,
                        maxTicksLimit: 20
                    }
                }
            }
        }
    });
}

function graficoMetBas(data) {
    const pesos = data.map(d => d.met_basal);
    const labels = data.map(d => formatarDataHora(d.data));

    const ctx = document.getElementById('metBasChart').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Metabolismo Basal',
                data: pesos,
                borderColor: 'rgb(235,199,55)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução do Metabolismo Basal no tempo'
                }
            },
            scales: {
                y: {
                    ticks: {
                        beginAtZero: false
                    }
                },
                x: {
                    ticks: {
                        display: false,
                        autoSkip: true,
                        maxTicksLimit: 20
                    }
                }
            }
        }
    });
}

//Gera a tabela
function gerarTabela(data) {
    const tbody = document.querySelector('tbody');
    const thead = document.querySelector('thead');
    tbody.innerHTML = '';
    thead.innerHTML = `   
  <tr>
  <th>Peso</th>
  <th>IMC</th>
  <th>Gordura</th>
  <th>Músculo</th>
  <th>Metabolismo Basal</th>
  <th>Idade</th>
  <th>Idade Corporal</th>
  <th>Gordura Visceral</th>
  <th>Data</th>
  <th>Apagar</th>
  </tr>
  `;
    data.forEach(dado => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${dado.peso}</td>
  <td>${dado.imc}</td>
  <td>${dado.gordura}</td>
  <td>${dado.musculo}</td>
  <td>${dado.met_basal}</td>
  <td>${dado.idade}</td>
  <td>${dado.idade_corporal}</td>
  <td>${dado.gordura_visceral}</td>
  <td>${formatarDataHora(dado.data)}</td>
  <td style="text-align: center;">
    <a href="#" onclick="apagarDado(${dado.id})" style="color: red;">
      <i class="material-icons" style="vertical-align: middle;">delete</i>
    </a>
  </td>`;
        tbody.appendChild(tr);
    });
}