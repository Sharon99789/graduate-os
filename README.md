# Graduate OS｜独立邮箱版

React + TypeScript + Vite + Supabase Auth/PostgreSQL，PWA。面向2026级建筑专硕的个人规划工作台；沿用2026规则模拟，不保证正式获奖。

此版本脱离ChatGPT Sites：邮箱/密码登录、邮箱验证、找回密码、跨设备同步、手机布局、离线页面、材料清单、JSON备份/恢复及5份本机快照。未填真实云项目配置，不能宣称已经上线。

## 本地运行

Node 22.12+（建议24），运行：

```sh
npm ci
```

把`.env.example`复制为`.env.local`，填写自己的Supabase Project URL和publishable（或旧anon）公开前端密钥。绝不能填service_role、sb_secret或数据库密码。

```sh
npm run dev
npm test
npm run build
npm run check:pwa
```

Vite开发模式不注册Service Worker；构建后的dist才是完整PWA。测试48项通过及构建/PWA资源检查通过，尚未在真实Supabase执行SQL、验证邮件送达、验证RLS双账号或手机安装。

## 初始化与安全

1. 建议为Graduate OS单独创建Supabase项目。已有项目也可使用独立graduate_os_workspaces表，但必须先检查同名表及函数，勿盲目重跑不同版本SQL。
2. 在SQL Editor执行supabase/001_workspace.sql，保存执行结果。该SQL不读取或更改日序表。
3. Auth开启Email/Password与Confirm Email，密码策略至少10位。把独立站点根URL设为Site URL与允许Redirect URL；测试本地时另外允许http://localhost:5173/及其recovery查询链接。
4. 邮箱验证/找回需要邮件投递。默认Supabase邮件服务有严格限制且可能仅发给组织成员，个人测试建议使用组织账号邮箱；正式使用配置自己的SMTP，凭据只存Supabase控制台。不要为解决收不到邮件直接关闭验证。
5. 此为个人站点。首次创建/验证自己的用户后，在Supabase关闭Allow new users to sign up；保留登录和找回功能。可在Auth Users检查，勿添加陌生用户。
6. RLS已开启，每条读取、插入、更新仅允许auth.uid()等于user_id。匿名角色无表权限。RPC为security invoker、空search_path，不接受客户端指定账号；比较revision后原子保存，旧版本返回冲突快照。
7. 验收：未登录不可读取；A与B各自不能读取/更新对方记录；同一账号两窗口新增合并、同字段修改提示冲突；断网修改恢复后同步；JSON恢复前会保存快照。测试表中勿使用私人证明内容。

数据保存JSON文档，单文档约2MB；CAS防止应用正常并发静默覆盖。授权用户具有自己文档的写权限，不用于恶意同账号客户端审计。证明文件不上传；仅同步文件名、路径和自记完成状态。前端publishable密钥可公开，权限依靠认证和RLS；个人密码不进入成果备份。

## 独立部署与GitHub

推荐部署能在自己的电脑/手机正常访问的HTTPS静态托管；网络可达性需要本人在常用网络测试，换托管后也要验证Supabase地址可达。

在GitHub创建自己的私有仓库，上传源代码，排除node_modules、dist、.env.local及任何密码。静态托管连接该仓库，构建命令npm run build，输出目录dist；在托管环境变量填两个VITE_SUPABASE变量，重新构建。或者本地配置后构建并上传dist内容。

本项目使用根路径部署；GitHub Pages仓库子路径需同时调整Vite base、manifest start_url/scope/id、SW路径及资源URL，不能直接把此构建放入子路径。不要上传旧Sites Worker或D1文件。原Sites站点保持原样，迁移验收前继续用于导出备份。

## 数据迁移

旧站点→数据与设置→导出所有记录JSON，另保管电脑证明文件。新站点首次登录后→数据与设置→恢复备份。检查成果与任务数量，等待云端已同步，再用手机登录同一个邮箱核对。新域名不会自动读到旧域名localStorage。

不要删除旧记录或清理浏览器，直到新站点双设备核对完成。迁入不把ChatGPT用户ID当作Supabase用户ID；通过JSON导入自己的新账号。恢复会替换当前档案，要求确认且保存恢复前快照。

## PWA安装和备份

Windows Edge：菜单→应用→安装此站点；安卓Edge：菜单→添加到手机/主屏幕/安装；iOS Safari：分享→添加到主屏幕。页面内数据与设置也提供安装入口。首次在线打开并缓存成功后可离线打开；首次登录与新设备必须联网。

Service Worker仅缓存通用前端和静态资源，Supabase外域认证/数据、API均不缓存。导航网络优先，网络异常才用离线页面。新构建等待旧窗口关闭后激活。离线副本和认证session保存在该设备的浏览器，退出不删除档案；共享设备退出后另清理本站数据。

自动快照：每天首次修改前（上海日期）及恢复前，最近5份，只存本机。每周及重要录入后导出JSON到自己的备份文件夹；电脑证明文件单独备份。备份不包含密码、session或证明文件字节。导出材料清单可按建议文件名保存。

## 文件结构

- src/main.tsx、style.css：页面与手机版。
- src/AuthShell.tsx、supabase.ts、AccountPanel.tsx：邮箱认证。
- src/supabaseTransport.ts、sync.ts、merge.ts、useCloudData.ts：认证请求、CAS及三方同步。
- supabase/001_workspace.sql：初始化表、RLS与保存函数。
- src/scoring.ts及测试：国奖模拟排名、折算、上限等。
- src/scholarship.ts、ScholarshipPanel.tsx：学业一等奖准备，无虚构公式。
- src/evidence.ts、EvidenceChecklist.tsx：电脑材料清单。
- src/backups.ts、BackupHistory.tsx：快照与恢复。
- public/manifest.webmanifest、icons/、scripts/build-pwa.mjs：PWA与离线页面。

后续未完成：完整科研管理、课程/重复提醒、毕业条件正式认定和简历导出。期刊及竞赛候选来自上传2021目录，仅名称与个人模拟参考，2026级适用性及争议口径集中在规则页披露。所有计分均为模拟，不将演示数据当作本人真实成果。

## GitHub Pages 迁移版（2026-10-12）

用户已确认日序GitHub Pages可在手机不开VPN打开及同步。Graduate OS新增子目录路径构建；构建命令前设置DEPLOY_BASE=/graduate-os/，同时填原Supabase公开环境变量。manifest、资源、登录跳转、SW及离线缓存均使用该路径；缓存前缀含目录，不清理其他应用缓存。源代码本身不硬编码真实项目密钥。

发布文件包的Website目录为已配置Supabase的/graduate-os/静态构建；上传该目录内部全部文件与子目录至新的graduate-os仓库根目录，开启Pages使用main根目录。Source目录保留完整更新源码，勿把Source目录当成发布页面。

免费GitHub Pages使用Public仓库，仅发布前端与公开配置，不上传个人记录、密码、service_role或证明文件。工作台内容通过邮箱登录及Supabase RLS隔离。个人数据在Supabase中沿用，浏览器旧Netlify域名本机修改需同步成功或另导出JSON。发布后更新Supabase Site URL及Redirect URLs为真实GitHub Pages地址，并验证手机不开VPN登录与同步。旧站点不要先删除。
