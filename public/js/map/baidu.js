// 百度地图API功能
  var map = new BMap.Map("map");
  map.centerAndZoom("北京",9);
  map.addControl(new BMap.NavigationControl());    
  map.addControl(new BMap.ScaleControl());    
  map.addControl(new BMap.OverviewMapControl());    
  map.addControl(new BMap.MapTypeControl());
  map.enableScrollWheelZoom(true);

	var cur_point;
  // 浏览器定位所在地
  $('#getCurLoc').click(function(){
  	$(this).removeAttr('data-tooltip');
  	$(this).addClass('loading');
  	getCurrentLocation();
  });
  function getCurrentLocation(){
	  var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r){
			if(this.getStatus() == BMAP_STATUS_SUCCESS){
				map.clearOverlays();
				var mk = new BMap.Marker(r.point);
				map.addOverlay(mk);
				mk.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
				map.panTo(r.point);
				$('.latitude').val(r.point.lat);
				$('.longitude').val(r.point.lng);
				cur_point = r.point;
				// 将地址解析为字符
				var geoc = new BMap.Geocoder();    
				geoc.getLocation(r.point, function(rs){
					var addComp = rs.addressComponents;
					var address = addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber;
					$('#suggestId').val(address);
    			$('#getCurLoc').attr('data-tooltip','所在地：'+address);
					$('#getCurLoc').removeClass('loading');
				});        
			}
			else {
				alert('failed'+this.getStatus());
			}        
		},{enableHighAccuracy: true});
  }

	// 用经纬度设置地图中心点
	$('#locate').click(function(){
		var lat;
		var lng;
		if($('#lat_txt').text().indexOf('N')!=-1){
			lat = $('.latitude').val();
		}else if($('#lat_txt').text().indexOf('S')!=-1){
			lat = - $('.latitude').val();
		}
		if($('#lng_txt').text().indexOf('E')!=-1){
			lng = $('.longitude').val();
		}else if($('#lng_txt').text().indexOf('W')!=-1){
			lng = - $('.longitude').val();
		}
		theLocation(lat,lng);
	});
	function theLocation(lat,lng){
    if(lat !== "" && lng !== ""){
        var new_point = new BMap.Point(lng,lat);
        var marker = new BMap.Marker(new_point);  // 创建标注
        map.addOverlay(marker);              // 将标注添加到地图中
        map.panTo(new_point);      
				// 将地址解析为字符
				var geoc = new BMap.Geocoder();    
				geoc.getLocation(new_point, function(rs){
					var addComp = rs.addressComponents;
					var address = addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber;
					$('#suggestId').val(address);
				});    
    }
	}

	// ----------------------------------------------------------
	// 地图关键字输入框提示
	var ac = new BMap.Autocomplete({    //建立一个自动完成的对象
			"input" : "suggestId",
			"location" : map
	});

	ac.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
	var str = "";
		var _value = e.fromitem.value;
		var value = "";
		if (e.fromitem.index > -1) {
			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		}    
		str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;
		
		value = "";
		if (e.toitem.index > -1) {
			_value = e.toitem.value;
			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		}    
		str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
		$("#searchResultPanel").innerHTML = str;
	});

	var myValue;
	ac.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
	var _value = e.item.value;
		myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		$("#searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
		
		setPlace();
	});

	function setPlace(){
		map.clearOverlays();    //清除地图上所有覆盖物
		function myFun(){
			var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
			map.centerAndZoom(pp, 18);
			map.addOverlay(new BMap.Marker(pp));    //添加标注
		}
		var local = new BMap.LocalSearch(map, { //智能搜索
		  onSearchComplete: myFun
		});
		local.search(myValue);
		// 创建地址解析器实例
		var myGeo = new BMap.Geocoder();
		// 将地址解析为经纬度 并显示
		myGeo.getPoint(myValue, function(point){
			if (point) {
				$('.latitude').val(point.lat);
				$('.longitude').val(point.lng);
			}else{
				alert("您选择地址没有解析到结果!");
			}
		});
	}
	// ----------------------------------------------------------
//去这个地球上最远的地方！
$('#go-far-in-earth').click(function(){
	var cur_lat = parseFloat($('.latitude').val());
	var cur_lng = parseFloat($('.longitude').val());

	var pointA = new BMap.Point(cur_lng,cur_lat);
	var pointB = getFarthestInEarth(cur_lat,cur_lng);
  displayDistance(pointA,pointB);
});

	function getFarthestInEarth(latitude,longitude){
		var go_lat = -latitude;
		var go_lng;
		if(longitude <= 0){
			go_lng = longitude + 180;
		}else if(longitude > 0){
			go_lng = longitude - 180;
		}
		theLocation(go_lat,go_lng);
		$('.latitude').val(go_lat);
		$('.longitude').val(go_lng);

		return new BMap.Point(go_lng,go_lat);
	}

// 计算并显示距离			
function displayDistance(pointA,pointB){
	var distance = parseFormatNum(map.getDistance(pointA,pointB));
	$('#distance').text(distance);  //获取两点距离,保留小数点后两位
	var points = [pointA,pointB];
	var curve = new BMapLib.CurveLine(points , {strokeColor:"blue", strokeWeight:3, strokeOpacity:0.5});  //定义折线
	map.addOverlay(curve);     //添加折线到地图上
}
 //数字加逗号
function parseFormatNum(number,n){
 	if(n !== 0 ){
     n = (n > 0 && n <= 20) ? n : 2; 
	}
  number = parseFloat((number + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";  
  var sub_val = number.split(".")[0].split("").reverse(); 
  var sub_xs = number.split(".")[1];  
 
  var show_html = "";  
  for (i = 0; i < sub_val.length; i++){  
      show_html += sub_val[i] + ((i + 1) % 3 === 0 && (i + 1) != sub_val.length ? "," : "");  
  }  
  
  if(n === 0 ){
      return show_html.split("").reverse().join("");  
  }else{
  return show_html.split("").reverse().join("") + "." + sub_xs;  
  }
}

// 计算中国内距离自己城市最远的城市
$('#go-far-in-china').click(function(){
	var FarthestCityInChina;
	var FarthestCityNameInChina;
	var FarthestProvinceNameInChina;
	var FarthestCityMK;
	var cur_lat = parseFloat($('.latitude').val());
	var cur_lng = parseFloat($('.longitude').val());
	cur_point = new BMap.Point(cur_lng,cur_lat);
	getFarthestCityInChina();
});

function getFarthestCityInChina(){
	$.getJSON("/js/city/china-city.json", function(json){
		var maxDistance = 0;
		var china = json;
		var citysName;
		var myGeo = new BMap.Geocoder();
		if(!cur_point){
			alert('请先定位！');
			return ;
		}
		// var another_city;
		// var distance;
		// for (var i = 0; i < china.provinces.length; i++) {
		// 	for (var j = 0; j < china.provinces[i].citys.length; j++) {
		 //  	// 将地址解析结果显示在地图上,并调整地图视野
		 //  	myGeo.getPoint(china.provinces[i].citys[j].citysName, function(point){
		 //  		cityName = china.provinces[i].citys[j].citysName;
		// 			provinceName = china.provinces[i].provinceName;
	  // 			city_point = point;
	  // 			distance = map.getDistance(cur_point,city_point);
	  // 			if(distance > maxDistance){
	  // 				maxDistance = distance;
	  // 				FarthestCityInChina = city_point;
	  // 				FarthestCityNameInChina = cityName;
	  // 				FarthestProvinceNameInChina = provinceName;

	  // 				map.clearOverlays(); 
	  // 				FarthestCityMK = new BMap.Marker(FarthestCityInChina);  // 创建标注
	  // 				map.addOverlay(FarthestCityMK);              // 将标注添加到地图中
	  // 				map.panTo(FarthestCityInChina);  
	  // 				displayDistance(cur_point,city_point);
	  // 				$('#suggestId').val(FarthestProvinceNameInChina +','+ FarthestCityNameInChina);
	  // 			}
		 //  	}, china.provinces[i].citys[j].citysName);
		// 	}
		// }

		// promise
		

	});
}
// 通过城市名称获取经纬度
function getPointByName(cityName){
	// 创建地址解析器实例
	var myGeo = new BMap.Geocoder();
	var city;
	// 将地址解析结果显示在地图上,并调整地图视野
	myGeo.getPoint(cityName, function(point){
		city = point;
	}, cityName);
	return city;
}
// IP定位 我的城市
var myCity = new BMap.LocalCity();
