import Debug "mo:base/Debug";
import Text "mo:base/Text";
import List "mo:base/List";

actor {

  stable var sorteios : List.List<Text> = List.nil<Text>();

  public func registrarSorteio(sorteio: Text) : async () {
    sorteios := List.push(sorteio, sorteios);
    Debug.print("Sorteio registrado: " # sorteio);
  };

  public query func listarSorteios() : async [Text] {
    List.toArray(sorteios);
  };
}
