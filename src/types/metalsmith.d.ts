declare module 'metalsmith' {
  import {Stats} from 'fs';
  import metalsmith from 'metalsmith';

  export type Plugin = (
    files: {[index: string]: any},
    metalsmith: MetalSmith,
    done: () => void
  ) => Promise<any>;

  export type Callback = (err: Error, files: {[index: string]: any}) => void;

  export type Ignore = (path: string, stat: Stats) => void;

  export interface MetalSmith {
    source(path: string): MetalSmith;
    source(): string;
    use(plugin: Plugin | Plugin[]): MetalSmith;
    process(fn?: Callback): object;
  }

  export default function(directory: string): MetalSmith;
}
