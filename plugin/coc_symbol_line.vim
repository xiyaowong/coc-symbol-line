if exists('g:loaded_coc_symbol_line') | finish | endif
let g:loaded_coc_symbol_line = 1

function! g:CocSymbolLineClick(minwid, clicks, mouse, modifiers)
  call CocAction('runCommand', 'symbol-line._click', a:minwid)
endfunction

hi default link CocSymbolLine              Normal
hi default link CocSymbolLineFile          CocSymbolFile
hi default link CocSymbolLineClass         CocSymbolClass
hi default link CocSymbolLineMethod        CocSymbolMethod
hi default link CocSymbolLineFunction      CocSymbolFunction
hi default link CocSymbolLineStruct        CocSymbolStruct
hi default link CocSymbolLineProperty      CocSymbolProperty
hi default link CocSymbolLineVariable      CocSymbolVariable


function! s:get_hl_attr(groups, attr)
  for group in a:groups
    let ret = synIDattr(synIDtrans(hlID(group)), a:attr)
    if ret != ''
      return ret
    endif
  endfor
endfunction

function! s:set_highlight()
  let bg = s:get_hl_attr(['CocSymbolLine'], 'bg')

  exe 'hi! CocSymbolLineFile      guifg='.s:get_hl_attr(['CocSymbolFile', 'Statement'], 'fg')      .' guibg='.bg
  exe 'hi! CocSymbolLineClass     guifg='.s:get_hl_attr(['CocSymbolClass', 'TSType'], 'fg')        .' guibg='.bg
  exe 'hi! CocSymbolLineMethod    guifg='.s:get_hl_attr(['CocSymbolMethod', 'TSMethod'], 'fg')     .' guibg='.bg
  exe 'hi! CocSymbolLineFunction  guifg='.s:get_hl_attr(['CocSymbolFunction', 'TSFunction'], 'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineStruct    guifg='.s:get_hl_attr(['CocSymbolStruct', 'TSStrucure'], 'fg')   .' guibg='.bg
  exe 'hi! CocSymbolLineProperty  guifg='.s:get_hl_attr(['CocSymbolProperty', 'TSProperty'], 'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineVariable  guifg='.s:get_hl_attr(['CocSymbolVariable', 'TSVariable'], 'fg') .' guibg='.bg
endfunction

call s:set_highlight()

" adjust highlights
call timer_start(3000, { -> s:set_highlight() })

augroup CocSymbolLine
  autocmd!
  autocmd VimEnter,ColorScheme * call <sid>set_highlight()
augroup END
