hi default link CocSymbolLine              Normal
hi default link CocSymbolLineFile          CocSymbolFile
hi default link CocSymbolLineClass         CocSymbolClass
hi default link CocSymbolLineMethod        CocSymbolMethod
hi default link CocSymbolLineFunction      CocSymbolFunction
hi default link CocSymbolLineStruct        CocSymbolStruct
hi default link CocSymbolLineProperty      CocSymbolProperty
hi default link CocSymbolLineVariable      CocSymbolVariable

call coc_symbol_line#set_highlight()
" adjust highlights
call timer_start(3000, { -> coc_symbol_line#set_highlight() })

augroup CocSymbolLine
  autocmd!
  autocmd VimEnter,ColorScheme * call timer_start(3000, { -> coc_symbol_line#set_highlight() })
augroup END
