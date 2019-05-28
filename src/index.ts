import App from './components/App.svelte';
import './index.scss';

const name: string = 'test';

const target = document.querySelector('main');

if (!target) {
  throw new Error('Can not find app container...');
}

const app = new App({
  target,
  anchor: null,
  props: {},
  hydrate: false,
  intro: false,
});
