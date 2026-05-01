{
  pkgs,
  ...
}:
let
  packageJson = builtins.fromJSON (builtins.readFile ./package.json);
  npmScripts = packageJson.scripts or { };

  sanitizeScriptName = name: builtins.replaceStrings [ ":" "/" " " ] [ "-" "-" "-" ] name;

  npmScriptNames = builtins.attrNames npmScripts;
  devenvScriptNames = map (name: "vera-${sanitizeScriptName name}") npmScriptNames;
  uniqueDevenvScriptNames = builtins.attrNames (
    builtins.listToAttrs (
      map (name: {
        inherit name;
        value = true;
      }) devenvScriptNames
    )
  );

  generatedScripts = builtins.listToAttrs (
    map (name: {
      name = "vera-${sanitizeScriptName name}";
      value = {
        exec = "yarn run ${name}";
      };
    }) npmScriptNames
  );
in
assert builtins.length devenvScriptNames == builtins.length uniqueDevenvScriptNames;
{
  cachix.enable = false;
  languages.typescript.enable = true;
  packages = with pkgs; [
    nodejs_24
    yarn
    (python3.withPackages (ps: with ps; [ rembg coverage ]))
  ];

  scripts = generatedScripts;

  enterShell = ''
    echo "Node $(node --version) | Yarn $(yarn --version)"
    echo "devenv scripts are generated from package.json with vera- prefix."
    echo "Example: 'yarn run test:backend' => 'vera-test-backend'"
  '';
}
