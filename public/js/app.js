// 使通知框延时自动从页面删除
   let fadeTime = 2000;
   $(document).ready( function () {
      // 延时清除掉成功、失败提示信息
      if ($('.ui.success.message').length > 0) {
        $('.ui.success.message').fadeOut(fadeTime)
      } else if ($('.ui.error.message').length > 0) {
        $('.ui.error.message').fadeOut(fadeTime)
      }
      
      //  点击按钮弹出下拉框
      $('.ui.dropdown').dropdown();
      
      // 鼠标悬浮在头像上，弹出气泡提示框
      $('.post-content .avatar-link').popup({
        inline: true,
        position: 'bottom right',
        lastResort: 'bottom right'
      });
    })


// 同步 经纬度 符号
