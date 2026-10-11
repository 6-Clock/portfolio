# Fonts

The hero uses **Relidux** by Chequered Ink (https://www.dafont.com/relidux.font).

## Install the font

1. Download the font from https://www.dafont.com/relidux.font (a `.zip`).
2. Extract it and copy the OpenType file here, named exactly:

   ```
   public/fonts/Relidux.otf
   ```

3. That's it — `@font-face` in `src/style.css` already points at
   `/fonts/Relidux.otf`. Restart `npm run dev` if it was running.

## License

"Free for personal use." Commercial use requires a license from Chequered Ink.
Note that committing the `.otf` to a public repo is a form of redistribution —
confirm that's within the license before pushing it publicly.
