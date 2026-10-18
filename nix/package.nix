# The simulator as a package: the built page plus a `pensebem` launcher that
# opens it in the default browser, and a menu entry with an icon.
#
#   nix run github:lpereira/Pense-Bem      run it without installing
#   packages.<system>.default              install it (NixOS, home-manager)
#
# The Makefile is not used as is: it needs Python 2 (bundled scour and
# deindent.py), a 2011 Closure Compiler jar, cpp, `git log`, and PHP for the
# stylesheet. Instead:
#   - the SVG goes through the same scour flags, with nixpkgs' scour and a
#     Python 3 deindent;
#   - the JS is shipped unminified: Closure only shrank it, and the source
#     already exports window.PB_init / window.PB_buttonPress for the SVG;
#   - the two `#include`s are inlined with awk; the footer date is `updated`;
#   - pb-css.php becomes a plain stylesheet with one fixed background pattern
#     (the PHP picked one at random per request);
#   - the Google Analytics snippet is dropped.
#
# Icon (./pense-bem.png): generated with gpt-image-2 (2026-10-18), corners
# rounded and scaled to 256 px with ImageMagick. No official logos.
{ lib, stdenvNoCC, makeWrapper, makeDesktopItem, copyDesktopItems
, python3, xdg-utils
, version ? "0-unstable", updated ? "unknown" }:

stdenvNoCC.mkDerivation {
  pname = "pense-bem";
  inherit version;

  src = ../simulador;

  nativeBuildInputs = [ python3.pkgs.scour python3 makeWrapper copyDesktopItems ];

  buildPhase = ''
    runHook preBuild

    scour -i pensebem-realistic.svg -o pensebem-scoured.svg --create-groups \
      --enable-comment-stripping --remove-metadata --no-renderer-workaround \
      --strip-xml-prolog
    python3 -c 'import sys; from xml.dom.minidom import parse
    sys.stdout.write(parse(sys.argv[1]).toxml().replace("\n", "").replace("<?xml version=\"1.0\" ?>", ""))' \
      pensebem-scoured.svg > pensebem-min.svg
    sed -i -e 's/PB\.init/window.PB_init/g' \
           -e 's/PB\.buttonPress/window.PB_buttonPress/g' \
           -e 's/<script[^>]*>//g' pensebem-min.svg

    echo "${updated}" > last-update.inc
    awk '/^#include "/ { f = $2; gsub(/"/, "", f); while ((getline l < f) > 0) print l; close(f); next } { print }' \
      index.html.in > index.html
    sed -i -e 's/pb-css\.php/pb-css.css/' -e '/var _gaq/,/})();/d' index.html

    sed -e '/^<?php$/,/^?>$/d' -e 's/<?php echo [^?]*?>/156.gif/' \
      html-output/pb-css.php > pb-css.css

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    share=$out/share/pense-bem
    mkdir -p $share
    cp -r html-output/patterns html-output/svg html-output/forkme.png $share/
    cp index.html pb-css.css $share/
    cp pensebem.js $share/pensebem-min.js
    install -Dm644 ${./pense-bem.png} $out/share/icons/hicolor/256x256/apps/pense-bem.png

    makeWrapper ${xdg-utils}/bin/xdg-open $out/bin/pensebem \
      --add-flags "file://$share/index.html"

    runHook postInstall
  '';

  desktopItems = [
    (makeDesktopItem {
      name = "pense-bem";
      desktopName = "Pense Bem";
      comment = "Simulator of the Tectoy Pense Bem educational toy";
      exec = "pensebem";
      icon = "pense-bem";
      categories = [ "Game" "Education" ];
    })
  ];

  meta = {
    description = "Web simulator of the Tectoy Pense Bem educational toy";
    homepage = "https://github.com/lpereira/Pense-Bem";
    license = lib.licenses.beerware;
    platforms = lib.platforms.linux;
    mainProgram = "pensebem";
  };
}
