function! coc_symbol_line#click(minwid, clicks, mouse, modifiers)
  call CocAction('runCommand', 'symbol-line._click', a:minwid, a:mouse)
endfunction

function! s:get_hl_attr(groups, attr)
  for group in a:groups
    let ret = synIDattr(synIDtrans(hlID(group)), a:attr)
    if ret != ''
      return ret
    endif
  endfor
endfunction

function! coc_symbol_line#set_highlight()
  let bg = s:get_hl_attr(['CocSymbolLine'], 'bg')

  exe 'hi! CocSymbolLineSeparator  guifg='.s:get_hl_attr(['CocSymbolLineSeparator', 'CocSymbolLine'], 'fg') .' guibg='.bg

  exe 'hi! CocSymbolLineFile       guifg='.s:get_hl_attr(['CocSymbolFile', 'Statement'], 'fg')              .' guibg='.bg
  exe 'hi! CocSymbolLineClass      guifg='.s:get_hl_attr(['CocSymbolClass', 'TSType'], 'fg')                .' guibg='.bg
  exe 'hi! CocSymbolLineMethod     guifg='.s:get_hl_attr(['CocSymbolMethod', 'TSMethod'], 'fg')             .' guibg='.bg
  exe 'hi! CocSymbolLineFunction   guifg='.s:get_hl_attr(['CocSymbolFunction', 'TSFunction'], 'fg')         .' guibg='.bg
  exe 'hi! CocSymbolLineStruct     guifg='.s:get_hl_attr(['CocSymbolStruct', 'TSStrucure'], 'fg')           .' guibg='.bg
  exe 'hi! CocSymbolLineProperty   guifg='.s:get_hl_attr(['CocSymbolProperty', 'TSProperty'], 'fg')         .' guibg='.bg
  exe 'hi! CocSymbolLineVariable   guifg='.s:get_hl_attr(['CocSymbolVariable', 'TSVariable'], 'fg')         .' guibg='.bg
endfunction
