import {
  generateWords32,
  importWords32,
  listSks,
  clearSksCache,
} from "./xinyin_main.js";

/**
 * @param {string} id
 * @returns HTMLInputElement | HTMLTextAreaElement
 */
function getInputElement(id) {
  const inputElement = document.getElementById(id);
  if (
    inputElement instanceof HTMLInputElement ||
    inputElement instanceof HTMLTextAreaElement
  ) {
    return inputElement;
  } else {
    throw new Error(`Input element with id "${id}" not found.`);
  }
}

/**
 * @param {string} id
 * @returns string
 */
function getInputValue(id) {
  const inputElement = getInputElement(id);
  return inputElement.value;
}

document
  .getElementById("btnGenerateWord32")
  .addEventListener("click", async () => {
    try {
      let txtInHeart = getInputValue("inputTxtInHeart");

      let startOf8105 = Number(getInputValue("inputStartOf8105"));
      if (isNaN(startOf8105)) {
        throw new Error("Start of 8105 must be a valid number.");
      }

      let countIn8105 = Number(getInputValue("inputCountIn8105"));
      if (isNaN(countIn8105)) {
        throw new Error("Count in 8105 must be a valid number.");
      }

      const words32 = await generateWords32(
        txtInHeart,
        startOf8105,
        countIn8105
      );
      document.getElementById("generatedWords32").innerText = words32;
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

document
  .getElementById("btnImportWords32")
  .addEventListener("click", async () => {
    try {
      let txtInHeart = getInputValue("inputTxtInHeart");

      let startOf8105 = Number(getInputValue("inputStartOf8105"));
      if (isNaN(startOf8105)) {
        throw new Error("Start of 8105 must be a valid number.");
      }

      let countIn8105 = Number(getInputValue("inputCountIn8105"));
      if (isNaN(countIn8105)) {
        throw new Error("Count in 8105 must be a valid number.");
      }

      let inputWords32 = getInputValue("inputWords32").trim();
      if (inputWords32.length !== 32) {
        throw new Error("Input words32 must be exactly 32 characters long.");
      }

      let address = await importWords32(
        inputWords32,
        txtInHeart,
        startOf8105,
        countIn8105,
        inputWords32
      );

      document.getElementById("solanaAddress").innerText = address;
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

document.getElementById("btnListSks").addEventListener("click", () => {
  listSks()
    .then((sks) => {
      const sksList = document.getElementById("sksList");
      if (!sks || sks.length === 0) {
        sksList.innerHTML = "<li>本地存储的密钥列表将显示在这里...</li>";
      } else {
        sksList.innerHTML = "";
        sks.forEach((sk) => {
          const li = document.createElement("li");
          li.textContent = sk;
          sksList.appendChild(li);
        });
      }
    })
    .catch((error) => {
      alert(`Error listing SKs: ${error.message}`);
    });
});

document.getElementById("btnClearSks").addEventListener("click", () => {
  clearSksCache()
    .then(() => {
      document.getElementById("btnListSks").click(); // Clear the displayed list
    })
    .catch((error) => {
      alert(`Error clearing SKs cache: ${error.message}`);
    });
});

/**
 *
 * @param {HTMLElement} element
 */
function selectText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

document
  .getElementById("generatedWords32")
  .addEventListener("click", function () {
    selectText(this);
  });

document.getElementById("solanaAddress").addEventListener("click", function () {
  selectText(this);
});
