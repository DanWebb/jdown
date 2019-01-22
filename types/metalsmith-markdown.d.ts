declare module 'metalsmith-markdown' {
  import {Plugin} from 'metalsmith';
  import {MarkedOptions} from 'marked';
  export default function markdown(options?: MarkedOptions): Plugin;
}
