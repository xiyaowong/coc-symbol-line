import { workspace } from 'coc.nvim';

const kindsMap = {
  showFiles: 'File',
  showModules: 'Module',
  showNamespaces: 'Namespace',
  showPackages: 'Package',
  showClasses: 'Class',
  showMethods: 'Method',
  showProperties: 'Property',
  showFields: 'Field',
  showConstructors: 'Constructor',
  showEnums: 'Enum',
  showInterfaces: 'Interface',
  showFunctions: 'Function',
  showVariables: 'Variable',
  showConstants: 'Constant',
  showStrings: 'String',
  showNumbers: 'Number',
  showBooleans: 'Boolean',
  showArrays: 'Array',
  showObjects: 'Object',
  showKeys: 'Key',
  showNull: 'Null',
  showEnumMembers: 'EnumMember',
  showStructs: 'Struct',
  showEvents: 'Event',
  showOperators: 'Operator',
  showTypeParameters: 'TypeParameter',
};

class Config {
  constructor() {
    this.setConfiguration();
  }

  public labels: { [key: string]: string } = {};
  public default_ = '%f';
  public separator = ' > ';
  public icons = true;
  public showKinds: string[] = [];
  public onlyNearestKinds: string[] = [];
  public maxItems = 8;
  public maxItemsIndicator = '…';

  setConfiguration() {
    this.labels = workspace.getConfiguration('suggest').get<any>('completionItemKindLabels', {});

    const config = workspace.getConfiguration('symbol-line');

    this.default_ = config.get<string>('default')!;
    this.separator = config.get<string>('separator')!;
    this.onlyNearestKinds = config.get<string[]>('onlyNearestKinds')!;
    this.maxItems = config.get<number>('maxItems')!;
    this.maxItemsIndicator = config.get<string>('maxItemsIndicator')!;

    const checkBoolean = (key: string) => config.get<boolean>(key)!;

    this.icons = checkBoolean('icons');

    this.showKinds = [];
    for (const kindKey of [
      'showFiles',
      'showModules',
      'showNamespaces',
      'showPackages',
      'showClasses',
      'showMethods',
      'showProperties',
      'showFields',
      'showConstructors',
      'showEnums',
      'showInterfaces',
      'showFunctions',
      'showVariables',
      'showConstants',
      'showStrings',
      'showNumbers',
      'showBooleans',
      'showArrays',
      'showObjects',
      'showKeys',
      'showNull',
      'showEnumMembers',
      'showStructs',
      'showEvents',
      'showOperators',
      'showTypeParameters',
    ]) {
      if (checkBoolean(kindKey)) {
        this.showKinds.push(kindsMap[kindKey]);
      }
    }
  }
}

export const config = new Config();
