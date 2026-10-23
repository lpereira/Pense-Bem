{
  description = "Simulator of the Tectoy Pense Bem educational toy";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      date = self.lastModifiedDate or "19700101000000";
      day = "${builtins.substring 0 4 date}-${builtins.substring 4 2 date}-${builtins.substring 6 2 date}";
    in {
      packages = nixpkgs.lib.genAttrs systems (system: {
        default = nixpkgs.legacyPackages.${system}.callPackage ./nix/package.nix {
          version = "0-unstable-${day}";
          updated = day;
        };
      });
    };
}
