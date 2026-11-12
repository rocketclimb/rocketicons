const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
const lu=require('react-icons/lu');
const names="house search settings user bell heart star shopping-cart mail calendar camera cloud download upload lock message-circle phone play rocket zap sparkles check x menu filter trash-2 pencil share-2 bookmark image music map-pin credit-card wallet chart-bar chart-pie trending-up globe wifi sun moon layers package code terminal git-branch smartphone monitor eye thumbs-up gift flame target compass send plus log-out shield-check bot wand-sparkles palette box cpu database folder file-text clock map headphones video mic inbox archive tag award briefcase coffee receipt shopping-bag badge-percent truck store layout-dashboard users activity chevron-right bell-ring circle-check".split(' ');
const pas=s=>'Lu'+s.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join('');
const out={};const miss=[];
for(const n of names){const C=lu[pas(n)];if(!C){miss.push(n);continue;}
 const m=renderToStaticMarkup(React.createElement(C));out[n]=m.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');}
require('fs').writeFileSync('icons.json',JSON.stringify(out));
console.log(Object.keys(out).length,'missing',miss);
