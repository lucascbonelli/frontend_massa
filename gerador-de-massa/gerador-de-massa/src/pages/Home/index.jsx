import "./style.css";
import api from "../../services/api";
import { useState } from "react";

function Home() {
  const [items, setItems] = useState([]);
  const [candidato, setCandidato] = useState([]);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [cpfcandidatos, setCpfCandidatos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dados, setDados] = useState({
    idDMH: "string",
    quantidadeInscricao: 1,
    tipoIngresso: "ENEM",
    tipoSimulacao: "PADRAO",
    canalVendas: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const novoValor = name === "canalVendas" ? Number(value) : value;
    setDados({ ...dados, [name]: novoValor });
  };


  async function createCandidato() {
    try {
      setIsLoading(true); // Ativa o loading antes de iniciar o processo
      console.log("Enviando dados:", dados);
      
      const response = await api.post("inscricao/create", dados);
      console.log("Resposta da API:", response);
  
      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error("Resposta da API inválida!");
      }
  
      setItems((prevItems) => [...prevItems, ...response.data]);
      setCpfCandidatos(response.data);
  
      setTimeout(async () => {
        for (const cpf of response.data) {
          console.log("Buscando candidato para CPF:", cpf);
          await getListaAlunos(cpf);
  
          const bk = await getBK(cpf);
  
          if (selectedOptions.includes("Vestibular")) {
            await passaNoVestibular(bk);
          }
  
          if (selectedOptions.includes("Pagamento")) {
            await realizaPagamento(bk);
          }
  
          if (selectedOptions.includes("Aceite")) {
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 5s antes do aceite
            await realizaAceite(bk);
          }
        }
  
        setIsLoading(false); // Desativa o loading apenas quando tudo terminar
      }, 2000);
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      alert("Erro ao enviar os dados!");
      setIsLoading(false); // Se der erro, desativa o loading
    }
  }

  // Função para buscar dados do candidato por CPF
  async function getListaAlunos(cpf) {
    try {
      const response = await api.get(`/inscricao/get-inscricao-by-cpf/${cpf}`);
      console.log("Candidato encontrado:", response.data);
      setCandidato((prevCandidatos) => [...prevCandidatos, ...response.data]);
      setError("")
    } catch (err) {
      console.error("Erro ao buscar candidato:", err);
      setError("Erro ao buscar dados. Verifique o console.");
    }
  }

  // Função para buscar o BK (business key) com base no CPF
  async function getBK(cpf) {
    try {
      const response = await api.get(`/inscricao/get-inscricao-by-cpf/${cpf}`);
      const bk = response.data[0].inscricao.businessKey;
      console.log("Business Key do candidato:", bk);
      // Faça algo com o BK aqui, como passar para outras funções ou fazer chamadas adicionais
      return bk;
    } catch (err) {
      console.error("Erro ao buscar BK:", err);
    }
  }

  // Função para passar no vestibular
  async function passaNoVestibular(bk) {
    try {
      const response = await api.put(`/contrato/aprovar/${bk}`);
      console.log("Vestibular aprovado, status:", response.status);
    } catch (error) {
      console.error("Erro ao aprovar vestibular:", error);
    }
  }

  // Função para realizar o pagamento
  async function realizaPagamento(bk) {
    try {
      const body = { bk: String(bk) }; // Garante que o BK seja enviado como string

      const response = await api.post("pagamento/gerar-pagamento-pix", body);

      console.log("Pagamento realizado, status:", response.status);
    } catch (error) {
      console.error("Erro ao realizar pagamento:", error);
    }
  }

  // Função para realizar o aceite do contrato
  async function realizaAceite(bk) {
    try {
      let response = await api.put(`revisar/aprovacao/${bk}`);
      console.log("Revisão do contrato: " + response.status);
      response = await api.put(`contrato/aceite/${bk}`);
      console.log("Aprovação de contrato: " + response.status);
    } catch (error) {
      console.error("Erro ao realizar aceite de contrato:", error);
    }
  }

  async function executarAcoesSelecionadas(bk) {
    for (const opcao of selectedOptions) {
      console.log(`Executando ação: ${opcao} para BK: ${bk}`);
      if (opcao === "Vestibular") await passaNoVestibular(bk);
      if (opcao === "Pagamento") await realizaPagamento(bk);
      if (opcao === "Aceite") await realizaAceite(bk);
    }
  }

  const options = ["Vestibular", "Pagamento", "Aceite"];

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  return (
    <div className="container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <img src="/loading.gif" alt="Carregando..." />
            <p>Processando os dados... Aguarde!</p>
          </div>
        </div>
      )}
      <form className="form">
        <h1>Gerador de Massa de Dados</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="form-grid">
          <div className="input-group">
            <label>Id da Oferta</label>
            <input type="text" placeholder="1000748470" name="idDMH" onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Canal de Venda</label>
            <input type="number" placeholder="86" name="canalVendas" onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Tipo de Simulação</label>
            <input type="text" placeholder="PADRAO_PAGUEFACIL" name="tipoSimulacao" onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Tipo de Ingresso</label>
            <input type="text" placeholder="VESTIBULAR" name="tipoIngresso" onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Quantidade</label>
            <input type="number" placeholder="1" name="quantidadeInscricao" onChange={handleChange} min='1' max='10' />
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

      {candidato.length > 0 && (
        <div className="result">
          <h2>Dados dos Candidatos:</h2>
          {candidato.map((c, index) => (
            <div key={index} className="candidato">
              <p><strong>CPF:</strong> {c.dadosPessoais.cpf || "N/A"}</p>
              <p><strong>Nome:</strong> {c.dadosPessoais.nome || "N/A"}</p>
              <p><strong>BK:</strong> {c.inscricao.businessKey || "N/A"}</p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;