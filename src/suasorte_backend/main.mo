import Principal "mo:base/Principal";
import List "mo:base/List";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Debug "mo:base/Debug";


actor {
  public type UserData = {
    principal : Text;
    dataSorteio : Nat;
    
  };

  stable var sorteios : [UserData] = [];

  public shared (msg) func sortear(dataSorteio : Nat) : async () {
    if (Principal.isAnonymous(msg.caller)) {
      //anonimo
      Debug.trap("Usuario não identificado");
    };

    //CRIAR O RECORTE DO PAGE
    var sorteio : UserData = {
      principal = Principal.toText(msg.caller);
      dataSorteio = dataSorteio;
      
    };
    //adiciona ao array
    sorteios := Array.append(sorteios, [sorteio]);
  };

  public shared query (msg) func getSorteiosUsuario() : async [UserData] {
    if (Principal.isAnonymous(msg.caller)) {
      Debug.trap("Usuario não identificado");
    };

    let principal = Principal.toText(msg.caller);

    func procurar(a : UserData) : Bool {
      (a.principal == principal);
    };

    return Array.filter<UserData>(sorteios, procurar);
  };
};
