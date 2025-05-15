import Principal "mo:base/Principal";
import List "mo:base/List";
import Text "mo:base/Text";

actor {
  type Registro = {
    usuario: Principal;
    texto: Text;
  };

  stable var sorteios : List.List<Registro> = List.nil<Registro>();

  public shared ({ caller }) func registrarSorteio(texto: Text) : async () {
    let usuario = caller;
    let novo : Registro = { usuario = usuario; texto = texto };
    sorteios := List.push(novo, sorteios);
  };

  public query func listarSorteios() : async [Registro] {
    return List.toArray(sorteios);
  };

  public query func listarSorteiosDoUsuario(usuario: Principal) : async [Text] {
    let filtrados = List.filter<Registro>(
      sorteios,
      func(r) { r.usuario == usuario }
    );
    let textos = List.map<Registro, Text>(filtrados, func(r) { r.texto });
    return List.toArray(textos);
  };
};
