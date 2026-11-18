# PetMotion — app

**Cada passeio vira um mapa.** App React Native que registra os passeios de cães e gatos usando só o celular: o caminho no mapa, o tempo, os passos, onde o pet fez xixi, cocô ou bebeu água, além de vacinas com lembrete e conquistas.

> Trabalho da cadeira de Desenvolvimento Mobile. A API, o site e o painel da equipe estão em [petmotion-api](https://github.com/GabrielCordeiroBarrosoTeles/petmotion-api).

## O que o app faz

- **Passeio ao vivo:** contagem 3-2-1, trajeto desenhado pelo GPS, passos, ritmo, pausa e "segure para finalizar".
- **Marcações com um toque:** xixi, cocô e água no ponto exato do mapa.
- **Alerta de asfalto quente:** estima a temperatura do chão antes de sair.
- **Card do passeio** estilo Strava para compartilhar no Instagram ou WhatsApp.
- **Meta diária, sequência de dias e conquistas** com animação e confete.
- **Carteirinha de saúde:** vacinas, vermífugos, remédios e consultas, com lembrete na véspera.
- **Vários pets** na mesma conta, cachorro ou gato.
- **Modo apresentação:** simula o GPS andando (para demonstrar em sala, onde o sinal é fraco).

## Recursos nativos usados

| Recurso | Para quê |
|---|---|
| GPS (`expo-location`) | Trajeto do passeio e clima da região |
| Pedômetro (`expo-sensors`) | Contagem de passos |
| Câmera e galeria (`expo-image-picker`) | Foto do pet |
| Notificações locais (`expo-notifications`) | Passeio em andamento e lembretes de saúde |
| Háptico (`expo-haptics`) | Resposta tátil em toques, marcações e conquistas |
| Captura e compartilhamento (`react-native-view-shot` + `expo-sharing`) | Card do passeio |
| Armazenamento seguro (`expo-secure-store`) | Token de login |

## Stack

Expo SDK 58 · React Native 0.88 · TypeScript · expo-router · styled-components · Reanimated 4 + Moti · Zustand · react-native-maps · Jest + Testing Library.

## Como rodar

```bash
npm install
npx expo start
```

Abra no **Expo Go** com o celular na mesma rede do computador. Sem configurar nada, o app procura a API no IP do computador, na porta 8000. Para apontar para outro endereço, copie `.env.example` para `.env` e preencha `EXPO_PUBLIC_API_URL`.

Conta de demonstração (depois de rodar o seed da API): `gabriel@petmotion.app` / `petmotion`.

## Testes

```bash
npm test                # 242 testes
npm run test:coverage   # falha se qualquer métrica ficar abaixo de 100%
npm run typecheck
```

**Cobertura de 100%** em instruções, ramos, funções e linhas, garantida pelo `coverageThreshold` do Jest.

## Estrutura

```
app/          rotas do expo-router (só reexportam as telas)
src/
  components/ componentes reutilizáveis (index.tsx, styles.ts, types.ts)
  screens/    telas (+ SkeletonLoader/ quando buscam dados)
  hooks/      hooks reutilizáveis
  store/      estado global (zustand), incluindo o rastreador do passeio
  services/   cliente da API e tipos do domínio
  theme/      tokens de cor, tipografia, espaço e movimento
  utils/      formatação, geografia, notificações, háptico
test/         setup do Jest, mocks dos módulos nativos e helpers
```

## Design

Paleta própria tirada do universo do passeio: **bola de tênis** `#C9F24B` (energia, ação), **pinheiro** `#0F2A24` (confiança, substitui o preto), **neblina do parque** `#EEF2EC` (fundo calmo), **língua** `#FF7A8A` (afeto, saúde), **poça** `#7FB8E6` (água) e **sol** `#FFC24D` (conquistas). Tipografia Bricolage Grotesque + Manrope.
