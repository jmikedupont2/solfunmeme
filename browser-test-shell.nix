{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs
    firefox
    geckodriver
  ];
  
  shellHook = ''
    echo "🦊 Firefox Headless Testing Environment"
    echo ""
    echo "Available commands:"
    echo "  geckodriver --version"
    echo "  firefox --version"
    echo "  node scripts/bench-browser-simple.js"
    echo ""
  '';
}
