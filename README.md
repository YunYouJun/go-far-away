# go-far-away 去远方

[![Build Status](https://travis-ci.com/YunYouJun/go-far-away.svg?branch=master)](https://travis-ci.com/YunYouJun/go-far-away)

> Go the farthest place.

定位个人所在地，或通过输入经纬度的方式，计算出世界上距离自己最远的地方。（~~地球不完全是圆的这种细节，就不要在意啦！~~）

## Origin

此前不知在哪看过这样一个说法，从家里定位出自己所在地的经纬度。再将北纬换成难为，将东经换成西经并互补，便会得到地球上的另一个点。而这就是你在这个世界上可以去的最远的地方，也是离家最远的地方。

> 这时，你站在这个点上，朝东西南北迈出的任何一步，都在回家的路上。

## Function

- [ ] 定位
  - [ ] 自动定位
    - [x] IP 定位
    - [x] 浏览器精准定位
  - [x] 自定义经纬度
  - [x] 自定义地址
    - [x] autocomplete
  - [x] 经纬度与地址双向绑定
- [x] 经纬度分秒与小数转换
- [ ] 地图切换
  - [ ] 百度地图
  - [ ] 高德地图
  - [ ] 谷歌地图
- [ ] 去远方
  - [x] 地球上距离自己最远的地方
    - [x] 显示距离
    <!-- - [ ] 显示连线 -->
  - [ ] 指定国家距离自己最远的地方
  - [ ] 国内距离自己最远的地方
- [ ] 全局消息提示

## Intend

- [ ] the farthest place in the universe

## CHANGELOG

### 1.0.0 （2019-02-12）

Base on:

- Vue
- 高德地图

### [0.1.0](https://github.com/YunYouJun/go-far-away) （2017-09-22）

Base on:

- express
- ejs
- 百度地图
- JQuery
