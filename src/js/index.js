const sectors = [
  { color: "#F6BA33", label: "Chia đôi", image: null },
  { color: "#5EB847", label: "200.000 VND", image: null },
  { color: "#318ACF", label: "X2", image: null },
  { color: "#65479B", label: "100.000 VND", image: null },
  { color: "#8D348F", label: "30.000 VND", image: null },
  { color: "#EB5A33", label: "50.0000 VND", image: null },
  { color: "#315BA8", label: "Quay lại", image: null },
  { color: "#26D9D0", label: "20.000 VND", image: null },
  { color: "#65479B", label: "10.000 VND", image: null },
  { color: "#DD4278", label: "5.000 VND", image: null },
];

function getSectorsOutput() {
  return sectors; // Lấy ra output của sector để tiện thay đổi
}
let sectorOutput = getSectorsOutput();

const rand = (m, M) => Math.random() * (M - m) + m; // Tạo 1 số thực bất kỳ trong khoảng để áp dụng cho vận tốc tối đa
let lengthA = sectorOutput.length;
const elSpin = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext`2d`;
const dia = ctx.canvas.width; // Đường kính
const rad = dia / 2; // Bán kính
const PI = Math.PI;
const TAU = 2 * PI; // Pix2 tương đương 360 độ
let arc = TAU / length; // Góc mỗi phần, chia đều vòng quay tuỳ theo độ dài mảng sectors
const friction = 0.996; // 0.995=soft, 0.99=mid, 0.98=hard (độ ma sát)
const angVelMin = 0.003; // dưới mức này sẽ dừng
let angVelMax = 0; // vân tốc tối đa
let angVel = 0; // vận tốc hiện tại
let ang = 0; // góc xoay hiện tại
let isSpinning = false;
let isAccelerating = false;
let animFrame = null; // Engine's requestAnimationFrame: đối tượng để quản lí vòng lặp
let music = document.querySelector("#spin-audio");
let musicWin = document.querySelector("#congratulation");
let showModal = document.querySelector(".modal");
let initialAngVel = 0;

//* Xác định index của sector hiện tại */
const getIndex = () => Math.floor(lengthA - (ang / TAU) * lengthA) % lengthA; // index chạy từ 0 đến length - 1 và quay lại 0 khi vòng quay quay đủ một vòng.

// % length đảm bảo rằng index không vượt quá giới hạn của mảng sectors. Nếu vượt quá, nó sẽ quay lại phần đầu của mảng.

// Image:
const loadImage = (ctx, sector, rad) => {
  sector.image.onload = function () {
    ctx.save();
    // ctx.resetTransform();
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.drawImage(sector.image, 250, -35, 80, 80);
    ctx.restore();
  };
};
const drawSector = (sector, i) => {
  const ang = arc * i;
  ctx.save();
  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();
  // TEXT
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px sans-serif";
  // Image
  if (sector.image) {
    ctx.drawImage(sector.image, 250, -35, 80, 80);
  } else {
    ctx.fillText(sector.label, rad - 10, 10);
  }

  ctx.restore();
};
//* CSS rotate CANVAS Element */
const rotate = () => {
  const sector = sectorOutput[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  elSpin.style.backgroundColor = sector.color;
  document.querySelector(".result").style.color = sector.color;
  document.querySelector(".fa-face-smile").style.color = sector.color;
};

const frame = () => {
  if (!isSpinning) return;

  if (angVel >= angVelMax) isAccelerating = false;

  // Accelerate
  if (isAccelerating) {
    angVel ||= angVelMin; // khởi tạo vận tốc ban đầu
    angVel *= 1.038; // tăng tốc
  }
  // Decelerate
  else {
    isAccelerating = false;
    angVel *= friction; // giảm tốc bơi masat (friction)
    // SPIN END & show prizes:
    if (angVel < angVelMin) {
      isSpinning = false;
      music.currentTime = 0;
      music.pause();
      musicWin.play();
      showModal.style.display = "block";
      $(document).ready(function () {
        $(".close, .close-modal").click(function (e) {
          e.preventDefault();
          $(".modal").hide();
          stop();
        });
        $(".del").click(function (e) {
          if (currentSector !== null && sectorOutput.length > 1) {
            sectorOutput.splice(currentIndex, 1);
            $(".result-area .highlight").eq(currentIndex).remove();
            initWheel(sectorOutput);
            currentSector = null;
          }
          e.preventDefault();
          $(".modal").hide();
          stop();
        });
      });
      angVel = 0;
      let prize = sectorOutput[getIndex()].label;
      let prize2 = sectorOutput[getIndex()].label;
      cancelAnimationFrame(animFrame);
      if ((isSpinning = false)) {
        $(".show-prize").append(
          `<div class ="highlight"><i class="far fa-check-circle"></i><span style="margin-left: 30px">${prize}</span></div>
        `
        );
      } else {
        $(".show-prize").append(
          `<div class ="highlight"><i class="far fa-check-circle"></i><span style="margin-left: 30px">${prize2}</span></div>
        `
        );
      }

      start();
    }
    let currentIndex = getIndex();
    let currentSector = sectorOutput[currentIndex];
    if (currentSector.image) {
      $(".result").empty().append(currentSector.image);
      currentSector.image.classList.add("prizeImg");
    } else {
      $(".result").text(sectorOutput[getIndex()].label);
    }
  }
  $(".del-prize").click(function () {
    $(".show-prize").empty();
  });

  ang += angVel; // Update góc quay
  ang %= TAU; // chuẩn hoá góc
  rotate(); // xoay canvas
};

const engine = () => {
  frame();
  animFrame = requestAnimationFrame(engine);
};
elSpin.addEventListener("click", () => {
  if (isSpinning) return;
  music.play();
  isSpinning = true;
  isAccelerating = true;
  angVelMax = rand(0.1, 0.4);
  engine(sectorOutput); // Start engine!
});

// INIT!
const initWheel = (sectors1) => {
  lengthA = sectors1?.length;
  arc = TAU / lengthA;
  ctx.clearRect(0, 0, dia, dia);
  for (let index = 0; index < sectors1.length; index++) {
    drawSector(sectors1[index], index);
  }
  rotate(sectors1);
};
initWheel(sectorOutput);
// Set Full Screen The Wheel
function setFullScreen() {
  const wheel = document.querySelector(".wheel-container");
  const elementsToHide = document.querySelectorAll(
    ".menu-container, .themes, .wp-footer"
  );

  if (wheel.classList.contains("centered-wheel")) {
    wheel.classList.remove("centered-wheel");
    window.scrollTo(0, 500);
    elementsToHide.forEach((element) => {
      element.classList.remove("hidden");
    });
  } else {
    wheel.classList.add("centered-wheel");
    window.scrollTo(0, 0);
    elementsToHide.forEach((element) => {
      element.classList.add("hidden");
    });
  }
}
//----------- Active Menu-Tabs-----------
$(document).ready(function () {
  const tabs = $(".tab-item");
  const panes = $(".tab-pane");
  const tabActive = $(".tab-item.active");
  const line = $(".tab-line");

  line.css({
    left: tabActive.position().left + "px",
    width: tabActive.outerWidth() + "px",
  });

  tabs.click(function () {
    $(".tab-item.active").removeClass("active");
    $(".tab-pane.active").removeClass("active");

    line.css({
      left: $(this).position().left + "px",
      width: $(this).outerWidth() + "px",
    });

    $(this).addClass("active");
    panes.eq($(this).index()).addClass("active");
  });
});

//----------- Active Themes-Tabs-----------
$(document).ready(function () {
  const tabs = $(".theme-item");
  const panes = $(".theme-pane");
  const tabActive = $(".theme-item.theme-active");
  const line = $(".theme-line");

  line.css({
    left: tabActive.position().left + "px",
    width: tabActive.outerWidth() + "px",
  });

  tabs.click(function () {
    $(".theme-item.theme-active").removeClass("theme-active");
    $(".theme-pane.theme-active").removeClass("theme-active");

    line.css({
      left: $(this).position().left + "px",
      width: $(this).outerWidth() + "px",
    });

    $(this).addClass("theme-active");
    panes.eq($(this).index()).addClass("theme-active");
  });
});

//-----------Lưu chủ đề-----------
$(document).ready(function () {
  restoreData();

  $(".show-input, .creatNew-btn").click(function () {
    $(".save-hidden").slideToggle(300);
    $(".random-themes").val("Chủ đề" + " " + Math.floor(Math.random() * 100));
  });

  $(".save-btn").click(function () {
    let text = $(".random-themes").val();
    alert("Đã thêm " + text + " thành công");
    $(".save-hidden").hide();
    let dataArray = JSON.parse(localStorage.getItem("dataArray")) || [];
    let newItem = {
      topic: JSON.stringify(sectorOutput),
      name: text,
    };
    dataArray.push(newItem);
    localStorage.setItem("dataArray", JSON.stringify(dataArray));

    $("#Name_topic").show();

    for (let i = 0; i < dataArray.length; i++) {
      createButton(dataArray[i]);
    }
    if (dataArray.length > 0) {
      $("#Name_topic").show();
    }
    location.reload();
  });
  function restoreData() {
    let dataArray = JSON.parse(localStorage.getItem("dataArray")) || [];
    for (let i = 0; i < dataArray.length; i++) {
      createButton(dataArray[i]);
    }
  }
  function createButton(item) {
    let buttonContainer = $("#Name_topic");
    let newButton = document.createElement("button");
    newButton.innerHTML = item.name;
    newButton.classList.add("hii");
    newButton.onclick = function () {
      topic(item.topic);
    };
    buttonContainer.append(newButton);
  }
  function topic(topicValue) {
    let parsedSectors = JSON.parse(topicValue);
    sectors.length = 0;
    sectors.push(...parsedSectors);
    updateWheel();
    initWheel(sectorOutput);
    displayNewTheme();
  }
  // -----------Dropdown-Menu-Bar and Reponsive-------------
  $(function () {
    var pull = $(".pull");
    menu = $(".drop-down");

    $(pull).on("click", function (e) {
      e.preventDefault();
      menu.slideToggle();
    });

    $(window).resize(function () {
      var w = $(window).width();
      if (w > 320 && menu.is(":hidden")) {
        menu.removeAttr("style");
      }
    });
  });
  //-----------Đổ data từ sectors-----------
  for (const sector of sectorOutput) {
    const newElement = $("<div class='highlight editable' ></div>");
    const newSpan = $(`<span contenteditable='true'>${sector.label}</span>`);
    newElement.append(
      "<i class='far fa-check-circle' style='margin-right: 30px;'></i>"
    );
    newElement.append(newSpan);
    $(".result-area").append(newElement);
  }
});

//-----------Trộn data trong sectors----------
function shuffleArr() {
  sectorOutput.sort(() => Math.random() - 0.5);
  return sectorOutput;
}

// Sắp xếp từ A->Z:
function ascendingArr() {
  sectorOutput.sort((a, b) => a.label.localeCompare(b.label));
  return sectorOutput;
}
// Sắp xếp từ Z->A:
function decreasingArr() {
  sectorOutput.sort((a, b) => b.label.localeCompare(a.label));
  return sectorOutput;
}

// Hiện thị dữ liệu đã thay đổi
function displayNewData(sectorOutput) {
  const resultArea = $(".result-area");
  resultArea.empty();

  for (const sector of sectorOutput) {
    const newItem = $(
      "<div class='highlight editable' contenteditable='true'></div>"
    );

    // Nếu có hình ảnh, thêm vào newItem
    if (sector.image) {
      newItem.append("<i class='far fa-check-circle'></i>");
      newItem.append(
        `<span style='margin-left: 30px'>${sector.image.outerHTML}</span>`
      );
    } else {
      newItem.append(
        `<i class='far fa-check-circle'></i><span style='margin-left: 30px'>${sector.label}</span>`
      );
    }

    resultArea.append(newItem);
  }
}
let isLocked = false;

// Trộn ngẫu nhiên
$(".shuffle-btn").click(function () {
  const shuffleData = shuffleArr();
  displayNewData(shuffleData);
  updateWheel();
});
// Xoá
$(".delete-btn, .creatNew, .creatNew-btn").click(function () {
  $(".result-area").empty();
  sectorOutput.length = 0;
  isLocked = true;
  elSpin.style.background = "gray";
  ctx.beginPath();
  ctx.fillStyle = "gray";
  ctx.arc(rad, rad, rad, 2 * Math.PI, false);
  ctx.fill();
  addElement();
  checkAndToggleButtons();
});

// Thêm Elements sau khi xoá :
function addElement() {
  const newElement = $("<div class='highlight editable' ></div>");
  const newSector = {
    color: randomColor(),
    label: "",
    image: null,
  };
  sectorOutput.unshift(newSector);
  const newSpan = $(
    `<span contenteditable='true'>${newSector.label + "&#160;"}</span>`
  );
  newElement.append(
    "<i class='far fa-check-circle' style='margin-right: 30px;'></i>"
  );
  newElement.append(newSpan);
  $(".result-area").append(newElement);
  $(".result-area").on("input", ".editable", function () {
    updateWheel();
  });
}
// Nếu chỉ có 1 phần tử sẽ khoá chức năng trộn và sắp xếp
function checkAndToggleButtons() {
  if (sectorOutput.length === 1) {
    $(".ascending, .decreasing, .shuffle-btn").prop("disabled", true);
  } else {
    $(".ascending, .decreasing, .shuffle-btn").prop("disabled", false);
  }
}
checkAndToggleButtons();
// Trộn ngẫu nhiên
$(".shuffle-btn").click(function () {
  if (isLocked == true) {
    isLocked = false;
    return;
  } else {
    isLocked == false;
    const shuffleData = shuffleArr();
    displayNewData(shuffleData);
    updateWheel();
  }
});
// Sắp xếp từ nhỏ > lớn:
$(".ascending").click(function () {
  if (isLocked == true) {
    isLocked = false;
    return;
  } else {
    const ascendingData = ascendingArr();
    displayNewData(ascendingData);
    updateWheel();
  }
});
// Sắp xếp từ lớn > nhỏ:
$(".decreasing").click(function () {
  if (isLocked == true) {
    isLocked = false;
    return;
  } else {
    const decreasingData = decreasingArr();
    displayNewData(decreasingData);
    updateWheel();
  }
});
// Thêm ảnh:
$("#addImageButton").click(function () {
  $("#imageInput").click();
});
const imageInputs = [];
$("#imageInput").change(function () {
  const selectedFile = this.files[0];

  if (selectedFile) {
    const imageUrl = URL.createObjectURL(selectedFile);

    // Create a new image element
    const imageElement = new Image();
    imageElement.classList.add("inputImg");
    imageElement.onload = function () {
      imageInputs.push(imageElement);

      const currentIndex = getIndex();
      const currentSector = sectorOutput[currentIndex];
      if (currentSector.label == "" && currentSector.image == null) {
        currentSector.image = imageElement;
        updateWheel(); // Update the wheel with the new image
        initWheel(sectorOutput);
        $(".result-area .highlight")
          .eq(currentIndex)
          .append(
            `<span style='margin-left: 30px'>${imageElement.outerHTML}</span>`
          );
      } else {
        const newSector = {
          color: randomColor(),
          label: "",
          image: imageElement,
        };
        sectorOutput.push(newSector);
        for (let i = 0; i < sectorOutput.length; i++) {
          const element = sectorOutput[i];
          if (element.label == "" && element.image == null) {
            sectorOutput.splice(i, 1);
            $(".result-area .highlight")[i].remove();
          }
        }
        updateWheel();
        initWheel(sectorOutput);
        $(".result-area").append(
          `<div class="highlight editable" contenteditable="true"><i class="far fa-check-circle"></i><span style="margin-left: 30px">${imageElement.outerHTML}</span></div>`
        );
      }
    };
    imageElement.src = imageUrl;
    $(this).val("");
  }
});
// Xóa và vẽ lại vòng quay với dữ liệu mới từ outputSector
function updateWheel() {
  ctx.clearRect(0, 0, dia, dia);
  sectorOutput.forEach((sector, index) => {
    drawSector(sector, index);
  });
  rotate();
}

function focusAndPlaceCaretAtEnd(el) {
  el.focus();
  if (
    typeof window.getSelection != "undefined" &&
    typeof document.createRange != "undefined"
  ) {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

// Edit Text in Span:
$(".result-area").on("input", ".editable", function () {
  const index = $(this).index();
  const newText = $(this).text().trim(); // Lấy văn bản và loại bỏ khoảng trắng ở hai đầu
  const scrollTop = $(".result-area").scrollTop();

  if (newText === "") {
    // Xử lý khi văn bản là rỗng
    if (index == 0 && sectorOutput.length !== 1) {
      const continueElement = $(this).next()[0];
      $(this).remove(); // Loại bỏ phần tử editable hiện tại
      sectorOutput.splice(index, 1); // Loại bỏ mục tương ứng từ sectorOutput
      $(".result-area").scrollTop(scrollTop);
      const abc = continueElement.childNodes[1];
      focusAndPlaceCaretAtEnd(abc);
      updateWheel(); // Cập nhật vòng quay
    } else if (index == 0 && sectorOutput.length == 1) {
      sectorOutput[0].label = "";
      sectorOutput[0].image = "";
    } else {
      // Kiểm tra xem phần tử có phải là phần tử đầu tiên không
      const prevElement = $(this).prev()[0];
      $(this).remove(); // Loại bỏ phần tử editable hiện tại
      sectorOutput.splice(index, 1); // Loại bỏ mục tương ứng từ sectorOutput
      $(".result-area").scrollTop(scrollTop);
      const abc = prevElement.childNodes[1];
      focusAndPlaceCaretAtEnd(abc); // Đặt focus vào phần tử trước đó
      updateWheel(); // Cập nhật vòng quay
    }
  } else {
    // Xử lý khi văn bản không rỗng
    sectorOutput[index].label = newText; // Cập nhật nhãn tương ứng trong sectorOutput
    updateWheel(); // Cập nhật vòng quay
  }

  initWheel(sectorOutput); // Khởi tạo vòng quay với sectorOutput đã cập nhật
  checkAndToggleButtons();
});

$(".result-area").on("keydown", ".editable ", function (event) {
  const $span = $(this);
  if (event.which === 13) {
    event.preventDefault();
    if (
      $span.text().trim() !== "" ||
      $span.children().children()[0] !== undefined
    ) {
      // debugger
      const newElement = $("<div class='highlight editable' ></div>");
      const newSpan = $("<span contenteditable='true'></span>");
      newElement.append(
        "<i class='far fa-check-circle' style='margin-right: 30px;'></i>"
      );
      newElement.append(newSpan);
      $(this).after(newElement);

      // Focus vào phần tử mới
      newSpan.focus();
      const index = $(this).index();
      const newSector = { color: randomColor(), label: "", image: null };
      sectorOutput = [
        ...sectorOutput.slice(0, index + 1),
        newSector,
        ...sectorOutput.slice(index + 1),
      ];
      updateWheel();
      initWheel(sectorOutput);
    }
  }
});

const start = () => {
  setTimeout(function () {
    confetti.start();
  }, 100);
};
//  Stop

const stop = () => {
  setTimeout(function () {
    confetti.stop();
  }, 100);
};

// New Theme:

function randomColor() {
  const randomInt = () => Math.floor(Math.random() * 256);
  const hue = Math.floor(Math.random() * 360);
  const rgb = `rgb(${randomInt()}, ${randomInt()}, ${randomInt()})`;
  const color = `hsl(${hue}, 70%, 50%)`;

  return color;
}

// New Data:
function displayNewTheme() {
  $(".result-area").empty();
  for (const sector of sectorOutput) {
    $(".result-area").append(
      `<div class ="highlight editable" contenteditable="true" ><i class="far fa-check-circle"></i><span style="margin-left: 30px">${sector.label}</span></div>`
    );
  }
}
// Drink theme-button:
$(".drink").click(function () {
  const drink = [
    { color: randomColor(), label: "Uống 1 ly", image: null },
    { color: randomColor(), label: "Bên trái uống", image: null },
    { color: randomColor(), label: "Tất cả cùng uống", image: null },
    { color: randomColor(), label: "Uống 2 ly", image: null },
    { color: randomColor(), label: " Được ăn mồi", image: null },
    { color: randomColor(), label: "Chỉ ai đó uống", image: null },
    { color: randomColor(), label: "Thoát nạn", image: null },
    { color: randomColor(), label: "Bên phải uống", image: null },
    { color: randomColor(), label: "Uống 1/2 ly", image: null },
    { color: randomColor(), label: "Đối diện uống", image: null },
  ];
  sectors.length = 0;
  sectors.push(...drink);
  displayNewTheme();
  updateWheel();
});

//  lunch theme-button:
$(".lunch").click(function () {
  const lunch = [
    { color: randomColor(), label: "Ăn phở", image: null },
    { color: randomColor(), label: "Cơm rang", image: null },
    { color: randomColor(), label: "Bún bò Huế", image: null },
    { color: randomColor(), label: "Mì Quảng", image: null },
    { color: randomColor(), label: "Nhịn đói", image: null },
    { color: randomColor(), label: "Bánh xèo", image: null },
    { color: randomColor(), label: "Cơm chiên", image: null },
    { color: randomColor(), label: "Cơm bình dân", image: null },
    { color: randomColor(), label: "Nhậu thay cơm", image: null },
    { color: randomColor(), label: "Bánh mì", image: null },
  ];
  sectors.length = 0;
  sectors.push(...lunch);
  displayNewTheme();
  updateWheel();
});

// / odd-even theme-button:
$(".odd-even").click(function () {
  const oddEven = [
    { color: randomColor(), label: "Không tính", image: null },
    { color: randomColor(), label: "Chẵn", image: null },
    { color: randomColor(), label: "Quay lại", image: null },
    { color: randomColor(), label: "Lẻ", image: null },
    { color: randomColor(), label: " Cả hai", image: null },
    { color: randomColor(), label: "Chẵn", image: null },
    { color: randomColor(), label: "Lẻ", image: null },
    { color: randomColor(), label: "Quay lại", image: null },
    { color: randomColor(), label: "Lẻ", image: null },
    { color: randomColor(), label: "Chẵn", image: null },
  ];
  sectors.length = 0;
  sectors.push(...oddEven);
  displayNewTheme();
  updateWheel();
});
// / girl theme-button:
$(".girl").click(function () {
  const girl = [
    { color: randomColor(), label: "Ôm rồi hôn", image: null },
    { color: randomColor(), label: "Bịt mắt bắt...", image: null },
    { color: randomColor(), label: "Chơi trốn tìm", image: null },
    { color: randomColor(), label: "Mua trà sữa ", image: null },
    { color: randomColor(), label: " Đi xem film", image: null },
    { color: randomColor(), label: "Chỉ ai đó uống", image: null },
    { color: randomColor(), label: "Ra công viên", image: null },
    { color: randomColor(), label: "Matxa cho em", image: null },
    { color: randomColor(), label: "Đi hotel :D", image: null },
    { color: randomColor(), label: "Ôm nha ngủ", image: null },
  ];
  sectors.length = 0;
  sectors.push(...girl);
  displayNewTheme();
  updateWheel();
});
// / money theme-button:
$(".money").click(function () {
  const money = [
    { color: randomColor(), label: "Vừa đi vệ sinh", image: null },
    { color: randomColor(), label: "Mồm to", image: null },
    { color: randomColor(), label: "Thằng quay", image: null },
    { color: randomColor(), label: "Nói nhiều", image: null },
    { color: randomColor(), label: "Quay lại", image: null },
    { color: randomColor(), label: "Ăn nhiều", image: null },
    { color: randomColor(), label: "Uống ít", image: null },
    { color: randomColor(), label: "Đeo kính", image: null },
    { color: randomColor(), label: "Đối diện", image: null },
    { color: randomColor(), label: "Tên Tiến", image: null },
  ];
  sectors.length = 0;
  sectors.push(...money);
  displayNewTheme();
  updateWheel();
});
// / game theme-button:
$(".game").click(function () {
  const game = [
    { color: randomColor(), label: "Liên Minh", image: null },
    { color: randomColor(), label: "PUBG", image: null },
    { color: randomColor(), label: "Tốc chiên", image: null },
    { color: randomColor(), label: "Liên quân", image: null },
    { color: randomColor(), label: " Bang Bang", image: null },
    { color: randomColor(), label: "Lửa chùa ", image: null },
    { color: randomColor(), label: "FifaOnline4", image: null },
    { color: randomColor(), label: "Đột Kich", image: null },
    { color: randomColor(), label: "Game 18+", image: null },
    { color: randomColor(), label: "Nối chữ", image: null },
  ];
  sectors.length = 0;
  sectors.push(...game);
  displayNewTheme();
  updateWheel();
});
// / lucky theme-button:
$(".lucky").click(function () {
  const lucky = [
    { color: randomColor(), label: "Ngoan ngoãn", image: null },
    { color: randomColor(), label: "Xạo chó", image: null },
    { color: randomColor(), label: "Tham lam", image: null },
    { color: randomColor(), label: "Có trách nhiệm", image: null },
    { color: randomColor(), label: "Suy đồi đạo đức", image: null },
    { color: randomColor(), label: "Đồi bại", image: null },
    { color: randomColor(), label: "Dâm tặc", image: null },
    { color: randomColor(), label: "Người nhân ái", image: null },
    { color: randomColor(), label: "Trung thực", image: null },
    { color: randomColor(), label: "Thánh lượn lẹo", image: null },
  ];
  sectors.length = 0;
  sectors.push(...lucky);
  displayNewTheme();
  updateWheel();
});
// name theme-button:
$(".name").click(function () {
  const name = [
    { color: randomColor(), label: "Hùng", image: null },
    { color: randomColor(), label: "Huy", image: null },
    { color: randomColor(), label: "Tiến", image: null },
    { color: randomColor(), label: "Sói", image: null },
    { color: randomColor(), label: "Tanpo", image: null },
    { color: randomColor(), label: "Tuyêt", image: null },
    { color: randomColor(), label: "Vua lì đòn", image: null },
    { color: randomColor(), label: "Thánh bựa", image: null },
    { color: randomColor(), label: "Songoku", image: null },
    { color: randomColor(), label: "Pikachu", image: null },
  ];
  sectors.length = 0;
  sectors.push(...name);
  displayNewTheme();
  updateWheel();
});
// animal theme-button:
$(".animal").click(function () {
  const animal = [
    { color: randomColor(), label: "Chó", image: null },
    { color: randomColor(), label: "Mèo", image: null },
    { color: randomColor(), label: "Heo", image: null },
    { color: randomColor(), label: "Gà", image: null },
    { color: randomColor(), label: "Bò", image: null },
    { color: randomColor(), label: "Cọp", image: null },
    { color: randomColor(), label: "Gián", image: null },
    { color: randomColor(), label: "Chuột", image: null },
    { color: randomColor(), label: "Tinh trùng thất bại", image: null },
    { color: randomColor(), label: "Cá mập", image: null },
  ];
  sectors.length = 0;
  sectors.push(...animal);
  displayNewTheme();
  updateWheel();
});
$(".football").click(function () {
  const animal = [
    { color: randomColor(), label: "MU", image: null },
    { color: randomColor(), label: "Chelsea ", image: null },
    { color: randomColor(), label: "Real Madrid", image: null },
    { color: randomColor(), label: "Barcelona ", image: null },
    { color: randomColor(), label: "Bayern Munich", image: null },
    { color: randomColor(), label: "PSG ", image: null },
    { color: randomColor(), label: "Liverpool ", image: null },
    { color: randomColor(), label: "Tottenham", image: null },
    { color: randomColor(), label: "Napoli", image: null },
    { color: randomColor(), label: "Arsenal ", image: null },
  ];
  sectors.length = 0;
  sectors.push(...animal);
  displayNewTheme();
  updateWheel();
});
$(".oneToTen").click(function () {
  const animal = [
    { color: randomColor(), label: "1", image: null },
    { color: randomColor(), label: "2 ", image: null },
    { color: randomColor(), label: "3", image: null },
    { color: randomColor(), label: "4 ", image: null },
    { color: randomColor(), label: "5", image: null },
    { color: randomColor(), label: "6 ", image: null },
    { color: randomColor(), label: "7 ", image: null },
    { color: randomColor(), label: "8", image: null },
    { color: randomColor(), label: "9", image: null },
    { color: randomColor(), label: "10 ", image: null },
  ];
  sectors.length = 0;
  sectors.push(...animal);
  displayNewTheme();
  updateWheel();
});
$(".prizes").click(function () {
  const animal = [
    { color: randomColor(), label: "Giảm giá 10%", image: null },
    { color: randomColor(), label: "Quà tặng 100k", image: null },
    { color: randomColor(), label: "Giảm giá 15%", image: null },
    { color: randomColor(), label: "Quà tặng 200k ", image: null },
    { color: randomColor(), label: "Giảm giá 20%", image: null },
    { color: randomColor(), label: "Quà tặng 200k ", image: null },
    { color: randomColor(), label: "Giảm giá 30% ", image: null },
    { color: randomColor(), label: "Chúc May mắn", image: null },
    { color: randomColor(), label: "Quay Lại", image: null },
    { color: randomColor(), label: "Mua 1 tặng 1", image: null },
  ];
  sectors.length = 0;
  sectors.push(...animal);
  displayNewTheme();
  updateWheel();
});
$(".colors").click(function () {
  const animal = [
    { color: "#8D348F", label: "Tím Mộng Mơ", image: null },
    { color: "#EFE603", label: "Vàng Sa Ngã", image: null },
    { color: "#EEEEEE", label: "Xám nhạt nhoà", image: null },
    { color: "#FFCEEC", label: "Hồng phớt", image: null },
    { color: "#1C0E1C", label: "Đen huyền ảo", image: null },
    { color: "#A87A54", label: "Nâu no no ", image: null },
    { color: "#5EB847", label: "Xanh loè loẹt ", image: null },
    { color: "#318ACF", label: "Xanh dương", image: null },
    { color: "#AA0100", label: "Đỏ", image: null },
    { color: randomColor(), label: "Bay màu", image: null },
  ];
  sectors.length = 0;
  sectors.push(...animal);
  displayNewTheme();
  updateWheel();
});
$(".anime").click(function () {
  const animal = [
    { color: randomColor(), label: "Naruto", image: null },
    { color: randomColor(), label: "Conan", image: null },
    { color: randomColor(), label: "Dragon Ball", image: null },
    { color: randomColor(), label: "One Piece", image: null },
    { color: randomColor(), label: "Fairy Tail", image: null },
    { color: randomColor(), label: "Pokemon", image: null },
    { color: randomColor(), label: "One Punch Man", image: null },
    { color: randomColor(), label: "Bleach", image: null },
    { color: randomColor(), label: "Attack on Titan", image: null },
    { color: randomColor(), label: "Kimetsu no Yaiba", image: null },
  ];
  sectors.length = 0;
  sectors.push(...animal);
  displayNewTheme();
  updateWheel();
});
$(".fashion").click(function () {
  const animal = [
    { color: randomColor(), label: "Hermes ", image: null },
    { color: randomColor(), label: "Chanel ", image: null },
    { color: randomColor(), label: " Louis Vuitton ", image: null },
    { color: randomColor(), label: "Christian Dior", image: null },
    { color: randomColor(), label: "Ferragamo ", image: null },
    { color: randomColor(), label: "Versace ", image: null },
    { color: randomColor(), label: "Prada", image: null },
    { color: randomColor(), label: "Fendi", image: null },
    { color: randomColor(), label: "Giorgio Armani", image: null },
    { color: randomColor(), label: " Zegna", image: null },
  ];
  sectors.length = 0;
  sectors.push(...animal);
  displayNewTheme();
  updateWheel();
});
