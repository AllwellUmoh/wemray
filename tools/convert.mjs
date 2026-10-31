import fs from 'node:fs';
import path from 'node:path';
import HtmlToJsx from 'htmltojsx';

const root = process.cwd();
const tmp = path.join(process.env.TEMP, 'opencode', 'wemray', 'clean2');
const out = path.join(root, 'src', 'pages', 'sections');
const compOut = path.join(root, 'src', 'components');
fs.mkdirSync(out, { recursive: true });

const converter = new HtmlToJsx({ createClass: false });

const pageMap = {
  'wemray-homepage-improved__13_': 'Home',
  'about__1_': 'About',
  'services__1_': 'Services',
  'academy__1_': 'Academy',
  'contact': 'Contact',
  'service-ai': 'ServiceAi',
  'service-automation': 'ServiceAutomation',
  'service-branding': 'ServiceBranding',
  'service-mobile': 'ServiceMobile',
  'service-saas': 'ServiceSaas',
  'service-seo': 'ServiceSeo',
  'service-software': 'ServiceSoftware',
  'service-website': 'ServiceWebsite',
};

function fixStyleObjects(jsx) {
  return jsx.replace(/style=\{\{([^}]*)\}\}/g, (match, body) => {
    const fixed = body.replace(/(^|[{,]\s*)-([A-Za-z][\w-]*)(\s*:)/g, (m, pre, name, colon) => {
      const key = name.startsWith('-') ? `-${name}` : `--${name}`;
      return `${pre}'${key}'${colon}`;
    });
    return `style={{${fixed}}}`;
  });
}

function convertHtml(html) {
  let jsx = converter.convert(html);
  jsx = fixStyleObjects(jsx);
  jsx = jsx.replace(/<img\b[^>]*>/g, (tag) => tag.replace(/\salt(?=\s|\/?>)/, ' alt=""'));
  jsx = jsx.replace(/<img([^>]*?)\sdata-logo([^>]*?)\/?>/g, (m, before, after) => {
    if (/src=/.test(before) || /src=/.test(after)) return m;
    return `<img${before} data-logo src="/logo.png"${after} />`;
  });
  jsx = jsx.replace(/<img([^>]*?)\sonerror="[^"]*"([^>]*?)\/?>/g, '<img$1$2 />');
  jsx = jsx.replace(/<a(?=[\s>])/g, '<AppLink');
  jsx = jsx.replace(/<\/a>/g, '</AppLink>');
  return jsx;
}

function writeComponent(file, name, input, { appLink = true } = {}) {
  let jsx = input.trim();
  if (jsx.startsWith('<div>') && jsx.endsWith('</div>')) {
    jsx = jsx.slice(5, -6).trim();
  }
  const content = `${appLink ? "import AppLink from '../../components/AppLink';\n\n" : ''}export default function ${name}() {\n  return (\n    <>\n${jsx
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n')}\n    </>\n  );\n}\n`;
  fs.writeFileSync(path.join(out, `${file}.jsx`), content);
}

for (const [source, name] of Object.entries(pageMap)) {
  const html = fs.readFileSync(path.join(tmp, `${source}.body.html`), 'utf8');
  writeComponent(`${name}Body`, `${name}Body`, convertHtml(html));
}

const home = fs.readFileSync(
  path.join(root, 'html', 'wemray-homepage-improved (13).html'),
  'utf8',
);

function section(startRe, endTag, label) {
  const match = startRe.exec(home);
  if (!match) throw new Error(`Missing ${label}`);
  const start = match.index;
  const end = home.indexOf(endTag, start);
  if (end === -1) throw new Error(`Missing end for ${label}`);
  return home.slice(start, end + endTag.length);
}

let header = section(/<header class="nav"/, '</header>', 'header');
let mmenu = section(/<nav class="mmenu"/, '</nav>', 'mmenu');
let footer = section(/<footer class="ft"/, '</footer>', 'footer');
const astStart = home.indexOf('<div class="ast" id="ast">');
const astEnd = home.indexOf('<script', astStart);
let assistant = home.slice(astStart, astEnd).trim();

for (const [value, replacement] of [
  [/src="data:image\/png;base64,[^"]*"/g, 'src="/logo.png"'],
]) {
  header = header.replace(value, replacement);
  footer = footer.replace(value, replacement);
  assistant = assistant.replace(value, replacement);
}

const fragments = [
  ['HeaderMarkup', 'HeaderMarkup', header],
  ['MobileMenuMarkup', 'MobileMenuMarkup', mmenu],
  ['FooterMarkup', 'FooterMarkup', footer],
  ['AssistantMarkup', 'AssistantMarkup', assistant],
];

for (const [file, name, html] of fragments) {
  const jsx = convertHtml(html);
  const content = `import AppLink from './AppLink';\n\nexport default function ${name}() {\n  return (\n${jsx
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n')}\n  );\n}\n`;
  fs.writeFileSync(path.join(compOut, `${file}.jsx`), content);
}

console.log('Generated', Object.keys(pageMap).length, 'page bodies and 4 fragments.');
