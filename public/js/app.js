// 使通知框延时自动从页面删除
let fadeTime = 2000;
$(document).ready( function () {
  // 延时清除掉成功、失败提示信息
  if ($('.ui.success.message').length > 0) {
    $('.ui.success.message').fadeOut(fadeTime);
  } else if ($('.ui.error.message').length > 0) {
    $('.ui.error.message').fadeOut(fadeTime);
  }
  
  //  点击按钮弹出下拉框
  $('.ui.dropdown').dropdown();
  
  // 鼠标悬浮在头像上，弹出气泡提示框
  $('.post-content .avatar-link').popup({
    inline: true,
    position: 'bottom right',
    lastResort: 'bottom right'
  });
});
// 按钮状态切换
$(".ui .button").click(
  function(e){
      $(".ui .button").removeClass("secondary");
      $(this).addClass("secondary");
  }
);
// 回车出发Go按钮
$(document).keydown(function(e){ 
  if (!e)  
    e = window.event;  
  if ((e.keyCode || e.which) == 13) {  
    $("#locate").click();  
  }  
});

// 同步 经纬度 符号


// 获取url参数
function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
      return unescape(r[2]);
  }
  return null;
}

// 度分秒单位转换
// 小数 to 度分秒
function decimal2degree(decimal){
  var degress = Math.floor(decimal);
  var minute = Math.floor((decimal-degress)*60);
  var second = Math.floor(((decimal-degress)*60-minute)*60);
  var degree = new Array(degress,minute,second);
  return degree;
}
// 度分秒 to 小数
function degree2decimal(degree){
  let degress = parseFloat(degree[0]);
  let minute = parseFloat(degree[1]);
  let second = parseFloat(degree[2]);
  var decimal = degress + minute/60 + second/3600;
  return decimal;
}
// 转换并显示
$('#decimal2degree').click(function(){
  let latitude = $('.latitude').val();
  let longitude = $('.longitude').val();
  let lat_de = decimal2degree(latitude);
  let lon_de = decimal2degree(longitude);
  for (var i = 0; i < $('.latitude').length; i++) {
    $('.latitude').eq(i+1).val(lat_de[i]); 
    $('.longitude').eq(i+1).val(lon_de[i]);
  }
});
$('#degree2decimal').click(function(){
  let lat_de = new Array();
  let lon_de = new Array();
  for (var i = 0; i < $('.latitude').length; i++) {
    lat_de[i] = $('.latitude').eq(i+1).val();
    lon_de[i] = $('.longitude').eq(i+1).val();
  }
  let latitude = degree2decimal(lat_de);
  let longitude = degree2decimal(lon_de);
  $('.latitude').eq(0).val(latitude);
  $('.longitude').eq(0).val(longitude);
});