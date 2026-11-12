const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {spawn, execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');
const root = __dirname;
const artifacts = path.join(root, 'artifacts');
const consumer = path.join(root, 'consumer');
const host = path.join(root, 'tools');
const packages = new Map();
for (const file of fs.readdirSync(artifacts).filter(f => f.endsWith('.tgz'))) {
  const archive = path.join(artifacts, file);
  const manifest = JSON.parse(execFileSync('tar', ['-xOf', archive, 'package/package.json'], {encoding:'utf8'}));
  packages.set(manifest.name, {file, archive, manifest});
}
const metadata = JSON.parse(fs.readFileSync(path.join(artifacts, 'release-metadata.json')));
assert.equal(metadata.releaseHeadSha, process.argv[2]);
assert.equal(metadata.sourceWorkflowRunId, 36250310169);
assert.equal(metadata.cutFromSha, "43b8667d07bfb3a0fb10b50964f62fce4391743c");
assert.equal(packages.size, 5);
const runtime = JSON.parse(execFileSync('tar', ['-xOf', packages.get('@rocketicons/toolkit').archive, 'package/data/runtime-dependencies.json'], {encoding:'utf8'}));
for (const name of ['@rocketicons/utils', '@rocketicons/tailwind']) {
  assert.equal(runtime[name], '^' + packages.get(name).manifest.version);
}
assert.ok(packages.get('@rocketicons/toolkit').manifest.dependencies.typescript);
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const run = (command, args, cwd) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {cwd, env:{...process.env, npm_config_cache:path.join(root,'npm-cache')}, stdio:['ignore','pipe','pipe']});
  let out = '', err = '';
  child.stdout.on('data', d => out += d);
  child.stderr.on('data', d => err += d);
  child.on('error', reject);
  child.on('close', code => code === 0 ? resolve(out) : reject(new Error(`${command} exited ${code}\n${out}\n${err}`)));
});
(async () => {
  for (const dir of [host, consumer]) fs.mkdirSync(dir, {recursive:true});
  writeJson(path.join(host,'package.json'), {name:'release-artifact-tools', version:'1.0.0', private:true});
  console.log('Installing all five release archives in an isolated tools directory');
  const installed = await run('npm', ['install', '--ignore-scripts', '--omit=optional', '--no-audit', '--no-fund', ...Array.from(packages.values(), p=>p.archive), 'react@19', 'tailwindcss@4'], host);
  fs.writeFileSync(path.join(root,'tools-install.log'), installed);
  const toolkit = require(path.join(host,'node_modules/@rocketicons/toolkit'));
  const ts = require(path.join(host,'node_modules/typescript'));
  assert.equal(toolkit.catalogVersion, packages.get('rocketicons').manifest.version);
  assert.equal(toolkit.listCollections().length, 33);
  assert.equal(toolkit.allIcons().length, 54222);
  // Serve only the unpublished Rocketicons runtimes from these exact release archives.
  // All other npm dependencies use the public registry; no publishing occurs.
  const requests = [];
  const server = http.createServer((req, res) => {
    const route = decodeURIComponent(req.url.split('?')[0]);
    requests.push(route);
    const entry = packages.get(route.slice(1));
    if (entry && runtime[entry.manifest.name]) {
      const buffer = fs.readFileSync(entry.archive);
      const version = {...entry.manifest, dist:{tarball:`http://127.0.0.1:${server.address().port}/${entry.file}`, integrity:'sha512-'+crypto.createHash('sha512').update(buffer).digest('base64')}};
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify({name:version.name, 'dist-tags':{latest:version.version}, versions:{[version.version]:version}}));
    } else {
      const tarball = Array.from(packages.values()).find(p => '/'+p.file === route);
      if (tarball && runtime[tarball.manifest.name]) {
        res.setHeader('Content-Type','application/octet-stream');
        fs.createReadStream(tarball.archive).pipe(res);
      } else {res.writeHead(404); res.end('Not found');}
    }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    fs.writeFileSync(path.join(consumer,'.npmrc'), `registry=https://registry.npmjs.org/\n@rocketicons:registry=http://127.0.0.1:${server.address().port}/\naudit=false\nfund=false\n`);
    writeJson(path.join(consumer,'package.json'), {name:'release-artifact-consumer', version:'1.0.0', private:true, dependencies:{react:'^19.0.0',tailwindcss:'^4.2.1','@tailwindcss/postcss':'^4.2.1'}});
    fs.mkdirSync(path.join(consumer,'src'));
    writeJson(path.join(consumer,'tsconfig.json'), {compilerOptions:{baseUrl:'./src', paths:{'@app/*':['./*']}, jsx:'react-jsx', moduleResolution:'bundler',module:'esnext'}});
    fs.writeFileSync(path.join(consumer,'postcss.config.js'), 'module.exports = {plugins: {"@tailwindcss/postcss": {}}};\n');
    fs.writeFileSync(path.join(consumer,'src/index.css'), '@import "tailwindcss";\n');
    fs.writeFileSync(path.join(consumer,'src/App.tsx'), 'import "./index.css"; export default function App() { return null; }\n');
    const plan = await toolkit.planIcons(consumer,['@fi/fi-calendar'],{fromFile:'src/App.tsx'});
    assert.deepEqual(plan.toInstall, Object.entries(runtime).map(([name, range]) => name+'@'+range));
    assert.equal(fs.existsSync(path.join(consumer,'node_modules')),false);
    const cli = path.join(host,'node_modules/rocketicons/bin/index.js');
    console.log('Running packaged CLI init in a project with no node_modules');
    const init = await run(process.execPath,[cli,'init','--cwd',consumer,'--json'],consumer);
    fs.writeFileSync(path.join(root,'consumer-init.log'),init);
    const add = JSON.parse(await run(process.execPath,[cli,'add','@fi/fi-calendar','--cwd',consumer,'--json'],consumer));
    const doctor = JSON.parse(await run(process.execPath,[cli,'doctor','--cwd',consumer,'--json'],consumer));
    assert.equal(doctor.healthy,true);
    const config = ts.readConfigFile(path.join(consumer,'tsconfig.json'), ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config.config,ts.sys,consumer);
    const resolved = ts.resolveModuleName('@/ri/icons/fi-calendar',path.join(consumer,'src/App.tsx'),parsed.options,ts.sys).resolvedModule;
    assert.equal(resolved.resolvedFileName,path.join(consumer,'src/ri/icons/fi-calendar.tsx'));
    assert.deepEqual(parsed.options.paths['@app/*'], ['./*']);
    const second = JSON.parse(await run(process.execPath,[cli,'init','--cwd',consumer,'--json'],consumer));
    assert.deepEqual(second.changes,[]);
    const installedRuntimes = {};
    for (const name of Object.keys(runtime)) {
      installedRuntimes[name] = JSON.parse(fs.readFileSync(path.join(consumer,'node_modules',name,'package.json'))).version;
      assert.equal(installedRuntimes[name],packages.get(name).manifest.version);
      assert.ok(requests.includes('/'+name));
    }
    const result = {releaseHeadSha:metadata.releaseHeadSha, packages:Object.fromEntries(Array.from(packages,([name,p])=>[name,p.manifest.version])), runtimeRequirements:runtime, installedRuntimes, collectionCount:toolkit.listCollections().length, iconCount:toolkit.allIcons().length, doctor, alias:parsed.options.paths['@/ri/*'], resolved:resolved.resolvedFileName, idempotent:true, registry:'local fixture serving unchanged release runtime archives; public npm for other dependencies', requests};
    writeJson(path.join(root,'smoke-result.json'),result);
    console.log(JSON.stringify(result,null,2));
  } finally {await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
