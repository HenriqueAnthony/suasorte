import { useEffect, useState, useRef } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { suasorte_backend } from "declarations/suasorte_backend";

function App() {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [listaNomes, setListaNomes] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [resultadoArquivo, setResultadoArquivo] = useState([]);
  const nomeArquivoSelecionadoRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [contador, setContador] = useState(0);
  const [mostrandoResultado, setMostrandoResultado] = useState(false);

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

    const handleSorteadorClick = (e) => {
      e.preventDefault();
      wrapper.classList.add("active-popup");
    };

    document
      .querySelector(".registerLink")
      ?.addEventListener("click", handleRegisterClick);
    document
      .querySelector(".loginLink")
      ?.addEventListener("click", handleLoginClick);
    document
      .querySelector(".sorteadornav")
      ?.addEventListener("click", handleSorteadorClick);

    return () => {
      document
        .querySelector(".registerLink")
        ?.removeEventListener("click", handleRegisterClick);
      document
        .querySelector(".loginLink")
        ?.removeEventListener("click", handleLoginClick);
      document
        .querySelector(".sorteadornav")
        ?.removeEventListener("click", handleSorteadorClick);
    };
  }, []);

  // COLOQUE ISSO FORA DO useEffect
  const login = async () => {
    const authClient = await AuthClient.create();

    await authClient.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        setIsLoggedIn(true);
        window.location.href = "/suasorte/";
      },
      windowOpenerFeatures: `
      left=${window.screen.width / 2 - 525 / 2},
      top=${window.screen.height / 2 - 705 / 2},
      toolbar=0,location=0,menubar=0,width=525,height=705
    `,
    });
  };

  const logout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsLoggedIn(false);
  };

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

    // Inicia contagem de 5 segundos
    setContador(5);
    setResultado([]);
    setMostrandoResultado(false);

    let tempo = 5;
    const interval = setInterval(() => {
      tempo -= 1;
      setContador(tempo);

      if (tempo === 0) {
        clearInterval(interval);
        realizarSorteio(qtd); // Chama a função async
      }
    }, 1000);
  };

  const realizarSorteio = async (qtd) => {
    const copia = [...listaNomes];
    const sorteados = [];

    for (let i = 0; i < qtd; i++) {
      const index = Math.floor(Math.random() * copia.length);
      sorteados.push(copia.splice(index, 1)[0]);
    }

    setResultado(sorteados);
    setHistorico((prev) => [...prev, sorteados]);
    setMostrandoResultado(true);

    // Envia para o backend
    if (isLoggedIn) {
      const texto = `Sorteio Manual: ${sorteados.join(", ")}`;
      try {
        await suasorte_backend.registrarSorteio(texto);
        console.log("Sorteio registrado com sucesso!");
      } catch (err) {
        console.error("Erro ao registrar sorteio:", err);
      }
    }
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

      // INICIA CONTAGEM
      setContador(5);
      setResultadoArquivo([]);
      setMostrandoResultado(false);

      let tempo = 5;
      const interval = setInterval(() => {
        tempo -= 1;
        setContador(tempo);

        if (tempo === 0) {
          clearInterval(interval);
          realizarSorteioArquivo(linhas, qtd);
        }
      }, 1000);
    };

    reader.readAsText(file);
  };
  const realizarSorteioArquivo = (linhas, qtd) => {
    const copia = [...linhas];
    const sorteados = [];

    for (let i = 0; i < qtd; i++) {
      const index = Math.floor(Math.random() * copia.length);
      sorteados.push(copia.splice(index, 1)[0]);
    }

    setResultadoArquivo(sorteados);
    setHistorico((prev) => [...prev, sorteados]);
    setMostrandoResultado(true);

    // Registrar no backend se quiser (opcional)
    if (isLoggedIn) {
      const texto = `Sorteio por Arquivo: ${sorteados.join(", ")}`;
      try {
        suasorte_backend.registrarSorteio(texto);
      } catch (err) {
        console.error("Erro ao registrar sorteio:", err);
      }
    }
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
          <a href="#" className="sorteadornav">
            Sorteios
          </a>
          <a href="#">Contato</a>
          {isLoggedIn ? (
            <button onClick={logout} id="logout">
              Logout
            </button>
          ) : (
            <button onClick={login} className="btnLogin">
              Login
            </button>
          )}
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
            <button onClick={adicionarNome}>Adicionar</button>
            <div className="quantidade">
              <input
                type="number"
                id="quantidadeSorteio"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
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
            {contador > 0 && !mostrandoResultado ? (
              <span className="contador">{contador}</span>
            ) : (
              resultado.map((r, i) => (
                <span key={i} className="posicao">
                  {i + 1}. {r}
                </span>
              ))
            )}
          </div>

          <div className="historico-sorteios">
            <h3>Histórico de Sorteios</h3>
            {historico.length === 0 ? (
              <p>Nenhum sorteio ainda.</p>
            ) : (
              <ul>
                {historico.map((sorteio, idx) => (
                  <li key={idx}>
                    {idx + 1}º: {sorteio.join(", ")}
                  </li>
                ))}
              </ul>
            )}
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
              {contador > 0 && !mostrandoResultado ? (
                <span className="contador">{contador}</span>
              ) : (
                resultadoArquivo.map((r, i) => (
                  <span key={i} className="posicao">
                    {i + 1}. {r}
                  </span>
                ))
              )}
            </div>

            <div className="historico-sorteios">
              <h3>Histórico de Sorteios</h3>
              {historico.length === 0 ? (
                <p>Nenhum sorteio ainda.</p>
              ) : (
                <ul>
                  {historico.map((sorteio, idx) => (
                    <li key={idx}>
                      {idx + 1}º: {sorteio.join(", ")}
                    </li>
                  ))}
                </ul>
              )}
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
