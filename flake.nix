{
  description = "Flake with a shell with npm and some utils";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-22.05";
    npm.url = "nixpkgs/eab71d47d511e3ae4f6e300c18c8436aa7316cdc";
  };

  outputs = { self, nixpkgs, npm }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      npmPkgs = npm.legacyPackages.${system};
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          npmPkgs.nodePackages.npm
          npmPkgs.nodePackages.typescript
          npmPkgs.nodePackages.vscode-langservers-extracted
        ];
      };
    };
}
