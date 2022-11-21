import { debuglog } from 'util'
import nodemailer from 'nodemailer'
import apis from './apis.js'
import Onion from './onion.js'

const debug = debuglog('genshin')

let transporter
if (process.env.MAIL_HOST && process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    // 使用SSL方式（安全方式，防止被窃取信息）
    secureConnection: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  })
}

function sendMail(text) {
  if (!transporter) return
  transporter
    .sendMail({
      // 发送方邮箱的账号
      from: `"Genshin Helper" <${process.env.MAIL_USERNAME}>`,
      // 邮箱接收者的账号
      to: process.env.MAIL_USERNAME_TO,
      subject: '原神米游社签到助手',
      text,
    })
    .then(() => debug('邮件发送成功'))
    .catch((err) => debug('邮件发送失败', err))
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  const onion = new Onion()

  // 校验环境变量
  onion.use((ctx, next) => {
    if (!process.env.COOKIE) {
      debug('环境变量 COOKIE 未配置，退出...')
      process.exit()
    } else {
      next()
    }
  })

  // 获取角色信息
  onion.use(async (ctx, next) => {
    try {
      const response = await apis.getUserGameRoles()
      if (response.data) {
        const [role] = response.data.list
        // 角色信息挂载到上下文对象上
        ctx.userInfo = role
        next()
      } else {
        debug('获取角色信息失败', response.message)
      }
    } catch (error) {
      debug('获取角色信息失败', error)
    }
  })

  // 获取当前签到状态信息
  onion.use(async (ctx, next) => {
    const { userInfo } = ctx
    try {
      const response = await apis.getRewardInfo(userInfo.region, userInfo.game_uid)
      if (response.retcode !== 0 || !response.data) {
        debug('获取当前签到状态信息失败', response.message)
        sendMail('获取当前签到状态信息失败')
        return
      } else {
        ctx.rewardInfo = response.data
        next()
      }
    } catch (error) {
      debug('获取当前签到状态信息失败', error)
    }
  })

  onion.use(async (ctx, next) => {
    const { rewardInfo } = ctx
    debug(
      '当前签到状态:',
      `今日${rewardInfo.is_sign ? '已签到' : '未签到'}`,
      `累计签到 ${rewardInfo.total_sign_day} 天`,
      `漏签 ${rewardInfo.sign_cnt_missed} 天`
    )
    if (rewardInfo.first_bind) {
      debug('请先前往米游社App手动签到一次')
      sendMail('请先前往米游社App手动签到一次')
      return
    }
    if (rewardInfo.is_sign) {
      debug('旅行者,你已经签到过了')
      sendMail('旅行者,你已经签到过了')
      return
    }
    next()
  })

  // 签到
  onion.use(async (ctx, next) => {
    const { userInfo, rewardInfo } = ctx

    const retry = async (retries, fn, delay_ms = 0) => {
      if (delay_ms) {
        await delay(delay_ms)
      }
      return fn().then((res) => {
        return retries > 1 && res?.data?.risk_code === 375 ? retry(retries - 1, fn, delay_ms) : Promise.resolve(res)
      })
    }

    debug('开始签到...')
    try {
      // 重试 10 次，每次间隔 3s
      const response = await retry(10, () => apis.bbsSignReward(userInfo.region, userInfo.game_uid), 3000)

      const { data: sign } = response
      if (sign?.risk_code === 375) {
        debug('签到失败', '本次签到被判定为机器行为，请前往米游社完成机器验证后手动签到')
        sendMail('签到失败 - 本次签到被判定为机器行为，请前往米游社完成机器验证后手动签到')
        return
      }
    } catch (error) {
      debug('签到失败', '本次签到被判定为机器行为，请前往米游社完成机器验证后手动签到')
      sendMail('签到失败 - 本次签到被判定为机器行为，请前往米游社完成机器验证后手动签到')
      return
    }

    await next()
    debug(
      '签到完成',
      '当前签到状态:',
      `今日${rewardInfo.is_sign ? '已签到' : '未签到'}`,
      `累计签到 ${rewardInfo.total_sign_day} 天`,
      `漏签 ${rewardInfo.sign_cnt_missed} 天`
    )
    sendMail(
      `签到完成 当前签到状态: 今日${rewardInfo.is_sign ? '已签到' : '未签到'} 累计签到 ${rewardInfo.total_sign_day} 天 漏签 ${
        rewardInfo.sign_cnt_missed
      } 天`
    )
  })

  // 获取当前签到状态信息
  onion.use(async (ctx, next) => {
    const { userInfo } = ctx
    try {
      const response = await apis.getRewardInfo(userInfo.region, userInfo.game_uid)
      if (response.retcode !== 0 || !response.data) {
        debug('获取当前签到状态信息失败', response.message)
        sendMail('获取当前签到状态信息失败')
        return
      } else {
        ctx.rewardInfo = response.data
        next()
      }
    } catch (error) {
      debug('获取当前签到状态信息失败', error)
    }
  })

  onion.run()
}
main()
