import undici from 'undici'
import md5 from 'md5'
import randomstring from 'randomstring'
import nodeMachineId from 'node-machine-id'
import stringFormat from 'string-format'
import { debuglog } from 'util'
import CONFIG from './settings.js'

stringFormat.extend(String.prototype, {})

const debug = debuglog('genshin')

const { machineIdSync } = nodeMachineId
debug(machineIdSync({ original: true }))

function getDS() {
  const randomStr = randomstring.generate({ length: 6 })
  const timestamp = Math.floor(Date.now() / 1000)

  // iOS sign
  const sign = md5(`salt=${CONFIG.SALT}&t=${timestamp}&r=${randomStr}`)
  const DS = `${timestamp},${randomStr},${sign}`
  return DS
}

const headers = {
  'Accept-Encoding': 'gzip, deflate, br',
  'User-Agent': CONFIG.USER_AGENT,
  // 1:  ios
  // 2:  android
  // 4:  pc web
  // 5:  mobile web
  'x-rpc-client_type': '5',
  'x-rpc-device_id': machineIdSync({ original: true }),
  'x-rpc-app_version': CONFIG.APP_VERSION,
  DS: getDS(),
  Referer: CONFIG.REFERER_URL,
  Cookie: process.env.COOKIE,
}

// 获取角色信息
function getUserGameRoles() {
  return undici.request(CONFIG.ROLE_URL, { headers }).then((res) => res.body.json())
}

// 获取当前签到状态信息
function getRewardInfo(region, uid) {
  return undici.request(CONFIG.INFO_URL.format(region, uid), { headers }).then((res) => res.body.json())
}

// 获取签到奖励列表
function getReward() {
  return undici.request(CONFIG.getAwards, { headers }).then((res) => res.body.json())
}

function _bbsSignReward(region, uid, exHeaders = {}) {
  return undici
    .request(CONFIG.SIGN_URL, {
      method: 'POST',
      headers: { ...headers, ...exHeaders },
      body: JSON.stringify({
        act_id: CONFIG.ACT_ID,
        region: region,
        uid,
      }),
    })
    .then(async (res) => {
      let data = await res.body.text()
      try {
        data = JSON.parse(data)
      } catch {}
      return data
    })
}

// 签到
async function bbsSignReward(region, uid) {
  const response = await _bbsSignReward(region, uid)
  const { data: sign } = response
  // 触发验证码
  if (sign?.risk_code === 375) {
    try {
      // 尝试自动校验
      debug('触发验证码，尝试自动校验')
      const { data: geetest } = await captchaPass(sign.gt, sign.challenge)
      if (geetest?.validate) {
        debug('校验后尝试二次签到')
        const res = await _bbsSignReward(region, uid, {
          'x-rpc-validate': geetest.validate,
          'x-rpc-challenge': sign.challenge,
          'x-rpc-seccode': geetest.validate + '%7Cjordan',
        })
        return res
      }
      debug('验证码校验失败', geetest)
    } catch (error) {
      debug('验证码校验失败', error)
    }
  }
  return response
}

function captchaPass(gt, challenge) {
  return undici.request(CONFIG.GEETEST.format(gt, challenge)).then(async (res) => {
    const jsonp = await res.body.text()
    const raw = jsonp.match(/^[^(]*?\((.*)\)[^)]*$/)?.[1]
    return JSON.parse(raw)
  })
}

export default { getUserGameRoles, getRewardInfo, getReward, bbsSignReward, captchaPass }
