import { useEffect, useState, useRef } from "react";
import { suasorte_backend } from "declarations/suasorte_backend";

function App() {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [listaNomes, setListaNomes] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [resultadoArquivo, setResultadoArquivo] = useState([]);
  const nomeArquivoSelecionadoRef = useRef(null);

  const wrapperRef = useRef(null);
  const arquivoInputRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;

    const handleRegisterClick = (e) => {
      e.preventDefault();
      wrapper.classList.add("active");
    };

    const handleLoginClick = (e) => {
      e.preventDefault();
      wrapper.classList.remove("active");
    };

    const handlePopup = () => {
      wrapper.classList.add("active-popup");
    };

    document
      .querySelector(".registerLink")
      ?.addEventListener("click", handleRegisterClick);
    document
      .querySelector(".loginLink")
      ?.addEventListener("click", handleLoginClick);
    document.querySelector(".btnLogin")?.addEventListener("click", handlePopup);

    return () => {
      document
        .querySelector(".registerLink")
        ?.removeEventListener("click", handleRegisterClick);
      document
        .querySelector(".loginLink")
        ?.removeEventListener("click", handleLoginClick);
      document
        .querySelector(".btnLogin")
        ?.removeEventListener("click", handlePopup);
    };
  }, []);

  const adicionarNome = () => {
    const nomeLimpo = nome.trim();
    if (nomeLimpo) {
      setListaNomes((prev) => [...prev, nomeLimpo]);
      setNome("");
    }
  };

  const sortear = () => {
    const qtd = parseInt(quantidade);
    if (isNaN(qtd) || qtd < 1) {
      setResultado(["Informe uma quantidade válida."]);
      return;
    }

    if (qtd > listaNomes.length) {
      setResultado(["Quantidade maior que o número de nomes adicionados."]);
      return;
    }

    const copia = [...listaNomes];
    const sorteados = [];

    for (let i = 0; i < qtd; i++) {
      const index = Math.floor(Math.random() * copia.length);
      sorteados.push(copia.splice(index, 1)[0]);
    }

    setResultado(sorteados);
  };

  const limparTudo = () => {
    setListaNomes([]);
    setResultado([]);
    setNome("");
    setQuantidade("");
  };

  const sortearDoArquivo = () => {
    const arquivoInput = arquivoInputRef.current;
    const file = arquivoInput?.files[0];
    const qtd = parseInt(
      document.getElementById("quantidadeSorteioArquivo")?.value
    );

    if (!file) {
      setResultadoArquivo(["Selecione um arquivo."]);
      return;
    }

    if (isNaN(qtd) || qtd < 1) {
      setResultadoArquivo(["Informe uma quantidade válida."]);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const linhas = event.target.result
        .split("\n")
        .map((linha) => linha.trim())
        .filter((linha) => linha !== "");

      if (qtd > linhas.length) {
        setResultadoArquivo([
          "Quantidade maior que o número de nomes no arquivo.",
        ]);
        return;
      }

      const copia = [...linhas];
      const sorteados = [];

      for (let i = 0; i < qtd; i++) {
        const index = Math.floor(Math.random() * copia.length);
        sorteados.push(copia.splice(index, 1)[0]);
      }

      setResultadoArquivo(sorteados);
    };

    reader.readAsText(file);
  };

  const handleArquivoChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      nomeArquivoSelecionadoRef.current.textContent = "";
      return;
    }

    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      nomeArquivoSelecionadoRef.current.textContent =
        "Arquivo inválido. Selecione um arquivo .txt.";
      nomeArquivoSelecionadoRef.current.style.color = "red";
      e.target.value = "";
    } else {
      nomeArquivoSelecionadoRef.current.textContent = file.name;
      nomeArquivoSelecionadoRef.current.style.color = "white";
    }
  };

  return (
    <main>
      <header>
        <h2 className="logo">SuaSorte</h2>
        <nav className="navegacao">
          <a href="#">Home</a>
          <a href="#">Explorar</a>
          <a href="#">Sorteios</a>
          <a href="#">Contato</a>
          <button className="btnLogin">Login</button>
        </nav>
      </header>

      <div className="wrapper" ref={wrapperRef}>
        <div className="caixa-form-login">
          <h2>Manual</h2>
          <div className="adcnome">
            <input
              id="nomeInput"
              type="text"
              placeholder="Digite o nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarNome()}
            />
            <div className="quantidade">
              <input
                type="number"
                id="quantidadeSorteio"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
            <button onClick={adicionarNome}>Adicionar</button>
          </div>

          <ul id="listaNomes">
            {listaNomes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>

          <div className="botoes">
            <button onClick={sortear}>Sortear</button>
            <button onClick={limparTudo}>Limpar Tudo</button>
          </div>

          <div className="resultado" id="resultado">
            {resultado.map((r, i) => (
              <span key={i} className="posicao">
                {i + 1}. {r}
              </span>
            ))}
          </div>

          <div className="registro-login">
            <p>
              Sorteio com lista{" "}
              <a href="#" className="registerLink">
                Click aqui
              </a>
            </p>
          </div>
        </div>

        <div className="caixa-form-individual">
          <div className="sorteio-arquivo">
            <h2>Sorteio com Lista</h2>
            <div className="topo-sorteio">
              <input
                type="file"
                ref={arquivoInputRef}
                onChange={handleArquivoChange}
                accept=".txt"
                id="arquivoInput"
              />
              <label htmlFor="arquivoInput">Escolher arquivo</label>
              <input
                type="number"
                id="quantidadeSorteioArquivo"
                placeholder="Qtd"
              />
            </div>
            <p
              id="nomeArquivoSelecionado"
              className="arquivo-nome"
              ref={nomeArquivoSelecionadoRef}
            ></p>
            <div className="botoes">
              <button onClick={sortearDoArquivo}>Sortear</button>
            </div>
            <div id="resultadoArquivo" className="resultado">
              {resultadoArquivo.map((r, i) => (
                <span key={i}>
                  {i + 1}º {r}
                </span>
              ))}
            </div>
          </div>

          <div className="registro-individual">
            <p>
              Sorteio Vários{" "}
              <a href="#" className="loginLink">
                Click aqui
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
