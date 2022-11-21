
### 2. 获取米游社Cookie

1. 打开你的浏览器,进入无痕/隐身模式
2. 由于米哈游修改了bbs可以获取的`Cookie`，导致一次获取的`Cookie`缺失，所以需要增加步骤
3. 打开 http://bbs.mihoyo.com/ys 并进行登入操作
4. 在上一步登入完成后新建标签页，打开 http://user.mihoyo.com 并进行登入操作
5. 按下键盘上的F12或右键检查,打开开发者工具,点击Console
6. 复制以下代码
```javascript
var cookie = document.cookie
var ask = confirm('Cookie:' + cookie + '\n\nDo you want to copy the cookie to the clipboard?')
if (ask == true) {
  copy(cookie)
  msg = cookie
} else {
  msg = 'Cancel'
}
```

7. 此时`Cookie`已经复制到你的粘贴板上了


### 3. 添加环境变量至 Secrets

- 回到项目页面，依次点击`Settings`-->`Secrets`-->`New secret`

- 建立名为`COOKIE`的 secret，值为米游社复制的`Cookie`内容，最后点击`Add secret`

- 邮件通知需添加 `MAIL_HOST` `MAIL_USERNAME` `MAIL_PASSWORD` `MAIL_USERNAME_TO` 环境变量
