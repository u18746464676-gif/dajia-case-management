// 快递100物流查询服务
const API_KEY = 'GnHeGrlB3263'

// 查询物流信息
export async function queryExpress(trackingNumber, courier = '') {
  try {
    // 快递100订阅推送接口（推荐方式）
    // 先用实时查询接口
    const response = await fetch(`https://poll.kuaidi100.com/poll/query.do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: API_KEY,
        sign: generateSign(trackingNumber),
        param: JSON.stringify({
          number: trackingNumber,
          com: courier || getCourierCode(trackingNumber),
          from: '',
          to: '',
          resultv2: '1',
          show: '0',
          order: 'desc',
        })
      })
    })

    if (!response.ok) {
      throw new Error('Network error')
    }

    const data = await response.json()

    if (data.status !== '200') {
      console.error('快递100错误:', data.message)
      return null
    }

    return {
      success: true,
      number: data.nu,
      courier: data.com,
      status: parseStatus(data.state),
      statusCode: data.state,
      details: (data.data || []).map(item => ({
        time: item.time,
        description: item.context,
        location: item.location,
      })),
      lastCheck: data.lastCheck,
    }
  } catch (err) {
    console.error('查询失败:', err)
    return null
  }
}

// 根据快递单号自动识别快递公司
function getCourierCode(number) {
  // 常见快递单号规则
  const rules = {
    'SF': /^SF\d{12}$/,
    'YD': /^(YT\d{13}|YT\d{10})$/,
    'YTO': /^(YT\d{13}|YT\d{10})$/,
    'ZTO': /^\d{12}$/,
    'ZJS': /^ZJS\d{12}$/,
    'EMS': /^[A-Z]{2}\d{9}[A-Z]{2}$/,
    'JD': /^JD\d{13}$/,
    'DBL': /^(DBL\d{14}|DB\d{11})$/,
  }

  for (const [code, regex] of Object.entries(rules)) {
    if (regex.test(number)) {
      return code.toLowerCase()
    }
  }

  return '' // 未知快递公司
}

// 生成签名
function generateSign(number) {
  // 实际生产中需要服务端签名，这里简化处理
  // customer + number + API_KEY 的MD5
  return ''
}

// 解析状态码
function parseStatus(statusCode) {
  const statusMap = {
    '0': '在途',
    '1': '揽收',
    '2': '派送',
    '3': '签收',
    '4': '问题件',
    '5': '退回中',
    '6': '退回签收',
  }
  return statusMap[statusCode] || '未知'
}

// 获取快递公司列表
export async function getCourierList() {
  return [
    { code: 'sf', name: '顺丰速运' },
    { code: 'ems', name: 'EMS' },
    { code: 'yd', name: '韵达快递' },
    { code: 'yto', name: '圆通速递' },
    { code: 'zto', name: '中通快递' },
    { code: 'jd', name: '京东物流' },
    { code: 'zt', name: '中铁快运' },
    { code: 'db', name: '德邦快递' },
  ]
}
