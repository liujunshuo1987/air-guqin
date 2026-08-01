# 無絃琴 · App Store 上架手册

状态(2026-08-01):Capacitor iOS 壳已建、模拟器编译通过、IAP 桥已接线。
剩余步骤都需要 Apple 开发者账号操作,按此清单走即可。

## 架构一览

- 壳:Capacitor 7,`webDir=www`(由 `scripts/build-www.sh` 从仓库根收集),
  `appId=com.jeonshoeck.wuxianqin`,iosScheme=https(保证 getUserMedia 安全上下文)
- IAP:cordova-plugin-purchase(StoreKit),产品 ID `com.jeonshoeck.wuxianqin.zhiyin`
  (非消耗型买断)。购买/恢复按钮仅在原生壳内出现(`isNativeApp()` 守卫),
  成交后本机落 `qin.tier=zhiyin`——无服务器、不接触支付信息
- 摄像头:`NSCameraUsageDescription` 已写入 Info.plist;影像全程端上处理
- 法务:隐私政策 https://jeonshoeck.com/wuxianqin/privacy
  用户协议 https://jeonshoeck.com/wuxianqin/terms

## 一次性准备(App Store Connect)

1. Apple Developer Program 会员(个人 $99/年)
2. Certificates, Identifiers & Profiles → 注册 Bundle ID `com.jeonshoeck.wuxianqin`
3. App Store Connect → 新建 App:名称「無絃琴」(可加副标 Air Qin)、主语言简中、
   Bundle ID 选上一步、SKU 随意(如 wuxianqin)
4. App 内购买项目 → 新建**非消耗型**:
   - 产品 ID 必须逐字符等于 `com.jeonshoeck.wuxianqin.zhiyin`
   - 价格档选 ¥45 对应档位;名称「知音」,描述照知音页三项权益写
5. 协议、税务和银行:签 Paid Apps 协议、填收款账户(IAP 上架硬前提)
6. 沙盒测试员:用户与访问 → 沙盒 → 新建测试 Apple ID(真机测购买用)

## 每次构建与发布

```bash
cd /Users/sx/镜头视觉乐器
npm run ios        # build-www + cap sync + 打开 Xcode
```

Xcode 内:
1. App target → Signing & Capabilities → 选你的 Team(自动签名即可);
   Capabilities 加 **In-App Purchase**
2. 真机运行调试(⚠ 模拟器无摄像头,乐器主体必须真机验)
3. 购买链路:真机 + 沙盒账号,点「成为知音 · ¥45」走完;删 App 重装点
   「恢复购买」验证权益回归
4. 发布:Product → Archive → Distribute App → App Store Connect → 上传
5. App Store Connect 填页提审(下节)

## 提审页要点

- **App 隐私(营养标签):选「不收集数据」(Data Not Collected)**——
  产品事实如此(无账号、无采集、埋点本地),这是最强的过审与获客卖点
- 隐私政策 URL / 支持 URL:上面两个 jeonshoeck.com 链接
- 年龄分级:4+;类别:音乐(次选 教育)
- 审核备注建议原文:
  「本应用用前置摄像头做手部识别以凌空演奏虚拟古琴,影像全程在设备本地处理,
  不上传任何数据。无账号体系。内购为一次性买断解锁曲谱内容,可用沙盒账号测试。
  演奏需要摄像头,请审核员在真机上体验:入席后按开指引导挥手即可发声。」
- 截图:6.9" 与 6.5" iPhone 各一组(横屏演奏画面+开指引导+琴谱卷轴+知音页);
  录屏预览(App Preview)强烈建议放你的抚琴视频
- 出口合规:仅用 HTTPS/系统加密 → 选"豁免"

## 已知注意事项

- WKWebView 的 localStorage 随删 App 清除:进度/权益本机存档会丢,
  权益靠「恢复购买」回来(协议里已写明);进度云同步留待后续版本
- intro.mp4/模型均已打包本地(www/ 28MB),首启无网也可用
- 中文路径 + CocoaPods:终端需 `export LANG=en_US.UTF-8`(已踩过坑)
- 每次改 web 端后:`npm run build:www && npx cap sync ios` 再构建
