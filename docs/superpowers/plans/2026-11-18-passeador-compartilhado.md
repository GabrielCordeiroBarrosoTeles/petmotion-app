# Passeador compartilhado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O pai/mãe de pet compartilha um pet com um passeador por QR code ou link; o passeador aceita e passa a passear com ele; quando o passeador começa, o pai/mãe de pet é avisado e acompanha o passeio ao vivo.

**Architecture:** Papel por pet, não por conta: o dono continua em `pets.user_id`; passeadores ficam em `pet_walkers`. Convites (`pet_invites`) de uso único e com validade. O passeio ao vivo é efêmero: o celular do passeador manda o estado para a API (`/api/live/...`), a API guarda o último estado no cache e transmite pelo Laravel Reverb no canal privado `pet.{id}`, que só o dono pode ouvir. O app fala o protocolo Pusher direto num `WebSocket` (sem lib), autenticando o canal em `/api/broadcasting/auth` com o token Sanctum.

**Tech Stack:** Laravel 13 + Reverb + Sanctum (petmotion-api); Expo SDK 58 / RN 0.88, `react-native-qrcode-svg`, `expo-camera` (leitura de QR), `expo-notifications` (aviso local) (petmotion-app).

**Spec:** a conversa de 18/11/2026 (Gabriel), incluindo o **passeio em grupo**: o pai/mãe de pet com 2+ pets passeia com todos de uma vez, e o passeador leva juntos pets de donos diferentes (ex.: 2 da Ana + 1 do Carlos). Conversa original: botão "Compartilhar com passeador" no pet → folha de baixo com QR code + botão que envia o QR e um link; quem lê/abre aceita e o pet fica salvo para ele; quando o passeador passeia, notificação para o pai/mãe de pet, que pode ver ao vivo "por socket". Nomes decididos: **"pai/mãe de pet"** (dono) e **"passeador"** (quem leva). Push com o app fechado (Firebase) fica para o fim: o Gabriel faz o passo a passo do Firebase depois que o código estiver pronto.

## Global Constraints

- Dono = `pets.user_id`. Passeador = linha em `pet_walkers (pet_id, user_id)`. Um usuário pode ser dono de uns pets e passeador de outros na mesma conta.
- Recurso de outra pessoa continua respondendo **404** (não 403), como no resto da API.
- Convite: código de 8 caracteres `[A-Z0-9]` sem ambíguos (sem `0 O 1 I`), validade **48 h**, **uso único**. Link público: `{APP_URL}/convite/{code}`; deep link do app: `petmotion://convite/{code}`.
- O passeador **não vê** a saúde do pet (lista, cadastro, próximos cuidados) nem edita/remove o pet. Ele vê e cria passeios do pet.
- O pai/mãe de pet vê **todos** os passeios do pet (de quem quer que tenha passeado); o passeador vê só os que **ele** fez.
- Canal ao vivo: `private-pet.{petId}`, autorizado só para o dono. Estado ao vivo no cache em `live:pet:{petId}`, TTL 3 h.
- **Passeio em grupo:** um passeio pode levar vários pets (o `POST /api/walks` já aceita `companion_ids` e grava um registro por pet com o mesmo `group_id`). Cada pet do grupo precisa ser `canBeWalkedBy` quem passeia. Cada dono só enxerga os pets dele: `companions` no JSON lista só os pets que quem pergunta pode ver. No ao vivo, uma sessão cobre todos os pets do grupo e cada dono recebe só os pets dele.
- Textos: "pai/mãe de pet" e "passeador" no app e no monitor (o monitor "Tutores" vira "Pais de pet"). Voz do app: frases curtas, benefício, sem jargão.
- 100% de cobertura nos dois projetos (CLAUDE.md §14). Sem `Alert.alert` (usar `confirmAction`), sem `style={{}}`, tokens + `RFValue`.

## Review Focus

- Convite vencido, já usado, inexistente ou aberto pelo próprio dono: mensagem clara, nada é gravado.
- Passeador removido no meio de um passeio: o `finish` ainda salva o passeio já feito? Esperado: **sim** (o passeio aconteceu); novos passeios dão 404.
- Dois passeadores (ou dono + passeador) passeando o mesmo pet ao mesmo tempo: o estado ao vivo é do último que começou; o `finish` de uma sessão antiga não apaga a nova.
- Dono abre "ao vivo" depois que o passeio acabou ou antes de começar: tela diz "Nenhum passeio agora" em vez de mapa vazio.
- Passeio em grupo com pets de dois donos: a Ana não pode ver o pet do Carlos (nem no `companions`, nem no ao vivo), e cada um recebe só o aviso dos seus.
- Socket cai (túnel, 4G): o app reconecta e reassina sem duplicar inscrições; enquanto cai, a tela ao vivo continua com o último estado do `GET /live`.

---

## File Structure

**petmotion-api**
- `database/migrations/2026_11_18_140000_create_pet_walkers_and_invites.php` — `pet_walkers`, `pet_invites`.
- `app/Models/PetInvite.php` — convite (`isUsable()`, `generateCode()`).
- `app/Models/Pet.php` — `walkers()`, `isOwnedBy()`, `canBeWalkedBy()`, scope `accessibleBy()`.
- `app/Models/User.php` — `walkingPets()`.
- `app/Http/Controllers/Api/InviteController.php` — criar, ver, aceitar.
- `app/Http/Controllers/Api/WalkerController.php` — listar e remover passeadores.
- `app/Http/Controllers/Api/LiveWalkController.php` — start / progress / finish / cancel / show.
- `app/Services/LiveWalkStore.php` — leitura/escrita do estado ao vivo no cache.
- `app/Events/LiveWalkUpdated.php` — `ShouldBroadcastNow` em `private-pet.{id}`.
- `routes/api.php`, `routes/channels.php`, `bootstrap/app.php` (broadcasting com `auth:sanctum`).
- Controllers existentes: `PetController`, `WalkController`, `StatsController`, `HealthRecordController`.
- `resources/views/invite.blade.php` + rota web `/convite/{code}` — página “Abra no app”.
- Monitor: textos "Tutores" → "Pais de pet".
- `infra/docker-compose.yml`, `infra/nginx.conf`, `infra/.env.example` — container `petmotion-reverb` (porta 8096, sem publicar) e proxy `/app` + `/apps` com upgrade de WebSocket.

**petmotion-app**
- `src/services/types.ts` — `Pet.role`, `Pet.owner_name`, `Walk.walker`, `Invite*`, `LiveWalk`.
- `src/services/api.ts` — endpoints novos.
- `src/services/realtime.ts` — cliente Pusher mínimo sobre `WebSocket`.
- `src/hooks/useLiveBroadcast.ts` — passeador: manda o estado (start/progress/finish/cancel).
- `src/hooks/useOwnerLive.ts` — dono: assina os pets, avisa quando sai passeio.
- `src/components/InviteSheet/` — folha de baixo: QR, código, "Enviar convite", lista de passeadores.
- `src/screens/Invite/` (+ `app/convite/[code].tsx`) — prévia e aceite.
- `src/screens/ScanInvite/` (+ `app/scan-invite.tsx`) — câmera lendo QR.
- `src/screens/LiveWalk/` (+ `app/live/[id].tsx`) — mapa ao vivo para o dono.
- Ajustes: `Home`, `Profile`, `PetForm`, `Health`, `History`/`WalkRow`, `Root`.

---

### Task 1: API — papéis por pet e convites

**Files:**
- Create: migração, `app/Models/PetInvite.php`, `app/Http/Controllers/Api/InviteController.php`, `app/Http/Controllers/Api/WalkerController.php`, `tests/Feature/Api/InviteTest.php`
- Modify: `app/Models/Pet.php`, `app/Models/User.php`, `routes/api.php`, `tests/TestCase.php` (helper `makeWalker(Pet $pet): User`)

**Interfaces:**
- Produces: `Pet::isOwnedBy(User): bool`, `Pet::canBeWalkedBy(User): bool` (dono ou passeador), `Pet::scopeAccessibleBy(Builder, User)`, `Pet::walkers(): BelongsToMany`, `User::walkingPets(): BelongsToMany`.
- Produces (HTTP):
  - `POST /api/pets/{pet}/invites` (dono) → 201 `{code, url, expires_at}`
  - `GET /api/invites/{code}` → 200 `{code, expires_at, pet:{id,name,species,photo_url}, owner:{name}}`; 404 inexistente/vencido/usado; 422 `{error:"own_pet"}` se quem abre é o dono
  - `POST /api/invites/{code}/accept` → 200 pet (com `role:"walker"`); mesmos erros; aceitar de novo quando já é passeador → 200 sem duplicar
  - `GET /api/pets/{pet}/walkers` (dono) → `[{id,name}]`; `DELETE /api/pets/{pet}/walkers/{user}` (dono) → 204

- [ ] **Step 1: Testes que falham** em `InviteTest`: `test_owner_creates_invite_with_48h_code`, `test_non_owner_cannot_create_invite` (404, inclusive passeador), `test_preview_shows_pet_and_owner_name`, `test_preview_rejects_expired_used_unknown` (404 cada), `test_owner_opening_own_invite_gets_own_pet_error` (422), `test_accept_makes_user_walker_and_burns_code` (segundo usuário aceitando o mesmo código → 404), `test_accept_twice_by_same_walker_is_idempotent`, `test_owner_lists_and_removes_walkers` (passeador removido some da lista), `test_walker_cannot_list_or_remove_walkers` (404). Código: `assertMatchesRegularExpression('/^[A-HJ-NP-Z2-9]{8}$/', $code)`; `expires_at` = agora + 48 h (`Carbon::setTestNow`).
- [ ] **Step 2:** `php artisan test --filter=InviteTest` → FAIL (rotas inexistentes).
- [ ] **Step 3:** migração (`pet_walkers`: `pet_id` FK cascade, `user_id` FK cascade, unique par, timestamps; `pet_invites`: `pet_id` FK cascade, `code` unique, `created_by` FK users, `expires_at`, `accepted_by` nullable FK, `accepted_at` nullable), models, controllers e rotas. `PetInvite::generateCode()` usa `Str::random` sobre o alfabeto acima com retry em colisão.
- [ ] **Step 4:** `php artisan test` → PASS (suíte inteira).
- [ ] **Step 5:** commit `feat(api): convites e passeadores por pet`.

### Task 2: API — o resto da API respeita o papel

**Files:**
- Modify: `PetController` (index devolve próprios + de passeio com `role` e `owner_name`; show/update/destroy do passeador → 404), `WalkController` (store aceita pets de passeio; index com `pet_id`: dono vê todos do pet, passeador só os dele; show: dono do pet ou quem passeou; destroy: dono do pet ou quem passeou; walks trazem `walker:{id,name}`), `StatsController` (passeador: 200 com `upcoming_care: []`), `HealthRecordController` (passeador → 404), `app/Models/Pet.php` (`role`/`owner_name` calculados por request — via `setAttribute` no controller, não `$appends`)
- Test: `tests/Feature/Api/WalkerAccessTest.php`

**Interfaces:**
- Consumes: Task 1 (`isOwnedBy`, `canBeWalkedBy`, `accessibleBy`).
- Produces: `GET /api/pets` itens com `role: "owner"|"walker"` e `owner_name` (só no `walker`); walk JSON com `walker: {id, name}`.

- [ ] **Step 1: Testes que falham:** `test_walker_group_walk_with_pets_of_two_owners` (passeador do Thor e da Mel da Ana e do Bidu do Carlos salva um passeio com os três: 3 registros, mesmo `group_id`; pet que ele não passeia no grupo → 404 e nada gravado), `test_companions_only_lists_pets_the_viewer_can_see` (a Ana vê o Thor com `companions` = [Mel], sem o Bidu), `test_pets_index_lists_owned_and_walking_with_role`, `test_walker_can_walk_shared_pet` (POST /walks 201 e `walks.user_id` = passeador), `test_removed_walker_cannot_start_new_walk` (404), `test_owner_sees_all_walks_of_pet_walker_sees_only_his`, `test_walker_cannot_see_health_or_edit_pet` (health index/store 404; PUT/DELETE pet 404), `test_walker_stats_hide_upcoming_care`, `test_walk_json_has_walker_name`.
- [ ] **Step 2:** rodar → FAIL. **Step 3:** implementar. **Step 4:** `php artisan test` → PASS. Quebrar de propósito a checagem do passeador no `store` e confirmar que `test_removed_walker_cannot_start_new_walk` falha; desfazer.
- [ ] **Step 5:** commit `feat(api): passeador passeia, dono vê tudo, saúde só do dono`.

### Task 3: API — passeio ao vivo com Reverb

**Files:**
- Create: `app/Services/LiveWalkStore.php`, `app/Events/LiveWalkUpdated.php`, `app/Http/Controllers/Api/LiveWalkController.php`, `routes/channels.php`, `tests/Feature/Api/LiveWalkTest.php`
- Modify: `composer.json` (`laravel/reverb`), `config/broadcasting.php`, `config/reverb.php`, `bootstrap/app.php` (`withBroadcasting(__DIR__.'/../routes/channels.php', ['prefix' => 'api', 'middleware' => ['auth:sanctum']])`), `routes/api.php`, `phpunit.xml` (`BROADCAST_CONNECTION=null`), `.env.example`

**Interfaces:**
- Produces (HTTP, todos `auth:sanctum`, quem chama precisa `canBeWalkedBy`):
  - `POST /api/live/start {pet_ids:[...]}` → 201 `{session}` (uuid); para **cada** pet grava o estado `{session, status:"running", walker:{id,name}, pet_id, pet_names (só os pets do mesmo dono), started_at, elapsed_ms:0, at, distance:0, steps:0, points:[], counts:{pee,poop,water}}` e transmite no canal daquele pet
  - `POST /api/live/{session}/progress {pet_ids, status, elapsed_ms, distance, steps, points:[[lat,lng]], counts}` → 204; `points` são **novos** pontos (o servidor acumula, máx. 2000)
  - `POST /api/live/{session}/finish {walks:[{pet_id, walk_id}]}` → 204; o estado de cada pet vira `{status:"finished", walk_id}` (o registro **daquele** pet) e fica 10 min
  - `POST /api/live/{session}/cancel {pet_ids}` → 204; estados removidos
  - `GET /api/pets/{pet}/live` (dono) → 200 estado ou 204 sem passeio
  - Sessão diferente da atual → 409 (não sobrescreve a mais nova)
- Produces (socket): evento `live.updated` em `private-pet.{petId}` com o estado inteiro (sem `points` acumulados no progress: manda só os novos em `new_points`, o resto igual).
- `LiveWalkStore::get(int $petId): ?array`, `put(int $petId, array $state): void`, `forget(int $petId): void` (cache, TTL 3 h; `finished` 10 min).

- [ ] **Step 1: Testes que falham** (com `Event::fake([LiveWalkUpdated::class])`): `test_walker_starts_live_and_owner_reads_it`, `test_progress_appends_points_and_broadcasts_new_ones` (`Event::assertDispatched` com `new_points`), `test_finish_keeps_walk_id_for_owner`, `test_cancel_clears_state`, `test_stale_session_gets_409`, `test_group_session_broadcasts_each_owner_only_their_pets` (Thor e Mel da Ana + Bidu do Carlos: o canal do Bidu nunca recebe nomes da Ana e vice-versa), `test_stranger_gets_404_everywhere`, `test_channel_authorizes_only_owner` (POST `/api/broadcasting/auth` com `BROADCAST_CONNECTION=reverb` de teste: dono 200, passeador e estranho 403).
- [ ] **Step 2:** FAIL. **Step 3:** instalar `laravel/reverb` (`/opt/homebrew/opt/php/bin/php $(which composer) require laravel/reverb`), configurar, implementar. **Step 4:** `php artisan test` → PASS.
- [ ] **Step 5:** commit `feat(api): passeio ao vivo (Reverb)`.

### Task 4: API — página do link, monitor e deploy do Reverb

**Files:**
- Create: `resources/views/invite.blade.php`, `tests/Feature/Web/InvitePageTest.php`
- Modify: `routes/web.php` (`GET /convite/{code}`), views do monitor (Tutores → Pais de pet; detalhe do passeio mostra o passeador quando não é o dono), `infra/docker-compose.yml` (serviço `petmotion-reverb`: mesma imagem do php, `php artisan reverb:start --host=0.0.0.0 --port=8096`, só na rede interna), `infra/nginx.conf` (`location ~ ^/(app|apps)/` → `proxy_pass http://petmotion-reverb:8096` com `Upgrade`/`Connection`), `infra/.env.example` (`BROADCAST_CONNECTION=reverb`, `REVERB_*`, host público `petmotion.tolembrado.com.br`, porta 443, `https`), `infra/README.md`

- [ ] **Step 1: Testes que falham:** `test_invite_page_shows_pet_and_open_in_app_link` (contém `petmotion://convite/{code}` e o nome do pet, sem dados do dono além do primeiro nome), `test_invite_page_for_bad_code_says_expired` (200 com texto "Esse convite não vale mais"), `test_monitor_uses_pais_de_pet`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar (página na identidade do site: fundo pinheiro, bola, botão primário "Abrir no PetMotion"). **Step 4:** PASS. Subir local com `docker compose` simulando a rede `tolembrado` e conferir `wss://…/app/{key}` respondendo `pusher:connection_established`.
- [ ] **Step 5:** commit `feat: página do convite, monitor com Pais de pet, Reverb no deploy`.

### Task 5: App — tipos, API e cliente de tempo real

**Files:**
- Modify: `src/services/types.ts`, `src/services/api.ts`
- Create: `src/services/realtime.ts`, `src/services/__tests__/realtime.test.ts`; testes novos em `api.test.ts`

**Interfaces:**
- Produces (types): `PetRole = 'owner' | 'walker'`; `Pet.role: PetRole`, `Pet.owner_name?: string`; `Walk.walker?: { id: number; name: string }`; `Invite = { code; url; expires_at }`; `InvitePreview = { code; expires_at; pet: Pick<Pet,'id'|'name'|'species'|'photo_url'>; owner: { name } }`; `Walker = { id; name }`; `LiveWalk` (estado da Task 3, `new_points?: LatLng[]`).
- Produces (api): `createInvite(petId)`, `invite(code)`, `acceptInvite(code)`, `walkers(petId)`, `removeWalker(petId, userId)`, `liveStart(petIds)`, `liveProgress(session, payload)`, `liveFinish(session, walks: {pet_id, walk_id}[])`, `liveCancel(session, petIds)`, `live(petId): Promise<LiveWalk | null>` (204 → null).
- Produces (realtime): `createRealtime({ url, key, authorize }): { subscribe(channel: string, event: string, cb: (data) => void): () => void; close(): void }` — `authorize(socketId, channel) => Promise<string>` chama `POST /broadcasting/auth`. Protocolo Pusher 7: espera `pusher:connection_established` (pega `socket_id`), manda `pusher:subscribe {channel, auth}`, responde `pusher:ping` com `pusher:pong`, reconecta com espera crescente (1 s, 2 s, 4 s… máx. 30 s) e reassina tudo; `close()` não reconecta. URL vem de `EXPO_PUBLIC_REVERB_URL`/`EXPO_PUBLIC_REVERB_KEY` (sem elas: derivada de `siteUrl`, `wss://<host>/app/<key>`).

- [ ] **Step 1: Testes que falham** com um `WebSocket` falso global: `subscribes_after_connection_with_auth`, `delivers_events_parsed`, `answers_ping`, `reconnects_with_backoff_and_resubscribes`, `unsubscribe_stops_delivery`, `close_does_not_reconnect`, `auth_failure_drops_only_that_channel`; e em `api.test.ts` `live returns null on 204`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm run test:coverage` → 100%.
- [ ] **Step 5:** commit `feat(app): tipos, endpoints e cliente realtime`.

### Task 6: App — compartilhar (folha com QR) e aceitar (link e câmera)

**Files:**
- Create: `src/components/InviteSheet/{index,styles,types}.tsx`, `src/screens/Invite/` (+ `SkeletonLoader/`), `src/screens/ScanInvite/`, rotas `app/convite/[code].tsx`, `app/scan-invite.tsx`; testes `src/components/__tests__/invite-sheet.test.tsx`, `src/screens/__tests__/invite.test.tsx`
- Modify: `app.json` (plugin `expo-camera` com texto de permissão em pt-BR), `src/screens/Root/index.tsx` (rotas: `convite/[code]` modal, `scan-invite` fullScreenModal), `src/screens/PetForm/index.tsx` (editando como dono: botão ghost "Compartilhar com passeador" abre o `InviteSheet`), `src/screens/Profile/index.tsx` (linha "Recebi um convite" → `/scan-invite`), `src/store/pets.ts` (recarregar após aceitar)

**Interfaces:**
- Consumes: Task 5 (`createInvite`, `invite`, `acceptInvite`, `walkers`, `removeWalker`).
- Produces: `<InviteSheet pet visible onClose />`; `parseInviteCode(text: string): string | null` em `src/utils/invite.ts` (aceita o código puro, `petmotion://convite/X` e `https://…/convite/X`; normaliza para maiúsculas; rejeita o resto).

- [ ] **Step 1: Testes que falham:** `parseInviteCode` (os três formatos, minúsculas, lixo → null); `InviteSheet`: cria convite ao abrir, mostra QR com a URL e o código, "Enviar convite" chama `Share.share` com mensagem "Oi! Quero que você passeie com o Thor no PetMotion. Abra: <url>", lista passeadores e remove com `confirmAction`; `Invite`: prévia "Ana quer que você passeie com o Thor", aceitar → toast de sucesso + `router.replace('/home')` + pet na lista; convite inválido → estado "Esse convite não vale mais"; `own_pet` → "Esse pet já é seu"; `ScanInvite`: leitura válida navega para `/convite/CODE`, inválida mostra aviso e continua lendo, sem permissão mostra botão "Permitir câmera".
- [ ] **Step 2:** FAIL. **Step 3:** `npx expo install react-native-qrcode-svg expo-camera`; implementar (folha igual à `ConfirmSheet`: `Modal` transparente, pinheiro, sobe em mola, QR em fundo `surface` com borda `primary`). **Step 4:** `npm run test:coverage` → 100%, `npm run typecheck`.
- [ ] **Step 5:** commit `feat(app): compartilhar pet com passeador por QR e link`.

### Task 7: App — passeador transmite, pai/mãe de pet acompanha

**Files:**
- Create: `src/hooks/useLiveBroadcast.ts`, `src/hooks/useOwnerLive.ts`, `src/store/live.ts`, `src/screens/LiveWalk/` (+ rota `app/live/[id].tsx`); testes `src/hooks/__tests__/live.test.tsx`, `src/screens/__tests__/live-walk.test.tsx`
- Create: `src/screens/Walk/CrewPicker/` ("Quem vai junto?": antes de começar, todos os pets que eu posso passear, agrupados por dono — "Seus pets", "Da Ana", "Do Carlos" —, o pet selecionado já marcado, toque marca/desmarca, mínimo 1)
- Modify: `src/store/walk.ts` (`petIds: number[]` no lugar de `petId`; `finish()` devolve `pet_id` = o primeiro e `companion_ids` = os outros), `src/screens/Walk/index.tsx` (título "Pronto pra sair com Thor, Mel e Bidu?", "Passeando com …", transmissão ao vivo de todos os pets que não são meus), `src/screens/WalkSummary` e `WalkShareCard` ("Passeio de Thor, Mel e Bidu", avatares sobrepostos), `src/utils/format.ts` (`joinNames(['Thor','Mel','Bidu'])` → "Thor, Mel e Bidu"), `src/screens/Root/index.tsx` (`useOwnerLive()` quando logado), `src/screens/Home/index.tsx` (banner "Thor está passeando com João · Ver ao vivo" quando houver estado ao vivo do pet selecionado; pet de passeio mostra "Pet da Ana"), `src/screens/Health/index.tsx` (pet de passeio: EmptyState "A saúde do Thor fica com a Ana"), `src/components/PetSwitcher` (selo pequeno "Passeio" nos pets de passeio), `src/screens/History/WalkRow` (“com João” quando `walker.id` ≠ eu)

**Interfaces:**
- Consumes: Tasks 5–6.
- Produces: `useLive` (zustand) `{ byPet: Record<number, LiveWalk>; set(petId, state); clear(petId) }`.
- `useLiveBroadcast()` (no `WalkScreen`, só com os pets do grupo cujo `role === 'walker'`; passeio só com pets meus não transmite): `start` ao começar, `progress` no máx. a cada **5 s** com os pontos novos desde o último envio, `finish(walkId)` ao salvar, `cancel` ao descartar; falha de rede não trava o passeio (só tenta de novo no próximo envio).
- `useOwnerLive()`: assina `private-pet.{id}` de todo pet `role==='owner'`; ao receber `running` de sessão nova → notificação local (`scheduleNotificationAsync` imediata) "O Thor saiu para passear com o João" + toast; toque abre `/live/{id}`; `finished` → notificação "O Thor voltou: 2,1 km em 42 min".
- `LiveWalkScreen`: carrega `api.live(id)`, aplica eventos do `useLive`, mostra `RouteMap follow`, cronômetro andando sozinho (`elapsed_ms` + agora − `at`), km, passos, marcações, "com João"; sem passeio → "Nenhum passeio agora"; `finished` → "Passeio concluído" + botão "Ver passeio" (`/walks/{walk_id}`).

- [ ] **Step 1: Testes que falham:** `joinNames` (1, 2 e 3 nomes); CrewPicker (agrupa por dono, mínimo 1, sem outros pets não aparece); passeio em grupo salva `companion_ids` e o resumo diz "Passeio de Thor, Mel e Bidu"; broadcast (start só com os pets de passeio, progress agrupa em 5 s e manda só pontos novos, finish com `walk_id`, cancel no descartar, erro de rede não quebra); owner (assina só pets do dono, notifica em sessão nova e não repete na mesma, finished notifica com km/min, desassina ao sair); LiveWalk (os três estados, cronômetro anda, evento novo acrescenta pontos); Home/Health/PetSwitcher/WalkRow com pet de passeio.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm run test:coverage` → 100%, `npm run typecheck`, `npx expo export --platform android`.
- [ ] **Step 5:** commit `feat(app): passeio em grupo e ao vivo para o pai/mãe de pet`.

### Task 8: Ponta a ponta, deploy e documentação

- [ ] **Step 1:** seed: conta `joao@passeador.app` (senha `petmotion`) já passeador do Thor; um passeio do Thor feito pelo João.
- [ ] **Step 2:** deploy na VPS (`git pull` + `./deploy.sh`), conferir `wss://petmotion.tolembrado.com.br/app/<key>` e `GET /api/health`.
- [ ] **Step 3:** teste real com dois celulares: Gabriel compartilha, João lê o QR, passeia; o Gabriel recebe o aviso e vê o mapa andando.
- [ ] **Step 4:** CLAUDE.md (papéis, convite, ao vivo, Reverb, novas rotas e telas) e política de privacidade (o pai/mãe de pet vê o trajeto feito pelo passeador; o passeador vê nome e foto do pet).
- [ ] **Step 5:** commit + push dos dois repositórios; entregar ao Gabriel o passo a passo do Firebase (push com o app fechado).

### Task 9: Refazer a apresentação

O deck (https://claude.ai/code/artifact/6ffbb9bd-93e3-4514-9ab9-70529556a040) é refeito com o produto novo, mantendo a identidade (pinheiro, neblina, bola, Bricolage + Manrope):

- [ ] **Step 1:** história da Ana como fio condutor: a dor ("confio meu cachorro a alguém e não vejo nada"), para quem (pai/mãe de pet que contrata passeador, família, vizinho; e o passeador, que ganha prova do serviço), a ideia, o fluxo (compartilhar por QR → aceitar → passear → aviso + ao vivo), passeio em grupo.
- [ ] **Step 2:** **slide do relógio refeito para ser o mais chamativo do deck:** celular e relógio desenhados em SVG (com o passeio na tela dos dois, a mesma cara do app), a ponte entre eles animada (pontos andando de um para o outro), e a explicação em 3 passos curtos (JS → módulo Kotlin → Data Layer → relógio; e o toque voltando).
- [ ] **Step 3:** slide do ao vivo (celular do passeador → Reverb → celular do pai/mãe de pet), bastidores (Laravel API + Reverb + monitor Blade) e qualidade com os números reais finais.
