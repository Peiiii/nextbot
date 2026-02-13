# Channel Guides

Quick setup guides for each supported channel. All channels are configured in `~/.nextclaw/config.json` (or via the UI).

- Start the service: `nextclaw start`
- Or run gateway only: `nextclaw gateway`

## Telegram

1) Create a bot with @BotFather and copy the token.
2) Configure:

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "YOUR_BOT_TOKEN",
      "allowFrom": ["YOUR_TELEGRAM_USER_ID"]
    }
  }
}
```

3) Run `nextclaw gateway` (or `nextclaw start`).

## Discord

1) Create a bot at https://discord.com/developers/applications.
2) Enable **MESSAGE CONTENT INTENT** in Bot settings.
3) Configure:

```json
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "YOUR_BOT_TOKEN",
      "allowFrom": ["YOUR_DISCORD_USER_ID"]
    }
  }
}
```

4) Run `nextclaw gateway` (or `nextclaw start`).

## WhatsApp

1) Link device (QR login):

```bash
nextclaw channels login
```

2) Configure:

```json
{
  "channels": {
    "whatsapp": {
      "enabled": true,
      "allowFrom": ["+1234567890"]
    }
  }
}
```

3) Run `nextclaw gateway`.

## Feishu

1) Create an app on Feishu Open Platform and enable **Bot** capability.
2) Permissions: add `im:message`.
3) Event: add `im.message.receive_v1` and choose **Long Connection** mode.
4) Configure:

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_xxx",
      "appSecret": "xxx",
      "encryptKey": "",
      "verificationToken": "",
      "allowFrom": []
    }
  }
}
```

5) Run `nextclaw gateway`.

## Mochat

1) Get your Claw token and agent user ID from Mochat.
2) Configure:

```json
{
  "channels": {
    "mochat": {
      "enabled": true,
      "baseUrl": "https://mochat.io",
      "clawToken": "claw_xxx",
      "agentUserId": "YOUR_AGENT_USER_ID",
      "allowFrom": []
    }
  }
}
```

3) Run `nextclaw gateway`.

## DingTalk

1) Create a DingTalk app and enable **Stream Mode**.
2) Configure:

```json
{
  "channels": {
    "dingtalk": {
      "enabled": true,
      "clientId": "YOUR_APP_KEY",
      "clientSecret": "YOUR_APP_SECRET",
      "allowFrom": []
    }
  }
}
```

3) Run `nextclaw gateway`.

## Slack

1) Create a Slack app and enable **Socket Mode**.
2) Get bot token (`xoxb-...`) and app token (`xapp-...`).
3) Configure:

```json
{
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "xoxb-...",
      "appToken": "xapp-...",
      "groupPolicy": "mention"
    }
  }
}
```

4) Run `nextclaw gateway`.

## Email

1) Prepare an IMAP/SMTP account (e.g. Gmail app password).
2) Configure:

```json
{
  "channels": {
    "email": {
      "enabled": true,
      "consentGranted": true,
      "imapHost": "imap.gmail.com",
      "imapPort": 993,
      "imapUsername": "bot@gmail.com",
      "imapPassword": "app-password",
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUsername": "bot@gmail.com",
      "smtpPassword": "app-password",
      "fromAddress": "bot@gmail.com",
      "allowFrom": ["you@gmail.com"]
    }
  }
}
```

3) Run `nextclaw gateway`.

## QQ

1) Create a QQ bot and get `appId` / `secret`.
2) Configure:

```json
{
  "channels": {
    "qq": {
      "enabled": true,
      "appId": "YOUR_APP_ID",
      "secret": "YOUR_APP_SECRET",
      "allowFrom": []
    }
  }
}
```

3) Run `nextclaw gateway`.
