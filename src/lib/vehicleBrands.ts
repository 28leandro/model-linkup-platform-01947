// Vehicle brand → models mapping
// Models commercialized in Paraguay between 2005 and present.
// Lists are intentionally generous; "Otro" allows free text in the form.

export type BrandModelMap = Record<string, string[]>;

export const AUTOS_BRAND_MODELS: BrandModelMap = {
  Toyota: ["Corolla","Corolla Cross","Yaris","Yaris Cross","Etios","Hilux","Hilux SW4","Fortuner","RAV4","Land Cruiser","Land Cruiser Prado","4Runner","Tacoma","Camry","Prius","Avanza","Innova","Hiace","Rush","C-HR","Highlander","FJ Cruiser","Probox"],
  Volkswagen: ["Gol","Gol Trend","Voyage","Saveiro","Polo","Polo Track","Virtus","Vento","Bora","Jetta","Passat","Golf","T-Cross","Taos","Tiguan","Amarok","Nivus","Suran","Fox","Crossfox","up!"],
  Chevrolet: ["Onix","Onix Plus","Prisma","Aveo","Sonic","Cruze","Spin","Tracker","Captiva","S10","Montana","Trailblazer","Corsa","Astra","Vectra","Agile","Cobalt","Celta","D-Max","Equinox"],
  Ford: ["Fiesta","Ka","EcoSport","Focus","Fusion","Mondeo","Ranger","F-150","Edge","Escape","Kuga","Territory","Bronco Sport","Maverick","Explorer","Everest"],
  Hyundai: ["Atos","i10","Accent","HB20","Elantra","Sonata","Veloster","Tucson","Santa Fe","Creta","Kona","Palisade","Venue","Grand i10","Getz","ix35","H1","H100","Porter"],
  Kia: ["Picanto","Rio","Cerato","K3","K5","Optima","Sportage","Sorento","Soul","Seltos","Stonic","Carnival","Carens","Forte","Mohave"],
  Nissan: ["March","Versa","Sentra","Tiida","Almera","Altima","Note","Micra","Kicks","X-Trail","Qashqai","Pathfinder","Murano","Frontier","Navara","NP300","Patrol","Sunny"],
  Honda: ["Fit","City","Civic","Accord","HR-V","CR-V","WR-V","Pilot","Passport","Ridgeline"],
  Renault: ["Logan","Sandero","Stepway","Symbol","Clio","Megane","Fluence","Duster","Oroch","Captur","Kwid","Kangoo","Master","Koleos","Alaskan"],
  Peugeot: ["207","208","2008","301","308","3008","408","5008","508","Partner","Expert","Hoggar","Boxer","Landtrek"],
  Citroen: ["C3","C3 Picasso","C4","C4 Cactus","C4 Lounge","C5 Aircross","Berlingo","Jumper","Jumpy"],
  Fiat: ["Palio","Siena","Strada","Uno","Mobi","Argo","Cronos","Toro","Pulse","Fastback","500","Ducato","Doblo","Idea","Linea","Bravo"],
  Mitsubishi: ["Lancer","ASX","Outlander","Eclipse Cross","Pajero","Pajero Sport","Pajero Dakar","Pajero TR4","L200","Triton","Montero","Mirage","Xpander","Space Wagon"],
  "Mercedes-Benz": ["Clase A","Clase B","Clase C","Clase E","Clase S","CLA","CLS","GLA","GLB","GLC","GLE","GLS","Sprinter","Vito","Viano","Citan","Clase G","SLK","SL"],
  BMW: ["Serie 1","Serie 2","Serie 3","Serie 4","Serie 5","Serie 7","X1","X2","X3","X4","X5","X6","X7","Z4","M2","M3","M4","M5","i3","iX","iX3"],
  Audi: ["A1","A3","A4","A5","A6","A7","A8","Q2","Q3","Q5","Q7","Q8","TT","R8","e-tron"],
  Suzuki: ["Alto","Celerio","Swift","Baleno","Dzire","Ciaz","SX4","S-Cross","Vitara","Grand Vitara","Jimny","XL7","Ertiga","APV","Ignis"],
  Mazda: ["2","3","6","CX-3","CX-30","CX-5","CX-7","CX-9","CX-30","BT-50","MX-5"],
  Jeep: ["Renegade","Compass","Cherokee","Grand Cherokee","Wrangler","Gladiator","Commander","Patriot"],
  Geely: ["Emgrand","Emgrand 7","Coolray","Tugella","Atlas","Atlas Pro","Azkarra","GS","Boyue","Geometry C","Monjaro"],
  BYD: ["F0","F3","F6","Song","Song Plus","Tang","Yuan","Yuan Plus","Dolphin","Atto 3","Han","Seal","Seagull","Shark","Qin","Han EV"],
  Chery: ["QQ","Tiggo 2","Tiggo 3","Tiggo 4","Tiggo 5","Tiggo 7","Tiggo 7 Pro","Tiggo 8","Tiggo 8 Pro","Arrizo 5","Arrizo 6","Fulwin","Face","Cielo","Omoda 5","Jaecoo 7"],
  JAC: ["J2","J3","J4","J5","J6","S2","S3","S4","S5","S7","T6","T8","iEV"],
  "Great Wall": ["Hover","Wingle","H3","H5","H6","Steed","Poer"],
  Haval: ["H1","H2","H6","H6 GT","H9","Jolion","Dargo","F7"],
  MG: ["MG3","MG5","MG6","MG ZS","MG HS","MG GT","MG RX5","MG RX8","MG One","Cyberster"],
  Changan: ["Alsvin","Eado","CS15","CS35","CS35 Plus","CS55","CS75","CS95","Hunter","Lamore","Uni-T","Uni-K"],
  Dongfeng: ["S30","H30","AX3","AX4","AX7","Glory 580","Rich 6","DFSK"],
  GAC: ["GS3","GS4","GS5","GS8","GA3","GA4","GA6","Empow","Emkoo"],
  Lifan: ["320","520","620","X50","X60","X70","Foison","Myway"],
  DFSK: ["Glory 500","Glory 580","Glory 600","Glory iX5","K01","K02","K05"],
};

export const MOTOS_BRAND_MODELS: BrandModelMap = {
  Honda: ["CG 125","CG 150","CG 160","Wave","Biz 125","Biz 110","Pop 110","Titan","Bros 160","XR 150","XRE 190","XRE 300","Falcon NX 400","CB 250 Twister","CB 300","CB 500","CB 600","CB 1000","CBR 250","CBR 600","CBR 1000","Africa Twin","Hornet","NXR 150","Elite 125"],
  Yamaha: ["YBR 125","YBR 150","Crypton","Fazer 150","Fazer 250","FZ 16","FZ 25","FZ S","Lander 250","XTZ 125","XTZ 150","XTZ 250 Tenere","XTZ 660","XTZ 1200","MT-03","MT-07","MT-09","MT-15","R3","R6","R1","Ray ZR","NMAX","XMAX"],
  Suzuki: ["AX 100","EN 125","Gixxer 150","Gixxer 250","GN 125","GSX 150","GSX 250","GSX-R 600","GSX-R 750","GSX-R 1000","V-Strom 250","V-Strom 650","V-Strom 1000","Burgman","Address"],
  Kawasaki: ["Ninja 250","Ninja 300","Ninja 400","Ninja 650","Ninja ZX-6R","Ninja ZX-10R","Z250","Z400","Z650","Z750","Z800","Z900","Z1000","Versys 300","Versys 650","Versys 1000","KLR 650","KLX 150"],
  Bajaj: ["Boxer 100","Boxer 150","CT 100","Discover 125","Discover 150","Pulsar 135","Pulsar 150","Pulsar 180","Pulsar 200 NS","Pulsar 200 RS","Pulsar 220","Pulsar N250","Pulsar F250","Dominar 250","Dominar 400","Avenger 220","Rouser"],
  KTM: ["Duke 125","Duke 200","Duke 250","Duke 390","Duke 690","Duke 790","Duke 890","RC 200","RC 390","Adventure 250","Adventure 390","Adventure 790","Adventure 890","Adventure 1290","SX","EXC"],
  Kenton: ["GT 150","GT 200","Strada 150","Sport 150","Trail 200","Cargo","Speed 150","KP 150"],
  Star: ["Cargo","Pasajero","Trabajo 150","Cross 150","Sport 200"],
  Leopard: ["LP 110","LP 125","LP 150","LP 200","Trail 200","Cross"],
  Zanella: ["RX 150","RX 200","ZB 110","Patagonian Eagle","Hot 90","Sapucai","Tricargo"],
  Loncin: ["LX 150","LX 200","CR3","CRF 250","Voge 300","Voge 500","GP 150"],
  Lifan: ["LF 125","LF 150","LF 200","KP 150","KPR 200","KPT 200"],
  Zongshen: ["ZS 125","ZS 150","ZS 200","RX1","RX3","RX4","RX6"],
  Haojue: ["HJ 125","HJ 150","DK 150","TR 150","KA 135"],
  Jianshe: ["JS 125","JS 150","JS 200","JS 250"],
  "Royal Enfield": ["Bullet 350","Classic 350","Meteor 350","Hunter 350","Himalayan","Continental GT 650","Interceptor 650"],
  Harley: ["Street 750","Iron 883","Sportster","Forty-Eight","Fat Boy","Road King","Street Glide","Pan America"],
};

export const CAMIONES_BRAND_MODELS: BrandModelMap = {
  "Mercedes-Benz": ["Accelo","Atego","Axor","Actros","Atron","Arocs","L 1620","LS 1634","LS 1938","LS 2543","Sprinter Chasis"],
  Volvo: ["VM 270","VM 330","FH 380","FH 420","FH 440","FH 460","FH 480","FH 500","FH 540","FM 370","FM 400","FM 440","FMX","NH 12"],
  Scania: ["P 230","P 250","P 310","P 360","G 380","G 410","G 440","G 460","G 480","R 380","R 420","R 440","R 450","R 470","R 500","R 540","R 560","R 580","R 620","R 730","S 500","S 540","S 580","T 124"],
  Iveco: ["Daily","Tector","Cursor","Stralis","Hi-Way","Hi-Road","Trakker","S-Way","Eurocargo","T-Way"],
  MAN: ["TGL","TGM","TGS","TGX","TGA","Constellation","CLA","Latitude"],
  Volkswagen: ["Delivery","Worker","Constellation","Meteor","Robust","Titan","8.150","9.150","11.180","13.180","15.190","17.230","19.320","24.250","24.280","25.320","26.260","26.300","26.420","31.260","31.320"],
  Ford: ["Cargo 815","Cargo 1119","Cargo 1119e","Cargo 1717","Cargo 1723","Cargo 1729","Cargo 1932","Cargo 2042","Cargo 2422","Cargo 2629","Cargo 2842","F-350","F-4000","F-MAX"],
  Hyundai: ["HD35","HD45","HD65","HD72","HD78","HD120","HD170","HD250","HD320","Mighty","Xcient"],
  JAC: ["1040","1042","1061","1063","1080","1090","1130","1134","1145","1163","1402","Gallop","N75","N120","N350"],
  Foton: ["Aumark","Auman","Tunland","BJ1039","BJ1043","BJ1049","BJ1059","BJ1069","Daimler"],
  Sinotruk: ["Howo","Sitrak","Hohan","T5G","T7H","C5H","C7H","A7"],
  Dongfeng: ["DFL","KC","KX","Captain","Furika","Liuzhou"],
  Shacman: ["X3000","F3000","F2000","H3000","M3000","X6000"],
  FAW: ["J5","J6","J7","Jiefang","Tiger V","Tiger VR"],
  Higer: ["KLQ","Pickup","Bus Chasis"],
  Yutong: ["ZK6122","ZK6129","ZK6938","ZK6107","ZK6118","ZK6831"],
  "Golden Dragon": ["XML6105","XML6125","XML6796","XML6857"],
  Mack: ["Granite","Anthem","Pinnacle","Trident","Titan"],
  International: ["9800i","9200i","Lonestar","ProStar","DuraStar"],
};

export const VEHICLE_BRAND_MODELS: Record<string, BrandModelMap> = {
  autos: AUTOS_BRAND_MODELS,
  motos: MOTOS_BRAND_MODELS,
  camiones: CAMIONES_BRAND_MODELS,
};

export const getVehicleBrands = (subId?: string | null): string[] => {
  if (!subId) return [];
  const map = VEHICLE_BRAND_MODELS[subId];
  return map ? Object.keys(map).sort() : [];
};

export const getVehicleModels = (subId?: string | null, brand?: string | null): string[] => {
  if (!subId || !brand) return [];
  return VEHICLE_BRAND_MODELS[subId]?.[brand] ?? [];
};
