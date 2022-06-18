# coc-symbol-line

![demo](https://user-images.githubusercontent.com/47070852/155291646-ec1f5623-63ab-4ff5-a48e-cd9670e5c39e.gif)

## Install

`:CocInstall coc-symbol-line`

## Setup

add section `%{%get(b:, "coc_symbol_line", "")%}` to tabline/statusline or
neovim's winbar

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
vim.o.winbar = '%!v:lua.symbol_line()'

```

</details>

<details>
<summary>My config for neovim</summary>

```lua
function _G.symbol_line()
  local bufnr = vim.api.nvim_win_get_buf(vim.g.statusline_winid or 0)
  local ok, line = pcall(vim.api.nvim_buf_get_var, bufnr, 'coc_symbol_line')
  return ok and '%#CocSymbolLine# ' .. line or ''
end

if vim.fn.exists '&winbar' then
  vim.api.nvim_create_autocmd({ 'CursorHold', 'WinEnter', 'BufWinEnter' }, {
    callback = function()
      if vim.b.coc_symbol_line and vim.bo.buftype == '' then
        if vim.wo.winbar == '' then
          vim.wo.winbar = '%!v:lua.symbol_line()'
        end
      else
        vim.wo.winbar = ''
      end
    end,
  })
end
```

</details>

## Usage

This plugin only provide buffer localed variable `coc_symbol_line`

Left click to jump to the position of this symbol.
Right click to select the range of this symbol.

## Options

- `symbol-line.default`
- `symbol-line.separator`
- `symbol-line.icons`
- `symbol-line.show{Kind}s`
- `symbol-line.onlyNearestKinds`
- `symbol-line.maxItems`
- `symbol-line.maxItemsIndicator`

Please trigger completion in `coc-settings.json` to get details.

## Highlights

- `CocSymbolLine`
- `CocSymbolLineSeparator`
- `CocSymbolLineEllipsis`

You should setup highlights before this extension activated.

---

Most of code is copied from coc.nvim :)
