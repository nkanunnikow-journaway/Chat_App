# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A React + TypeScript chat application frontend built with Vite and Tailwind CSS v4. It talks to a REST backend (base URL
from `VITE_API_BASE_URL`) for users, chats, and messages. There is no client-side router — screen switching is done via
plain React state in `src/App.tsx`.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`) — use `pnpm`, not `npm`/`yarn`.

- `pnpm install` — install dependencies. Installing `@journaway/eslint-config` and `@journaway/prettier-config` requires
  auth to the GitHub npm registry (personal access token in npm config); see README.md for the setup link.
- `pnpm dev` — start the Vite dev server.
- `pnpm build` — type-check (`tsc -b`) then production build (`vite build`).
- `pnpm preview` — preview a production build locally.
- `pnpm lint` — run ESLint (config extended from `@journaway/eslint-config/react-internal`).

There is no test suite/runner configured in this repo currently.

Environment: requires a `.env` with `VITE_API_BASE_URL` pointing at the backend API (e.g. `http://172.21.9.28:3200`).

## Architecture

**Top-level flow (`src/App.tsx`)**: holds `currentUser` and a `page: 'chat' | 'profile'` state — this is the entire
routing model, no router library is used. Renders, in order of precedence: `ErrorPage` (if the API is unreachable),
`RegisterPage` (if no `currentUser`), `ProfilePage` or `UsersPage` depending on `page`.

**API layer (`src/api/*.tsx`)**: one file per resource (`usersApi`, `chatsApi`, `messagesApi`), each a thin set of
functions wrapping `httpClient` (`src/api/httpClient.tsx`). `httpClient` prefixes every request with
`VITE_API_BASE_URL`, JSON-encodes bodies by default (pass `isFormData=true` to send `FormData` for file uploads
instead), and throws on non-2xx responses. On a network failure (`TypeError: Failed to fetch`) it dispatches a `window`
`api-unreachable` CustomEvent instead of just throwing — `App.tsx` listens for this event and swaps the whole UI to
`ErrorPage`. Any new API call should go through `httpClient` to keep this offline-detection behavior working.

**Types (`src/types/*.tsx`)**: mirror backend DTOs — `users.tsx`, `chats.tsx` (`ChatType = 'DIRECT' | 'GROUP'`,
participants have `role: 'MEMBER' | 'ADMIN'`), `messages.tsx` (messages carry `attachments` of type
`'IMAGE' | 'LOCATION'`). Request/response shapes (`CreateUserRequest`, `CreateChatRequest`, etc.) live alongside the
entity types.

**Pages vs components**: `src/pages/` holds top-level screens (`RegisterPage`, `UsersPage`, `ProfilePage`, `ErrorPage`);
`src/components/` holds the chat UI composed by `UsersPage` — `ChatList` (sidebar: chat list, search, group-creation
trigger, dark-mode/language/logout controls) and `ChatWindow` (message thread), which in turn composes
`src/components/chatWindow/` (`ChatHeader`, `MessageList`, `MessageInput`, `GroupDropdown`). Generic, reusable pieces (
`Avatar`, `ConfirmModal`, `SearchUserInput`) live in `src/components/ui/`.

**Responsive layout**: mobile-first Tailwind classes with `lg:` breakpoints. On small screens `UsersPage` shows either
`ChatList` or `ChatWindow` (never both), toggled by whether `selectedChat` is set (`hidden`/`flex` classes); on `lg:`
screens both are shown side by side. Follow this pattern for new full-screen views rather than introducing separate
mobile components.

**Theming**: colors are CSS variables defined via Tailwind's `@theme` block in `src/index.css` (`--color-primary`,
`--color-bg-app`, etc.), overridden under `[data-theme="dark"]`. Dark mode is toggled by setting `data-theme` on
`document.documentElement` (see `ChatList`'s `toggleDarkMode`) — this is Tailwind's data-attribute variant strategy, not
the `dark:` class strategy, so new dark-mode styling should extend the CSS variables rather than adding `dark:` utility
classes.

**i18n**: `i18next` + `react-i18next`, initialized once in `src/i18n/index.ts` (imported from `main.tsx`), with `en`/
`de` resources in `src/i18n/locales/*.json`. All user-facing strings go through `useTranslation()`'s `t()` — check both
locale files stay in sync when adding new keys. Language is toggled at runtime via `i18n.changeLanguage`.

**Notable libraries**: `lucide-react` for icons, `canvas-confetti` for the registration success animation.

## Add Unit tests

- Whenever you add changes add unit tests and run and make sure the tests passes