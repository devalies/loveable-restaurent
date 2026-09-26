<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep this restaurant as a TanStack Start application with Lovable Cloud for persistent content; this workspace cannot run Laravel/PHP.
- Store business facts centrally in `src/lib/restaurant.ts` and public content in Cloud tables; this prevents conflicting details and enables staff updates.
- Grant admin privileges only through the separate `user_roles` table after owner identity is verified; self-registration must never grant administration.
