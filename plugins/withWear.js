/**
 * Pluga o app do relógio (../wear, Kotlin + Compose para Wear OS) no projeto Android gerado.
 * O android/ é recriado pelo `expo prebuild`; este plugin garante que o :wear entre sempre.
 */
const { withSettingsGradle } = require('expo/config-plugins');

const INCLUDE = "include ':wear'\nproject(':wear').projectDir = new File(rootDir, '../wear')";

module.exports = function withWear(config) {
  return withSettingsGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes("include ':wear'")) {
      cfg.modResults.contents += `\n// App do relógio (plugins/withWear.js)\n${INCLUDE}\n`;
    }
    return cfg;
  });
};
