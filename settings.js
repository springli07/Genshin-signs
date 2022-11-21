import _ from 'lodash'

const ACT_ID = 'e202009291139501'
const APP_VERSION = '2.34.1'

const UAList = [
  `Mozilla/5.0 (Linux; U; Android 9; zh-cn; Redmi Note 5 Build/PKQ1.180904.001) AppleWebKit/537.36 (KHTML, like Gecko) miHoYoBBS/${APP_VERSION}`,
  `Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/${APP_VERSION}`,
  `Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/${APP_VERSION}`,
  `Mozilla/5.0 (Linux; Android 10; MIX 2 Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36 miHoYoBBS/${APP_VERSION}`,
]

export default {
  ACT_ID,
  APP_VERSION,
  SALT: '9nQiU3AV0rJSIBWgdynfoGMGKaklfbM7',
  // USER_AGENT: UAList[_.random(0, UAList.length - 1)],
  USER_AGENT: `Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/${APP_VERSION}`,
  REFERER_URL: `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${ACT_ID}&utm_source=bbs&utm_medium=mys&utm_campaign=icon`,
  AWARD_URL: `https://api-takumi.mihoyo.com/event/bbs_sign_reward/home?act_id=${ACT_ID}`,
  ROLE_URL: 'https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn',
  INFO_URL: `https://api-takumi.mihoyo.com/event/bbs_sign_reward/info?act_id=${ACT_ID}&region={}&uid={}`,
  SIGN_URL: 'https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign',
  GEETEST: 'https://apiv6.geetest.com/ajax.php?gt={}&challenge={}&lang=zh-cn&pt=3&client_type=web_mobile&callback=geetest_1665115368313',
}
