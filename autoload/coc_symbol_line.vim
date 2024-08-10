function! coc_symbol_line#click(minwid, clicks, mouse, modifiers)
  call CocAction('runCommand', 'symbol-line._click', a:minwid, a:mouse)
endfunction

function! coc_symbol_line#expand(minwid, clicks, mouse, modifiers)
  let line = get(b:, 'coc_symbol_line', '')
  let b:coc_symbol_line = get(b:, 'coc_symbol_line_full', line)
  redraw
endfunction

function! s:a(groups, attr) " get gui attribute of highlight
  let attr = a:attr =~ '#$' ? a:attr : a:attr.'#'

  for group in a:groups
    let ret = synIDattr(synIDtrans(hlID(group)), attr)
    if ret =~ '^#'
      return ret
    endif
  endfor

  if attr =~ '^fg'
    return 'white'
  endif

  return 'NONE'
endfunction

function! coc_symbol_line#set_highlight()
  let bg = s:a(['CocSymbolLine'], 'bg')

  exe 'hi! CocSymbolLineSeparator     guifg='.s:a(['CocSymbolLineSeparator',  'CocSymbolLine'], 'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineEllipsis      guifg='.s:a(['CocSymbolLineEllipsis',   'CocSymbolLine'], 'fg') .' guibg='.bg

  " TODO: update treestiter group names
  exe 'hi! CocSymbolLineFile          guifg='.s:a(['CocSymbolFile',           'Statement'],     'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineModule        guifg='.s:a(['CocSymbolModule'],        'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineNamespace     guifg='.s:a(['CocSymbolNamespace',      'TSNamespace'],   'fg') .' guibg='.bg
  exe 'hi! CocSymbolLinePackage       guifg='.s:a(['CocSymbolPackage'],       'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineClass         guifg='.s:a(['CocSymbolClass',          'TSType'],        'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineMethod        guifg='.s:a(['CocSymbolMethod',         'TSMethod'],      'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineProperty      guifg='.s:a(['CocSymbolProperty',       'TSProperty'],    'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineField         guifg='.s:a(['CocSymbolField',          'TSField'],       'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineConstructor   guifg='.s:a(['CocSymbolConstructor'],   'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineEnum          guifg='.s:a(['CocSymbolEnum'],          'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineInterface     guifg='.s:a(['CocSymbolInterface'],     'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineFunction      guifg='.s:a(['CocSymbolFunction',       'TSFunction'],    'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineVariable      guifg='.s:a(['CocSymbolVariable',       'TSVariable'],    'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineConstant      guifg='.s:a(['CocSymbolConstant',       'TSConstant'],    'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineString        guifg='.s:a(['CocSymbolString',         'TSString'],      'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineNumber        guifg='.s:a(['CocSymbolNumber',         'TSNumber'],      'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineBoolean       guifg='.s:a(['CocSymbolBoolean',        'TSBoolean'],     'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineArray         guifg='.s:a(['CocSymbolArray'],         'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineObject        guifg='.s:a(['CocSymbolObject'],        'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineKey           guifg='.s:a(['CocSymbolKey',            'TSKeyword'],     'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineNull          guifg='.s:a(['CocSymbolNull'],          'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineEnumMember    guifg='.s:a(['CocSymbolEnumMember'],    'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineStruct        guifg='.s:a(['CocSymbolStruct',         'TSStructure'],   'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineEvent         guifg='.s:a(['CocSymbolEvent'],         'fg')             .'    guibg='.bg
  exe 'hi! CocSymbolLineOperator      guifg='.s:a(['CocSymbolOperator',       'TSOperator'],    'fg') .' guibg='.bg
  exe 'hi! CocSymbolLineTypeParameter guifg='.s:a(['CocSymbolTypeParameter'], 'fg')             .'    guibg='.bg

endfunction
