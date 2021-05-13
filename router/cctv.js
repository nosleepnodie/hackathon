const parse  = require("csv-parse/lib/sync"); // npm install csv-parse
const fs = require("fs"); // npm install fs

var name = ["경기도", "경상남도", "경상북도", "광주", "대구", "대전", "부산", "서울", "울산", "인천", "전라남도", "전라북도", "제주도", "충청남도", "충청북도"];
const data = [];
const bell = parse(fs.readFileSync("./bell.csv").toString());
const police = parse(fs.readFileSync("./police.csv").toString());
const center = parse(fs.readFileSync("./center.csv").toString());
// 위도 6, 경도 7

for(var i = 0; i < name.length; i++){
    const csv = fs.readFileSync("./" + String(i) + ".csv");

    data[i] = parse(csv.toString());
}

var dict = {};
for(var i = 0; i < name.length; i++){
    dict[name[i]] = i;
}

//console.log(data[2]); // 경상북도
//console.log(data[dict["인천"]]);

/*
[
  '번호',             '관리기관명',
  '소재지도로명주소', '소재지지번주소',
  '설치목적구분',     '카메라대수',
  '카메라화소수',     '촬영방면정보',
  '보관일수',         '설치연월',
  '관리기관전화번호',  '위도',
  '경도',             '데이터기준일자'
]
*/
// 도로명주소 2, 위도 11, 경도 12

function getDistance(lat1, lon1, lat2, lon2) {
  if ((lat1 == lat2) && (lon1 == lon2))
      return 0;

  var radLat1 = Math.PI * lat1 / 180;
  var radLat2 = Math.PI * lat2 / 180;
  var theta = lon1 - lon2;
  var radTheta = Math.PI * theta / 180;
  var dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
  if (dist > 1)
      dist = 1;

  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515 * 1.609344 * 1000;
  if (dist < 100) dist = Math.round(dist / 10) * 10;
  else dist = Math.round(dist / 100) * 100;

  return dist;
}

function get_near_cctv(lat, lon){
  var ret = []

  for(var i = 0; i < data.length; i++){
    for(var j = 0; j < data[i].length; j++){
      var dist = getDistance(lat, lon, data[i][j][11], data[i][j][12]);

      if(dist <= 1000) ret.push([dist, data[i][j][11], data[i][j][12], 0]);
    }
  } // 0 : cctv

  for(var i = 0; i < bell.length; i++){
    var dist = getDistance(lat, lon, bell[i][6], bell[i][7]);

    if(dist <= 1000) ret.push([dist, bell[i][6], bell[i][7], 1]);
  } // 1 : 벨

  for(var i = 0; i < police.length; i++){
    var dist = getDistance(lat, lon, police[i][1], police[i][2]);

    if(dist <= 1000) ret.push([dist, police[i][1], police[i][2], 2]);
  } // 2 : 경찰서

  for(var i = 0; i < center.length; i++){
    var dist = getDistance(lat, lon, center[i][7], center[i][8]);

    if(dist <= 1000) ret.push([dist, center[i][7], center[i][8], 3]);
  } // 3 : 지구대 파출소

  // 정렬은 귀찮으니 n^2으로; bubble sorting
  for(var i = 0; i < ret.length; i++){
    for(var j = i - 1; j >= 0; j--){
      if(ret[j][0] > ret[j + 1][0]){
        var temp = ret[j];
        ret[j] = ret[j + 1];
        ret[j + 1] = temp;
      }
    }
  }  

  return ret;
  // return type: array; [distance, location, latitute, logitute]
}

var res = get_near_cctv(37.5032838,127.0850114); // 서울 이태원 경리단길
console.log(res);