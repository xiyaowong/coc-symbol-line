# coc-symbol-line(WIP)

![demo](https://user-images.githubusercontent.com/47070852/155291646-ec1f5623-63ab-4ff5-a48e-cd9670e5c39e.gif)

This plugin is an attempt to [neovim's winbar](https://github.com/neovim/neovim/pull/17336)

It can be used for tabline&statusline. Should support both neovim and vim.

## Install

`:CocInstall coc-symbol-line`

## Setup

add section `%{%get(b:, "coc_symbol_line", "")%}` to tabline/statusline

<details>
<summary>lua snippet for neovim</summary>

```lua
function _G.symbol_line()
  local curwin = vim.g.statusline_winid or 0
  local curbuf = vim.api.nvim_win_get_buf(curwin)
  local ok, line = pcall(vim.api.nvim_buf_get_var, curbuf, 'coc_symbol_line')
  return ok and line or ''
end

vim.o.tabline = '%!v:lua.symbol_line()'
vim.o.statusline = '%!v:lua.symbol_line()'

```

</details>

## Highlights

- `CocSymbolLine`

Most of code is copied from coc.nvim :)
