if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then((registration) => console.log(registration.scope))
    .catch((err) => console.error(err));
}
document.querySelector("#gUM_do").onclick = () => {
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      document.querySelector("#gUM_rec").onclick = () => mediaRecorder.start();
      document.querySelector("#gUM_stop").onclick = () => mediaRecorder.stop();
      mediaRecorder.ondataavailable = (e) => {
        const dl = document.createElement("a");
        dl.setAttribute("download", "");
        const videoURL = URL.createObjectURL(e.data);
        dl.href = videoURL;
        dl.innerText = "DL";
        document.querySelector("#gUM_res").appendChild(dl);
      };
    });
};
// [Browserpad - A notepad in the browser](http://browserpad.org/)
// [【JavaScript入門】Blobの使い方とダウンロード・保存方法まとめ！ | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/67735)
function fileSave(filedata, filename, saveid) {
  const saveA = document.querySelector(saveid);
  const blob = new Blob([filedata]);
  saveA.href = URL.createObjectURL(blob);
  saveA.download = filename;
}
async function fileRead(
  openid,
  textboxid = "",
  filenameid = "",
  mime = "plain/text"
) {
  const file = document.querySelector(openid).files[0];
  const readed = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    mime == "plain/text"
      ? reader.readAsText(file)
      : reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(reader); // [【JavaScript入門】初心者でも分かるイベント処理の作り方まとめ！ | 侍エンジニア塾ブログ（Samurai Blog） - プログラミング入門者向けサイト](https://www.sejuku.net/blog/61631)
    reader.onerror = () => reject(reader);
  });
  if (textboxid) {
    const filenameBox = document.querySelector(filenameid);
    filenameBox.value = file.name;
    const textbox = document.querySelector(textboxid);
    textbox.value = readed.result;
  }
  return [readed.result, file.name];
}

// [web-browser-based-file-encryption-decryption/web-browser-based-file-encryption-decryption.html at master · meixler/web-browser-based-file-encryption-decryption](https://github.com/meixler/web-browser-based-file-encryption-decryption/blob/master/web-browser-based-file-encryption-decryption.html)
// openssl aes-256-cbc -e -salt -pbkdf2 -iter 10000 -in a -out a.aes
// [暗号技術勉強メモ - Qiita](https://qiita.com/opengl-8080/items/85df520e2d8c4e19be8e)
// [AES暗号CBCモードの暗号鍵と初期化ベクトル | reverse-eg-mal-memoのブログ](https://ameblo.jp/reverse-eg-mal-memo/entry-12580058952.html)
// [Example of AES-GCM encryptor with passphrase, based on Web Crypto API](https://gist.github.com/piroor/a312990473fbbef94ce63309278874f0)
// [Webアプリや拡張機能（アドオン）で、Web Crypto APIを使ってローカルに保存されるデータを暗号化する - 2019-01-30 - ククログ](https://www.clear-code.com/blog/2019/1/30.html#fnref1)
document.getElementById("aes_raw").addEventListener("change", clickAES);
function clickAES() {
  const file = document.getElementById("aes_raw").files[0];
  document.getElementById("aes_mode").checked ? decryptfile(file) : encryptfile(file)
}

async function encryptfile(file) {
  const passElm = document.getElementById("aes_pass");
  const aesElm = document.getElementById("aes_result");

  const objFile = file;
  const [filebuff, _] = await fileRead("#aes_raw", "", "", "").catch((e) => console.error(e));
  const plaintextbytes = new Uint8Array(filebuff);

  const pbkdf2iterations = 10000;
  const passphrasebytes = new TextEncoder("utf-8").encode(passElm.value);
  const pbkdf2salt = window.crypto.getRandomValues(new Uint8Array(8));

  const passphrasekey = await window.crypto.subtle
    .importKey("raw", passphrasebytes, { name: "PBKDF2" }, false, [
      "deriveBits",
    ])
    .catch((e) => console.error(e));

  const pbkdf2deived = await window.crypto.subtle
    .deriveBits(
      {
        name: "PBKDF2",
        salt: pbkdf2salt,
        iterations: pbkdf2iterations,
        hash: "SHA-256",
      },
      passphrasekey,
      384
    )
    .catch((e) => console.error(e));
  const pbkdf2bytes = new Uint8Array(pbkdf2deived);

  const keybytes = pbkdf2bytes.slice(0, 32);
  const ivbytes = pbkdf2bytes.slice(32);

  const key = await window.crypto.subtle
    .importKey("raw", keybytes, { name: "AES-CBC", length: 256 }, false, [
      "encrypt",
    ])
    .catch((e) => console.error(e));

  const cipherbytesencrypted = await window.crypto.subtle
    .encrypt({ name: "AES-CBC", iv: ivbytes }, key, plaintextbytes)
    .catch((e) => console.error(e));

  const cipherbytes = new Uint8Array(cipherbytesencrypted);

  const resultbytes = new Uint8Array(cipherbytes.length + 16);
  resultbytes.set(new TextEncoder("utf-8").encode("Salted__"));
  resultbytes.set(pbkdf2salt, 8);
  resultbytes.set(cipherbytes, 16);

  const blob = new Blob([resultbytes], { type: "application/download" });
  aesElm.href = URL.createObjectURL(blob);
  aesElm.download = objFile.name + ".enc";
}

async function decryptfile(file) {
  const passElm = document.getElementById("aes_pass");
  const aesElm = document.getElementById("aes_result");
  const objFile = file;
  const [filebuff, _] = await fileRead("#aes_raw", "", "", "").catch((e) => console.error(e));
  const cipherbytesarray = new Uint8Array(filebuff);

  const pbkdf2iterations = 10000;
  const passphrasebytes = new TextEncoder("utf-8").encode(passElm.value);
  const pbkdf2salt = cipherbytesarray.slice(8, 16);

  const passphrasekey = await window.crypto.subtle
    .importKey("raw", passphrasebytes, { name: "PBKDF2" }, false, [
      "deriveBits",
    ])
    .catch((e) => console.error(e));

  const pbkdf2bytesderived = await window.crypto.subtle
    .deriveBits(
      {
        name: "PBKDF2",
        salt: pbkdf2salt,
        iterations: pbkdf2iterations,
        hash: "SHA-256",
      },
      passphrasekey,
      384
    )
    .catch((e) => console.error(e));
  const pbkdf2bytes = new Uint8Array(pbkdf2bytesderived);

  const keybytes = pbkdf2bytes.slice(0, 32);
  const ivbytes = pbkdf2bytes.slice(32);
  const cipherbytes = cipherbytesarray.slice(16);

  const key = await window.crypto.subtle
    .importKey("raw", keybytes, { name: "AES-CBC", length: 256 }, false, [
      "decrypt",
    ])
    .catch((e) => console.error(e));

  const plaintextbytesdecrypted = await window.crypto.subtle
    .decrypt({ name: "AES-CBC", iv: ivbytes }, key, cipherbytes)
    .catch((e) => console.error(e));

  const plaintextbytes = new Uint8Array(plaintextbytesdecrypted);

  const blob = new Blob([plaintextbytes], { type: "application/download" });
  aesElm.href = URL.createObjectURL(blob);
  aesElm.download = objFile.name.replace("enc", "");
}

// [【JavaScript】window.btoa(‘日本語’) する at softelメモ](https://www.softel.co.jp/blogs/tech/archives/4133)
async function toDataUrlScheme(openId, resultId) {
  const [rawHtml, filename] = await fileRead(openId);
  const binary = unescape(encodeURIComponent(rawHtml));
  const encoded = btoa(binary);
  const dataUrlScheme = "data:text/html;utf-8;base64," + encoded;
  const textarea = document.querySelector(resultId);
  textarea.value = dataUrlScheme;
}

// [mattiasw/ExifReader: A JavaScript Exif info parser.](https://github.com/mattiasw/ExifReader/)
function readExif(openId) {
  fileRead(openId, "", "", "binary").then((r) => {
    const tags = ExifReader.load(r[0]);
    delete tags["MakerNote"];
    alert(JSON.stringify(tags, null, 2));
  });
}

// [RxJS入門 | 第1回 RxJSとは | CodeGrid](https://www.codegrid.net/articles/2017-rxjs-1/)

// [SHA256のハッシュをJavaScriptのWeb標準のライブラリだけで計算する - nwtgck / Ryo Ota](https://scrapbox.io/nwtgck/SHA256のハッシュをJavaScriptのWeb標準のライブラリだけで計算する)
document.querySelector("#sha_raw").addEventListener("input", sha_rawInput)
function sha_rawInput() {
  const input = document.querySelector("#sha_raw").value;
  const result = document.querySelector("#sha_result");
  const buff = new Uint8Array([].map.call(input, (c) => c.charCodeAt(0)))
    .buffer;
  crypto.subtle
    .digest("SHA-256", buff)
    .then((d) => {
      result.value = [].map
        .call(new Uint8Array(d), (x) => ("00" + x.toString(16)).slice(-2))
        .join("");
    })
    .catch((e) => console.error(e));
};

document.querySelector("#url_button").addEventListener("click", urlClick)
function urlClick() {
  const input = document.querySelector("#url_raw").value;
  const result = document.querySelector("#url_result");
  if (!document.querySelector("#url_mode").checked) {
    result.value = decodeURI(input);
  } else {
    result.value = encodeURI(input);
  }
};

// [](https://luck2515.com/20200312/createPassword)
document.querySelector("#pass_button").addEventListener("click", passClick)
function passClick() {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "`˜!@#$%^&*()_+-={}[]|:;\"'<>,.?/";
  const length = Number(document.querySelector("#pass_length").value);
  const result = document.querySelector("#pass_result");
  const pass_mode = [];
  document.querySelectorAll('input[name="pass_mode"]').forEach((e) => {
    if (e.checked) {
      pass_mode.push(e.value);
    }
  });
  const useLowercase = pass_mode.includes("lower");
  const useUppercase = pass_mode.includes("upper");
  const useNumber = pass_mode.includes("number");
  const useSymbol = pass_mode.includes("symbol");
  const strList = `${useLowercase ? lowercase : ""}${useUppercase ? uppercase : ""
    }${useNumber ? numbers : ""}${useSymbol ? symbols : ""}`;
  const secureMathRandom = () =>
    window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
  let password = "";
  for (let j = 0; j < length; j++) {
    password += strList[Math.floor(secureMathRandom() * strList.length)];
  }
  result.value = password;
};

document.querySelector("#fin_json_raw").addEventListener("input", fin_json_rawInput)
function fin_json_rawInput() {
  const input = document.querySelector("#fin_json_raw").value;
  const result = document.querySelector("#fin_json_result");
  const json = JSON.parse(input);
  const values = Object.values(json);
  const sum = values.reduce((sum, n) => (sum += Number(n)));
  result.value = sum;
};

document.querySelector("#count_plus").addEventListener("click", count_plusClick)
document.querySelector("#count_minus").addEventListener("click", count_minusClick)
document.querySelector("#count_reset").addEventListener("click", count_resetClick)
function count_plusClick() {
  const result = document.querySelector("#count_result");
  const resultNum = Number(result.value)
  result.value = resultNum + 1
};
function count_minusClick() {
  const result = document.querySelector("#count_result");
  const resultNum = Number(result.value)
  result.value = resultNum - 1
};
function count_resetClick() {
  const result = document.querySelector("#count_result");
  result.value = 0
};

document.querySelector("#calc_raw").addEventListener("input", calc_rawInput)
function calc_rawInput() {
  const input = document.querySelector("#calc_raw").value;
  const result = document.querySelector("#calc_result");
  result.value = calc(input);
};

// [rss-detect-bookmarklet/rss.js at master · aziraphale/rss-detect-bookmarklet](https://github.com/aziraphale/rss-detect-bookmarklet/blob/master/rss.js)
document.querySelector("#rss_button").addEventListener("click", rssClick)
function rssClick() {
  const input = document.querySelector("#rss_raw").value;
  const result = document.querySelector("#rss_result");
  fetch(
    "https://script.google.com/macros/s/AKfycbyidun34eo8cgf5mIskkgjVbC2pmgqSNldbRK7MEwkX0sWCuUxf/exec",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify({ urls: [input] }),
      redirect: "follow",
    }
  )
    .then((res) => res.json())
    .then((htmlstr) => {
      const query =
        "[href$='.atom'], [href*='.atom?'], [href$='.rss'], [href*='.rss?'], [href*='/rss.'], [href*='/feed.'], [href*='/atom.'], [href*='//feeds.feedburner.com/'], [href*='/feed/'], [type='application/atom+xml'], [type='application/rss+xml']";
      const html = new DOMParser().parseFromString(htmlstr, "text/html");
      const elements = html.querySelectorAll(query);
      // [querySelectorAllしてmapしたいとき[...すると短い - hitode909の日記](https://blog.sushi.money/entry/2017/04/19/114028)
      const links = Array.from(elements).map((x) => x.href);
      result.value = links.length > 0 ? links : "None";
    })
    .catch((e) => console.error(e));
};

// [rss-detect-bookmarklet/rss.js at master · aziraphale/rss-detect-bookmarklet](https://github.com/aziraphale/rss-detect-bookmarklet/blob/master/rss.js)
document.querySelector("#jrnl_button").addEventListener("click", jrnlClick)
function jrnlClick() {
  const input = document.querySelector("#jrnl_raw").value;
  const result = document.querySelector("#jrnl_result");
  const today = new Date();
  const date = `${today.getFullYear()}-${("0" + (today.getMonth() + 1)).slice(
    -2
  )}-${("0" + today.getDate()).slice(-2)}`;
  const resultJson = {
    P577: date,
    P793: "",
    P4271: 0,
    P135: "http://www.wikidata.org/entity/",
    P1476: "",
  };
  result.value = JSON.stringify(resultJson, null, 0);
  const art = input;
  if (art) {
    window.open(
      `https://query.wikidata.org/#PREFIX%20rdfs:%20<http://www.w3.org/2000/01/rdf-schema#>select%20distinct%20*%20where%20{%20?s%20rdfs:label%20?o%20filter%20regex%20(?o,%20"${art}").}limit%201`
    );
  }
};

document.querySelector("#btfy_raw").addEventListener("input", btfy_rawInput)
function btfy_rawInput() {
  const input = document.querySelector("#btfy_raw").value;
  const result = document.querySelector("#btfy_result");
  const beautify = SimplyBeautiful();
  result.value = beautify.js(input);
};

// [totp.js · GitHub](https://gist.github.com/matobaa/fd519dbcfff2c30cb56597194d1a4541)
document.querySelector("#totp_button").addEventListener("click", totpClick)
function totpClick() {
  const input = document.querySelector("#totp_raw").value;
  const result = document.querySelector("#totp_result");
  var b32 = (s) =>
    [0, 8, 16, 24, 32, 40, 48, 56]
      .map((i) =>
        [0, 1, 2, 3, 4, 5, 6, 7]
          .map((j) => s.charCodeAt(i + j))
          .map((c) => (c < 65 ? c - 24 : c - 65))
      )
      .map((a) => [
        (a[0] << 3) + (a[1] >> 2),
        (a[1] << 6) + (a[2] << 1) + (a[3] >> 4),
        (a[3] << 4) + (a[4] >> 1),
        (a[4] << 7) + (a[5] << 2) + (a[6] >> 3),
        (a[6] << 5) + (a[7] >> 0),
      ])
      .flat(),
    trunc = (dv) => dv.getUint32(dv.getInt8(19) & 0x0f) & 0x7fffffff,
    c = Math.floor(Date.now() / 1000 / 30);
  crypto.subtle
    .importKey(
      "raw",
      new Int8Array(b32(input)),
      { name: "HMAC", hash: { name: "SHA-1" } },
      true,
      ["sign"]
    )
    .then((k) =>
      crypto.subtle.sign(
        "HMAC",
        k,
        new Int8Array([0, 0, 0, 0, c >> 24, c >> 16, c >> 8, c])
      )
    )
    .then((h) => (result.value = ("0" + trunc(new DataView(h))).slice(-6)));
};

document.querySelector("#la_button").addEventListener("click", laClick)
function laClick() {
  const input = document.querySelector("#la_raw");
  const result = document.querySelector("#la_result");
  const parsed = new Date(Date.parse(input.value))
  result.value = parsed.toLocaleString("ja-JP", {
    timeZone: "America/Los_Angeles",
  })
};

// [Ocrad.js - Optical Character Recognition in Javascript](https://antimatter15.com/ocrad.js/demo.html)
document.querySelector("#ocr_button").addEventListener("click", ocrClick)
function ocrClick() {
  const input = document.querySelector("#ocr_raw");
  const result = document.querySelector("#ocr_result");
  const fileData = input.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;
    // [【javaScript学習】ImageDataへの画像読み込みと画像処理 | CodeCampus](https://blog.codecamp.jp/programming-javascript-Imagedata)
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
      const ct = cv.getContext("2d");
      ct.drawImage(img, 0, 0);
      const data = ct.getImageData(0, 0, cv.width, cv.height);
      const string = OCRAD(data);
      result.value = string;
    };
  };
  reader.readAsDataURL(fileData);
};

// [potrace](http://kilobtye.github.io/potrace/)
document.querySelector("#potrace_button").addEventListener("click", potraceClick)
function potraceClick() {
  const input = document.querySelector("#potrace_raw");
  const result = document.querySelector("#potrace_result");
  const fileData = input.files[0];
  Potrace.loadImageFromFile(fileData);
  Potrace.process(() => (result.value = Potrace.getSVG(3)));
};

// [javascriptでテキスト音声読み上げ - Qiita](https://qiita.com/taiko1/items/240eea6eb597701f83bb)
document.querySelector("#speech_button").addEventListener("click", speechClick)
function speechClick() {
  const speak = new SpeechSynthesisUtterance();
  speak.text = document.querySelector("#speech_raw").value;
  speak.rate = Number(document.querySelector("#speech_rate").value);
  speak.pitch = Number(document.querySelector("#speech_pitch").value);
  speak.lang = document.querySelector("#speech_lang").value;
  speechSynthesis.speak(speak);
};

// [Blenderで作成した3Dモデルを、Three.jsでブラウザに表示する - Qiita](https://qiita.com/nannany_hey/items/c92d9f05588c751077b1#threejs%E3%81%AB%E3%81%A6%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%9D%E3%83%BC%E3%83%88%E3%81%97%E3%81%9Fgltf%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E3%83%AD%E3%83%BC%E3%83%89%E3%81%99%E3%82%8B)
document.querySelector("#gltf_raw").onchange = function () {
  var inputFile = document.querySelector("#gltf_raw").files[0];
  const objectUrl = window.URL.createObjectURL(inputFile)

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#gltf_result')
  });

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
  camera.position.set(0, 400, -1000);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Load GLTF or GLB
  const loader = new THREE.GLTFLoader();

  let model = null;
  loader.load(
    objectUrl,
    function (gltf) {
      model = gltf.scene;
      // model.name = "model_with_cloth";
      model.scale.set(400.0, 400.0, 400.0);
      model.position.set(0, -400, 0);
      scene.add(gltf.scene);

      // model["test"] = 100;
    },
    function (error) {
      console.log('An error happened');
      console.log(error);
    }
  );
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;

  const light = new THREE.AmbientLight(0xFFFFFF, 1.0);
  // シーンに追加
  scene.add(light);

  // 初回実行
  tick();

  function tick() {
    controls.update();

    if (model != null) {
      console.log(model);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
}

// [LI-NA/mozjpeg.js: The native javascript jpg optimizer. Live demo:](https://github.com/LI-NA/mozjpeg.js)
const dataURLtoUnit8 = (dataurl) => {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr;
}
document.querySelector("#jpeg_raw").addEventListener("change",
  function jpegClick(e) {
    const result = document.querySelector("#jpeg_result");
    const fileData = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const ary = dataURLtoUnit8(e.target.result);
      const output = jpegtran(ary, ["-optimize", "-copy", "all"], function (str) { console.log(str) });
      const blob = new Blob([output.data]);
      result.href = URL.createObjectURL(blob);
      result.download = fileData.name;
    };
    reader.readAsDataURL(fileData);
  }
)
// [Optipng.js - The native javascript png optimizer.](https://li-na.github.io/optipng.js/)
document.querySelector("#png_raw").addEventListener("change",
  function pngClick(e) {
    const result = document.querySelector("#png_result");
    const fileData = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const ary = dataURLtoUnit8(e.target.result);
      const output = optipng(ary, ["-o5"], function (str) { console.log(str) });
      const blob = new Blob([output.data]);
      result.href = URL.createObjectURL(blob);
      result.download = fileData.name;
    };
    reader.readAsDataURL(fileData);
  }
)
// [FFMPEG.WASM](https://ffmpegwasm.netlify.app/)
// [](https://unpkg.com/@ffmpeg/ffmpeg@latest/dist/ffmpeg.min.js)
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });
const transcode = async ({ target: { files } }) => {
  const { name } = files[0];
  await ffmpeg.load();
  ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
  await ffmpeg.run('-i', name, 'output.mp4');
  const data = ffmpeg.FS('readFile', 'output.mp4');
  const video = document.getElementById('video_result');
  video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
}
document
  .getElementById('video_raw').addEventListener('change', transcode);

// [svg2ass-gui/main.js at main · qgustavor/svg2ass-gui](https://github.com/qgustavor/svg2ass-gui/blob/main/lib/main.js)
document.querySelector("#svg_button").addEventListener("click", svgClick)
async function svgClick() {
  const input = document.querySelector("#svg_raw");
  const result = document.querySelector("#svg_result");
  const svgo = await import('./svgo.browser.js');
  result.value = svgo.optimize(input.value).data;
}

// [LeafletでGPSログ(GPX)地図：クライアントローカルGPXファイルをアップロード可能に。 - 晴歩雨描](https://2ndart.hatenablog.com/entry/2021/05/09/165116)
document.querySelector("#gpx_button").addEventListener("click", gpxClick)
async function gpxClick() {
  const input = document.querySelector("#gpx_raw");
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    const gpx = e.target.result;
    console.log(gpx);
    const map = L.map('gpx_result');
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://www.osm.org">OpenStreetMap</a>'
    }).addTo(map);
    new L.GPX(gpx, { async: true }).on('loaded', function (e) {
      map.fitBounds(e.target.getBounds());
    }).addTo(map);
  }
  fileReader.readAsText(input.files[0]);
}

// [web_qrcode/index.html at main · dotnsf/web_qrcode](https://github.com/dotnsf/web_qrcode/blob/main/index.html)
document.querySelector("#qr_raw").addEventListener("change", qrClick)
function qrClick() {
  const canvas = document.getElementById("qr_canvas");
  const ctx = canvas.getContext("2d");
  const input = document.querySelector("#qr_raw");
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    const img = new Image();
    img.src = fileReader.result;
    img.onload = (e) => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        const result = document.querySelector("#qr_result");
        result.value = code.data;
    };
  }
  fileReader.readAsDataURL(input.files[0]);
}

document.querySelector("#clipboard_button").addEventListener("click", clipboardClick)
function clipboardClick() {
  navigator.clipboard.writeText("");
}

// [Depth Map Extractor](http://www.hasaranga.com/dmap/)
document.getElementById("depth_raw").addEventListener("change", clickDepth);
function clickDepth(evt) {
  var f = evt.target.files[0];
  var reader = new FileReader();
  reader.onload = function () {
    var buffer = reader.result;
    var i = 0;
    var startPosition = 0;
    var lastPosition = 0;
    var newFileChunkAvailable = false;
    var chunkNumber = -1;
    do {
      startPosition = lastPosition;
      i = startPosition + 2;
      while (buffer[i].charCodeAt(0) == 0xff) {
        var chunkSize =
          (buffer[i + 2].charCodeAt(0) << 8) + buffer[i + 3].charCodeAt(0);
        i += chunkSize + 2;
      }
      lastPosition = buffer.indexOf("\u00FF\u00D9", i);
      if (
        lastPosition >= 0 &&
        lastPosition < buffer.length - 3 &&
        buffer[lastPosition + 2].charCodeAt(0) == 0xff &&
        buffer[lastPosition + 3].charCodeAt(0) == 0xd8
      )
        newFileChunkAvailable = true;
      else newFileChunkAvailable = false;
      lastPosition = lastPosition + 2;
      chunkNumber++;
    } while (chunkNumber < 2 && newFileChunkAvailable);
    if (chunkNumber != 2) return false;
    var depthImage = buffer.slice(startPosition, lastPosition);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = "data:image/jpeg;base64," + btoa(depthImage);
    console.log(a.href);
    a.download = "depth.jpeg";
    a.click();
  };
  reader.readAsBinaryString(f);
}

document.getElementById("surround_button").addEventListener("click", clickSurround);
function clickSurround(evt) {
  const { createFFmpeg, fetchFile } = FFmpeg;
  const ffmpeg = createFFmpeg({ log: true });
  const fl = document.getElementById("fl");
  const fr = document.getElementById("fr");
  const fc = document.getElementById("fc");
  const lfe = document.getElementById("lfe");
  const bl = document.getElementById("bl");
  const br = document.getElementById("br");
  const transcode = async () => {
    const audios = [fl, fr, fc, lfe, bl, br];
    await ffmpeg.load();
    audios.forEach(async (audio) =>
      ffmpeg.FS("writeFile", audio.files[0].name, await fetchFile(audio.files[0]))
    );
    const inputs = audios.map((audio) => ["-i", audio.files[0].name]).flat();
    await ffmpeg.run(
      ...inputs,
      "-c:a",
      "aac",
      "-filter_complex",
      "[0:a][1:a][2:a][3:a][4:a][5:a]join=inputs=6:channel_layout=5.1:map=0.0-FL|1.0-FR|2.0-FC|3.0-LFE|4.0-BL|5.0-BR[a]",
      "-map",
      "[a]",
      "out.m4a"
    );
    const data = ffmpeg.FS("readFile", "out.m4a");
    const result = document.getElementById("surround_result");
    result.href = URL.createObjectURL(
      new Blob([data.buffer], { type: "audio/m4a" })
    );
    result.download = "out.m4a";
  };
  transcode();
}
