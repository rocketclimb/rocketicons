# Icon pack refresh — 2026-09-04

All 32 collections were checked against their upstream sources. Sixteen Git pins and two installed npm versions change. Legacy Font Awesome 5/6, Heroicons 1/2, and Ionicons 4/5 retain their named major versions; unchanged sources are already current on their configured lines. Git sources use full commit hashes for reproducibility.

The generated package grows from **46,570 to 51,606 exports** (+5,427 / −391). The web catalog has **51,602 distinct IDs**: four existing Lucide AZ/Az alias pairs share IDs. VS Code's `VscBlank` is an intentional empty placeholder.

## Remix license boundary

Remix is updated to `f51ba97038d814f8a4138b4ad8379b447d591756` (package version 4.8.0), the last revision before the license changed. Its [pinned license](https://github.com/Remix-Design/RemixIcon/blob/f51ba97038d814f8a4138b4ad8379b447d591756/License) is Apache 2.0. The [new license](https://github.com/Remix-Design/RemixIcon/blob/f526a922ddb2e6108ef4c3ed0df2a9fb3b608e45/License) restricts competing icon libraries; this update does not adopt it.

## Pack inventory

| Pack | Source revision/version                                                                                                              | Before | After | Added | Removed |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------ | -----: | ----: | ----: | ------: |
| rc   | Local SVG (unchanged)                                                                                                                |      1 |     1 |     0 |       0 |
| ai   | `d7c5ad5015a0` → [`7f2516ac9122`](https://github.com/ant-design/ant-design-icons/commit/7f2516ac91226d2b41f93b35cb5197c8d94f7189)    |    789 |   848 |    59 |       0 |
| bi   | `9ffa9136e868` → [`9ffa9136e868`](https://github.com/atisawd/boxicons/commit/9ffa9136e8681886bb7bd2145cd4098717ce1c11)               |  1,634 | 1,634 |     0 |       0 |
| bs   | `7c2454522e5c` → [`6945b7006285`](https://github.com/twbs/icons/commit/6945b7006285d444cc17ff2e22c7691719229526)                     |  2,716 | 2,754 |    38 |       0 |
| cg   | `deea4fa5f39a` → [`ad0428df5491`](https://github.com/astrit/css.gg/commit/ad0428df5491082b29a81d64dbdc59b9602cc059)                  |    704 |   704 |     0 |       0 |
| ci   | `eeef6206df83` → [`cec1364b5199`](https://github.com/Klarr-Agency/Circum-Icons/commit/cec1364b5199f55e946a9a8360385a958b98cc60)      |    288 |   288 |     0 |       0 |
| di   | `ba75593fdf8d` → [`ba75593fdf8d`](https://github.com/vorillaz/devicons/commit/ba75593fdf8d66496676a90cbf127d721f73e961)              |    192 |   192 |     0 |       0 |
| fa   | `afecf2af5d89` → [`afecf2af5d89`](https://github.com/FortAwesome/Font-Awesome/commit/afecf2af5d897b763e5e8e28d46aad2f710ccad6)       |  1,611 | 1,611 |     0 |       0 |
| fa6  | `f0c25837a3fe` → [`840c215f894f`](https://github.com/FortAwesome/Font-Awesome/commit/840c215f894f429b26b8c1402a65da835dc5a450)       |  2,024 | 2,058 |    34 |       0 |
| fc   | `8eccbbbd8b2a` → [`1bf90d5ff118`](https://github.com/icons8/flat-color-icons/commit/1bf90d5ff118bc6690120ff9fdfe234565b7e414)        |    329 |   329 |     0 |       0 |
| fi   | 4.29.2 (already current)                                                                                                             |    287 |   287 |     0 |       0 |
| gi   | `12920d656558` → [`12920d656558`](https://github.com/delacannon/game-icons-inverted/commit/12920d6565588f0512542a3cb0cdfd36a497f910) |  4,040 | 4,040 |     0 |       0 |
| go   | 19.9.0 → 19.34.0                                                                                                                     |    273 |   352 |    80 |       1 |
| gr   | `2c16c9d1ed02` → [`9d0b1551b6a9`](https://github.com/grommet/grommet-icons/commit/9d0b1551b6a9790c554ba526455bc50c6d70e62b)          |    635 |   637 |     2 |       0 |
| hi   | `b6de5792d3d5` → [`b6de5792d3d5`](https://github.com/tailwindlabs/heroicons/commit/b6de5792d3d53ff81c71b1b8283463aad622e0e3)         |    460 |   460 |     0 |       0 |
| hi2  | `eee05eb77af6` → [`616b7a4dbbf3`](https://github.com/tailwindlabs/heroicons/commit/616b7a4dbbf3d011760af8066262cd5c6b3868f3)         |    876 |   972 |    96 |       0 |
| im   | `d006795ede82` → [`d006795ede82`](https://github.com/Keyamoon/IcoMoon-Free/commit/d006795ede82361e1bac1ee76f215cf1dc51e4ca)          |    491 |   491 |     0 |       0 |
| io   | 4.6.3 (latest v4)                                                                                                                    |    696 |   696 |     0 |       0 |
| io5  | 5.5.4 (latest v5)                                                                                                                    |  1,332 | 1,332 |     0 |       0 |
| lia  | `78a101217707` → [`2bb7870e4d3f`](https://github.com/icons8/line-awesome/commit/2bb7870e4d3f3a2d966eea2c94912096621e0662)            |  1,544 | 1,544 |     0 |       0 |
| lu   | 0.542.0 → 1.41.0                                                                                                                     |  1,840 | 2,052 |   231 |      19 |
| md   | `1ea21d542975` → [`0cbb08816df0`](https://github.com/google/material-design-icons/commit/0cbb08816df07faaae3dca060d4ebb10b66c214f)   |  4,341 | 4,341 |     0 |       0 |
| pi   | `f0d270195c81` → [`2b75f3ad12b4`](https://github.com/phosphor-icons/core/commit/2b75f3ad12b420c9504ef05df8d2564a28f8500e)            |  7,488 | 9,072 | 1,620 |      36 |
| ri   | `3c4f3ff316c8` → [`f51ba97038d8`](https://github.com/Remix-Design/RemixIcon/commit/f51ba97038d814f8a4138b4ad8379b447d591756)         |  2,537 | 3,188 |   656 |       5 |
| rx   | `94b3fcf4e972` → [`112af91ad275`](https://github.com/radix-ui/icons/commit/112af91ad275a63c3a29b0da2588342af74ef9bf)                 |    318 |   332 |    14 |       0 |
| si   | `f74f0e6b995a` → [`8a040dd8e1f7`](https://github.com/simple-icons/simple-icons/commit/8a040dd8e1f7d99d27827efd4089a5434fdb7b5c)      |  2,753 | 3,458 |   974 |     269 |
| sl   | `f3ed94dd797b` → [`f3ed94dd797b`](https://github.com/thesabbir/simple-line-icons/commit/f3ed94dd797bdcab52d6f27ba589aea4bb6f3e4d)    |    189 |   189 |     0 |       0 |
| tb   | `93e971c34c18` → [`55f87a73f45c`](https://github.com/tabler/tabler-icons/commit/55f87a73f45cf1d9eaf16d7da705065483a9e4f9)            |  4,836 | 6,184 | 1,409 |      61 |
| tfi  | `9600186b24a7` → [`9600186b24a7`](https://github.com/lykmapipo/themify-icons/commit/9600186b24a7242f0e1e0a186983e6253301bb5d)        |    352 |   352 |     0 |       0 |
| ti   | `0aa64f6ce8b8` → [`0aa64f6ce8b8`](https://github.com/stephenhutchings/typicons.font/commit/0aa64f6ce8b892a83aeeafa42c74fb9c1f22ec84) |    336 |   336 |     0 |       0 |
| vsc  | `19a8819666fe` → [`1c47ab36a4bb`](https://github.com/microsoft/vscode-codicons/commit/1c47ab36a4bb845c437866405c2fa67b8ca0fe36)      |    439 |   653 |   214 |       0 |
| wi   | `bb80982bf1f4` → [`bb80982bf1f4`](https://github.com/erikflowers/weather-icons/commit/bb80982bf1f43f2d57f9dd753e7413bf88beb9ed)      |    219 |   219 |     0 |       0 |

## Compatibility and release notes

The names below were removed or renamed upstream. Consumers importing these names must migrate before upgrading. No matching imports were found in the web app, and its production build passes. Existing generated files in a consumer's own source tree are unaffected until regenerated. This refresh is a breaking catalog change and must be released accordingly; do not treat it as a patch-only dependency bump.

Tabler moved its files into `icons/outline` and `icons/filled`. Filled exports retain the existing `Tb…Filled` convention. Its remaining removals include upstream renames, such as numeric names moving to word-based names.

Use the current catalog to choose replacements. Brand removals are recorded rather than restored from old sources.

### go — 1 removed exports

- `GoCommit`

### lu — 19 removed exports

- `LuChrome`
- `LuChromium`
- `LuCodepen`
- `LuCodesandbox`
- `LuDribbble`
- `LuFacebook`
- `LuFigma`
- `LuFramer`
- `LuGithub`
- `LuGitlab`
- `LuInstagram`
- `LuLinkedin`
- `LuPocket`
- `LuRailSymbol`
- `LuSlack`
- `LuTrello`
- `LuTwitch`
- `LuTwitter`
- `LuYoutube`

### pi — 36 removed exports

- `PiArchiveBoxBold`
- `PiArchiveTrayBold`
- `PiFolderNotchBold`
- `PiFolderNotchMinusBold`
- `PiFolderNotchOpenBold`
- `PiFolderNotchPlusBold`
- `PiArchiveBoxDuotone`
- `PiArchiveTrayDuotone`
- `PiFolderNotchDuotone`
- `PiFolderNotchMinusDuotone`
- `PiFolderNotchOpenDuotone`
- `PiFolderNotchPlusDuotone`
- `PiArchiveBoxFill`
- `PiArchiveTrayFill`
- `PiFolderNotchFill`
- `PiFolderNotchMinusFill`
- `PiFolderNotchOpenFill`
- `PiFolderNotchPlusFill`
- `PiArchiveBoxLight`
- `PiArchiveTrayLight`
- `PiFolderNotchLight`
- `PiFolderNotchMinusLight`
- `PiFolderNotchOpenLight`
- `PiFolderNotchPlusLight`
- `PiArchiveBox`
- `PiArchiveTray`
- `PiFolderNotchMinus`
- `PiFolderNotchOpen`
- `PiFolderNotchPlus`
- `PiFolderNotch`
- `PiArchiveBoxThin`
- `PiArchiveTrayThin`
- `PiFolderNotchMinusThin`
- `PiFolderNotchOpenThin`
- `PiFolderNotchPlusThin`
- `PiFolderNotchThin`

### ri — 5 removed exports

- `RiBookMarkFill`
- `RiBookMarkLine`
- `RiFileMarkFill`
- `RiFileMarkLine`
- `RiFontSans`

### si — 269 removed exports

- `SiAbbrobotstudio`
- `SiAbletonlive`
- `SiAcclaim`
- `SiAddthis`
- `SiAdobe`
- `SiAdobeacrobatreader`
- `SiAdobeaftereffects`
- `SiAdobeaudition`
- `SiAdobecreativecloud`
- `SiAdobedreamweaver`
- `SiAdobefonts`
- `SiAdobeillustrator`
- `SiAdobeindesign`
- `SiAdobelightroom`
- `SiAdobelightroomclassic`
- `SiAdobephotoshop`
- `SiAdobepremierepro`
- `SiAdobexd`
- `SiAerlingus`
- `SiAerospike`
- `SiAew`
- `SiAffinity`
- `SiAffinitydesigner`
- `SiAffinityphoto`
- `SiAffinitypublisher`
- `SiAirbrakedotio`
- `SiAlfaromeo`
- `SiAllocine`
- `SiAlteryx`
- `SiAltiumdesigner`
- `SiAmazon`
- `SiAmazonalexa`
- `SiAmazonapigateway`
- `SiAmazonaws`
- `SiAmazoncloudwatch`
- `SiAmazondocumentdb`
- `SiAmazondynamodb`
- `SiAmazonec2`
- `SiAmazonecs`
- `SiAmazoneks`
- `SiAmazonfiretv`
- `SiAmazongames`
- `SiAmazoniam`
- `SiAmazonlumberyard`
- `SiAmazonluna`
- `SiAmazonpay`
- `SiAmazonprime`
- `SiAmazonrds`
- `SiAmazonredshift`
- `SiAmazonroute53`
- `SiAmazons3`
- `SiAmazonsimpleemailservice`
- `SiAmazonsqs`
- `SiAnchor`
- `SiAngellist`
- `SiAngularjs`
- `SiAngularuniversal`
- `SiAol`
- `SiAskfm`
- `SiAskubuntu`
- `SiAtom`
- `SiAuthy`
- `SiAwsamplify`
- `SiAwsfargate`
- `SiAwslambda`
- `SiAwsorganizations`
- `SiAzureartifacts`
- `SiAzuredataexplorer`
- `SiAzuredevops`
- `SiAzurefunctions`
- `SiAzurepipelines`
- `SiBadgr`
- `SiBathasu`
- `SiBbc`
- `SiBbciplayer`
- `SiBugsnag`
- `SiByte`
- `SiCaffeine`
- `SiCanva`
- `SiChromecast`
- `SiCkeditor4`
- `SiCliqz`
- `SiCodeium`
- `SiCodepen`
- `SiCodereview`
- `SiCognizant`
- `SiCoil`
- `SiCsharp`
- `SiCss3`
- `SiD3Dotjs`
- `SiDaimler`
- `SiDataverse`
- `SiDbt`
- `SiDelicious`
- `SiDesignernews`
- `SiDocusign`
- `SiDynamics365`
- `SiEljueves`
- `SiEllo`
- `SiEmpirekred`
- `SiEngadget`
- `SiEventbrite`
- `SiFeathub`
- `SiFite`
- `SiFlattr`
- `SiFlipkart`
- `SiFluxus`
- `SiForestry`
- `SiFoursquarecityguide`
- `SiFsecure`
- `SiFunimation`
- `SiGameandwatch`
- `SiGeant`
- `SiGoldenline`
- `SiGooglebard`
- `SiGoogledatastudio`
- `SiGoogledomains`
- `SiGooglefit`
- `SiGooglehangouts`
- `SiGooglemybusiness`
- `SiGoogleoptimize`
- `SiGooglepodcasts`
- `SiGrubhub`
- `SiHeroku`
- `SiHulu`
- `SiHurriyetemlak`
- `SiHyperledger`
- `SiIbm`
- `SiIbmcloud`
- `SiIbmwatson`
- `SiInformatica`
- `SiIntegromat`
- `SiInternetexplorer`
- `SiInvision`
- `SiIscsquared`
- `SiJaguar`
- `SiJamboard`
- `SiJenkinsx`
- `SiJfrogbintray`
- `SiKatacoda`
- `SiLandrover`
- `SiLgtm`
- `SiLinkedin`
- `SiLogitech`
- `SiMagento`
- `SiMarketo`
- `SiMediatemple`
- `SiMercedes`
- `SiMicrogenetics`
- `SiMicrosoft`
- `SiMicrosoftacademic`
- `SiMicrosoftaccess`
- `SiMicrosoftazure`
- `SiMicrosoftbing`
- `SiMicrosoftedge`
- `SiMicrosoftexcel`
- `SiMicrosoftexchange`
- `SiMicrosoftoffice`
- `SiMicrosoftonedrive`
- `SiMicrosoftonenote`
- `SiMicrosoftoutlook`
- `SiMicrosoftpowerpoint`
- `SiMicrosoftsharepoint`
- `SiMicrosoftsqlserver`
- `SiMicrosoftteams`
- `SiMicrosofttranslator`
- `SiMicrosoftvisio`
- `SiMicrosoftword`
- `SiMinecraft`
- `SiMinetest`
- `SiMojangstudios`
- `SiMulesoft`
- `SiMusescore`
- `SiNextui`
- `SiNintendo`
- `SiNintendo3Ds`
- `SiNintendogamecube`
- `SiNintendonetwork`
- `SiNintendoswitch`
- `SiNuxtdotjs`
- `SiOpenai`
- `SiOpentf`
- `SiOracle`
- `SiPepsi`
- `SiPlaywright`
- `SiPluscodes`
- `SiPocket`
- `SiPointy`
- `SiPokemon`
- `SiPowerapps`
- `SiPowerautomate`
- `SiPowerbi`
- `SiPowerfx`
- `SiPowerpages`
- `SiPowershell`
- `SiPowervirtualagents`
- `SiPrime`
- `SiPrimevideo`
- `SiQuip`
- `SiRadiopublic`
- `SiRealm`
- `SiRenovatebot`
- `SiRevue`
- `SiRome`
- `SiRstudio`
- `SiSalesforce`
- `SiSandisk`
- `SiScribd`
- `SiSendinblue`
- `SiShotcut`
- `SiShutterstock`
- `SiSkynet`
- `SiSkype`
- `SiSkypeforbusiness`
- `SiSkyrock`
- `SiSlack`
- `SiSmashdotgg`
- `SiSonarcloud`
- `SiSonarlint`
- `SiSonarqube`
- `SiSonarsource`
- `SiSourcegraph`
- `SiSpinrilla`
- `SiStackpath`
- `SiStitcher`
- `SiStudyverse`
- `SiTableau`
- `SiTencentqq`
- `SiTmobile`
- `SiTnt`
- `SiTunein`
- `SiTutanota`
- `SiTwilio`
- `SiTwitter`
- `SiTwoo`
- `SiUno`
- `SiUntangle`
- `SiUploaded`
- `SiUptobox`
- `SiVisualbasic`
- `SiVisualstudio`
- `SiVisualstudiocode`
- `SiW3C`
- `SiWalmart`
- `SiWarnerbros`
- `SiWebhint`
- `SiWesterndigital`
- `SiWhitesource`
- `SiWii`
- `SiWiiu`
- `SiWindicss`
- `SiWindows`
- `SiWindows10`
- `SiWindows11`
- `SiWindows95`
- `SiWindowsterminal`
- `SiWindowsxp`
- `SiWinmate`
- `SiXamarin`
- `SiXaml`
- `SiXbox`
- `SiXilinx`
- `SiYahoo`
- `SiYammer`
- `SiYourtraveldottv`
- `SiZendframework`
- `SiZeromq`
- `SiZerply`
- `SiZwave`

### tb — 61 removed exports

- `Tb12Hours`
- `Tb123`
- `Tb24Hours`
- `Tb2Fa`
- `Tb360View`
- `Tb360`
- `Tb3DCubeSphereOff`
- `Tb3DCubeSphere`
- `Tb3DRotate`
- `TbAccessibleOffFilled`
- `TbArticleFilledFilled`
- `TbBoxSeam`
- `TbCircle0Filled`
- `TbCircle1Filled`
- `TbCircle2Filled`
- `TbCircle3Filled`
- `TbCircle4Filled`
- `TbCircle5Filled`
- `TbCircle6Filled`
- `TbCircle7Filled`
- `TbCircle8Filled`
- `TbCircle9Filled`
- `TbCodeAsterix`
- `TbCurrencyRubel`
- `TbDiscount2Off`
- `TbDiscount2`
- `TbDiscountCheckFilled`
- `TbDiscountCheck`
- `TbGenderTrasvesti`
- `TbHandRock`
- `TbHexagon0Filled`
- `TbHexagon1Filled`
- `TbHexagon2Filled`
- `TbHexagon3Filled`
- `TbHexagon4Filled`
- `TbHexagon5Filled`
- `TbHexagon6Filled`
- `TbHexagon7Filled`
- `TbHexagon8Filled`
- `TbHexagon9Filled`
- `TbKering`
- `TbMessageCircle2Filled`
- `TbMessageCircle2`
- `TbMoodConfuzedFilled`
- `TbMoodConfuzed`
- `TbMoodSuprised`
- `TbPhysotherapist`
- `TbSeedingOff`
- `TbSeeding`
- `TbShiJumping`
- `TbSportBillard`
- `TbSquare0Filled`
- `TbSquare1Filled`
- `TbSquare2Filled`
- `TbSquare3Filled`
- `TbSquare4Filled`
- `TbSquare5Filled`
- `TbSquare6Filled`
- `TbSquare7Filled`
- `TbSquare8Filled`
- `TbSquare9Filled`

## Reproduce validation

After an authenticated `npm ci --ignore-scripts`:

1. Run `SKIP_IGNITION_BUILD=true npm run build-all` to build packages and refresh sources. The source cache now invalidates when pinned revisions change.
2. Run `npm run generate-content-collections -w ignition` and `npm run generate-statics:all-icons -w ignition`.
3. Run `npm run test:catalog -w @rocketicons/generator` to render every export and validate every web index/shard record.
4. Run the workspace tests, then `SITE_ORIGIN=https://rocketicons.com npm run build -w ignition`.
5. Serve `packages/ignition/out`; navigate to every collection, select icons, follow the documentation links, and check browser Back in both locales.

The CI workflow runs the exhaustive catalog check after generating the complete catalog. Live Algolia search indexing and native-device rendering are separate checks and were not performed for this refresh.
