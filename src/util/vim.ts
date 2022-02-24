import { workspace } from 'coc.nvim';

export async function registerRuntimepath(extensionPath: string) {
  const { nvim } = workspace;
  const rtp = (await nvim.getOption('runtimepath')) as string;
  const paths = rtp.split(',');
  if (!paths.includes(extensionPath)) {
    await nvim.command(`execute 'noa set rtp+='.fnameescape('${extensionPath.replace(/'/g, "''")}')`);
  }
}
