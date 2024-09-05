document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("viewButton").addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "viewPDFs" });
  });
  document
    .getElementById("downloadButton")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage({ action: "downloadPDFs" });
    });
  document
    .getElementById("compileDampersButton")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage({ action: "compileDampers" });
    });
  document
    .getElementById("compileFSButton")
    .addEventListener("click", function () {
      chrome.runtime.sendMessage({ action: "compileFS" });
    });
  // document
  //   .getElementById("compileHiltiLabelsButton")
  //   .addEventListener("click", function () {
  //     chrome.runtime.sendMessage({ action: "compileHiltiLabels" });
  //   });
  const compileHiltiLabelsButton = document.getElementById(
    "compileHiltiLabelsButton"
  );

  compileHiltiLabelsButton.addEventListener("click", function () {
    // The text you want to copy to the clipboard
    const textToCopy =
      "function compileHiltiLabelsFunction() {\n" +
      "  let markingsList = CategoryMarkingsArray.getMarkingsList();\n" +
      "  let sortedItemLabels = markingsList\n" +
      "    .map((marking) => marking.itemLabel)\n" +
      "    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));\n" +
      '  let formattedItemLabels = sortedItemLabels.join("\\n");\n' +
      "  console.log(formattedItemLabels);\n" +
      "}\n" +
      "compileHiltiLabelsFunction();";

    // Copy the text to the clipboard
    navigator.clipboard.writeText(textToCopy).then(
      function () {
        // Success - show temporary popup message
        showPopupMessage("Code copied to clipboard! Paste into console.");
      },
      function (err) {
        // Error - handle accordingly
        console.error("Could not copy text: ", err);
      }
    );
  });

  function showPopupMessage(message) {
    // Create the popup message element
    const popupMessage = document.createElement("div");
    popupMessage.innerText = message;
    popupMessage.className = "popup-message";

    // Append the popup message to the body
    document.body.appendChild(popupMessage);

    // Remove the popup message after 2 seconds
    setTimeout(function () {
      document.body.removeChild(popupMessage);
    }, 2000);
  }
});
