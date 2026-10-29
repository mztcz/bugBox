let nextEid = 1;
const C = {
entities: new Set,
bug: new Map,
pos: new Map,
vel: new Map,
walk: new Map,
team: new Map,
combat: new Map,
food: new Map,
obstacle: new Map,
young: new Map,
shell: new Map
};
function ecsClear() {
C.entities.clear();
for (const k in C) C[k] instanceof Map && C[k].clear();
nextEid = 1
}
function ecsSpawn(comps) {
const e = nextEid++;
C.entities.add(e);
for (const k in comps) C[k].set(e, comps[k]);
return e
}
function ecsFront(e) { C.entities.delete(e), C.entities.add(e) }
function ecsKill(e) {
C.entities.delete(e);
for (const k in C) C[k] instanceof Map && C[k].delete(e)
}
function ecsQuery(...comps) {
const out = [];
for (const e of C.entities) comps.every(c => C[c].has(e)) && out.push(e);
return out
}
