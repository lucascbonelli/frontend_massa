import "./style.css";
import api from '../../services/api'
import { useState, useEffect } from "react";

function Home() {
  const [candidato,setCandidato] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [dados, setDados] = useState({
    idDMH: "string",
    quantidadeInscricao: 1,
    tipoIngresso: "ENEM",
    tipoSimulacao: "PADRAO",
    canalVendas: 0
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Se o campo for de número, converte para Number
    const novoValor = name === "canalVendas" ? Number(value) : value;
  
    setDados({ ...dados, [name]: novoValor });
  };

  async function createCandidato(){
    let cpfcandidatos
    try {
      console.log(dados)
      const response = await api.post("inscricao/create", dados);
      cpfcandidatos = response.data
      console.log("Resposta da API:", response.data);
      alert("Aluno criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      alert("Erro ao enviar os dados!");
    }
    
    cpfcandidatos.map((cpfcandidato)=>{
      getListaAlunos(cpfcandidato)

      selectedOptions.map(opcao, ()=>{
        const bk = getBK(cpfcandidato)

        if (opcao == "Vestibular"){
          passaNoVestibular(bk)
        }
        if (opcao == "Pagamento"){
          realizaPagamento(bk)
        }
        if (opcao == "Aceite"){
          realizaAceite(bk)
        }

      })

    })
  }

  async function passaNoVestibular(bk){
    response = await api.get("/contrato/aprovar/" + bk);
    console.log("Vestibular: " + response.status)
  }
  
  async function realizaPagamento(bk){
    const body={
      bk:bk
    }
    const response = await api.put("pagamento/gerar-pagamento-pix", body)
    console.log(response.status)
    console.log(response.data)   
  }

  async function realizaPagamento(bk){
    let response = await api.put("revisar/aprovacao/" + bk)
    console.log("Revisão do contrato: " + response.status)
    response = await api.post("contrato/aceite/" + bk)
    console.log ("Aprovação de contrato: "+ response.status)
  }


  async function getBK(cpf){
    let response = await api.get("/inscricao/get-inscricao-by-cpf/" + cpf);
    bk = response.data[0].inscricao.businessKey;
    return bk
  }

  async function getListaAlunos(cpf) {
    try {
      const response = await api.get("/inscricao/get-inscricao-by-cpf/" + cpf);
      setCandidato(response.data);
      console.log(response.data[0]) // Atualiza o estado com os dados da API
    } catch (err) {
      console.error("Erro ao buscar candidato:", err);
      setError("Erro ao buscar dados. Verifique o console.");
    }
  }

  const alunos = [
    { bk: "123123", name: "Lucas", cpf: "09000806984" },
    { bk: "456456", name: "Eduardo", cpf: "09000806984" },
    { bk: "456456", name: "Eduardo", cpf: "09000806984" },
  ];

  const options = ["Vestibular", "Pagamento", "Aceite"];

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  return (
    <div className="container">
      <form className="form">
        <h1>Gerador de Massa de Dados</h1>

        <div className="form-grid">
          <div className="input-group">
            <label>Id da Oferta</label>
            <input type="text" value="2047509893" name="idDMH" onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Canal de Venda</label>
            <input type="number" value="83" name="canalVendas" onChange={handleChange}/>
          </div>
          <div className="input-group">
            <label>Tipo de Simulação</label>
            <input type="text" value="PADRAO_PAGUEFACIL" name="tipoSimulacao" onChange={handleChange}/>
          </div>
          <div className="input-group">
            <label>Tipo de Ingresso</label>
            <input type="text" value="VESTIBULAR" name="tipoIngresso" onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Quantidade</label>
            <input type="number" value="1" name="quantidadeInscricao" onChange={handleChange}/>
          </div>
        </div>

        <div className="checkbox-group">
          <h2>Selecione as opções:</h2>
          {options.map((option) => (
            <label key={option} className="checkbox">
              <input
                type="checkbox"
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              {option}
            </label>
          ))}
        </div>

        <button type="button" className="btn-criar" onClick={createCandidato}>
          Criar
        </button>
      </form>

 {/* Exibir dados retornados da API */}
 {error && <p style={{ color: "red" }}>{error}</p>}
        {candidato && (
          <div className="result">
            <h2>Dados do Candidato:</h2>
            <p><strong>CPF:</strong>  {candidato[0].dadosPessoais.cpf || "N/A"}</p>
            <p><strong>Nome:</strong> {candidato[0].dadosPessoais.nome || "N/A"}</p>
            <p><strong>BK:</strong>   {candidato[0].inscricao.businessKey || "N/A"}</p>
          </div>
        )}
    </div>
  );
}

export default Home;
