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

## ASC 填表抄写卡(逐屏粘贴)

### 第 0 屏 · developer.apple.com → Identifiers(先注册 Bundle ID)
Certificates, Identifiers & Profiles → Identifiers → ➕ → App IDs → App
- Description: `Wuxianqin`
- Bundle ID: **Explicit** → `com.jeonshoeck.wuxianqin`
- Capabilities: 勾 **In-App Purchase**(其余不动)→ Register

### 第 1 屏 · App Store Connect → 我的 App → ➕ 新建 App
- 平台: iOS
- 名称: `無絃琴`(若被占用,备选 `無絃琴 · 凌空古琴`、`無絃琴 Air Qin`)
- 主要语言: 简体中文
- 套装 ID: 选 `com.jeonshoeck.wuxianqin`
- SKU: `wuxianqin`
- 用户访问权限: 完全访问

### 第 2 屏 · App 信息
- 副标题: `凌空抚琴,以身为琴`
- 类别: 主要 **音乐**;次要 教育
- 年龄分级问卷: 全部"无" → **4+**

### 第 3 屏 · 定价与销售范围
- 价格: **免费**(App 本体免费,收费在内购)
- 销售范围: 全部地区,**先取消勾选中国大陆**(备案后再补开)

### 第 4 屏 · App 隐私
- 隐私政策 URL: `https://jeonshoeck.com/wuxianqin/privacy`
- 数据收集: **不收集数据**(Data Not Collected,逐项如实选"否")

### 第 5 屏 · 功能 → App 内购买项目 → ➕
- 类型: **非消耗型**(Non-Consumable)
- 参考名称: `知音`
- 产品 ID: `com.jeonshoeck.wuxianqin.zhiyin` ← **逐字符核对,建后不可改**
- 价格: 选 ¥45 对应档位
- 本地化(简体中文):
  - 显示名称: `知音`
  - 描述: `三卷曲谱全启,雅号之印,金玉之声三境`
- 审核截图: 提审前补(App 内知音页截图即可)
- ⚠ 首个版本提审时,在版本页底部**勾选随版本提交此内购**

### 第 6 屏 · 协议、税务和银行(付费前提)
- Paid Applications 协议 → 同意
- 银行: NeuronSpark Media-Tech Limited 的香港对公账户(SWIFT)
- 税表: 美国 **W-8BEN-E**(香港实体,无美国活动选 No 即可)

### 提审文案备用
- 技术支持网址: `https://jeonshoeck.com/neuronspark`
- 营销网址: `https://jeonshoeck.com/wuxianqin`
- 关键词(≤100字符): `古琴,乐器,国风,雅乐,减字谱,泛音,传统文化,冥想,音乐,汉文化`
- 描述与审核备注: 见下方"提审页要点"

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
