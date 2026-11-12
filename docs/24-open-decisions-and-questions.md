# 24 — Open decisions

These are not blockers for writing the blueprint. They are blockers for treating the matching copy or setting as final. Phase 1 can proceed with the recommended default where one is given, and the checklist still asks the farm to confirm.

| Decision | Recommendation | Blocks |
|---|---|---|
| Hero line and deck | Line approved. Deck: “A farm, its crops, and the journey from the land to the table.” | Launch copy, if the farm wants different words |
| Spelling Raktshali | Use this spelling until the farm corrects it | Crop page title |
| Corner radius 2px | Keep. Pills read as the reference shops | Visual build |
| Fraunces and Outfit | Keep | Visual build |
| Grain is not text | Keep. Measured 2.04:1 on paper | Visual build |
| Rice colour and the word traditional | Do not publish until the farm confirms them | Decided |
| Crop card art | Centred panicle on the blush panel, max 180px | Decided |
| Breakpoint | 1024px everywhere, including the Raktshali page | Decided |
| Strict CSP and no static shell | Keep, for the fraud-protection hosts and the nonce | Performance expectation |
| Password sign-in | On, with lockout, because recovery was required. Email code is the preferred first step | Clerk dashboard |
| Newsletter | Collect addresses. Do not send mail. `/unsubscribe` removes an address without a provider | Decided |
| Reading contact messages | `rga_messages_reader` via `scripts/read-contact-messages.ts`. Not the migration role | Decided |
| Host | Managed Next.js. Provider not chosen | Deploy |
| Database region | A region in India if the operator wants data there. Not chosen | Deploy |
| Rate-limit vendor | Upstash or the host’s firewall. Account not created | Forms in production |
| Hindi or bilingual | English only in Phase 1 | A later project |
| Who may appear in photos | Nobody until a consent exists | Photography |
| Legal review of privacy | Required before production forms collect mail | Production launch |
| First admin email | The operator’s. Not invented here | Clerk dashboard |

Unknown farm facts stay in `15-content-and-asset-inventory.md`. They are not decisions for the implementer to resolve by writing prose.
