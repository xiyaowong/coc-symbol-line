hi default link CocSymbolLine              Normal
hi default link CocSymbolLineSeparator     NonText

hi default link CocSymbolLineEllipsis      CocSymbolLine

hi default link CocSymbolLineFile          CocSymbolFile
hi default link CocSymbolLineModule        CocSymbolModule
hi default link CocSymbolLineNamespace     CocSymbolNamespace
hi default link CocSymbolLinePackage       CocSymbolPackage
hi default link CocSymbolLineClass         CocSymbolClass
hi default link CocSymbolLineMethod        CocSymbolMethod
hi default link CocSymbolLineProperty      CocSymbolProperty
hi default link CocSymbolLineField         CocSymbolField
hi default link CocSymbolLineConstructor   CocSymbolConstructor
hi default link CocSymbolLineEnum          CocSymbolEnum
hi default link CocSymbolLineInterface     CocSymbolInterface
hi default link CocSymbolLineFunction      CocSymbolFunction
hi default link CocSymbolLineVariable      CocSymbolVariable
hi default link CocSymbolLineConstant      CocSymbolConstant
hi default link CocSymbolLineBoolean       CocSymbolBoolean
hi default link CocSymbolLineArray         CocSymbolArray
hi default link CocSymbolLineObject        CocSymbolObject
hi default link CocSymbolLineKey           CocSymbolKey
hi default link CocSymbolLineNull          CocSymbolNull
hi default link CocSymbolLineEnumMember    CocSymbolEnumMember
hi default link CocSymbolLineStruct        CocSymbolStruct
hi default link CocSymbolLineEvent         CocSymbolEvent
hi default link CocSymbolLineOperator      CocSymbolOperator
hi default link CocSymbolLineTypeParameter CocSymbolTypeParameter

call coc_symbol_line#set_highlight()
" adjust highlights
call timer_start(3000, { -> coc_symbol_line#set_highlight() })

augroup CocSymbolLine
  autocmd!
  autocmd VimEnter,ColorScheme * call timer_start(3000, { -> coc_symbol_line#set_highlight() })
augroup END
