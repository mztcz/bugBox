// Fight box background: environment BG_ENV[bgE], method B (ground 1 texture px per game px) or C (B with the whole scene zoomed by z)
// environments: [ground, layers, z]; z = 0 method B only, z > 0 B or C (50/50), z < 0 C only; C zooms the scene by |z|
const BG_ENV = [
/* Lawn */[{c:["#2c4a1c","#3d6326","#4f7a2e"],sc:22},[["grain",{n:600,r:[.4,1],c:["#22381a","#4a3a22"],a:.7}],["blade",{n:1400,l:[5,11],w:[1,1.8],c:["#2f5220","#3c6a28","#4c8030","#5e9438","#6fa244"],lay:1,h:.8}]],0],
/* Tall grass */[{c:["#1a2a12","#24391a","#2f4a20"],sc:20},[["blade",{n:650,l:[22,40],w:[2,3.4],d:.7,s:1.3,c:["#24401a","#2e5422","#3c662c","#4c7834","#6a8a42","#94a05a"],lay:1,h:2.2}]],0],
/* Clover meadow */[{c:["#2a4418","#3a5c22","#46702a"],sc:18},[["blade",{n:500,l:[5,12],w:[1,1.7],c:["#2f5220","#3e6c28","#4e8030"],h:.8}],["clover",{n:170,r:[2.2,3.6],c:["#3e7a2e","#4a8a36","#56963e"],h:1.2}],["flower",{n:14,r:[2.8,4],c:["#e8e4da","#e6cfd8"]}]],0],
/* Moss */[{c:["#1f3412","#35561c","#5a7e2a","#7d9a3a"],sc:7,oc:5,k:2.4,ce:{s:34,e:4,ec:"#22361a",j:.25}},[["grain",{n:3500,r:[.35,.8],c:["#8aa848","#6d9030","#a8b860"],a:.8}],["straw",{n:120,l:[3,6],w:[.4,.5],c:["#8a5a2a","#a87a3a"],h:.6}]],1.4],
/* Ferns */[{c:["#1e1a12","#2a2418","#3a3020"],sc:18},[["leaf",{n:60,s:[8,14],c:["#4a3a24","#5a4428","#3e3020"],h:.8}],["fern",{n:7,l:[90,150],c:["#2e5a24","#3c6e2c","#4a7e34"],h:3}]],0],
/* Soil */[{c:["#2e2014","#3e2c1c","#4e3826","#5a442e"],sc:16,oc:5},[["grain",{n:2500,r:[.3,.9],c:["#241a10","#6a5440","#7a6a58"],a:.8}],["pebble",{n:90,r:[1,2.4],c:["#6a5a48","#7c6e5c","#5a4a3a"],h:.6}],["pebble",{n:45,r:[3,6.5],k:.4,c:["#3e2c1c","#4a3624","#563e2a"],h:1.5}],["straw",{n:25,l:[6,14],w:[.5,.6],c:["#6a4a2a"],h:.3}]],0],
/* Mud */[{c:["#1e160e","#2c2016","#3a2a1c"],sc:26},[["spot",{n:25,r:[8,26],c:"#c8b8a0",a:.12}],["puddle",{n:4,lv:1,nh:1,r:[14,32],c:["#4a3e32","#221a12"]}],["grain",{n:800,r:[.3,.8],c:["#140e08","#4a3a2a"],a:.7}]],0],
/* Cracked mud */[{c:["#8a7458","#a08a6a","#b29c7a"],sc:20,ce:{s:24,e:2.6,ec:"#3a2c1e",j:.18}},[["grain",{n:1200,r:[.3,.8],c:["#6a5640","#c8b494"],a:.6}],["pebble",{n:10,r:[1,2],c:["#8a7a64"],h:.5}]],5],
/* Sand */[{c:["#b89c6c","#c8ae7e","#d6be90"],sc:8,k:1.6},[["grain",{n:5000,r:[.3,.75],c:["#a88c5c","#e4d4b0","#8a8070","#c09a6a","#f0e8d8"],a:.9}],["pebble",{n:10,r:[1.2,2.6],c:["#9a8a74","#d8ccb8"],h:.5}]],0.6],
/* Wet sand */[{c:["#6e5a3c","#7e6a48","#8c7652"],sc:30,sr:{f:.35,w:.6,k:.25,ang:.4}},[["spot",{n:14,r:[20,50],c:"#d8e4e8",a:.14}],["grain",{n:2000,r:[.3,.7],c:["#5a4a32","#a89a80"],a:.8}],["pebble",{n:14,r:[1.4,3],e:[1.2,1.6],c:["#e8e0d0","#c8b8a8"],h:.5}]],0],
/* Dune */[{c:["#a8844e","#c49c62","#d8b478","#e6c690"],sc:60,k:1.8,sr:{f:.22,w:1.2,k:.45,ang:.9}},[["grain",{n:3000,r:[.3,.6],c:["#b8945e","#e8d0a0","#a07c48"],a:.6}]],0],
/* Gravel */[{c:["#3c3a36","#4a4842","#56534c"],sc:10},[["grain",{n:800,r:[.3,.8],c:["#26241f"],a:.8}],["pebble",{n:900,r:[2.6,5.2],k:.45,c:["#8a8680","#9e9a92","#6e6a64","#a8a090","#7a7266","#b4aea4","#5e5a56"],h:1.2}]],2.4],
/* Pebbles */[{c:["#2a2824","#34302a"],sc:10},[["pebble",{n:260,lv:2,r:[6,12],k:.12,e:[1.1,1.5],c:["#8a8478","#a49c8e","#6c6a66","#9a8a76","#b8b0a2","#7a6e62","#5c5e60"],h:2.2}]],0],
/* Granite */[{c:["#8a7e78","#a09088","#b4a49c"],sc:12},[["grain",{n:9000,r:[.4,1.3],c:["#1e1c1c","#2a2828","#e8e2dc","#c89a8c","#d8b0a0","#5a5450"],a:.85}],["crack",{n:2,l:[60,140],c:"rgba(30,26,24,.7)",w:.9}]],0],
/* Slate */[{c:["#283038","#323c46","#3e4852"],sc:18,st:[4,1],ce:{s:70,e:1.6,ec:"#14181c",j:.12,sx:2.2}},[["grain",{n:600,r:[.3,.7],c:["#8a96a2"],a:.3}],["crack",{n:3,l:[40,90],c:"rgba(10,12,16,.7)",w:.8}]],0],
/* Paving */[{c:["#5a544a","#6a6458"],sc:6},[["bricks",{bw:58,bh:29,gap:3.2,c:["#8a8a86","#9a968e","#7e7c78","#a6a298","#8e8a80"]}],["spot",{n:12,r:[4,10],c:"#4a6a2a",a:.35}],["grain",{n:600,r:[.3,.7],c:["#3a3630","#c8c4bc"],a:.5}]],5.3],
/* Concrete */[{c:["#8a8a86","#9a9a94","#a8a8a2"],sc:40,oc:5,k:1.4},[["grain",{n:3000,r:[.3,.9],c:["#5a5a56","#6e6e6a","#c0c0ba"],a:.7}],["spot",{n:6,r:[20,40],c:"#504a40",a:.12}],["crack",{n:2,l:[80,160],c:"rgba(40,40,38,.75)",w:.8}]],0],
/* Asphalt */[{c:["#1c1c1e","#262628","#303032"],sc:10},[["grain",{n:12000,r:[.3,1.1],c:["#3a3a3c","#4a4a4c","#141414","#6a6864","#8a8680"],a:.9}],["spot",{n:3,r:[16,34],c:"#0a0a0c",a:.35}],["crack",{n:1,l:[100,180],c:"rgba(5,5,6,.85)",w:1.1}]],0],
/* Autumn leaves */[{c:["#1e140c","#2a1c12"],sc:14},[["leaf",{n:600,lv:2,s:[11,19],c:["#7a2a14","#a43c18","#c8641e","#d89a2a","#8a5a24","#6a4a24","#b0882e","#5a3a1c"],h:1.4}]],-8],
/* Pine needles */[{c:["#2a1a10","#3a2414","#4a2e1a"],sc:12},[["needle",{n:3500,l:[6,10],c:["#7a4a22","#8e5a2a","#a06a34","#5a3418","#b07a40"],h:.6}],["cone",{n:3,s:[22,30]}]],0],
/* Bark */[{c:["#2a221c","#3e342a","#544638","#6a5a4a"],sc:9,st:[1,7],oc:5,k:2.2,sr:{f:.18,w:2.5,k:.35,ang:0}},[["crack",{n:8,l:[100,200],d:PI/2,c:"rgba(14,10,6,.85)",w:1.6}],["spot",{n:14,r:[5,12],c:"#9aaa7a",a:.45}],["grain",{n:800,r:[.3,.7],c:["#1a140e","#7a6a58"],a:.6}]],0],
/* Rotting wood */[{c:["#2a1e14","#3e2c1e","#56402a","#6a523a"],sc:10,st:[9,1],k:2},[["crack",{n:5,l:[80,180],d:0,c:"rgba(14,8,4,.8)",w:1.3}],["spot",{n:10,r:[6,14],c:"#d8d4c4",a:.3}],["spot",{n:6,r:[10,24],c:"#100a06",a:.4}],["grain",{n:900,r:[.3,.7],c:["#1a1008","#8a7458"],a:.6}]],0],
/* Forest litter */[{c:["#1c160e","#2a2016","#362a1c"],sc:14},[["needle",{n:900,l:[5,9],c:["#5a3a1e","#6a4826","#7a5430"],h:.5}],["leaf",{n:90,s:[8,14],c:["#5a3a1e","#6a4826","#4a3a22","#7a5a2e","#3a2e1e"],h:1}],["straw",{n:30,l:[12,30],w:[1,1.8],c:["#4a3422","#5a4230"],h:1.4}],["cone",{n:2,s:[20,26]}],["pebble",{n:10,r:[2,4],c:["#5a5450","#6a625a"],h:1}]],0],
/* Plowed field */[{c:["#2a1c12","#3a2818","#4a3420","#56402a"],sc:24,sr:{f:.28,w:.8,k:.55,ang:1.45}},[["grain",{n:1500,r:[.3,.8],c:["#1a120a","#6a5440"],a:.7}],["pebble",{n:160,r:[2.5,7],k:.45,c:["#3a2818","#4a3420","#5a4028"],h:1.8}],["straw",{n:30,l:[6,14],w:[.6,.9],c:["#a88a48"],h:.4}]],0],
/* Straw */[{c:["#6a5428","#7e6630"],sc:10},[["straw",{n:1800,l:[18,48],w:[.8,1.7],c:["#c8a450","#d8b860","#b8943e","#e4cc80","#a88434","#cfae58"],h:.7}]],0],
/* Snow and frost */[{c:["#b8c6d4","#d0dae4","#e4ecf2","#f2f6fa"],sc:34,k:1.6},[["spot",{n:8,r:[20,50],c:"#7a90b0",a:.18}],["grain",{n:1200,r:[.3,.8],c:["#ffffff","#c8d8e8"],a:.8}],["needle",{n:300,l:[2,5],w:.5,c:["#ffffff","#e0ecf8"],h:.3}],["sparkle",{n:260}]],0],
/* Puddle stones */[{c:["#1e1c1a","#2a2622"],sc:10},[["pebble",{n:220,r:[4,10],k:.18,c:["#6a6660","#7e766a","#5a5e62","#8a8070","#4e4a46"],h:1.2}],["water",{c:"#2a4a5a",a:.38}],["spot",{n:6,r:[20,40],c:"#cfe0e8",a:.1}],["sparkle",{n:30}]],0],
/* Planks */[{c:["#3a2a1a","#4a3420"],sc:20},[["planks",{bw:36,c:["#6a4a2e","#7a5636","#5e4228","#86603c","#704e30"]}]],5.2],
/* Lily pad */[{c:["#08120f","#0c1a16","#11221d"],sc:40,k:1.5},[["lily",{c:["#2c5a1e","#356a24","#3e7a2a"]}],["drop",{n:10,r:[2,5]}]],0],
/* Clay */[{c:["#7a3e22","#8e4c2a","#a45a32","#b46a3c"],sc:22,ce:{s:44,e:1.3,ec:"#4a2412",j:.1}},[["grain",{n:1500,r:[.3,.8],c:["#5a2a14","#c88a5a"],a:.6}],["spot",{n:8,r:[14,30],c:"#d8a070",a:.15}],["pebble",{n:12,r:[1.5,3],c:["#a86a42","#8a5232"],h:.6}]],0],
/* Peat bog */[{c:["#1a120c","#261a10","#342416"],sc:20},[["puddle",{n:3,r:[16,30],c:["#3a3a26","#12100a"]}],["patch",{n:26,r:[8,16],m:30,d:[1,2],c:["#6a8a2e","#8aa23e","#a8b84a","#a8583a"],h:.5}],["blade",{n:120,l:[10,20],w:[1,1.6],c:["#5a6a2a","#7a7a3a","#8a7a40"],h:1.2}]],0],
/* Volcanic ash */[{c:["#3a3836","#46423e","#524e4a"],sc:30,k:1.4},[["grain",{n:9000,r:[.3,.7],c:["#2a2826","#6a6662","#5a5450"],a:.8}],["pebble",{n:90,r:[2,5],k:.5,c:["#7a7470","#8a8480","#6a625c"],h:1}],["pebble",{n:20,r:[2,4],k:.5,c:["#1a1818"],h:.8}]],0],
/* Salt flat */[{c:["#cfcac0","#dedad2","#ecead4","#f6f4ee"],sc:30,k:1.3,ce:{s:30,e:3,ec:"#ffffff",j:.08}},[["grain",{n:1500,r:[.3,.8],c:["#b8b0a2","#ffffff"],a:.7}],["sparkle",{n:60}]],0],
/* Shell beach */[{c:["#b89c6c","#c8ae7e","#d6be90"],sc:9,k:1.6},[["grain",{n:4000,r:[.3,.75],c:["#a88c5c","#e4d4b0","#8a8070","#f0e8d8"],a:.9}],["shell",{n:40,s:[4,8],c:["#f0e4d4","#e8c8b0","#d8b0a0","#f4ece4","#c8a890"]}],["pebble",{n:25,r:[1.5,3],c:["#9a8a74","#e8e0d0"],h:.5}]],3.6],
/* Seaweed beach */[{c:["#6e5a3c","#7e6a48","#8c7652"],sc:28,sr:{f:.35,w:.6,k:.2,ang:.4}},[["grain",{n:2000,r:[.3,.7],c:["#5a4a32","#a89a80"],a:.8}],["straw",{n:45,l:[20,55],w:[1.6,3.2],c:["#3a4a1e","#4a3a1a","#2e3a18","#5a4a22"],h:.8}],["shell",{n:8,s:[4,7],c:["#e8dccc","#d8b8a0"]}],["sparkle",{n:20}]],3.8],
/* Cobblestones */[{c:["#1e1c1a","#2a2622"],sc:8},[["bricks",{bw:24,bh:24,gap:3,rad:7,j:2,c:["#6a6660","#7a746c","#5a5856","#8a8278","#6e665c","#585450"]}],["spot",{n:10,r:[3,7],c:"#4a6a2a",a:.35}]],0],
/* Brick paving */[{c:["#3a2e26","#4a3c32"],sc:8},[["bricks",{bw:44,bh:22,gap:2.6,rad:1.5,c:["#8a3a26","#9a442c","#7a3222","#a65034","#8e4a30"]}],["grain",{n:500,r:[.3,.7],c:["#2a1a12","#d8a080"],a:.5}]],6.9],
/* Wood chips */[{c:["#2a1c12","#362416"],sc:12},[["pebble",{n:520,r:[3,7],e:[1.8,3],k:.3,c:["#a8784a","#b8885a","#8a5e38","#c49a6a","#7a5232"],h:1}]],1.9],
/* Lichen rock */[{c:["#6a6660","#7a756e","#8a847c"],sc:14},[["grain",{n:5000,r:[.4,1.1],c:["#3a3836","#a8a29a","#5a5650"],a:.7}],["patch",{n:18,r:[8,18],m:34,d:[.9,1.8],c:["#d8b030","#c89a2a","#a8b060","#e0c860"],h:.2}],["patch",{n:10,r:[5,10],m:16,d:[.8,1.4],c:["#c8ccb8","#a8b0a0"],h:.2}]],1.8],
/* Marble */[{c:["#d8d4ce","#e6e2dc","#f2f0ec"],sc:60,k:1.2,sr:{f:.06,w:3,k:.35,ang:.6}},[["crack",{n:4,l:[120,260],d:.6,c:"rgba(90,90,96,.45)",w:.9}],["spot",{n:5,r:[20,40],c:"#8a8a90",a:.12}]],0],
/* Sandstone */[{c:["#a86a3a","#c08048","#d49a5c","#e2b072"],sc:30,k:1.4,sr:{f:.5,w:.4,k:.6,ang:.1}},[["grain",{n:3000,r:[.3,.8],c:["#8a5228","#f0c890"],a:.6}],["crack",{n:2,l:[60,120],c:"rgba(80,40,16,.6)",w:.9}]],0],
/* Ice */[{c:["#7aa8c0","#94bcd2","#b4d2e4","#d0e4f0"],sc:40,k:1.4},[["crack",{n:6,l:[80,200],c:"rgba(240,250,255,.75)",w:.8}],["drop",{n:24,r:[.8,2.2]}],["sparkle",{n:40}]],0],
/* Rusty metal */[{c:["#4e5256","#5e6266","#6e7276"],sc:14,st:[8,1]},[["spot",{n:22,r:[8,24],c:"#8a4a1e",a:.55}],["spot",{n:12,r:[4,10],c:"#b0602a",a:.5}],["rivet",{sx:210,sy:140,g:14}]],7],
/* Tiles */[{c:["#8a8a86","#9a9a94"],sc:6},[["bricks",{bw:40,bh:40,gap:2.5,rad:1.5,off:0,c:["#e8ecee","#dfe4e6","#f2f4f4","#d8dee2"]}],["spot",{n:5,r:[8,16],c:"#8a8060",a:.15}]],5.8],
/* Picnic cloth */[{c:["#a8a098","#c8c0b8","#dcd4cc"],sc:50,k:1.6},[["check",{s:18,a:.85,c:["#f2ece6","#c82a2a"]}],["drop",{n:3,r:[2,3.5]}]],1.7],
/* Cardboard */[{c:["#9a7a4e","#a8875a","#b8966a","#c4a478"],sc:40,k:1.2,sr:{f:.9,w:.03,k:.12,ang:0}},[["grain",{n:1500,r:[.3,.7],c:["#7a5a32","#d8b88a"],a:.6}],["spot",{n:4,r:[14,30],c:"#5a3a1a",a:.18}]],0],
/* Tabletop */[{c:["#3a2a1a","#4a3420"],sc:20},[["planks",{bw:130,gl:20,jn:[700,900],nail:0,c:["#8a5a32","#9a6638","#7e5230"]}]],1.8],
/* Bamboo mat */[{c:["#5a4a2a","#6a5832"],sc:20},[["planks",{bw:10,gl:2,jn:[28,48],nail:0,c:["#c8b06a","#bca460","#d4bc78","#b09858"]}]],1.8],
/* Mushroom floor */[{c:["#1c160e","#2a2016","#362a1c"],sc:14},[["needle",{n:600,l:[5,9],c:["#5a3a1e","#6a4826","#7a5430"],h:.5}],["leaf",{n:60,s:[8,14],c:["#5a3a1e","#6a4826","#4a3a22","#7a5a2e"],h:1}],["patch",{n:12,r:[5,10],m:20,d:[1,2],c:["#3e6a2a","#4e7a32"],h:.4}],["flower",{n:9,r:[5,10],c:["#b8281e","#c8401e","#8a5a2e","#a8784a"]}]],0],
/* Tree roots */[{c:["#2e2014","#3e2c1c","#4e3826"],sc:16,oc:5},[["grain",{n:1500,r:[.3,.9],c:["#241a10","#6a5440"],a:.8}],["crack",{n:4,l:[150,300],c:"#5a3e26",w:6}],["leaf",{n:25,s:[8,13],c:["#5a3a1e","#6a4826"],h:1}],["patch",{n:8,r:[6,12],m:20,d:[1,1.8],c:["#4a7a2a","#5a8a32"],h:.3}]],0],
/* Scree */[{c:["#2a2826","#363230"],sc:10},[["pebble",{n:520,r:[3,9],k:.6,c:["#7a7670","#8a8680","#6a6662","#9a948a","#5a5652","#7a6e62"],h:1.5}]],0],
/* Flower meadow */[{c:["#2a4418","#3a5c22","#46702a"],sc:18},[["blade",{n:700,l:[6,14],w:[1,1.8],c:["#2f5220","#3e6c28","#4e8030","#5e9438"],h:.9}],["flower",{n:90,r:[1.8,3],c:["#e84a6a","#f0d040","#ffffff","#b070e0","#ff8a3a","#5a8af0"]}]],0],
/* Dandelions */[{c:["#2c4a1c","#3d6326","#4f7a2e"],sc:22},[["blade",{n:1000,l:[5,11],w:[1,1.8],c:["#2f5220","#3c6a28","#4c8030","#5e9438"],h:.8}],["clover",{n:30,r:[2.2,3.4],c:["#3e7a2e","#4a8a36"],h:1}],["flower",{n:28,r:[3.5,5],c:["#f6c81e","#f0b818"]}],["patch",{n:5,r:[4,6],m:22,d:[.5,.9],c:["#f4f4f0","#e0e0d8"],h:.6}]],0],
/* Wheat field */[{c:["#6a5232","#7a6040"],sc:20},[["blade",{n:700,l:[22,40],w:[1.4,2.4],d:.9,s:.8,c:["#a8883e","#bc9a48","#c8aa58","#d4b868"],lay:1,h:2}],["leaf",{n:120,s:[5,8],c:["#d8b860","#c8a450","#e4c878"],h:2.4}]],0],
/* Compost */[{c:["#1a120a","#24180e","#302014"],sc:14},[["grain",{n:1500,r:[.3,.9],c:["#0e0a06","#4a3a2a"],a:.8}],["leaf",{n:55,s:[7,13],c:["#4a3a1e","#5a4422","#3a2e18","#6a5228"],h:.8}],["straw",{n:45,l:[8,22],w:[.7,1.3],c:["#8a6a3a","#a07a42"],h:.6}],["pebble",{n:20,r:[2,4],k:.6,c:["#efe6d6","#e6d2b0"],h:.6}],["spot",{n:6,r:[10,20],c:"#000000",a:.3}]],0],
/* Desert pavement */[{c:["#a8845a","#b8946a","#c4a478"],sc:12,k:1.5},[["grain",{n:3000,r:[.3,.7],c:["#8a6a42","#d8c098"],a:.7}],["pebble",{n:650,r:[2,5],k:.3,c:["#4a3424","#5a3e2a","#6a4a30","#3a2a1e","#7a5a3a"],h:.8}]],3.3],
/* Tundra */[{c:["#3e3a28","#4a4632","#5a5a3a"],sc:16},[["patch",{n:30,r:[6,14],m:25,d:[.8,1.6],c:["#c8ccb0","#d8dcc0","#b8c098"],h:.3}],["patch",{n:20,r:[6,12],m:22,d:[.8,1.6],c:["#5a7a2e","#6a8a36","#8a6a3a"],h:.3}],["flower",{n:22,r:[1.5,2.2],c:["#b0182a","#8a1020"]}],["needle",{n:200,l:[2,5],w:.5,c:["#e8ecf0"],h:.2}]],0],
/* City sidewalk */[{c:["#5a5a56","#6a6a66"],sc:20},[["bricks",{bw:130,bh:130,gap:2,rad:1,off:0,c:["#8e8e88","#9a9a94","#86867e"]}],["grain",{n:2500,r:[.3,.8],c:["#5a5a56","#c0c0ba"],a:.6}],["pebble",{n:25,r:[1.5,3],k:.1,h:0,c:["#3a3a3a","#2e2e30","#4a4844"]}],["crack",{n:1,t:[130,2],l:[60,120],c:"rgba(40,40,38,.75)",w:.8}]],0],
/* Kitchen counter */[{c:["#cfc8bc","#ddd6ca","#e8e2d8"],sc:30,k:1.2},[["grain",{n:6000,r:[.3,.9],c:["#8a8276","#6a6258","#b0a698","#3a3632","#f4f0ea"],a:.8}],["pebble",{n:40,r:[1,2.6],k:.5,c:["#c8a060","#a87a3a","#e0c890","#8a5a2a"],h:.8}],["spot",{n:3,r:[10,22],c:"#a07040",a:.12}]],0],
/* Bread slice */[{c:["#c8a46a","#d8b67c","#e6c890"],sc:20,ce:{s:7,e:1.6,ec:"#f4e2b8",j:.35}},[["spot",{n:6,r:[8,20],c:"#8a6430",a:.2}],["grain",{n:600,r:[.3,.6],c:["#fff2d0"],a:.5}]],0.55],
/* Cheese slice */[{c:["#e8c450","#f0d060","#f6dc78"],sc:40,k:1.3},[["puddle",{n:6,lv:1,r:[8,16],c:["#d8b040","#b08820"]}],["spot",{n:8,r:[10,30],c:"#fff0a0",a:.25}],["grain",{n:800,r:[.3,.6],c:["#c8a030"],a:.4}]],1.4],
/* Pizza */[{c:["#a8281a","#c03a20","#d04a28"],sc:14,k:1.6},[["spot",{n:30,r:[12,30],c:"#f8e8b0",a:.55}],["pebble",{n:6,r:[14,20],k:.06,e:[1,1.08],c:["#a8301e","#b83a24","#962818"],h:.5}],["grain",{n:120,r:[1.5,2.4],c:["#e8d8a0","#6a1a10"],a:.7}],["leaf",{n:4,s:[16,24],c:["#2e6a24","#3a7a2c"],h:1}],["grain",{n:300,r:[.3,.7],c:["#2a1a10"],a:.6}]],0],
/* Coffee beans */[{c:["#1a100a","#24160e"],sc:10},[["bean",{n:420,cm:4,s:[10,14],c:["#4a2a16","#5a341c","#3e2210","#6a3e20"]}]],1.4],
/* Rice */[{c:["#d8d2c4","#e4dece"],sc:8},[["pebble",{n:1400,r:[2,2.6],e:[2.1,2.5],k:.05,c:["#f4f0e6","#ece6d8","#faf8f0","#e0d8c6"],h:.5}]],0],
/* Honeycomb */[{c:["#c8902a","#d8a038","#e6b44a"],sc:20},[["comb",{r:5.8,cap:.35,c:["#f0b030","#a85a08","#f2d888","#d8b060"]}]],0],
/* Keyboard */[{c:["#141416","#1c1c20"],sc:10},[["bricks",{bw:30,bh:30,gap:3.4,rad:3,off:.25,c:["#2a2a2e","#2e2e32","#26262a"]}],["grain",{n:200,r:[.8,1.4],c:["#b8b8c0"],a:.4}]],0],
/* Circuit board */[{c:["#0e3a1e","#14482a","#1a5432"],sc:30,k:1.2},[["traces",{n:60,w:2,c:"#c89a3a",pc:"#e0c070",ic:3}],["grain",{n:300,r:[.3,.6],c:["#e8f0e8"],a:.4}]],0],
/* Graph paper */[{c:["#e8e6e0","#f2f0ea","#f8f6f2"],sc:40,k:1.2},[["grid",{s:7.7,w:.5,c:"rgba(80,140,200,.45)",M:5,cm:"rgba(60,110,180,.7)"}],["straw",{n:5,l:[30,80],w:[.8,1.2],c:["#5a5a60"],h:0}],["spot",{n:2,r:[10,20],c:"#a08a60",a:.12}]],0],
/* Newspaper */[{c:["#d8d2c2","#e2dccc","#ebe5d6"],sc:30,k:1.2},[["text",{cw:70,gap:8,lh:6,c:"#3a3834",hc:"#1a1816"}],["spot",{n:3,r:[12,26],c:"#a08050",a:.12}]],0],
/* Chessboard */[{c:["#6a4a2a","#7a5634","#8a623c"],sc:12,st:[1,6]},[["chess",{s:50,a:.82,c:["#e8d8b8","#3a2414"]}]],1.54],
/* Shag carpet */[{c:["#3a1e2a","#4a2636"],sc:10},[["needle",{n:6000,l:[4,8],w:1.3,c:["#8a3a5a","#9e4868","#7a2e4e","#b05a7a","#6a2442"],h:.6}]],1.8],
/* Denim */[{c:["#1a2a4a","#24386a","#30467a","#4a6090"],sc:16,k:1.5,sr:{f:1.6,w:.02,k:.45,ang:.8}},[["grain",{n:2500,r:[.3,.6],c:["#c8d4e8"],a:.35}]],0.7],
/* Leather */[{c:["#3a2010","#4a2a16","#5a341c","#6a3e22"],sc:24,k:1.6,ce:{s:9,e:1.1,ec:"#24120a",j:.08}},[["spot",{n:6,r:[14,30],c:"#c89a6a",a:.12}]],0.3],
/* Brick baseplate */[{c:["#2e7a3a","#348242"],sc:30,k:1.1},[["stud",{s:12.3,c:"#2e7a3a",hl:"#6ac07a"}]],1.8],
/* Coins */[{c:["#3a2a1c","#4a3624"],sc:20,st:[1,8]},[["coin",{n:60,r:[13,19],c:["#b88a3a","#c8a050","#a8a8a8","#b87a4a","#9a9a9a"]}]],1.8],
/* Tire tread */[{c:["#0e0e10","#141416"],sc:10},[["bricks",{bw:30,bh:18,gap:5,rad:3,off:.5,c:["#242426","#2a2a2c","#202022"]}],["grain",{n:1500,r:[.3,.7],c:["#3a3a3c","#0a0a0a"],a:.6}],["spot",{n:4,r:[14,30],c:"#6a5a4a",a:.15}]],1.8],
/* Drain grate */[{c:["#050505","#0c0a08"],sc:10},[["bars",{pt:20,bw:13,c:["#5a5650","#3e3a36","#22201e"]}],["spot",{n:10,r:[8,22],c:"#8a4a1e",a:.45}],["grain",{n:600,r:[.3,.8],c:["#2a2622","#6a645c"],a:.6}]],0],
/* Oil puddle */[{c:["#141420","#2a1a4a","#1a3a6a","#1a6a5a","#7a7a1a","#7a3a1a","#141420"],sc:50,k:1.4,sr:{f:.08,w:4,k:.55,ang:.3}},[["water",{c:"#0a0a10",a:.25}],["sparkle",{n:15}]],1.8],
/* Rice paddy */[{c:["#3a4a3a","#4a5a44","#5a6a4e"],sc:30},[["water",{c:"#4a6a6a",a:.3}],["tuft",{n:43,m:9,l:[10,24],w:1.4,c:["#4a8a2e","#5a9a36","#6aa83e"]}],["sparkle",{n:20}]],0],
/* Sulfur vent */[{c:["#6a6448","#7a7454","#8a845e"],sc:16},[["patch",{n:20,r:[6,16],m:30,d:[1,2.4],c:["#e8d020","#f0e040","#d8b818","#f4ec80"],h:.6}],["spot",{n:6,r:[20,50],c:"#ffffff",a:.22}],["crack",{n:3,l:[60,120],c:"rgba(30,26,16,.7)",w:1.2}]],1.8],
/* Spider web */[{c:["#0e1012","#161a1c","#1e2224"],sc:40},[["web",{cx:150,cy:100,n:28,r0:6,s:14,w:.55,c:"rgba(230,235,240,.6)"}],["drop",{n:25,r:[.6,1.4]}]],0],
/* Mycelium */[{c:["#2a1e14","#3e2c1e","#56402a"],sc:10,st:[6,1],k:2},[["crack",{n:30,l:[40,120],c:"rgba(240,236,224,.75)",w:.6}],["spot",{n:10,r:[8,20],c:"#f0ece0",a:.3}]],0],
/* Mushroom gills */[{c:["#c8b48e","#d6c4a0","#e2d2b0"],sc:40},[["veins",{cx:200,cy:-500,n:140,a0:.9,sp:1.35,L:1600,k:"rgba(90,64,36,.45)",lc:"rgba(255,245,225,.35)",w1:1.6,w2:.9}]],0],
/* Birch bark */[{c:["#d8d4cc","#e6e2da","#f0ece6"],sc:30,st:[3,1],k:1.3},[["straw",{n:70,l:[8,20],w:[1,2.2],d:0,s:.15,c:["#2a2622","#3a3430","#1a1816"],h:0}],["spot",{n:8,r:[10,24],c:"#3a3430",a:.35}],["crack",{n:3,l:[40,90],d:0,c:"rgba(30,26,22,.8)",w:1.4}],["spot",{n:5,r:[8,16],c:"#c89060",a:.25}]],1.8],
/* Crystal cave */[{c:["#141218","#1e1a24","#2a2432"],sc:14,k:1.8},[["spot",{n:6,r:[20,50],c:"#9a6ae0",a:.18}],["shard",{n:7,m:[4,8],l:[15,40],c:["#b890f0","#d0b8f8","#9a70e0","#e8e0ff"]}],["grain",{n:800,r:[.3,.8],c:["#4a4256","#0a080e"],a:.6}]],2.2]
];

let bgOn = 1, bgE = 0, bgC = 0, bgS = 0, bgKey = "", bgWait = 0;
const bgCv = document.createElement("canvas");
const bgDraw = (() => {
const sqrt = Math.sqrt, acos = Math.acos;
let LW = 400, LH = 260;
const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const mul = a => () => { a |= 0, a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
const rr = (R, v) => Array.isArray(v) ? v[0] + R() * (v[1] - v[0]) : v, pick = (R, a) => a[floor(R() * a.length)];
// pixel ground at density S (texture px per unit): fbm noise, stripes, voronoi cells
function ground(g, p, R, S) {
const w = round(LW * S), h = round(LH * S), lat = new Float32Array(65536);
for (let i = 0; i < 65536; i++) lat[i] = R();
const L = (i, j) => lat[((j & 255) << 8) | (i & 255)];
const vn = (x, y) => { const xi = floor(x), yi = floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), a = L(xi, yi), b = L(xi + 1, yi), c = L(xi, yi + 1), d = L(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v };
const fbm = (x, y, o) => { let s = 0, a = .5, f = 1, n = 0; for (let i = 0; i < o; i++) s += a * vn(x * f + i * 17.3, y * f + i * 9.1), n += a, a *= .5, f *= 2; return s / n };
const cols = p.c.map(hex), sc = p.sc || 20, st = p.st || [1, 1], oc = p.oc || 4, K = p.k || 2, sr = p.sr, ce = p.ce, ec = ce && hex(ce.ec);
const img = new ImageData(w, h), D = img.data;
for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
const x = i / S, y = j / S; let v = fbm(x / (sc * st[0]), y / (sc * st[1]), oc); v = (v - .5) * K + .5;
if (sr) { const t = (x * cos(sr.ang) + y * sin(sr.ang)) * sr.f + sr.w * 6 * fbm(x / 50, y / 50, 2); v = v * (1 - sr.k) + (.5 + .5 * sin(t)) * sr.k }
v = v < 0 ? 0 : v > 1 ? .9999 : v; const q = v * (cols.length - 1), n = floor(q), f = q - n, A = cols[n], B = cols[min(n + 1, cols.length - 1)];
let r = A[0] + (B[0] - A[0]) * f, gg = A[1] + (B[1] - A[1]) * f, b = A[2] + (B[2] - A[2]) * f;
if (ce) {
const sx = ce.sx || 1, cx = x / sx, gx = floor(cx / ce.s), gy = floor(y / ce.s); let F1 = 1e9, F2 = 1e9, id = 0;
for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = gx + dx, Y = gy + dy, ix = (((Y * 73856093) ^ (X * 19349663)) >>> 0) & 65535, px = (X + lat[ix]) * ce.s, py = (Y + lat[(ix * 7 + 13) & 65535]) * ce.s, u = (cx - px) * sx, d = u * u + (y - py) ** 2; d < F1 ? (F2 = F1, F1 = d, id = ix) : d < F2 && (F2 = d) }
const t = 1 + (lat[(id * 3 + 5) & 65535] - .5) * ce.j; r *= t, gg *= t, b *= t; const d = Math.sqrt(F2) - Math.sqrt(F1);
if (d < ce.e) { const m = (1 - d / ce.e) ** 1.5; r += (ec[0] - r) * m, gg += (ec[1] - gg) * m, b += (ec[2] - b) * m }
}
const o = (j * w + i) * 4; D[o] = r, D[o + 1] = gg, D[o + 2] = b, D[o + 3] = 255
}
const c = document.createElement("canvas"); c.width = w, c.height = h, c.getContext("2d").putImageData(img, 0, 0); g.imageSmoothingQuality = "high", g.drawImage(c, 0, 0, LW, LH)
}
// object: shadow pass offset by height h, then colour pass
const SH = "rgba(0,0,0,.34)";
function obj(g, h, fn) { if (h) { g.save(), g.translate(h * .8, h), fn(SH), g.restore() } fn(null) }
const col = (R, p, i) => p.lay ? p.c[floor(i / p.n * p.c.length)] : pick(R, p.c);
function blob(g, R, r, e, jag) {
const pts = []; for (let j = 0; j < 9; j++) { const t = j / 9 * TAU, q = r * (1 - jag + R() * jag); pts.push([cos(t) * q * e, sin(t) * q]) }
g.beginPath(); for (let j = 0; j < 9; j++) { const a = pts[j], b = pts[(j + 1) % 9], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; j ? g.quadraticCurveTo(a[0], a[1], mx, my) : g.moveTo(mx, my) } g.closePath()
}
// placement with layers: shape s = [x, y, angle, half length, radius] (capsule); level = 1 + highest level of the shapes it overlaps, over L = not placed (returns 0).
// k > 0: circles may share up to k of the smaller circle's area without counting as overlap
const ends = ([x, y, a, h]) => [x - cos(a) * h, y - sin(a) * h, x + cos(a) * h, y + sin(a) * h],
ptSeg = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1))); return hypot(px - ax - t * dx, py - ay - t * dy) },
side = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax),
segDist = (P, Q) => { const [a, b, c, d] = ends(P), [e, f, g, h] = ends(Q); return side(a, b, c, d, e, f) * side(a, b, c, d, g, h) < 0 && side(e, f, g, h, a, b) * side(e, f, g, h, c, d) < 0 ? 0 : min(ptSeg(a, b, e, f, g, h), ptSeg(c, d, e, f, g, h), ptSeg(e, f, a, b, c, d), ptSeg(g, h, a, b, c, d)) },
lens = (d, a, b) => d >= a + b ? 0 : d <= abs(a - b) ? PI * min(a, b) ** 2 : a * a * acos((d * d + a * a - b * b) / (2 * d * a)) + b * b * acos((d * d + b * b - a * a) / (2 * d * b)) - .5 * sqrt((-d + a + b) * (d + a - b) * (d - a + b) * (d + a + b));
function slot(arr, s, L, k = 0) {
const lv = 1 + arr.reduce((m, o) => (k ? lens(hypot(s[0] - o[0], s[1] - o[1]), s[4], o[4]) > k * PI * min(s[4], o[4]) ** 2 : segDist(s, o) < s[4] + o[4]) ? max(m, o[5]) : m, 0);
return lv > L ? 0 : (arr.push([...s, lv]), lv)
}
// layers; n = count for a 400 × 260 cut (scaled by area in bgDraw); lv = max layers (no overlap at 1)
const LY = {
grain(g,R,p){g.globalAlpha=p.a??1;for(let i=0;i<p.n;i++){g.fillStyle=pick(R,p.c),g.beginPath(),g.arc(R()*LW,R()*LH,rr(R,p.r),0,TAU),g.fill()}g.globalAlpha=1},
spot(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,r=rr(R,p.r),[a,b,c]=hex(p.c),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${a},${b},${c},${p.a})`),gr.addColorStop(1,`rgba(${a},${b},${c},0)`),g.fillStyle=gr,g.fillRect(x-r,y-r,2*r,2*r)}},
pebble(g,R,p){const A=[];for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,r=rr(R,p.r),e=p.e?rr(R,p.e):1+R()*.3,a=R()*TAU,c=col(R,p,i),seed=R()*1e9;if(p.lv&&!slot(A,[x,y,a,r*(e-1),r],p.lv))continue;
  obj(g,(p.h??1)*r/4,s=>{const RR=mul(seed);g.save(),g.translate(x,y),g.rotate(a),blob(g,RR,r,e,p.k??.25),g.fillStyle=s||c,g.fill();
    if(!s){const hx=-r*.35,hy=-r*.4,ca=cos(-a),sa=sin(-a),gr=g.createRadialGradient(hx*ca-hy*sa,hx*sa+hy*ca,0,0,0,r*1.25);gr.addColorStop(0,"rgba(255,255,255,.26)"),gr.addColorStop(.6,"rgba(255,255,255,0)"),gr.addColorStop(1,"rgba(0,0,0,.28)"),g.fillStyle=gr,g.fill()}
    g.restore()})}},
blade(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,l=rr(R,p.l),w=rr(R,p.w),a=p.d==null?R()*TAU:p.d+(R()-.5)*p.s,b=(R()-.5)*.8,c=col(R,p,i),tx=x+cos(a)*l,ty=y+sin(a)*l,nx=-sin(a),ny=cos(a),mx=(x+tx)/2+nx*b*l*.35,my=(y+ty)/2+ny*b*l*.35;
  obj(g,p.h??1,s=>{g.beginPath(),g.moveTo(x+nx*w/2,y+ny*w/2),g.quadraticCurveTo(mx+nx*w*.3,my+ny*w*.3,tx,ty),g.quadraticCurveTo(mx-nx*w*.3,my-ny*w*.3,x-nx*w/2,y-ny*w/2),g.closePath(),g.fillStyle=s||c,g.fill();
    s||(g.strokeStyle="rgba(255,255,255,.13)",g.lineWidth=w*.25,g.beginPath(),g.moveTo(x,y),g.quadraticCurveTo(mx,my,tx,ty),g.stroke())})}},
leaf(g,R,p){const A=[];for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,s=rr(R,p.s),wd=s*(.32+R()*.18),a=R()*TAU,c=col(R,p,i),hw=wd*.68;if(p.lv&&!slot(A,[x,y,a,max(0,s/2-hw),hw],p.lv))continue;
  obj(g,p.h??1,sh=>{g.save(),g.translate(x,y),g.rotate(a);g.beginPath(),g.moveTo(-s/2,0),g.bezierCurveTo(-s*.2,-wd,s*.25,-wd*.8,s/2,0),g.bezierCurveTo(s*.25,wd*.8,-s*.2,wd,-s/2,0),g.fillStyle=sh||c,g.fill();
    if(!sh){g.clip(),g.strokeStyle="rgba(40,20,8,.55)",g.lineWidth=.6,g.beginPath(),g.moveTo(-s/2,0),g.lineTo(s/2,0);for(let k=1;k<4;k++){const u=-s/2+k*s/4.2;g.moveTo(u,0),g.lineTo(u+s*.12,-wd*.55),g.moveTo(u,0),g.lineTo(u+s*.12,wd*.55)}g.stroke();const gr=g.createLinearGradient(0,-wd,0,wd);gr.addColorStop(0,"rgba(255,255,255,.12)"),gr.addColorStop(1,"rgba(0,0,0,.2)"),g.fillStyle=gr,g.fillRect(-s/2,-wd,s,2*wd)}g.restore()})}},
needle(g,R,p){g.lineCap="round";for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,l=rr(R,p.l),a=R()*TAU,c=col(R,p,i);obj(g,p.h??.6,s=>{g.strokeStyle=s||c,g.lineWidth=p.w||.8,g.beginPath(),g.moveTo(x,y),g.lineTo(x+cos(a)*l,y+sin(a)*l),g.stroke()})}},
straw(g,R,p){g.lineCap="round";for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,l=rr(R,p.l),w=rr(R,p.w),a=p.d==null?R()*TAU:p.d+(R()-.5)*p.s,c=col(R,p,i),b=(R()-.5)*l*.15,tx=x+cos(a)*l,ty=y+sin(a)*l,mx=(x+tx)/2-sin(a)*b,my=(y+ty)/2+cos(a)*b;
  obj(g,p.h??.7,s=>{g.strokeStyle=s||c,g.lineWidth=w,g.beginPath(),g.moveTo(x,y),g.quadraticCurveTo(mx,my,tx,ty),g.stroke();s||(g.strokeStyle="rgba(255,255,255,.18)",g.lineWidth=w*.35,g.stroke())})}},
clover(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,r=rr(R,p.r),a=R()*TAU,c=col(R,p,i);obj(g,p.h??1,s=>{g.fillStyle=s||c;for(let k=0;k<3;k++){const t=a+k*TAU/3;g.beginPath(),g.arc(x+cos(t)*r*.8,y+sin(t)*r*.8,r*.62,0,TAU),g.fill()}
  if(!s){g.strokeStyle="rgba(230,240,210,.35)",g.lineWidth=.45;for(let k=0;k<3;k++){const t=a+k*TAU/3;g.beginPath(),g.arc(x+cos(t)*r*.8,y+sin(t)*r*.8,r*.33,t+PI*.6,t+PI*1.4),g.stroke()}}})}},
flower(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,r=rr(R,p.r),c=pick(R,p.c);obj(g,1.2,s=>{g.fillStyle=s||c,g.beginPath(),g.arc(x,y,r,0,TAU),g.fill();if(!s){g.fillStyle="rgba(255,255,255,.55)";for(let k=0;k<12;k++){const t=R()*TAU,d=R()*r*.8;g.beginPath(),g.arc(x+cos(t)*d,y+sin(t)*d,.45,0,TAU),g.fill()}}})}},
fern(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,l=rr(R,p.l),a=R()*TAU,bd=(R()-.5)*.6,c=pick(R,p.c);
  obj(g,p.h??3,s=>{g.save(),g.translate(x,y),g.rotate(a);const pt=t=>[t*l,sin(t*PI)*bd*l*.3];g.strokeStyle=s||"#2a3a18",g.lineWidth=1.1,g.beginPath();for(let t=0;t<=1;t+=.05){const[u,v]=pt(t);t?g.lineTo(u,v):g.moveTo(u,v)}g.stroke();
    g.fillStyle=s||c;for(let t=.06;t<1;t+=.07*(1-t*.7)){const[u,v]=pt(t),z=l*.1*(1-t*.7);for(const sd of[-1,1]){g.save(),g.translate(u,v),g.rotate(sd*1.05),g.beginPath(),g.ellipse(z*.5,0,z*.55,z*.17,0,0,TAU),g.fill(),g.restore()}}g.restore()})}},
cone(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,s=rr(R,p.s),a=R()*TAU;obj(g,2.4,sh=>{g.save(),g.translate(x,y),g.rotate(a),g.fillStyle=sh||"#5a3a20",g.beginPath(),g.ellipse(0,0,s/2,s*.28,0,0,TAU),g.fill();
  if(!sh)for(let u=-s*.42;u<s*.42;u+=s*.09)for(let v=-1;v<=1;v++){const ww=s*.28*sqrt(max(0,1-(2*u/s)**2));g.fillStyle=(v+floor(u))%2?"#7a5430":"#6a4626",g.strokeStyle="rgba(30,16,6,.6)",g.lineWidth=.4,g.beginPath(),g.ellipse(u,v*ww*.55,s*.06,ww*.3,0,0,TAU),g.fill(),g.stroke()}g.restore()})}},
puddle(g,R,p){const A=[];for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,r=rr(R,p.r),seed=R()*1e9;if(p.lv&&!slot(A,[x,y,0,r*.4,r+2],p.lv))continue;g.save(),g.translate(x,y);blob(g,mul(seed),r,1.4,.35);g.strokeStyle="rgba(0,0,0,.28)",g.lineWidth=4,g.stroke();
  const gr=g.createRadialGradient(-r*.3,-r*.3,0,0,0,r*1.4);gr.addColorStop(0,p.c[0]),gr.addColorStop(1,p.c[1]),g.fillStyle=gr,g.fill();p.nh||(g.strokeStyle="rgba(220,230,235,.22)",g.lineWidth=1.2,g.beginPath(),g.ellipse(-r*.2,-r*.3,r*.5,r*.12,-.3,0,TAU),g.stroke());g.restore()}},
crack(g,R,p){g.lineCap=g.lineJoin="round";const walk=(x,y,a,n,w,dpt)=>{const pts=[[x,y]];for(let k=0;k<n;k++){a+=(R()-.5)*.9;x+=cos(a)*rr(R,[4,8]),y+=sin(a)*rr(R,[4,8]),pts.push([x,y]);dpt<2&&R()<.12&&walk(x,y,a+(R()<.5?1:-1)*rr(R,[.6,1.2]),floor(n*.4),w*.6,dpt+1)}
  for(const[c,o,lw]of[["rgba(255,255,255,.12)",.7,w*.6],[p.c,0,w]]){g.strokeStyle=c,g.lineWidth=lw,g.beginPath(),pts.forEach(([u,v],i)=>i?g.lineTo(u+o,v+o):g.moveTo(u+o,v+o)),g.stroke()}};
  for(let i=0;i<p.n;i++){let x=R()*LW,y=R()*LH;if(p.t){const[t,q]=p.t,cx=floor(x/t)*t+q/2,cy=floor(y/t)*t+q/2;x=clamp(x,cx+1,cx+t-q-1),y=clamp(y,cy+1,cy+t-q-1),g.save(),g.beginPath(),g.rect(cx,cy,t-q,t-q),g.clip()}walk(x,y,p.d==null?R()*TAU:p.d+(R()-.5)*.4,floor(rr(R,p.l)/6),p.w||1.2,0);p.t&&g.restore()}},
water(g,R,p){g.fillStyle=p.c,g.globalAlpha=p.a,g.fillRect(0,0,LW,LH),g.globalAlpha=1;g.strokeStyle="rgba(230,240,245,.16)",g.lineWidth=1;for(let i=0;i<14;i++){const x=R()*LW,y=R()*LH,l=rr(R,[20,70]);g.beginPath(),g.moveTo(x,y),g.quadraticCurveTo(x+l/2,y-4,x+l,y+1),g.stroke()}},
sparkle(g,R,p){g.strokeStyle="#fff",g.lineWidth=.55;for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,s=rr(R,[1,2.6]);g.globalAlpha=.4+R()*.6,g.beginPath(),g.moveTo(x-s,y),g.lineTo(x+s,y),g.moveTo(x,y-s),g.lineTo(x,y+s),g.stroke()}g.globalAlpha=1},
veins(g,R,p){g.lineCap="round";for(let i=0;i<p.n;i++){const a=p.a0+i/p.n*p.sp+(R()-.5)*.03,b=(R()-.5)*.15;for(const[c,o,w]of[[p.k,1.2,p.w1],[p.lc,0,p.w2]]){g.strokeStyle=c,g.lineWidth=w,g.beginPath(),g.moveTo(p.cx+o,p.cy+o);for(let t=0;t<=1;t+=.05){const d=t*p.L,aa=a+b*t;g.lineTo(p.cx+cos(aa)*d+o,p.cy+sin(aa)*d+o)}g.stroke()}}},
drop(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,r=rr(R,p.r);g.fillStyle="rgba(0,0,0,.25)",g.beginPath(),g.arc(x+r*.5,y+r*.6,r,0,TAU),g.fill();const gr=g.createRadialGradient(x+r*.3,y+r*.3,0,x,y,r);gr.addColorStop(0,"rgba(220,240,230,.35)"),gr.addColorStop(1,"rgba(120,170,140,.25)"),g.fillStyle=gr,g.beginPath(),g.arc(x,y,r,0,TAU),g.fill();g.fillStyle="rgba(255,255,255,.85)",g.beginPath(),g.arc(x-r*.35,y-r*.4,r*.22,0,TAU),g.fill()}},
planks(g,R,p){const jn=p.jn||[140,260];for(let y=0;y<LH;y+=p.bw){const c=pick(R,p.c);g.fillStyle=c,g.fillRect(0,y,LW,p.bw);const gr=g.createLinearGradient(0,y,0,y+p.bw);gr.addColorStop(0,"rgba(255,255,255,.08)"),gr.addColorStop(1,"rgba(0,0,0,.22)"),g.fillStyle=gr,g.fillRect(0,y,LW,p.bw);
  g.lineWidth=.6;const gl=p.gl||9;for(let k=0;k<gl;k++){const ph=R()*TAU,yy=y+p.bw*(k+.5)/gl;g.strokeStyle=`rgba(30,16,6,${.12+R()*.15})`,g.beginPath();for(let x=0;x<=LW;x+=6)x?g.lineTo(x,yy+sin(x*.02+ph)*p.bw*.06+sin(x*.07+ph*2)*.6):g.moveTo(x,yy);g.stroke()}
  p.nail!==0&&R()<.5&&(()=>{const kx=R()*LW,ky=y+p.bw*(.3+R()*.4);for(let q=4;q>0;q--)g.strokeStyle="rgba(40,20,8,.35)",g.beginPath(),g.ellipse(kx,ky,q*2.4,q*1.1,0,0,TAU),g.stroke()})();
  let jx=R()*jn[0];while(jx<LW){g.fillStyle="rgba(10,6,2,.7)",g.fillRect(jx,y,1.4,p.bw);if(p.nail!==0)for(const s of[-4,5])g.fillStyle="#2a2622",g.beginPath(),g.arc(jx+s,y+p.bw*.3,1,0,TAU),g.arc(jx+s,y+p.bw*.7,1,0,TAU),g.fill();jx+=rr(R,jn)}
  g.fillStyle="rgba(8,4,2,.85)",g.fillRect(0,y+p.bw-1.5,LW,1.5)}},
bricks(g,R,p){const off=p.off??.5,rad=p.rad??2.5,jt=p.j||0;for(let j=0;j*p.bh<LH;j++)for(let x=-(j%2?p.bw*off:0);x<LW;x+=p.bw){const y=j*p.bh,c=pick(R,p.c),q=p.gap/2+R()*jt,q2=p.gap/2+R()*jt;obj(g,.9,s=>{g.fillStyle=s||c,g.beginPath(),g.roundRect(x+q,y+q2,p.bw-p.gap-2*jt*.5,p.bh-p.gap-2*jt*.5,rad),g.fill();
  if(!s){const gr=g.createLinearGradient(x,y,x+p.bw,y+p.bh);gr.addColorStop(0,"rgba(255,255,255,.12)"),gr.addColorStop(1,"rgba(0,0,0,.18)"),g.fillStyle=gr,g.fill();g.fillStyle="rgba(40,36,30,.35)";for(let k=0;k<10;k++)g.beginPath(),g.arc(x+q+R()*(p.bw-p.gap),y+q2+R()*(p.bh-p.gap),.3+R()*.6,0,TAU),g.fill()}})}},
patch(g,R,p){for(let i=0;i<p.n;i++){const cx=R()*LW,cy=R()*LH,r=rr(R,p.r),m=p.m||14;for(let k=0;k<m;k++){const t=R()*TAU,d=sqrt(R())*r,x=cx+cos(t)*d,y=cy+sin(t)*d,z=rr(R,p.d),c=pick(R,p.c);
  obj(g,p.h??.4,s=>{g.fillStyle=s||c,g.beginPath(),g.arc(x,y,z,0,TAU),g.fill()})}}},
shell(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,s=rr(R,p.s),a=R()*TAU,c=pick(R,p.c);obj(g,1,sh=>{g.save(),g.translate(x,y),g.rotate(a),g.beginPath(),g.moveTo(0,s*.25),g.arc(0,s*.25,s,-PI*.88,-PI*.12),g.closePath(),g.fillStyle=sh||c,g.fill();
  if(!sh){g.strokeStyle="rgba(90,60,40,.45)",g.lineWidth=.5;for(let k=1;k<8;k++){const t=-PI*.88+k*PI*.76/8;g.beginPath(),g.moveTo(0,s*.25),g.lineTo(cos(t)*s,s*.25+sin(t)*s),g.stroke()}g.fillStyle="rgba(255,255,255,.18)",g.beginPath(),g.arc(0,s*.25,s*.6,-PI*.8,-PI*.5),g.lineTo(0,s*.25),g.fill()}g.restore()})}},
rivet(g,R,p){const seam=(x1,y1,x2,y2)=>{g.strokeStyle="rgba(0,0,0,.55)",g.lineWidth=1.6,g.beginPath(),g.moveTo(x1,y1),g.lineTo(x2,y2),g.stroke(),g.strokeStyle="rgba(255,255,255,.14)",g.lineWidth=.8,g.beginPath(),g.moveTo(x1+1,y1+1),g.lineTo(x2+1,y2+1),g.stroke();
  const L=hypot(x2-x1,y2-y1);for(let d=p.g/2;d<L;d+=p.g){const x=x1+(x2-x1)*d/L+(y1===y2?0:5),y=y1+(y2-y1)*d/L+(y1===y2?5:0),gr=g.createRadialGradient(x-.6,y-.6,0,x,y,1.8);gr.addColorStop(0,"#d8d4cc"),gr.addColorStop(1,"#4a4642"),g.fillStyle="rgba(0,0,0,.4)",g.beginPath(),g.arc(x+.8,y+1,1.8,0,TAU),g.fill(),g.fillStyle=gr,g.beginPath(),g.arc(x,y,1.8,0,TAU),g.fill()}};
  const ox=R()*p.sx,oy=R()*p.sy;for(let x=ox;x<LW;x+=p.sx)seam(x,0,x,LH);for(let y=oy;y<LH;y+=p.sy)seam(0,y,LW,y)},
check(g,R,p){g.globalAlpha=p.a;g.fillStyle=p.c[0],g.fillRect(0,0,LW,LH);g.fillStyle=p.c[1];g.globalAlpha=p.a*.5;for(let x=0;x<LW;x+=2*p.s)g.fillRect(x,0,p.s,LH);for(let y=0;y<LH;y+=2*p.s)g.fillRect(0,y,LW,p.s);
  g.globalAlpha=.07,g.fillStyle="#000";for(let x=0;x<LW;x+=2)g.fillRect(x,0,.6,LH);for(let y=0;y<LH;y+=2)g.fillRect(0,y,LW,.6);g.globalAlpha=1},
grid(g,R,p){g.lineWidth=p.w;let k=0;for(let x=R()*p.s;x<LW;x+=p.s,k++)g.strokeStyle=p.M&&k%p.M==0?p.cm:p.c,g.beginPath(),g.moveTo(x,0),g.lineTo(x,LH),g.stroke();k=0;for(let y=R()*p.s;y<LH;y+=p.s,k++)g.strokeStyle=p.M&&k%p.M==0?p.cm:p.c,g.beginPath(),g.moveTo(0,y),g.lineTo(LW,y),g.stroke()},
text(g,R,p){for(let c=0;c*p.cw<LW;c++){const x0=c*p.cw+p.gap/2,ww=p.cw-p.gap;let y=R()*p.lh;while(y<LH){if(R()<.06){g.fillStyle=p.hc;let x=x0;while(x<x0+ww*.8){const l=rr(R,[8,24]);g.fillRect(x,y,l,p.lh*1.1),x+=l+4}y+=p.lh*2}
  else{g.fillStyle=p.c;let x=x0;const end=x0+ww*(R()<.12?R():1);while(x<end){const l=min(rr(R,[3,14]),end-x);g.globalAlpha=.6+R()*.3,g.fillRect(x,y,l,p.lh*.45),x+=l+p.lh*.45}g.globalAlpha=1,y+=p.lh}}g.fillStyle="rgba(0,0,0,.15)",g.fillRect(c*p.cw-.4,0,.8,LH)}},
chess(g,R,p){g.globalAlpha=p.a;for(let j=0;j*p.s<LH;j++)for(let i=0;i*p.s<LW;i++)g.fillStyle=p.c[(i+j)%2],g.fillRect(i*p.s,j*p.s,p.s,p.s);g.globalAlpha=1,g.strokeStyle="rgba(0,0,0,.25)",g.lineWidth=.6;
  for(let x=0;x<LW;x+=p.s)g.beginPath(),g.moveTo(x,0),g.lineTo(x,LH),g.stroke();for(let y=0;y<LH;y+=p.s)g.beginPath(),g.moveTo(0,y),g.lineTo(LW,y),g.stroke()},
comb(g,R,p){const r=p.r,w=sqrt(3)*r;for(let j=0;j*1.5*r<LH+r;j++)for(let x=(j%2)*w/2;x<LW+w;x+=w){const y=j*1.5*r,cap=R()<p.cap;g.beginPath();for(let k=0;k<6;k++){const a=PI/6+k*PI/3;g.lineTo(x+cos(a)*r*.86,y+sin(a)*r*.86)}g.closePath();
  const gr=g.createRadialGradient(x-r*.2,y-r*.2,0,x,y,r);gr.addColorStop(0,cap?p.c[2]:p.c[0]),gr.addColorStop(1,cap?p.c[3]:p.c[1]),g.fillStyle=gr,g.fill();cap||(g.fillStyle="rgba(255,255,255,.35)",g.beginPath(),g.ellipse(x-r*.25,y-r*.3,r*.22,r*.1,-.5,0,TAU),g.fill())}},
traces(g,R,p){g.lineCap=g.lineJoin="round";for(let i=0;i<p.n;i++){let x=R()*LW,y=R()*LH,a=floor(R()*4)*PI/2;const pts=[[x,y]],n=floor(rr(R,[2,6]));for(let k=0;k<n;k++){const l=rr(R,[10,50]);x+=cos(a)*l,y+=sin(a)*l,pts.push([x,y]),a+=(R()<.5?1:-1)*PI/4*(R()<.5?1:2)}
  for(const[c,w,o]of[["rgba(0,0,0,.3)",p.w+1,.6],[p.c,p.w,0]]){g.strokeStyle=c,g.lineWidth=w,g.beginPath(),pts.forEach(([u,v],k)=>k?g.lineTo(u+o,v+o):g.moveTo(u+o,v+o)),g.stroke()}
  for(const[u,v]of[pts[0],pts[pts.length-1]])g.fillStyle=p.pc,g.beginPath(),g.arc(u,v,p.w*1.4,0,TAU),g.fill(),g.fillStyle="#1a1a14",g.beginPath(),g.arc(u,v,p.w*.5,0,TAU),g.fill()}
  for(let i=0;i<p.ic;i++){const x=R()*LW,y=R()*LH,w=rr(R,[24,48]),h=rr(R,[14,30]);obj(g,1.5,s=>{g.fillStyle=s||"#1c1c1e",g.fillRect(x,y,w,h)});g.fillStyle=p.pc;for(let k=3;k<w-2;k+=4)g.fillRect(x+k,y-2.5,1.6,2.5),g.fillRect(x+k,y+h,1.6,2.5);g.fillStyle="rgba(255,255,255,.25)",g.beginPath(),g.arc(x+4,y+4,1.4,0,TAU),g.fill()}},
web(g,R,p){const sp=[];for(let i=0;i<p.n;i++)sp.push(i/p.n*TAU+(R()-.5)*.15);g.strokeStyle=p.c,g.lineWidth=p.w;for(const a of sp)g.beginPath(),g.moveTo(p.cx,p.cy),g.lineTo(p.cx+cos(a)*1500,p.cy+sin(a)*1500),g.stroke();
  g.beginPath();for(let r=p.r0,k=0;r<1500;k++,r+=p.s/p.n){const a=sp[k%p.n],x=p.cx+cos(a)*r,y=p.cy+sin(a)*r;k?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()},
stud(g,R,p){const r=p.s*.3;for(let y=p.s/2;y<LH+p.s;y+=p.s)for(let x=p.s/2;x<LW+p.s;x+=p.s){g.fillStyle="rgba(0,0,0,.3)",g.beginPath(),g.arc(x+r*.35,y+r*.45,r,0,TAU),g.fill();const gr=g.createRadialGradient(x-r*.4,y-r*.4,0,x,y,r);gr.addColorStop(0,p.hl),gr.addColorStop(1,p.c),g.fillStyle=gr,g.beginPath(),g.arc(x,y,r,0,TAU),g.fill()}},
coin(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,r=rr(R,p.r),c=pick(R,p.c);obj(g,2,s=>{g.beginPath(),g.arc(x,y,r,0,TAU);if(s)return g.fillStyle=s,void g.fill();const[a,b,cc]=hex(c),gr=g.createLinearGradient(x-r,y-r,x+r,y+r);
  gr.addColorStop(0,`rgb(${min(255,a+60)},${min(255,b+60)},${min(255,cc+50)})`),gr.addColorStop(.5,c),gr.addColorStop(1,`rgb(${a*.55},${b*.55},${cc*.55})`),g.fillStyle=gr,g.fill();g.strokeStyle="rgba(0,0,0,.35)",g.lineWidth=r*.08,g.beginPath(),g.arc(x,y,r*.86,0,TAU),g.stroke();g.strokeStyle="rgba(255,255,255,.25)",g.lineWidth=r*.12,g.beginPath(),g.arc(x,y,r*.5,PI*.9,PI*1.6),g.stroke()})}},
bean(g,R,p){for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH,s=rr(R,p.s),a=R()*TAU,c=pick(R,p.c);obj(g,s*.15,sh=>{g.save(),g.translate(x,y),g.rotate(a),g.beginPath(),g.ellipse(0,0,s/2,s*.34,0,0,TAU),g.fillStyle=sh||c,g.fill();
  if(!sh){const gr=g.createRadialGradient(-s*.15,-s*.12,0,0,0,s*.55);gr.addColorStop(0,"rgba(255,230,200,.3)"),gr.addColorStop(1,"rgba(0,0,0,.35)"),g.fillStyle=gr,g.fill();g.strokeStyle="rgba(20,8,2,.85)",g.lineWidth=s*.07,g.beginPath(),g.moveTo(-s*.4,0),g.bezierCurveTo(-s*.1,-s*.1,s*.1,s*.1,s*.4,0),g.stroke()}g.restore()})}},
bars(g,R,p){for(let y=R()*p.pt-p.pt;y<LH;y+=p.pt)obj(g,1.5,s=>{if(s)return g.fillStyle=s,void g.fillRect(0,y,LW,p.bw);const gr=g.createLinearGradient(0,y,0,y+p.bw);gr.addColorStop(0,p.c[0]),gr.addColorStop(.4,p.c[1]),gr.addColorStop(1,p.c[2]),g.fillStyle=gr,g.fillRect(0,y,LW,p.bw)})},
shard(g,R,p){for(let i=0;i<p.n;i++){const cx=R()*LW,cy=R()*LH,m=floor(rr(R,p.m)),a0=R()*TAU,c=pick(R,p.c);for(let k=0;k<m;k++){const a=a0+(R()-.5)*1.6,l=rr(R,p.l),w=l*rr(R,[.18,.28]),x=cx+cos(a)*l*.15,y=cy+sin(a)*l*.15;
  obj(g,l*.12,s=>{g.save(),g.translate(x,y),g.rotate(a);const P=[[0,-w/2],[l*.8,-w/2],[l,0],[l*.8,w/2],[0,w/2]];g.beginPath(),P.forEach(([u,v],j)=>j?g.lineTo(u,v):g.moveTo(u,v)),g.closePath(),g.fillStyle=s||c,g.fill();
  s||(g.fillStyle="rgba(255,255,255,.35)",g.beginPath(),g.moveTo(0,-w/2),g.lineTo(l*.8,-w/2),g.lineTo(l,0),g.lineTo(0,0),g.closePath(),g.fill(),g.strokeStyle="rgba(255,255,255,.5)",g.lineWidth=.5,g.beginPath(),g.moveTo(0,0),g.lineTo(l,0),g.stroke());g.restore()})}}},
tuft(g,R,p){g.lineCap="round";for(let i=0;i<p.n;i++){const x=R()*LW,y=R()*LH;for(let k=0;k<p.m;k++){const a=R()*TAU,l=rr(R,p.l),c=pick(R,p.c),tx=x+cos(a)*l,ty=y+sin(a)*l,b=(R()-.5)*3;
  obj(g,1.5,s=>{g.strokeStyle=s||c,g.lineWidth=p.w,g.beginPath(),g.moveTo(x,y),g.quadraticCurveTo((x+tx)/2+b,(y+ty)/2,tx,ty),g.stroke()})}}},
lily(g,R,p){const A=[];for(let i=0;i<40;i++){const x=R()*LW,y=R()*LH,r=rr(R,[150,210]),a=R()*TAU,w=rr(R,[20,30])*PI/180,c=pick(R,p.c);if(!slot(A,[x,y,0,0,r],1,.33))continue;
  obj(g,3,s=>{g.save(),g.beginPath(),g.moveTo(x,y),g.arc(x,y,r,a+w/2,a-w/2+TAU),g.closePath(),g.fillStyle=s||c,g.fill();if(!s){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,"rgba(255,255,255,.08)"),gr.addColorStop(1,"rgba(0,0,0,.25)"),g.fillStyle=gr,g.fill(),g.clip(),g.lineCap="round";
    for(let k=0;k<18;k++){const b=a+w/2+(k+.5)/18*(TAU-w);for(const[sc,o,lw]of[["rgba(10,30,6,.35)",1.2,2.2],["rgba(180,220,120,.28)",0,1.3]])g.strokeStyle=sc,g.lineWidth=lw,g.beginPath(),g.moveTo(x+o,y+o),g.lineTo(x+cos(b)*r+o,y+sin(b)*r+o),g.stroke()}}g.restore()})}}
};
// draws BG_ENV[e] over W × H game px; layer counts n scale with the area (C: also / z², × cm); veins and web (with cx) keep their count
return (g, e, c, seed, W, H) => {
const [def, ls, zz] = BG_ENV[e], z = c ? abs(zz) : 1, R = mul(seed), k = W * H / 104e3 / z / z;
g.save(), g.scale(z, z), LW = W / z, LH = H / z, ground(g, def, R, z);
for (const [n, p] of ls) LY[n](g, R, p.n && p.cx == null ? { ...p, n: floor(p.n * k * (c && p.cm || 1) + R()) } : p);
g.restore()
}
})();
function bgPick() {
const z = BG_ENV[bgE = ri(BG_ENV.length)][2];
bgC = z < 0 || z > 0 && ri(2), bgS = ri(1e9), bgWait = 1, requestAnimationFrame(() => setTimeout(() => bgWait = 0))
}
// cached per pick and box size; right after a pick the plain backdrop shows for one frame (the render runs while the fight box is still empty)
function drawBg() {
const key = [bgE, bgC, bgS, boxLW, boxLH, boxS].join();
if (key !== bgKey) {
if (bgWait) return 0;
bgKey = key;
const dpr = (window.devicePixelRatio || 1) * boxS, g = bgCv.getContext("2d");
bgCv.width = max(1, round(boxLW * dpr)), bgCv.height = max(1, round(boxLH * dpr)), g.setTransform(dpr, 0, 0, dpr, 0, 0);
bgDraw(g, bgE, bgC, bgS, boxLW, boxLH);
g.strokeStyle = "rgba(0,0,0,.45)", g.lineWidth = 2, g.strokeRect(1, 1, boxLW - 2, boxLH - 2)
}
return boxCx.drawImage(bgCv, 0, 0, boxLW, boxLH), 1
}
bgPick();
