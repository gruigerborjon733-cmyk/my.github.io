const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 金山文档配置
const KDOCS_FILE_ID = "cdRob7rD60cV";
const KDOCS_API_TOKEN = "68LeaycOV1GYD7E7Y3nOOE";

// 登录接口
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: "账号和密码不能为空" });
  }
  try {
    const resp = await fetch(`https://kdocs.cn/api/v3/ide/file/${KDOCS_FILE_ID}/script/sync_task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KDOCS_API_TOKEN}`
      },
      body: JSON.stringify({
        script: `
          const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
          const rows = sheet.getDataRange().getValues();
          return rows;
        `
      })
    });
    const tableData = await resp.json();
    let ok = false;
    for (let i = 1; i < tableData.length; i++) {
      const [user, pwd] = tableData[i];
      if (user === username && pwd === password) {
        ok = true;
        break;
      }
    }
    if (ok) {
      return res.json({ code: 0, msg: "登录成功" });
    } else {
      return res.status(401).json({ msg: "用户名或密码错误" });
    }
  } catch (e) {
    return res.status(500).json({ msg: "服务异常" });
  }
});

app.listen(port, () => {
  console.log(`Server run on port ${port}`);
});
