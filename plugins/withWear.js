/**
 * Pluga o app do relógio (../wear, Kotlin + Compose para Wear OS) no projeto Android gerado.
 * O android/ é recriado pelo `expo prebuild`; este plugin garante que o :wear entre sempre.
 */
const { withGradleProperties, withSettingsGradle } = require('expo/config-plugins');

const INCLUDE = "include ':wear'\nproject(':wear').projectDir = new File(rootDir, '../wear')";

/** Memória do Gradle: o padrão (2 GB / 512 MB de Metaspace) estoura com o app do relógio junto. */
const MEMORY = {
  // cabe num Mac de 8 GB: um processo só (Kotlin dentro do Gradle) e 2 tarefas em paralelo
  'org.gradle.jvmargs': '-Xmx3072m -XX:MaxMetaspaceSize=1536m',
  'kotlin.compiler.execution.strategy': 'in-process',
  'org.gradle.workers.max': '2',
};

function withBuildMemory(config) {
  return withGradleProperties(config, (cfg) => {
    for (const [key, value] of Object.entries(MEMORY)) {
      cfg.modResults = cfg.modResults.filter((item) => !(item.type === 'property' && (item.key === key || item.key === 'kotlin.daemon.jvmargs')));
      cfg.modResults.push({ type: 'property', key, value });
    }
    return cfg;
  });
}

module.exports = function withWear(config) {
  config = withBuildMemory(config);
  return withSettingsGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes("include ':wear'")) {
      cfg.modResults.contents += `\n// App do relógio (plugins/withWear.js)\n${INCLUDE}\n`;
    }
    return cfg;
  });
};
